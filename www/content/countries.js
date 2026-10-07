/**
 * content/countries.js
 * ------------------------------------------------------------
 * بند 18 و 58 و 71: کشورهای همسایه. افزودن کشور جدید = افزودن یک
 * آیتم در این فایل (و در صورت نیاز کاشی‌های مرزی آن در mapTiles).
 */
export const COUNTRIES = [
  {
    id: 'country_north_001', name: 'پادشاهی شمال', flag: '❄️', color: '#7da7d9',
    power: 700, economy: 90, aggression: 35, trust: 55,
    tradePreference: 'food', startingRelation: 10,
    description: 'سرزمین سرد و کوهستانی؛ مردمانی سخت‌کوش با مزارع غنی.',
  },
  {
    id: 'country_desert_002', name: 'پادشاهی صحرا', flag: '🏜️', color: '#d9a648',
    power: 900, economy: 110, aggression: 60, trust: 35,
    tradePreference: 'coins', startingRelation: -20,
    description: 'کاروان‌های ثروتمند و سواران بیابان؛ همسایه‌ای جاه‌طلب.',
  },
  {
    id: 'country_forest_003', name: 'پادشاهی جنگل', flag: '🌲', color: '#5da05f',
    power: 550, economy: 80, aggression: 20, trust: 70,
    tradePreference: 'wood', startingRelation: 25,
    description: 'جنگل‌های انبوه و کمانداران افسانه‌ای؛ صلح‌جوترین همسایه.',
  },
  {
    id: 'country_coastal_004', name: 'پادشاهی ساحل', flag: '⚓', color: '#4fb3c9',
    power: 650, economy: 130, aggression: 30, trust: 60,
    tradePreference: 'trade', startingRelation: 15,
    description: 'بندرها و کشتی‌ها؛ ثروتمندترین شریک تجاری منطقه.',
  },
  {
    id: 'country_iron_005', name: 'پادشاهی آهن', flag: '⚒️', color: '#9a9aa5',
    power: 1100, economy: 100, aggression: 75, trust: 25,
    tradePreference: 'iron', startingRelation: -40,
    description: 'کوره‌های آهن و ارتش‌های فولادین؛ خطرناک‌ترین همسایه.',
  },
];
