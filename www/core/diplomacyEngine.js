/**
 * core/diplomacyEngine.js
 * ------------------------------------------------------------
 * بند 18: دیپلماسی. رابطه‌ها بین -100 تا +100 هستند.
 * اکشن‌ها: هدیه، پیمان تجاری، اتحاد، تهدید، جاسوسی، اعلان جنگ، صلح.
 */
import { chance, randFloat } from './rng.js';
import { bus } from './eventBus.js';

function clampRel(v) {
  if (typeof v !== 'number' || isNaN(v)) v = 0;
  return Math.max(-100, Math.min(100, Math.round(v)));
}

export function relationLabel(rel) {
  if (rel >= 70) return 'دوستانه';
  if (rel >= 30) return 'مثبت';
  if (rel > -30) return 'خنثی';
  if (rel > -70) return 'سرد';
  return 'دشمنانه';
}

export const DIPLO_ACTIONS = {
  gift: {
    id: 'gift', cost: (amount) => ({ coins: amount }),
    can: (state, c) => state.resources.coins >= 100 && c.relation < 100,
    run(state, country, config, opts = {}) {
      const amount = Number(opts.amount) || 150;
      state.resources.coins -= amount;
      const gain = Math.round(amount / 15) + Math.round(country.trust / 25);
      country.relation = clampRel(country.relation + gain);
      country.trust = Math.min(100, country.trust + 2);
      bus.emit('diplomacy:action', { action: 'gift', country: country.id, gain });
      return { ok: true, message: `هدیه ارسال شد؛ رابطه +${gain}` };
    },
  },
  trade: {
    id: 'trade', cost: () => ({ influence: 5 }),
    can: (state, c) => !c.tradePact && c.relation >= 20 && state.resources.influence >= 5,
    run(state, country) {
      state.resources.influence -= 5;
      country.tradePact = true;
      country.relation = clampRel(country.relation + 5);
      bus.emit('diplomacy:action', { action: 'trade', country: country.id });
      return { ok: true, message: 'پیمان تجاری بسته شد؛ درآمد روزانه افزایش می‌یابد.' };
    },
  },
  alliance: {
    id: 'alliance', cost: () => ({ influence: 15, credibility: 10 }),
    can: (state, c) => !c.alliance && c.relation >= 60 && state.resources.influence >= 15 && state.resources.credibility >= 10,
    run(state, country) {
      state.resources.influence -= 15;
      state.resources.credibility -= 10;
      country.alliance = true;
      country.relation = clampRel(country.relation + 10);
      bus.emit('diplomacy:action', { action: 'alliance', country: country.id });
      return { ok: true, message: 'پیمان اتحاد امضا شد!' };
    },
  },
  threaten: {
    id: 'threaten', cost: () => ({ credibility: 5 }),
    can: (state, c) => state.resources.credibility >= 5,
    run(state, country, config, opts = {}) {
      state.resources.credibility -= 5;
      country.relation = clampRel(country.relation - 20);
      const ourPower = opts.power || 1;
      if (ourPower > country.power * 1.3 && chance(60)) {
        country.trust = Math.max(0, country.trust - 10);
        state.resources.coins += 120;
        bus.emit('diplomacy:action', { action: 'threaten_success', country: country.id });
        return { ok: true, message: 'تهدید مؤثر بود؛ دشمن ۱۲۰ سکه باج داد.' };
      }
      bus.emit('diplomacy:action', { action: 'threaten_fail', country: country.id });
      return { ok: true, message: 'تهدید بی‌پاسخ ماند و رابطه بدتر شد.' };
    },
  },
  spy: {
    id: 'spy', cost: () => ({ coins: 80, influence: 4 }),
    can: (state, c) => state.resources.coins >= 80 && state.resources.influence >= 4,
    run(state, country, config) {
      state.resources.coins -= 80;
      state.resources.influence -= 4;
      const style = config.govStyles?.[state.kingdom.style];
      let success = 35 + state.resources.knowledge / 40 + country.trust / 10;
      if (style?.spyEffectMult) success *= style.spyEffectMult;
      if (state.research.unlocked.includes('tech_spies_001')) success += 15;
      if (chance(success)) {
        country.revealed = true;
        if (chance(30)) {
          country.power = Math.round(country.power * 0.92);
          bus.emit('diplomacy:action', { action: 'spy_sabotage', country: country.id });
          return { ok: true, message: 'جاسوسان موفق شدند و زیرساخت دشمن را تضعیف کردند!' };
        }
        bus.emit('diplomacy:action', { action: 'spy_info', country: country.id });
        return { ok: true, message: 'اطلاعات دقیق قدرت دشمن به دست آمد.' };
      }
      country.relation = clampRel(country.relation - 15);
      bus.emit('diplomacy:action', { action: 'spy_caught', country: country.id });
      return { ok: false, message: 'جاسوس دستگیر شد! رابطه آسیب دید.' };
    },
  },
  war: {
    id: 'war', cost: () => ({}),
    can: (state, c) => !c.atWar && !c.alliance,
    run(state, country) {
      country.atWar = true;
      country.alliance = false;
      country.tradePact = false;
      country.relation = clampRel(country.relation - 40);
      state.history.stats.wars += 1;
      bus.emit('war:started', { country: country.id });
      return { ok: true, message: `به ${country.name} اعلان جنگ شد!` };
    },
  },
  peace: {
    id: 'peace', cost: () => ({}),
    can: (state, c) => c.atWar,
    run(state, country, config) {
      // هزینه صلح بر اساس قدرت دشمن
      const tribute = Math.round(country.power / 2);
      if (state.resources.coins < tribute) return { ok: false, message: `دشمن برای صلح ${tribute} سکه می‌خواهد؛ کافی نیست.` };
      state.resources.coins -= tribute;
      country.atWar = false;
      country.relation = clampRel(country.relation + 20);
      state.history.stats.peaces = (state.history.stats.peaces || 0) + 1;
      bus.emit('war:ended', { country: country.id, peace: true });
      return { ok: true, message: `صلح با پرداخت ${tribute} سکه برقرار شد.` };
    },
  },
};

/** تغییر تدریجی رابطه‌ها در هر روز */
export function diplomacyDailyTick(state, config, content) {
  for (const def of content.countries) {
    const c = state.countries[def.id];
    if (!c) continue;
    const target = def.startingRelation ?? 0;
    if (!c.atWar) {
      c.relation += (target - c.relation) * 0.03;
      c.relation = clampRel(c.relation);
    } else if (chance(def.aggression / 12)) {
      // حمله دشمن در طول جنگ
      bus.emit('war:enemyAttack', { country: def.id });
    }
  }
}
