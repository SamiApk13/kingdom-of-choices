/**
 * content/technologies.js
 * ------------------------------------------------------------
 * بند 23: درخت فناوری در دسته‌های اقتصاد/کشاورزی/نظامی/ساختمان/
 * تجارت/دفاع/علم. اثر هر فناوری داده‌محور است و توسط موتورها خوانده می‌شود.
 */
export const TECHNOLOGIES = [
  // کشاورزی
  { id: 'tech_agriculture_001', name: 'کشاورزی پیشرفته', branch: 'agriculture',
    description: '+۱۵٪ تولید غذا', cost: { coins: 200, knowledge: 40 }, days: 2,
    effects: { productionMult: { food: 1.15 } }, requires: [], minLevel: 2 },
  { id: 'tech_irrigation_001', name: 'آبیاری', branch: 'agriculture',
    description: '+۱۰٪ تولید غذا و رشد بهتر جمعیت', cost: { coins: 350, knowledge: 70 }, days: 3,
    effects: { productionMult: { food: 1.10 }, growthBonus: 0.001 }, requires: ['tech_agriculture_001'], minLevel: 3 },

  // اقتصاد و تجارت
  { id: 'tech_accounting_001', name: 'حسابداری سلطنتی', branch: 'economy',
    description: '+۱۰٪ درآمد مالیات', cost: { coins: 300, knowledge: 60 }, days: 2,
    effects: { incomeMult: 1.10 }, requires: [], minLevel: 3 },
  { id: 'tech_traderoutes_001', name: 'مسیرهای تجاری', branch: 'trade',
    description: '+۲۰٪ درآمد پیمان‌های تجاری', cost: { coins: 450, knowledge: 90 }, days: 3,
    effects: { tradeIncomeMult: 1.2 }, requires: ['tech_accounting_001'], minLevel: 4 },
  { id: 'tech_guilds_001', name: 'صنف‌های تولیدی', branch: 'economy',
    description: '+۱۵٪ تولید چوب و سنگ', cost: { coins: 500, knowledge: 110 }, days: 3,
    effects: { productionMult: { wood: 1.15, stone: 1.15 } }, requires: ['tech_accounting_001'], minLevel: 5 },

  // نظامی
  { id: 'tech_steel_001', name: 'فولادسازی', branch: 'military',
    description: '+۱۵٪ قدرت واحدها', cost: { coins: 400, knowledge: 80, iron: 40 }, days: 3,
    effects: { militaryMult: 1.15 }, requires: [], minLevel: 4 },
  { id: 'tech_horse_001', name: 'پرورش اسب', branch: 'military',
    description: 'استخدام سواره‌نظام را باز می‌کند', cost: { coins: 350, knowledge: 70 }, days: 2,
    effects: {}, requires: [], minLevel: 4 },
  { id: 'tech_tactics_001', name: 'آرایش رزم', branch: 'military',
    description: '+۱۰٪ قدرت نظامی', cost: { coins: 600, knowledge: 140 }, days: 3,
    effects: { militaryMult: 1.10 }, requires: ['tech_steel_001'], minLevel: 6 },

  // ساختمان و دفاع
  { id: 'tech_architecture_001', name: 'مهندسی ساختمان', branch: 'building',
    description: '+۲۰٪ سرعت ساخت', cost: { coins: 380, knowledge: 75 }, days: 2,
    effects: { buildSpeedMult: 1.2 }, requires: [], minLevel: 3 },
  { id: 'tech_stonewall_001', name: 'دیوار سنگی', branch: 'defense',
    description: '+۲۰٪ دفاع قلعه و دیوار', cost: { coins: 420, knowledge: 90, stone: 150 }, days: 3,
    effects: { defenseMult: 1.2 }, requires: ['tech_architecture_001'], minLevel: 5 },

  // علم و جامعه
  { id: 'tech_medicine_001', name: 'پزشکی', branch: 'science',
    description: 'رشد جمعیت سریع‌تر', cost: { coins: 350, knowledge: 85 }, days: 2,
    effects: { growthBonus: 0.0015 }, requires: [], minLevel: 4 },
  { id: 'tech_admin_001', name: 'دیوان‌سالاری', branch: 'science',
    description: '+۲ نفوذ سیاسی در روز', cost: { coins: 500, knowledge: 120 }, days: 3,
    effects: { influencePerDay: 2 }, requires: ['tech_medicine_001'], minLevel: 5 },
  { id: 'tech_spies_001', name: 'شبکه جاسوسی', branch: 'science',
    description: '+۱۵٪ موفقیت جاسوسی', cost: { coins: 450, knowledge: 100 }, days: 2,
    effects: { spyBonus: 15 }, requires: [], minLevel: 5 },
  { id: 'tech_granary_001', name: 'ذخیره غذایی', branch: 'agriculture',
    description: '-۱۰٪ مصرف غذای جمعیت', cost: { coins: 300, knowledge: 65 }, days: 2,
    effects: { foodUseMult: 0.9 }, requires: ['tech_agriculture_001'], minLevel: 3 },
];
