/**
 * core/economyEngine.js
 * ------------------------------------------------------------
 * موتور اقتصاد: محاسبه تولید/مصرف روزانه، مالیات، حقوق ارتش،
 * رشد جمعیت و قیمت‌های بازار. همه اعداد از Config خوانده می‌شوند.
 */
import { randFloat } from './rng.js';

export function getBuildingProduction(buildingDef, level, state, config, content) {
  if (!buildingDef || level <= 0) return { production: {}, maintenance: {} };
  const lv = buildingDef.levels[Math.min(level, buildingDef.levels.length) - 1];
  const production = { ...lv.production };
  const maintenance = { ...lv.maintenance };

  // ضرایب فناوری
  for (const tech of content.technologies || []) {
    if (!state.research.unlocked.includes(tech.id)) continue;
    const fx = tech.effects || {};
    for (const res of Object.keys(production)) {
      if (fx.productionMult?.[res]) production[res] = Math.round(production[res] * fx.productionMult[res]);
    }
  }
  // بودجه کشاورزی روی غذا
  if (production.food) {
    const farmBudget = state.budgets?.farm ?? 1;
    const bonusPct = config.budgets.farm.foodBonusPct[farmBudget] || 0;
    production.food = Math.round(production.food * (1 + bonusPct));
  }
  return { production, maintenance };
}

/** ظرفیت جمعیت بر اساس خانه‌ها */
export function housingCapacity(state, config, content) {
  const house = content.buildings.find((b) => b.id === 'building_house_001');
  const lvl = state.buildings['building_house_001']?.level || 0;
  let cap = config.housing.base + lvl * config.housing.perHouseLevel;
  for (const tech of content.technologies || []) {
    if (state.research.unlocked.includes(tech.id) && tech.effects?.housingMult) {
      cap = Math.round(cap * tech.effects.housingMult);
    }
  }
  return cap;
}

/**
 * محاسبه گردش منابع یک روز کامل.
 * @returns { production, consumption, net, tax, upkeep, welfare, security, details }
 */
export function computeDaily(state, config, content) {
  const production = { coins: 0, food: 0, wood: 0, stone: 0, iron: 0 };
  const consumption = { coins: 0, food: 0, wood: 0, stone: 0, iron: 0 };

  // تولید/نگهداری ساختمان‌ها
  for (const b of content.buildings) {
    const owned = state.buildings[b.id];
    if (!owned || owned.level <= 0 || owned.progress !== null) continue;
    const { production: prod, maintenance } = getBuildingProduction(b, owned.level, state, config, content);
    for (const [k, v] of Object.entries(prod)) production[k] = (production[k] || 0) + v;
    for (const [k, v] of Object.entries(maintenance)) consumption[k] = (consumption[k] || 0) + v;
  }

  // تولید کاشی‌های تحت تملک (بند 20)
  if (content.ownedTileProduction) {
    const tileProd = content.ownedTileProduction(state);
    for (const [k, v] of Object.entries(tileProd)) production[k] = (production[k] || 0) + v;
  }

  // مالیات (بند 12)
  const taxLevel = config.taxLevels.find((t) => t.id === state.taxes.rate) || config.taxLevels[2];
  let tax = Math.round(state.resources.population * taxLevel.coinsPerPop);
  const style = config.govStyles?.[state.kingdom.style];
  if (style?.taxIncomeMult) tax = Math.round(tax * style.taxIncomeMult);
  for (const tech of content.technologies || []) {
    if (state.research.unlocked.includes(tech.id) && tech.effects?.incomeMult) tax = Math.round(tax * tech.effects.incomeMult);
  }
  production.coins += tax;

  // پیمان‌های تجاری
  let tradeIncome = 0;
  for (const c of Object.values(state.countries)) {
    if (c.tradePact && c.relation >= 0) tradeIncome += 15 + Math.round(c.economy / 10);
  }
  if (style?.tradeIncomeMult) tradeIncome = Math.round(tradeIncome * style.tradeIncomeMult);
  for (const tech of content.technologies || []) {
    if (state.research.unlocked.includes(tech.id) && tech.effects?.tradeIncomeMult) tradeIncome = Math.round(tradeIncome * tech.effects.tradeIncomeMult);
  }
  production.coins += tradeIncome;

  // مصرف غذای جمعیت + ارتش (با اثر فناوری ذخیره غذایی)
  const pop = state.resources.population;
  const armySize = Object.values(state.military.units).reduce((a, b) => a + b, 0);
  let foodUse = pop * config.population.foodPerPersonPerDay + armySize * 1;
  for (const tech of content.technologies || []) {
    if (state.research.unlocked.includes(tech.id) && tech.effects?.foodUseMult) foodUse *= tech.effects.foodUseMult;
  }
  consumption.food += Math.round(foodUse);

  // هزینه ارتش
  let upkeep = 0;
  for (const u of content.units) {
    upkeep += (state.military.units[u.id] || 0) * u.upkeep;
  }
  const genUpkeep = (state.generals || []).length * config.generals.upkeepPerDay;
  upkeep += genUpkeep;
  consumption.coins += upkeep;

  // بودجه‌ها
  const armyBudgetCost = config.budgets.army.levels[state.budgets?.army ?? 1] || 0;
  const farmBudgetCost = config.budgets.farm.levels[state.budgets?.farm ?? 1] || 0;
  const sciBudgetCost = config.budgets.science.levels[state.budgets?.science ?? 1] || 0;
  consumption.coins += armyBudgetCost + farmBudgetCost + sciBudgetCost;

  // رفاه و امنیت
  const welfare = config.welfareLevels.find((w) => w.id === state.taxes.welfare) || config.welfareLevels[1];
  const welfareCost = Math.round((production.coins) * welfare.costPct);
  consumption.coins += welfareCost;
  const secLevel = config.securityLevels.find((s) => s.id === state.taxes.security) || config.securityLevels[1];
  consumption.coins += secLevel.costPerDay;

  const net = {};
  for (const k of Object.keys(production)) net[k] = production[k] - consumption[k];

  return { production, consumption, net, tax, tradeIncome, upkeep: upkeep + genUpkeep, welfareCost, welfare, secLevel, armyBudgetCost, farmBudgetCost, sciBudgetCost };
}

/** رشد جمعیت بر اساس غذا، امنیت، رفاه و مسکن (بند 13) */
export function populationChange(state, config, content, daily) {
  const p = config.population;
  const pop = state.resources.population;
  const cap = housingCapacity(state, config, content);
  const foodOk = state.resources.food + daily.net.food >= 0;
  let growth = p.growthBase;
  growth += daily.welfare.growthBonus || 0;
  for (const tech of content.technologies || []) {
    if (state.research.unlocked.includes(tech.id) && tech.effects?.growthBonus) growth += tech.effects.growthBonus;
  }
  if (!foodOk) growth = -p.starvingPenalty;
  if (state.stats.security < 30) growth -= p.securityMigration * ((30 - state.stats.security) / 30);
  if (state.stats.popularity < 30) growth -= p.popularityMigration * ((30 - state.stats.popularity) / 30);
  if (pop >= cap) growth = Math.min(growth, 0);
  let delta = Math.round(pop * growth * randFloat(0.7, 1.3));
  if (pop + delta > cap) delta = cap - pop;
  return delta;
}

/** به‌روزرسانی قیمت‌های بازار (بند 19): نوسان تصادفی + برگشت به سمت قیمت پایه + شوک رویدادها */
export function marketTick(state, config) {
  const m = config.market;
  const prices = state.market.prices;
  const shocks = state.market.shocks || {};
  const prev = { ...prices };
  for (const res of Object.keys(prices)) {
    const base = m.base[res] ?? 1;
    let price = prices[res];
    price *= 1 + randFloat(-m.volatility, m.volatility);
    price += (base - price) * m.driftBack;
    if (shocks[res]) price *= shocks[res];
    prices[res] = Math.min(base * m.maxPriceMult, Math.max(base * m.minPrice, Math.round(price * 100) / 100));
    state.market.trend[res] = prices[res] > prev[res] ? 'up' : prices[res] < prev[res] ? 'down' : 'flat';
  }
  state.market.shocks = {};
}
