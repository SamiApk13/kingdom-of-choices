/**
 * core/effectEngine.js
 * ------------------------------------------------------------
 * بند 76: موتور اثر (Effect Engine) — عمومی و قابل‌ثبت.
 * هر اثر یک آبجکت داده‌محور است؛ تایپ‌های جدید بدون تغییر هسته
 * با registerEffect() اضافه می‌شوند (معماری پلاگین‌مانند، بند 91).
 */
import { bus } from './eventBus.js';

const registry = new Map();

export function registerEffect(type, handler) {
  registry.set(type, handler);
}

export function clampStat(v) {
  return Math.max(0, Math.min(100, Math.round(v * 10) / 10));
}

/**
 * اعمال فهرستی از اثرها روی وضعیت بازی.
 * @param {Array} effects
 * @param {object} ctx - { state, config, content }
 * @returns {string[]} توضیح انسانی اثرهای اعمال‌شده (برای نمایش به بازیکن)
 */
export function applyEffects(effects, ctx) {
  const report = [];
  if (!effects) return report;
  for (const eff of effects) {
    if (!eff) continue;
    const handler = registry.get(eff.type);
    if (!handler) {
      console.warn('[effectEngine] تایپ اثر ناشناخته:', eff.type);
      continue;
    }
    try {
      const desc = handler(eff, ctx);
      if (desc) report.push(desc);
    } catch (e) {
      console.error('[effectEngine] خطا در اعمال اثر', eff, e);
    }
  }
  return report;
}

/* ---------- تایپ‌های استاندارد ---------- */

registerEffect('resource', (eff, { state }) => {
  const before = state.resources[eff.res] ?? 0;
  let after = before + Math.round(eff.amount);
  if (eff.res !== 'population') after = Math.max(0, after);
  else after = Math.max(0, after);
  state.resources[eff.res] = Math.round(after);
  const sign = eff.amount >= 0 ? '+' : '';
  return `${eff.res} ${sign}${Math.round(eff.amount)}`;
});

registerEffect('resource_pct', (eff, { state }) => {
  const cur = state.resources[eff.res] ?? 0;
  const delta = Math.round(cur * (eff.percent / 100));
  state.resources[eff.res] = Math.max(0, cur + delta);
  return `${eff.res} ${eff.percent}%`;
});

registerEffect('set_resource', (eff, { state }) => {
  state.resources[eff.res] = Math.max(0, Math.round(eff.value));
  return `${eff.res} = ${eff.value}`;
});

registerEffect('popularity', (eff, { state }) => {
  state.stats.popularity = clampStat(state.stats.popularity + eff.amount);
  return `محبوبیت ${eff.amount > 0 ? '+' : ''}${eff.amount}`;
});

registerEffect('security', (eff, { state }) => {
  state.stats.security = clampStat(state.stats.security + eff.amount);
  return `امنیت ${eff.amount > 0 ? '+' : ''}${eff.amount}`;
});

registerEffect('morale', (eff, { state }) => {
  state.stats.morale = clampStat(state.stats.morale + eff.amount);
  return `روحیه ارتش ${eff.amount > 0 ? '+' : ''}${eff.amount}`;
});

registerEffect('xp', (eff, { state }) => {
  state.kingdom.xp += Math.round(eff.amount);
  return `+${Math.round(eff.amount)} تجربه`;
});

registerEffect('add_flag', (eff, { state }) => {
  state.flags[eff.flag] = eff.value === undefined ? true : eff.value;
  return null;
});

registerEffect('remove_flag', (eff, { state }) => {
  delete state.flags[eff.notFlag || eff.flag];
  return null;
});

registerEffect('change_relation', (eff, { state }) => {
  const c = state.countries[eff.country];
  if (!c) return null;
  c.relation = Math.max(-100, Math.min(100, c.relation + eff.amount));
  return null;
});

registerEffect('spawn_event', (eff, { state }) => {
  state.scheduledEvents = state.scheduledEvents || [];
  state.scheduledEvents.push({ id: eff.eventId, daysLeft: eff.delay ?? 1 });
  return null;
});

registerEffect('start_quest', (eff, { state }) => {
  state.missions.forced = state.missions.forced || [];
  if (!state.missions.forced.includes(eff.missionId)) state.missions.forced.push(eff.missionId);
  return null;
});

registerEffect('unlock_building', (eff, { state }) => {
  state.unlockedBuildings = state.unlockedBuildings || [];
  if (!state.unlockedBuildings.includes(eff.building)) state.unlockedBuildings.push(eff.building);
  return null;
});

registerEffect('unlock_tech', (eff, { state }) => {
  if (!state.research.unlocked.includes(eff.tech)) state.research.unlocked.push(eff.tech);
  return null;
});

registerEffect('start_war', (eff, { state }) => {
  const c = state.countries[eff.country];
  if (c) { c.atWar = true; c.relation = Math.min(c.relation, -50); }
  bus.emit('war:started', { country: eff.country });
  return `اعلان جنگ به ${eff.country}`;
});

registerEffect('timeline', (eff) => {
  bus.emit('timeline:add', { text: eff.text });
  return null;
});

registerEffect('title', (eff, { state }) => {
  if (!state.titles.includes(eff.title)) state.titles.push(eff.title);
  bus.emit('title:unlocked', { title: eff.title });
  return null;
});

registerEffect('price_shock', (eff, { state }) => {
  state.market.shocks = state.market.shocks || {};
  state.market.shocks[eff.res] = eff.mult;
  return null;
});

registerEffect('army_training', (eff, { state }) => {
  state.military.training = Math.max(1, Math.min(5, (state.military.training || 1) + eff.amount));
  return null;
});
