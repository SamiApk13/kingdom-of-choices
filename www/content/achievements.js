/**
 * content/achievements.js
 * ------------------------------------------------------------
 * بند 25: دستاوردها. داده‌محور و قابل افزودن از پنل مدیریت.
 */
export const ACHIEVEMENTS = [
  { id: 'ach_first_crown_001', name: 'اولین تاج', description: 'اولین تصمیم سلطنتی خود را بگیر.',
    icon: 'crown', condition: { metric: 'decisions_total', op: '>=', value: 1 } },
  { id: 'ach_rich_king_001', name: 'پادشاه ثروتمند', description: '۱۰۰٬۰۰۰ سکه در خزانه داشته باش.',
    icon: 'coins', condition: { metric: 'coins', op: '>=', value: 100000 } },
  { id: 'ach_conqueror_001', name: 'فاتح', description: '۱۰ جنگ را پیروز شو.',
    icon: 'sword', condition: { metric: 'wars_won', op: '>=', value: 10 } },
  { id: 'ach_peaceful_001', name: 'صلح‌طلب', description: '۵۰ روز پیاپی بدون جنگ بمان.',
    icon: 'globe', condition: { metric: 'days_no_war', op: '>=', value: 50 } },
  { id: 'ach_popular_001', name: 'محبوب', description: 'محبوبیت را به ۹۵ برسان.',
    icon: 'popularity', condition: { metric: 'popularity', op: '>=', value: 95 } },
  { id: 'ach_emperor_001', name: 'امپراتور', description: 'مالک ۲۰ منطقه شو.',
    icon: 'map', condition: { metric: 'territory', op: '>=', value: 20 } },
  { id: 'ach_builder_001', name: 'معمار', description: 'مجموع سطوح ساختمان‌ها را به ۱۲ برسان.',
    icon: 'hammer', condition: { metric: 'building_levels_total', op: '>=', value: 12 } },
  { id: 'ach_commander_001', name: 'فرمانده', description: 'ارتشی با ۲۰۰ سرباز داشته باش.',
    icon: 'military', condition: { metric: 'army_total', op: '>=', value: 200 } },
  { id: 'ach_scholar_001', name: 'دانشمند', description: '۵ فناوری کشف کن.',
    icon: 'book', condition: { metric: 'techs', op: '>=', value: 5 } },
  { id: 'ach_merchant_001', name: 'تاجر بزرگ', description: '۳ پیمان تجاری فعال داشته باش.',
    icon: 'market', condition: { metric: 'trade_pacts', op: '>=', value: 3 } },
  { id: 'ach_diplomat_001', name: 'دیپلمات', description: 'با ۲ کشور متحد شو.',
    icon: 'hand', condition: { metric: 'alliances', op: '>=', value: 2 } },
  { id: 'ach_veteran_001', name: 'فرمانروای کهنه‌کار', description: '۱۰۰ روز حکومت کن.',
    icon: 'clock', condition: { metric: 'day', op: '>=', value: 100 } },
  { id: 'ach_decisive_001', name: 'تصمیم‌گیر قهار', description: '۵۰ تصمیم دربار بگیر.',
    icon: 'scroll', condition: { metric: 'decisions_total', op: '>=', value: 50 } },
  { id: 'ach_thriving_001', name: 'پادشاهی پررونق', description: 'جمعیت را به ۵۰۰۰ برسان.',
    icon: 'population', condition: { metric: 'population', op: '>=', value: 5000 } },
];
