/**
 * content/missions.js
 * ------------------------------------------------------------
 * بند 24 و 59: مأموریت‌ها داده‌محورند.
 * نوع‌ها: daily / weekly / story
 * هر مأموریت یک «متریک» را با مقدار هدف می‌سنجد و پاداش دارد.
 */
export const MISSIONS = [
  /* ---------- روزانه (استخر چرخشی) ---------- */
  { id: 'mission_daily_001', type: 'daily', title: 'وقت دربار', description: 'امروز یک تصمیم در دربار بگیر.',
    condition: { metric: 'daily_decisions', op: '>=', value: 1 }, reward: { coins: 60 } },
  { id: 'mission_daily_002', type: 'daily', title: 'نبض بازار', description: 'یک معامله در بازار انجام بده.',
    condition: { metric: 'daily_trades', op: '>=', value: 1 }, reward: { coins: 80 } },
  { id: 'mission_daily_003', type: 'daily', title: 'سربازگیری', description: 'حداقل ۵ سرباز جدید استخدام کن.',
    condition: { metric: 'daily_recruits', op: '>=', value: 5 }, reward: { food: 100 } },
  { id: 'mission_daily_004', type: 'daily', title: 'عمران و آبادی', description: 'یک پروژه ساخت یا ارتقا آغاز کن.',
    condition: { metric: 'daily_builds', op: '>=', value: 1 }, reward: { wood: 80 } },
  { id: 'mission_daily_005', type: 'daily', title: 'دوستی‌ها', description: 'به یک کشور هدیه بفرست.',
    condition: { metric: 'daily_gifts', op: '>=', value: 1 }, reward: { influence: 3 } },
  { id: 'mission_daily_006', type: 'daily', title: 'خزانه پر', description: 'خزانه را حداقل با ۸۰۰ سکه نگه دار.',
    condition: { metric: 'coins', op: '>=', value: 800 }, reward: { xp: 20 } },
  { id: 'mission_daily_007', type: 'daily', title: 'تاجر حرفه‌ای', description: 'دو معامله در بازار انجام بده.',
    condition: { metric: 'daily_trades', op: '>=', value: 2 }, reward: { coins: 120 } },
  { id: 'mission_daily_008', type: 'daily', title: 'انبار مردم', description: 'حداقل ۶۰۰ غذا ذخیره داشته باش.',
    condition: { metric: 'food', op: '>=', value: 600 }, reward: { coins: 70 } },

  /* ---------- هفتگی ---------- */
  { id: 'mission_weekly_001', type: 'weekly', title: 'اندوخته سلطنتی', description: 'تا پایان هفته ۲۰۰۰ سکه جمع کن.',
    condition: { metric: 'coins', op: '>=', value: 2000 }, reward: { coins: 250 } },
  { id: 'mission_weekly_002', type: 'weekly', title: 'پادشاه مردم', description: 'محبوبیت را به ۸۰ برسان.',
    condition: { metric: 'popularity', op: '>=', value: 80 }, reward: { coins: 200, influence: 5 } },
  { id: 'mission_weekly_003', type: 'weekly', title: 'ارتش آماده', description: 'حداقل ۶۰ سرباز در ارتش داشته باش.',
    condition: { metric: 'army_total', op: '>=', value: 60 }, reward: { xp: 60, coins: 150 } },
  { id: 'mission_weekly_004', type: 'weekly', title: 'امنیت غذایی', description: '۱۵۰۰ غذا در انبارها ذخیره کن.',
    condition: { metric: 'food', op: '>=', value: 1500 }, reward: { coins: 180 } },

  /* ---------- داستانی (زنجیره‌ای) ---------- */
  { id: 'mission_story_001', type: 'story', title: 'گام نخست: آبادانی', description: 'تعداد ساختمان‌های پادشاهی را به ۵ برسان.',
    condition: { metric: 'buildings_total', op: '>=', value: 5 }, reward: { coins: 250 } },
  { id: 'mission_story_002', type: 'story', title: 'ارتش دائمی', description: 'ارتشی با حداقل ۵۰ سرباز تشکیل بده.',
    requiresMission: 'mission_story_001',
    condition: { metric: 'army_total', op: '>=', value: 50 }, reward: { coins: 350 } },
  { id: 'mission_story_003', type: 'story', title: 'نخستین پیروزی', description: 'در یک جنگ پیروز شو.',
    requiresMission: 'mission_story_002',
    condition: { metric: 'wars_won', op: '>=', value: 1 }, reward: { coins: 400, credibility: 10 } },
  { id: 'mission_story_004', type: 'story', title: 'قلمرو گسترده', description: 'مالک حداقل ۴ منطقه نقشه شو.',
    requiresMission: 'mission_story_003',
    condition: { metric: 'territory', op: '>=', value: 4 }, reward: { xp: 150, coins: 300 } },
  { id: 'mission_story_005', type: 'story', title: 'راه دانش', description: 'دو فناوری کشف کن.',
    requiresMission: 'mission_story_004',
    condition: { metric: 'techs', op: '>=', value: 2 }, reward: { coins: 500, knowledge: 30 } },
  { id: 'mission_story_006', type: 'story', title: 'پادشاهی نیرومند', description: 'پادشاهی را به سطح ۸ برسان.',
    requiresMission: 'mission_story_005', minLevel: 5,
    condition: { metric: 'level', op: '>=', value: 8 }, reward: { coins: 1000, title: 'title_mighty' } },
];
