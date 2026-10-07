/**
 * content/buildings.js
 * ------------------------------------------------------------
 * بند 14 و 57: ساختمان‌ها کاملاً داده‌محور هستند؛ هر ساختمان چند
 * سطح دارد با هزینه، زمان ساخت، تولید و نگهداری. اعداد بالانس از
 * پنل مدیریت قابل تغییرند. افزودن ساختمان جدید = افزودن یک آیتم.
 */
export const BUILDINGS = [
  {
    id: 'building_townhall_001', name: 'تالار حکومت', category: 'state',
    description: 'مرکز فرمانروایی؛ نفوذ سیاسی و اعتبار پادشاهی را افزایش می‌دهد.',
    minLevel: 1, maxLevel: 5, icon: 'castle',
    levels: [
      { cost: {}, buildDays: 0, production: { influence: 1, coins: 5 }, maintenance: {} },
      { cost: { coins: 400, stone: 100 }, buildDays: 3, production: { influence: 2, coins: 10 }, maintenance: { coins: 5 } },
      { cost: { coins: 900, stone: 250 }, buildDays: 4, production: { influence: 3, coins: 18 }, maintenance: { coins: 10 } },
      { cost: { coins: 1800, stone: 500 }, buildDays: 5, production: { influence: 5, coins: 30 }, maintenance: { coins: 18 } },
      { cost: { coins: 3600, stone: 900 }, buildDays: 6, production: { influence: 8, coins: 50 }, maintenance: { coins: 30 } },
    ],
  },
  {
    id: 'building_farm_001', name: 'مزرعه', category: 'food',
    description: 'تولید غذای مردم و ارتش. ستون فقرات اقتصاد پادشاهی.',
    minLevel: 1, maxLevel: 5, icon: 'wheat',
    levels: [
      { cost: {}, buildDays: 0, production: { food: 50 }, maintenance: {} },
      { cost: { coins: 150, wood: 60 }, buildDays: 2, production: { food: 90 }, maintenance: {} },
      { cost: { coins: 320, wood: 120 }, buildDays: 3, production: { food: 150 }, maintenance: {} },
      { cost: { coins: 650, wood: 220 }, buildDays: 4, production: { food: 240 }, maintenance: {} },
      { cost: { coins: 1200, wood: 400 }, buildDays: 5, production: { food: 360 }, maintenance: {} },
    ],
  },
  {
    id: 'building_granary_001', name: 'انبار غله', category: 'food',
    description: 'ذخیره‌سازی اصولی غلات؛ تلفات غذا را کم و تولید خالص را زیاد می‌کند.',
    minLevel: 2, maxLevel: 3, icon: 'food', requiresBuilding: 'building_farm_001', requiresBuildingLevel: 2,
    levels: [
      { cost: { coins: 220, wood: 140 }, buildDays: 2, production: { food: 30 }, maintenance: {} },
      { cost: { coins: 480, wood: 260 }, buildDays: 3, production: { food: 60 }, maintenance: {} },
      { cost: { coins: 900, wood: 420 }, buildDays: 4, production: { food: 100 }, maintenance: {} },
    ],
  },
  {
    id: 'building_warehouse_001', name: 'انبار', category: 'economy',
    description: 'انبارداری و لجستیک؛ از تلفات منابع می‌کاهد.',
    minLevel: 1, maxLevel: 3, icon: 'wood',
    levels: [
      { cost: {}, buildDays: 0, production: { food: 12, wood: 5 }, maintenance: {} },
      { cost: { coins: 200, wood: 120 }, buildDays: 2, production: { food: 22, wood: 10 }, maintenance: {} },
      { cost: { coins: 450, wood: 240 }, buildDays: 3, production: { food: 35, wood: 18 }, maintenance: {} },
    ],
  },
  {
    id: 'building_house_001', name: 'خانه', category: 'civil',
    description: 'مسکن مردم؛ ظرفیت جمعیت پادشاهی را افزایش می‌دهد.',
    minLevel: 1, maxLevel: 5, icon: 'home',
    levels: [
      { cost: {}, buildDays: 0, production: {}, maintenance: {} },
      { cost: { coins: 180, wood: 100 }, buildDays: 2, production: {}, maintenance: {} },
      { cost: { coins: 380, wood: 180, stone: 60 }, buildDays: 3, production: {}, maintenance: {} },
      { cost: { coins: 750, wood: 300, stone: 140 }, buildDays: 4, production: {}, maintenance: {} },
      { cost: { coins: 1400, wood: 500, stone: 280 }, buildDays: 5, production: {}, maintenance: {} },
    ],
  },
  {
    id: 'building_market_001', name: 'بازار', category: 'economy',
    description: 'مرکز تجارت؛ درآمد سکه روزانه ایجاد می‌کند.',
    minLevel: 2, maxLevel: 4, icon: 'market',
    levels: [
      { cost: { coins: 260, wood: 120 }, buildDays: 2, production: { coins: 30 }, maintenance: {} },
      { cost: { coins: 560, wood: 240 }, buildDays: 3, production: { coins: 60 }, maintenance: {} },
      { cost: { coins: 1100, wood: 420, stone: 100 }, buildDays: 4, production: { coins: 100 }, maintenance: {} },
      { cost: { coins: 2100, stone: 260 }, buildDays: 5, production: { coins: 160 }, maintenance: {} },
    ],
  },
  {
    id: 'building_workshop_001', name: 'کارگاه', category: 'production',
    description: 'کارگاه صنایع چوبی؛ تولید چوب را افزایش می‌دهد.',
    minLevel: 2, maxLevel: 4, icon: 'hammer',
    levels: [
      { cost: { coins: 220, stone: 60 }, buildDays: 2, production: { wood: 25 }, maintenance: {} },
      { cost: { coins: 460, stone: 120 }, buildDays: 3, production: { wood: 45 }, maintenance: {} },
      { cost: { coins: 900, stone: 220 }, buildDays: 4, production: { wood: 75 }, maintenance: {} },
      { cost: { coins: 1700, iron: 80 }, buildDays: 5, production: { wood: 115 }, maintenance: {} },
    ],
  },
  {
    id: 'building_quarry_001', name: 'معدن سنگ', category: 'production',
    description: 'استخراج سنگ برای ساختمان‌های دفاعی و شهرها.',
    minLevel: 3, maxLevel: 4, icon: 'stone',
    levels: [
      { cost: { coins: 320, wood: 160 }, buildDays: 3, production: { stone: 20 }, maintenance: {} },
      { cost: { coins: 640, wood: 260 }, buildDays: 4, production: { stone: 40 }, maintenance: {} },
      { cost: { coins: 1200, iron: 60 }, buildDays: 5, production: { stone: 65 }, maintenance: {} },
      { cost: { coins: 2200, iron: 140 }, buildDays: 6, production: { stone: 100 }, maintenance: {} },
    ],
  },
  {
    id: 'building_ironmine_001', name: 'معدن آهن', category: 'production',
    description: 'آهن برای سلاح، ارتش و تجهیزات.',
    minLevel: 4, maxLevel: 4, icon: 'iron', requiresBuilding: 'building_quarry_001',
    levels: [
      { cost: { coins: 420, wood: 200, stone: 80 }, buildDays: 3, production: { iron: 10 }, maintenance: {} },
      { cost: { coins: 800, stone: 180 }, buildDays: 4, production: { iron: 20 }, maintenance: {} },
      { cost: { coins: 1500, stone: 300 }, buildDays: 5, production: { iron: 34 }, maintenance: {} },
      { cost: { coins: 2800 }, buildDays: 6, production: { iron: 55 }, maintenance: {} },
    ],
  },
  {
    id: 'building_barracks_001', name: 'پادگان', category: 'military',
    description: 'مرکز آموزش و سازمان‌دهی ارتش؛ روحیه نیروها را بالا نگه می‌دارد.',
    minLevel: 1, maxLevel: 4, icon: 'sword',
    levels: [
      { cost: {}, buildDays: 0, production: {}, maintenance: { coins: 3 } },
      { cost: { coins: 300, wood: 140 }, buildDays: 2, production: {}, maintenance: { coins: 6 } },
      { cost: { coins: 650, stone: 150 }, buildDays: 3, production: {}, maintenance: { coins: 12 } },
      { cost: { coins: 1300, stone: 300, iron: 60 }, buildDays: 4, production: {}, maintenance: { coins: 22 } },
    ],
  },
  {
    id: 'building_wall_001', name: 'دیوار', category: 'defense',
    description: 'دیوار شهر؛ دفاع پایتخت را در برابر حملات تقویت می‌کند.',
    minLevel: 3, maxLevel: 4, icon: 'security',
    levels: [
      { cost: { coins: 350, stone: 200 }, buildDays: 3, production: {}, maintenance: { coins: 4 } },
      { cost: { coins: 750, stone: 420 }, buildDays: 4, production: {}, maintenance: { coins: 8 } },
      { cost: { coins: 1500, stone: 800 }, buildDays: 5, production: {}, maintenance: { coins: 15 } },
      { cost: { coins: 2900, stone: 1500, iron: 100 }, buildDays: 6, production: {}, maintenance: { coins: 26 } },
    ],
  },
  {
    id: 'building_castle_001', name: 'قلعه', category: 'defense',
    description: 'دژ مستحکم پادشاهی؛ نماد قدرت و آخرین خط دفاعی.',
    minLevel: 5, maxLevel: 3, icon: 'castle', requiresBuilding: 'building_wall_001',
    levels: [
      { cost: { coins: 1200, stone: 800, wood: 200 }, buildDays: 5, production: { credibility: 1 }, maintenance: { coins: 20 } },
      { cost: { coins: 2600, stone: 1600, iron: 150 }, buildDays: 6, production: { credibility: 2 }, maintenance: { coins: 35 } },
      { cost: { coins: 5200, stone: 3000, iron: 320 }, buildDays: 8, production: { credibility: 4 }, maintenance: { coins: 60 } },
    ],
  },
  {
    id: 'building_university_001', name: 'دانشگاه', category: 'science',
    description: 'مرکز دانش و تحقیق؛ دانش تولید می‌کند.',
    minLevel: 4, maxLevel: 3, icon: 'book',
    levels: [
      { cost: { coins: 500, wood: 200 }, buildDays: 3, production: { knowledge: 3 }, maintenance: { coins: 8 } },
      { cost: { coins: 1100, stone: 260 }, buildDays: 4, production: { knowledge: 6 }, maintenance: { coins: 16 } },
      { cost: { coins: 2200, stone: 500 }, buildDays: 5, production: { knowledge: 11 }, maintenance: { coins: 30 } },
    ],
  },
  {
    id: 'building_port_001', name: 'بندر', category: 'trade',
    description: 'بندر تجاری؛ دروازهٔ ثروت از آن‌سوی دریاها.',
    minLevel: 6, maxLevel: 3, icon: 'ship', requiresBuilding: 'building_market_001',
    levels: [
      { cost: { coins: 900, wood: 400, stone: 150 }, buildDays: 4, production: { coins: 55 }, maintenance: { coins: 10 } },
      { cost: { coins: 1900, wood: 700 }, buildDays: 5, production: { coins: 100 }, maintenance: { coins: 18 } },
      { cost: { coins: 3800, iron: 200 }, buildDays: 6, production: { coins: 170 }, maintenance: { coins: 30 } },
    ],
  },
  {
    id: 'building_caravanserai_001', name: 'کاروانسرا', category: 'trade',
    description: 'ایستگاه کاروان‌ها؛ درآمد تجاری و نفوذ سیاسی می‌آورد.',
    minLevel: 5, maxLevel: 3, icon: 'globe', requiresBuilding: 'building_market_001',
    levels: [
      { cost: { coins: 600, wood: 260 }, buildDays: 3, production: { coins: 25, influence: 1 }, maintenance: {} },
      { cost: { coins: 1300, wood: 460 }, buildDays: 4, production: { coins: 50, influence: 2 }, maintenance: {} },
      { cost: { coins: 2600, stone: 400 }, buildDays: 5, production: { coins: 90, influence: 3 }, maintenance: {} },
    ],
  },
];
