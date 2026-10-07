/**
 * content/mapTiles.js
 * ------------------------------------------------------------
 * بند 20/21: نقشه پادشاهی. هر کاشی ID یکتا دارد و نوع، موقعیت،
 * مالک اولیه و تولید غیرفعالِ خود را با خود حمل می‌کند.
 * کاشی‌های رود/کوه قفل طبیعی‌اند؛ خاک کشورهای همسایه فقط با جنگ فتح می‌شود.
 */

const T = (x, y, type, name, extra = {}) => ({ x, y, type, name, ...extra });

/** تولید غیرفعال کاشی وقتی متعلق به بازیکن باشد */
export const TILE_PRODUCTION = {
  capital: { coins: 10 },
  farm: { food: 20 },
  forest: { wood: 12 },
  mine: { iron: 5 },
  quarry: { stone: 8 },
  village: { coins: 8 },
  plain: { food: 3 },
  river: {},
  mountain: {},
};

export const TILE_TYPE_NAMES = {
  capital: 'پایتخت', farm: 'مزرعه', forest: 'جنگل', mine: 'معدن آهن',
  quarry: 'معدن سنگ', village: 'روستا', plain: 'دشت', river: 'رود', mountain: 'کوهستان',
};

const tiles = [
  /* ---------- مرز شمالی: پادشاهی شمال و آهن ---------- */
  T(1, 0, 'mountain', 'کوهستان شمال', { startOwner: 'country_north_001' }),
  T(2, 0, 'mountain', 'قله‌های یخی', { startOwner: 'country_north_001' }),
  T(3, 0, 'plain', 'دشت‌های برفی', { startOwner: 'country_north_001' }),
  T(4, 0, 'village', 'روستاهای شمالی', { startOwner: 'country_north_001' }),
  T(5, 0, 'forest', 'جنگل‌های سرد', { startOwner: 'country_north_001' }),
  T(6, 0, 'plain', 'تپه‌های مرزی', { startOwner: 'country_north_001' }),
  T(7, 0, 'mine', 'کوره‌های آهن', { startOwner: 'country_iron_005' }),
  T(8, 0, 'mine', 'کارگاه فولاد', { startOwner: 'country_iron_005' }),
  T(8, 1, 'mountain', 'کوه آهن', { startOwner: 'country_iron_005' }),

  /* ---------- مرز غربی: پادشاهی جنگل ---------- */
  T(0, 0, 'forest', 'جنگل باستانی', { startOwner: 'country_forest_003' }),
  T(0, 1, 'forest', 'بیشه کهن', { startOwner: 'country_forest_003' }),
  T(0, 2, 'forest', 'جنگل مه', { startOwner: 'country_forest_003' }),
  T(0, 3, 'village', 'دهکده الوار', { startOwner: 'country_forest_003' }),
  T(0, 4, 'forest', 'جنگل تاریک', { startOwner: 'country_forest_003' }),
  T(0, 5, 'forest', 'جنگل جنوبی مرزی', { startOwner: 'country_forest_003' }),

  /* ---------- مرز شرقی: پادشاهی صحرا ---------- */
  T(8, 2, 'plain', 'شن‌های روان', { startOwner: 'country_desert_002' }),
  T(8, 3, 'plain', 'واحه خشک', { startOwner: 'country_desert_002' }),
  T(8, 4, 'village', 'کاروان‌سرای صحرا', { startOwner: 'country_desert_002' }),
  T(8, 5, 'plain', 'تپه‌های شنی', { startOwner: 'country_desert_002' }),
  T(8, 6, 'plain', 'مرکز صحرای شرقی', { startOwner: 'country_desert_002' }),

  /* ---------- مرز جنوبی: پادشاهی ساحل ---------- */
  T(0, 6, 'plain', 'خلیج غربی', { startOwner: 'country_coastal_004' }),
  T(1, 6, 'plain', 'بندر بزرگ', { startOwner: 'country_coastal_004' }),
  T(2, 6, 'plain', 'کرانه صدف', { startOwner: 'country_coastal_004' }),
  T(3, 6, 'village', 'دهکده ماهیگیران', { startOwner: 'country_coastal_004' }),
  T(4, 6, 'plain', 'ساحل طلایی', { startOwner: 'country_coastal_004' }),
  T(5, 6, 'plain', 'کرانه باد', { startOwner: 'country_coastal_004' }),
  T(6, 6, 'village', 'بندرگاه جنوبی', { startOwner: 'country_coastal_004' }),
  T(7, 6, 'plain', 'خلیج شرقی', { startOwner: 'country_coastal_004' }),

  /* ---------- داخل قلمرو (خنثی و قابل گشایش) ---------- */
  T(1, 1, 'farm', 'مزرعه شمالی'),
  T(2, 1, 'plain', 'دشت شبنم'),
  T(3, 1, 'forest', 'جنگل بلوط'),
  T(4, 1, 'village', 'روستای کوهپایه'),
  T(5, 1, 'quarry', 'معدن سنگ شمالی'),
  T(6, 1, 'mountain', 'کوه مه', { locked: true }),
  T(7, 1, 'plain', 'تپه زرد'),

  T(1, 2, 'forest', 'بیشه زال'),
  T(2, 2, 'river', 'رود نقره‌ای', { locked: true }),
  T(3, 2, 'farm', 'مزرعه گندم'),
  T(4, 2, 'plain', 'دشت گندم'),
  T(5, 2, 'farm', 'مزرعه آفتاب'),
  T(6, 2, 'mine', 'معدن آهن شرقی'),
  T(7, 2, 'plain', 'دشت خاموش'),

  T(1, 3, 'plain', 'دشت غربی'),
  T(2, 3, 'farm', 'مزرعه رودبار'),
  T(3, 3, 'plain', 'صحرا کوچک'),
  T(4, 3, 'capital', 'پایتخت', { startOwner: 'player' }),
  T(5, 3, 'plain', 'دشت شرقی'),
  T(6, 3, 'village', 'روستای شرقی'),
  T(7, 3, 'quarry', 'معدن سنگ شرقی'),

  T(1, 4, 'forest', 'جنگل جنوبی'),
  T(2, 4, 'village', 'روستای جنوبی'),
  T(3, 4, 'farm', 'مزرعه بهار'),
  T(4, 4, 'plain', 'دشت مرکزی'),
  T(5, 4, 'farm', 'مزرعه جنوبی'),
  T(6, 4, 'river', 'رود جنوبی', { locked: true }),
  T(7, 4, 'plain', 'دشت بی‌نام'),

  T(1, 5, 'plain', 'دشت ساحلی'),
  T(2, 5, 'farm', 'مزارع ساحلی'),
  T(3, 5, 'forest', 'جنگل نخل'),
  T(4, 5, 'village', 'بندرگاه کوچک'),
  T(5, 5, 'plain', 'دشت مرجان'),
  T(6, 5, 'farm', 'مزرعه دریا'),
  T(7, 5, 'forest', 'جنگل ساحلی'),
];

let n = 0;
export const MAP_TILES = tiles.map((t) => ({
  id: `tile_${String(++n).padStart(3, '0')}`,
  production: TILE_PRODUCTION[t.type] || {},
  ...t,
}));

/** تولید کاشی‌های تحت تملک بازیکن */
export function ownedTileProduction(state) {
  const owned = new Set(state.ownedTiles || []);
  const out = {};
  for (const t of MAP_TILES) {
    if (!owned.has(t.id)) continue;
    const st = state.tiles.find((x) => x.id === t.id);
    if (st && st.owner !== 'player') continue;
    for (const [k, v] of Object.entries(t.production || {})) out[k] = (out[k] || 0) + v;
  }
  return out;
}
