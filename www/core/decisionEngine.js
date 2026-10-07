/**
 * core/decisionEngine.js
 * ------------------------------------------------------------
 * بند 8: هسته تصمیم‌گیری. انتخاب رویداد روزانه با وزن+شرط+کول‌داون،
 * اعمال هزینه و اثر گزینه‌ها، اثرهای تصادفی، رویدادهای زنجیره‌ای (بند 10)
 * و ایجاد پرچم برای داستان‌های آینده.
 */
import { weightedPick } from './rng.js';
import { evalCondition } from './conditionEngine.js';
import { applyEffects } from './effectEngine.js';
import { bus } from './eventBus.js';

/** فیلتر رویدادهای قابل‌نمایش در وضعیت فعلی */
export function availableEvents(state, config, content) {
  const ctx = { state, config, content };
  const now = state.kingdom.day;
  return content.events.filter((ev) => {
    if (ev.enabled === false) return false;
    if (ev.minLevel && state.kingdom.level < ev.minLevel) return false;
    if (ev.maxLevel && state.kingdom.level > ev.maxLevel) return false;
    if ((state.cooldowns[ev.id] ?? 0) > 0) return false;
    if (ev.requirements && !evalCondition(ev.requirements, ctx)) return false;
    // رویدادهای زمان‌بندی‌شده فقط از مسیر خودششان می‌آیند
    if (ev.scheduledOnly) return false;
    return true;
  });
}

/** انتخاب رویداد روز بر اساس وزن و کمیابی (بند 73) */
export function pickDailyEvent(state, config, content) {
  const pool = availableEvents(state, config, content);
  if (!pool.length) return null;
  return weightedPick(pool, (ev) => {
    const rarityW = config.rarityWeights[ev.rarity || 'common'] ?? 50;
    return rarityW * (ev.weight ?? 1);
  });
}

/** آیا بازیکن قادر به پرداخت هزینه این گزینه هست؟ */
export function canAffordChoice(state, choice) {
  if (!choice.costs) return true;
  for (const [res, amount] of Object.entries(choice.costs)) {
    if (res === 'popularity') { if ((state.stats.popularity) < amount) return false; continue; }
    if (res === 'morale') { if ((state.stats.morale) < amount) return false; continue; }
    if ((state.resources[res] ?? 0) < amount) return false;
  }
  return true;
}

/**
 * اعمال یک انتخاب.
 * @returns { report, randomResults, followUp }
 */
export function applyChoice(state, config, content, event, choice) {
  const ctx = { state, config, content };

  // پرداخت هزینه‌ها
  if (choice.costs) {
    for (const [res, amount] of Object.entries(choice.costs)) {
      if (res === 'popularity') state.stats.popularity = Math.max(0, state.stats.popularity - amount);
      else if (res === 'morale') state.stats.morale = Math.max(0, state.stats.morale - amount);
      else state.resources[res] = Math.max(0, (state.resources[res] ?? 0) - amount);
    }
  }

  // اثرهای قطعی
  const report = applyEffects(choice.effects, ctx);

  // اثرهای تصادفی (بند 8)
  const randomResults = [];
  if (choice.randomEffects) {
    for (const re of choice.randomEffects) {
      if (Math.random() * 100 < (re.chance ?? 50)) {
        const desc = applyEffects(re.effects, ctx);
        randomResults.push({ label: re.label || '', desc });
      }
    }
  }

  // پرچم‌ها (بند 10)
  if (choice.flags) {
    for (const [k, v] of Object.entries(choice.flags)) state.flags[k] = v === undefined ? true : v;
  }

  // رویداد بعدی زنجیره
  if (choice.followUpEvent) {
    state.scheduledEvents = state.scheduledEvents || [];
    state.scheduledEvents.push({ id: choice.followUpEvent, daysLeft: choice.followUpDelay ?? 1 });
  }

  // کول‌داون رویداد (بند 74)
  state.cooldowns[event.id] = event.cooldown ?? 5;

  // آمار و تجربه
  state.history.stats.decisions += 1;
  state.kingdom.xp += config.xp.decisionXp;

  bus.emit('decision:made', { eventId: event.id, choiceId: choice.id, event, choice });
  return { report, randomResults };
}

/** به‌روزرسانی کول‌داون‌ها در پایان هر روز */
export function tickCooldowns(state) {
  for (const k of Object.keys(state.cooldowns)) {
    if (state.cooldowns[k] > 0) state.cooldowns[k] -= 1;
  }
}
