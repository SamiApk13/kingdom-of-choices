/**
 * core/progressionEngine.js
 * ------------------------------------------------------------
 * بند 22/24/25/26: پیشرفت — سطح و XP، مأموریت‌ها، دستاوردها و لقب‌ها.
 * همه این‌ها داده‌محورند و با متریک‌های وضعیت بازی سنجیده می‌شوند.
 */
import { estimateMilitaryPower } from './warEngine.js';

export function xpForLevel(level, config) {
  return Math.round(config.xp.base * Math.pow(config.xp.growth, level - 1));
}

/** اعمال افزایش سطح در صورت کسب XP کافی؛ تعداد سطح‌های کسب‌شده را برمی‌گرداند */
export function checkLevelUp(state, config) {
  let gained = 0;
  while (state.kingdom.level < config.xp.maxLevel && state.kingdom.xp >= xpForLevel(state.kingdom.level, config)) {
    state.kingdom.xp -= xpForLevel(state.kingdom.level, config);
    state.kingdom.level += 1;
    gained += 1;
  }
  return gained;
}

/* ---------- متریک‌ها: تنها منبع حقیقت برای مأموریت/دستاورد/لقب ---------- */
export function metricValue(state, metric, ctx = {}) {
  const s = state;
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
  switch (metric) {
    case 'coins': return s.resources.coins;
    case 'food': return s.resources.food;
    case 'wood': return s.resources.wood;
    case 'stone': return s.resources.stone;
    case 'iron': return s.resources.iron;
    case 'population': return s.resources.population;
    case 'knowledge': return s.resources.knowledge;
    case 'influence': return s.resources.influence;
    case 'credibility': return s.resources.credibility;
    case 'popularity': return s.stats.popularity;
    case 'security': return s.stats.security;
    case 'morale': return s.stats.morale;
    case 'level': return s.kingdom.level;
    case 'day': return s.kingdom.day;
    case 'military': return estimateMilitaryPower(s, ctx.config || { govStyles: {} }, ctx.content || { units: [], technologies: [] });
    case 'army_total': return sum(s.military.units);
    case 'decisions_total': return s.history.stats.decisions;
    case 'wars_total': return s.history.stats.wars;
    case 'wars_won': return s.history.stats.wins;
    case 'wars_lost': return s.history.stats.losses;
    case 'buildings_total': return Object.values(s.buildings).filter((b) => b.level > 0).length;
    case 'building_levels_total': return Object.values(s.buildings).reduce((a, b) => a + b.level, 0);
    case 'territory': return (s.ownedTiles || []).length;
    case 'techs': return (s.research.unlocked || []).length;
    case 'trade_pacts': return Object.values(s.countries).filter((c) => c.tradePact).length;
    case 'alliances': return Object.values(s.countries).filter((c) => c.alliance).length;
    case 'relations_good': return Object.values(s.countries).filter((c) => c.relation >= 50).length;
    case 'generals': return (s.generals || []).length;
    case 'daily_decisions': return s.missions.counters?.decisionsToday || 0;
    case 'daily_builds': return s.missions.counters?.buildsToday || 0;
    case 'daily_trades': return s.missions.counters?.tradesToday || 0;
    case 'daily_recruits': return s.missions.counters?.recruitsToday || 0;
    case 'daily_gifts': return s.missions.counters?.giftsToday || 0;
    case 'max_popularity': return s.history.stats.maxPopularity;
    case 'treasury_peak': return s.history.stats.peakCoins;
    case 'days_no_war': return s.history.stats.daysWithoutWar;
    default:
      console.warn('[progression] متریک ناشناخته:', metric);
      return 0;
  }
}

function cmpNum(a, op, b) {
  switch (op) {
    case '>=': return a >= b;
    case '<=': return a <= b;
    case '>': return a > b;
    case '<': return a < b;
    case '==': return a === b;
    default: return a >= b;
  }
}

/** پیشرفت یک مأموریت (۰ تا ۱) + مقدار فعلی/هدف */
export function missionProgress(state, mission, ctx) {
  const cond = mission.condition;
  if (!cond) return { pct: 1, current: 0, target: 0, done: true };
  const current = metricValue(state, cond.metric, ctx);
  const target = cond.value;
  return {
    pct: Math.min(1, Math.max(0, current / Math.max(1, target))),
    current: Math.floor(current),
    target,
    done: cmpNum(current, cond.op || '>=', target),
  };
}

export function isMissionAvailable(state, mission) {
  if (mission.enabled === false) return false;
  if (mission.requiresMission && !state.missions.claimed?.[mission.requiresMission]) return false;
  if (mission.minLevel && state.kingdom.level < mission.minLevel) return false;
  return true;
}

/** انتخاب مأموریت‌های روزانه از استخر (بر اساس روز برای تنوع) */
export function pickDailyMissions(state, config, content, seedDay) {
  const pool = content.missions.filter((m) => m.type === 'daily' && m.enabled !== false);
  const n = config.dailyMissionCount;
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool[(seedDay * (i + 3) + i * 7) % pool.length]);
  }
  return [...new Set(out)];
}

export function pickWeeklyMissions(state, config, content, seedWeek) {
  const pool = content.missions.filter((m) => m.type === 'weekly' && m.enabled !== false);
  const n = config.weeklyMissionCount;
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool[(seedWeek * (i + 5) + i * 3) % pool.length]);
  }
  return [...new Set(out)];
}

/* ---------- دستاوردها (بند 25) ---------- */
export function checkAchievements(state, config, content) {
  const unlockedNow = [];
  const ctx = { config, content };
  for (const ach of content.achievements) {
    if (ach.enabled === false) continue;
    if (state.achievements[ach.id]) continue;
    const cond = ach.condition;
    const val = metricValue(state, cond.metric, ctx);
    if (cmpNum(val, cond.op || '>=', cond.value)) {
      state.achievements[ach.id] = { day: state.kingdom.day };
      unlockedNow.push(ach);
    }
  }
  return unlockedNow;
}

/* ---------- لقب‌ها (بند 26) ---------- */
export function checkTitles(state, config, content) {
  const unlockedNow = [];
  const ctx = { config, content };
  for (const title of content.titles) {
    if (state.titles.includes(title.id)) continue;
    const cond = title.condition;
    const val = metricValue(state, cond.metric, ctx);
    if (cmpNum(val, cond.op || '>=', cond.value)) {
      state.titles.push(title.id);
      unlockedNow.push(title);
    }
  }
  return unlockedNow;
}
