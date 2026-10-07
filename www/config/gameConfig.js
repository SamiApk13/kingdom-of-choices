/**
 * config/gameConfig.js
 * ------------------------------------------------------------
 * تمام اعداد و بالانس بازی از این فایل خوانده می‌شوند (بند 2 و 31 سند).
 * هیچ عدد بالانسی نباید داخل منطق بازی hard-code شود.
 * این مقادیر از طریق «پنل مدیریت» (admin.html) یا در آینده از طریق
 * Remote Config سرور قابل بازنویسی هستند (ذخیره در localStorage با کلید
 * koc_remote_config).
 */

export const DEFAULT_CONFIG = {
  clientVersion: '1.0.0',
  contentVersion: 1,

  /* ---------- بند 69: منابع شروع بازی ---------- */
  start: {
    coins: 500,
    food: 500,
    wood: 300,
    stone: 250,
    iron: 100,
    population: 1000,
    popularity: 70,
    security: 60,
    morale: 70,          // روحیه ارتش
    knowledge: 0,
    influence: 20,
    credibility: 10,     // اعتبار سلطنتی
    xp: 0,
    level: 1,
    day: 1,
    territory: 1,
  },

  housing: { base: 1800, perHouseLevel: 700 },

  /* ---------- رشد جمعیت (بند 13) ---------- */
  population: {
    growthBase: 0.004,        // رشد پایه روزانه در شرایط خوب
    foodPerPersonPerDay: 0.5, // مصرف غذای هر نفر در روز
    starvingPenalty: 0.02,    // ریزش جمعیت در صورت قحطی
    securityMigration: 0.002, // مهاجرت با امنیت پایین
    popularityMigration: 0.002,
  },

  /* ---------- بند 12: سطوح مالیات ---------- */
  taxLevels: [
    { id: 'very_low', name: 'خیلی کم', coinsPerPop: 0.05, popularity: +1, unrestRisk: 0, },
    { id: 'low',      name: 'کم',      coinsPerPop: 0.10, popularity: +0.5, unrestRisk: 0 },
    { id: 'normal',   name: 'متوسط',   coinsPerPop: 0.18, popularity: 0, unrestRisk: 0 },
    { id: 'high',     name: 'زیاد',    coinsPerPop: 0.30, popularity: -1, unrestRisk: 3 },
    { id: 'very_high',name: 'خیلی زیاد',coinsPerPop: 0.45, popularity: -2.5, unrestRisk: 7 },
  ],

  /* ---------- رفاه عمومی ---------- */
  welfareLevels: [
    { id: 'none', name: 'بدون رفاه', costPct: 0, popularity: -0.5, growthBonus: 0 },
    { id: 'low', name: 'رفاه کم', costPct: 0.04, popularity: +0.2, growthBonus: 0.0005 },
    { id: 'medium', name: 'رفاه متوسط', costPct: 0.08, popularity: +0.5, growthBonus: 0.001 },
    { id: 'high', name: 'رفاه زیاد', costPct: 0.14, popularity: +1, growthBonus: 0.002 },
  ],

  /* ---------- بودجه امنیت ---------- */
  securityLevels: [
    { id: 'low', name: 'امنیت کم', costPerDay: 5, security: +0.2, crimeRisk: 4 },
    { id: 'normal', name: 'امنیت عادی', costPerDay: 15, security: +0.5, crimeRisk: 2 },
    { id: 'high', name: 'امنیت زیاد', costPerDay: 35, security: +1, crimeRisk: 0.5 },
  ],

  /* ---------- بودجه‌های تخصصی (ضریب هزینه/اثر) ---------- */
  budgets: {
    army:    { levels: [0, 10, 25, 50], moraleGain: [0, 0.2, 0.5, 1.0], powerGain: [0, 0.2, 0.5, 1.0] },
    farm:    { levels: [0, 10, 25, 50], foodBonusPct: [0, 0.05, 0.1, 0.18] },
    science: { levels: [0, 10, 25, 50], knowledgeGain: [0, 2, 5, 10] },
  },

  /* ---------- بند 22: منحنی XP ---------- */
  xp: {
    base: 120,
    growth: 1.32, // xpForLevel(n) = base * growth^(n-1)
    maxLevel: 100,
    decisionXp: 15,
    buildXp: 30,
    warWinXp: 80,
    tradeXp: 8,
    researchXp: 40,
    missionXp: 25,
    expandXp: 50,
  },

  /* ---------- بند 73: وزن کمیابی رویدادها ---------- */
  rarityWeights: { common: 70, rare: 20, epic: 8, legendary: 2 },

  /* ---------- بازار (بند 19) ---------- */
  market: {
    base: { food: 2, wood: 3, stone: 4, iron: 12 },
    volatility: 0.12,
    minPrice: 0.4,
    maxPriceMult: 4,
    feePct: 0.05,       // کارمزد معامله
    driftBack: 0.08,    // سرعت برگشت قیمت به سمت پایه
  },

  /* ---------- بند 17: فرمول جنگ ---------- */
  war: {
    randomMin: 0.85,
    randomMax: 1.18,
    defenderBonus: 1.15,   // اگر دشمن دفاع کند
    casualtyBase: 0.10,    // درصد تلفات پایه طرف بازنده
    winnerCasualtyPct: 0.45,
    lootCoinsBase: 400,
    lootResourceBase: 250,
    credibilityWin: 8,
    credibilityLoss: 5,
    popularityWin: 6,
    popularityLoss: 8,
    moraleWin: 5,
    moraleLoss: 10,
    enemyGrowthPerDay: 1.5, // قدرت کشورها با گذشت زمان رشد می‌کند
    retreatThreshold: 0.12, // اختلاف کمتر از این = عقب‌نشینی
  },

  /* ---------- توسعه قلمرو (بند 21) ---------- */
  expansion: {
    baseCost: { coins: 200, influence: 5, population: 50 },
    costGrowthPerOwned: 1.25,
    baseDays: 2,
  },

  /* ---------- ژنرال‌ها (بند 16) ---------- */
  generals: {
    upkeepPerDay: 12,
    loyaltyDecayOnBankrupt: 4,
    betrayalThreshold: 20,
  },

  /* ---------- شورش و بحران ---------- */
  unrest: {
    popularityDanger: 10,   // زیر این عدد خطر شورش خیلی زیاد
    securityDanger: 20,
    revoltChanceBase: 8,    // درصد پایه شورش در شرایط خطر
  },

  /* ---------- بند 61: فیچر فلگ‌ها ---------- */
  featureFlags: {
    war: true,
    market: true,
    leaderboard: true,
    season: false,
    cloudSave: false,
    multiplayer: false,
    tutorial: true,
  },

  /* ---------- سبک‌های حکومت (بند 4) ---------- */
  govStyles: {
    warrior:      { militaryMult: 1.10, armyCostMult: 1.05 },
    merchant:     { tradeIncomeMult: 1.10, militaryMult: 0.95 },
    popular:      { startPopularity: +10, taxIncomeMult: 0.95 },
    strategist:   { spyEffectMult: 1.10, politicalCostMult: 1.05 },
    expansionist: { buildSpeedMult: 1.10, buildCostMult: 1.10 },
  },

  /* ---------- روزهای هفته برای مأموریت روزانه ---------- */
  dailyMissionCount: 3,
  weeklyMissionCount: 2,

  /* ---------- ذخیره‌سازی ---------- */
  save: {
    key: 'koc_save_v2',
    backupCount: 3,
    autoSave: true,
  },
};

/**
 * ادغام پیکربندی پایه با تنظیمات از راه دور (پنل مدیریت/سرور آینده).
 * هر کلید موجود در overrides جایگزین مقدار پایه می‌شود (شبه‌عمقی).
 */
export function mergeConfig(base, overrides) {
  if (!overrides || typeof overrides !== 'object') return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(overrides)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base && typeof base[k] === 'object' && base[k] !== null && !Array.isArray(base[k])) {
      out[k] = mergeConfig(base[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function loadRuntimeConfig(storage) {
  try {
    const raw = storage && storage.get('koc_remote_config');
    if (raw) return mergeConfig(structuredClone(DEFAULT_CONFIG), raw);
  } catch (e) {
    console.warn('remote config merge failed', e);
  }
  return structuredClone(DEFAULT_CONFIG);
}
