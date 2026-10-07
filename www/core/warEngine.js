/**
 * core/warEngine.js
 * ------------------------------------------------------------
 * بند 17: جنگ محاسباتی (بدون نبرد Real-Time).
 * قدرت = واحدها × آموزش × روحیه × ژنرال × فناوری × ضریب سبک × تصادف کنترل‌شده.
 */
import { randFloat } from './rng.js';

/** برآورد قدرت نظامی بازیکن */
export function estimateMilitaryPower(state, config, content) {
  const units = content?.units || [];
  let power = 0;
  for (const u of units) {
    const count = state.military.units[u.id] || 0;
    power += count * u.power;
  }
  const training = state.military.training || 1;
  power *= 1 + (training - 1) * 0.12;
  power *= 0.5 + (state.stats.morale / 100) * 0.6;

  // ژنرال فرمانده (اولین ژنرال) — قدرت + ویژگی (بند 16)
  const general = (state.generals || [])[0];
  if (general) {
    power *= 1 + (general.power || 5) / 100;
    if (general.trait === 'strategist') power *= 1.05;
  }

  // فناوری‌های نظامی
  for (const tech of content?.technologies || []) {
    if (state.research.unlocked.includes(tech.id) && tech.effects?.militaryMult) {
      power *= tech.effects.militaryMult;
    }
  }
  // سبک حکومت
  const style = config.govStyles?.[state.kingdom.style];
  if (style?.militaryMult) power *= style.militaryMult;

  return Math.round(power);
}

/** قدرت کشور مقصد که با زمان رشد می‌کند */
export function enemyStrength(country, state, config) {
  const day = state.kingdom.day;
  const growth = 1 + (day - 1) * ((config.war.enemyGrowthPerDay || 1) / 1000);
  return Math.round(country.power * growth);
}

/** پاداش دفاعی از دیوار و قلعه (وقتی دشمن به ما حمله می‌کند) */
export function defenseBonus(state, content) {
  let bonus = 1;
  const wall = state.buildings['building_wall_001'];
  const castle = state.buildings['building_castle_001'];
  if (wall?.level) bonus += wall.level * 0.08;
  if (castle?.level) bonus += castle.level * 0.10;
  for (const tech of content?.technologies || []) {
    if (state.research.unlocked.includes(tech.id) && tech.effects?.defenseMult) bonus *= tech.effects.defenseMult;
  }
  return bonus;
}

/**
 * حل نبرد و بازگرداندن گزارش کامل (بند 17).
 * @param {boolean} opts.weAttack - ما حمله‌کننده هستیم (دشمن در خاک خود دفاع می‌کند)
 */
export function resolveBattle(state, config, country, content, opts = {}) {
  const w = config.war;
  let ourPower = estimateMilitaryPower(state, config, content) * randFloat(w.randomMin, w.randomMax);
  let enemyPower = enemyStrength(country, state, config) * randFloat(w.randomMin, w.randomMax);

  if (opts.weAttack) {
    enemyPower *= w.defenderBonus; // دفاع در خاک خود
    const general = (state.generals || [])[0];
    if (general?.trait === 'warrior') ourPower *= 1.10;   // جنگجو: +۱۰٪ حمله
    if (general?.trait === 'fast') ourPower *= 1.05;      // سریع
  } else {
    ourPower *= defenseBonus(state, content); // دیوار و قلعه ما
    const general = (state.generals || [])[0];
    if (general?.trait === 'defender') ourPower *= 1.10;  // مدافع: +۱۰٪ دفاع
  }

  const ratio = ourPower / Math.max(1, enemyPower);
  let result;
  if (ratio >= 1 + w.retreatThreshold) result = 'victory';
  else if (ratio <= 1 - w.retreatThreshold) result = 'defeat';
  else result = 'retreat';

  const totalUnits = Object.values(state.military.units).reduce((a, b) => a + b, 0);
  let ourLosses = 0;
  let enemyLosses = 0;
  const rewards = { coins: 0, food: 0, wood: 0, stone: 0, iron: 0, credibility: 0, popularity: 0, morale: 0, xp: 0, tiles: [] };

  if (result === 'victory') {
    ourLosses = Math.round(totalUnits * w.casualtyBase * w.winnerCasualtyPct * randFloat(0.7, 1.3));
    enemyLosses = Math.round(Math.max(50, totalUnits) * w.casualtyBase * 2.2 * randFloat(0.8, 1.4));
    rewards.coins = Math.round(w.lootCoinsBase * (country.economy / 100 + 0.5) * randFloat(0.8, 1.4));
    const resPool = ['food', 'wood', 'stone', 'iron'];
    const r = resPool[Math.floor(Math.random() * resPool.length)];
    rewards[r] = Math.round(w.lootResourceBase * randFloat(0.7, 1.3));
    rewards.credibility = w.credibilityWin;
    rewards.popularity = w.popularityWin;
    rewards.morale = w.moraleWin;
    rewards.xp = config.xp.warWinXp;
    // فتح یک کاشی مرزی از دشمن
    const enemyTiles = (state.tiles || []).filter((t) => t.owner === country.id && !t.capital);
    if (enemyTiles.length) rewards.tiles.push(enemyTiles[Math.floor(Math.random() * enemyTiles.length)].id);
  } else if (result === 'defeat') {
    ourLosses = Math.round(totalUnits * w.casualtyBase * randFloat(1.2, 2.0));
    enemyLosses = Math.round(Math.max(30, totalUnits) * w.casualtyBase * 0.4 * randFloat(0.5, 1));
    rewards.coins = -Math.round(w.lootCoinsBase * 0.5);
    rewards.credibility = -w.credibilityLoss;
    rewards.popularity = -w.popularityLoss;
    rewards.morale = -w.moraleLoss;
    rewards.xp = 20;
  } else {
    ourLosses = Math.round(totalUnits * w.casualtyBase * 0.5);
    enemyLosses = ourLosses;
    rewards.morale = -3;
    rewards.xp = 10;
  }

  // اعمال تلفات به‌نسبت تعداد واحدها
  let remaining = ourLosses;
  for (const u of Object.keys(state.military.units)) {
    if (remaining <= 0) break;
    const have = state.military.units[u];
    const loss = Math.min(have, Math.max(1, Math.round(remaining * (have / Math.max(1, totalUnits)))));
    state.military.units[u] -= loss;
    remaining -= loss;
  }

  return {
    result,
    ourPower: Math.round(ourPower),
    enemyPower: Math.round(enemyPower),
    ourLosses,
    enemyLosses,
    rewards,
    country: country.id,
    day: state.kingdom.day,
  };
}
