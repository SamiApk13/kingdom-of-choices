/**
 * content/titles.js
 * ------------------------------------------------------------
 * بند 26: لقب‌های قابل کسب بر اساس رفتار و دستاوردهای بازیکن.
 */
export const TITLES = [
  { id: 'title_wise', name: 'پادشاه خردمند', description: '۲۵ تصمیم دربار گرفته‌اید.',
    condition: { metric: 'decisions_total', op: '>=', value: 25 } },
  { id: 'title_lion', name: 'شیر شمال', description: '۳ پیروزی نظامی کسب کرده‌اید.',
    condition: { metric: 'wars_won', op: '>=', value: 3 } },
  { id: 'title_conqueror', name: 'فاتح بزرگ', description: 'قلمرو خود را به ۱۰ منطقه رسانده‌اید.',
    condition: { metric: 'territory', op: '>=', value: 10 } },
  { id: 'title_rich', name: 'شاه ثروتمند', description: '۵۰٬۰۰۰ سکه اندوخته‌اید.',
    condition: { metric: 'coins', op: '>=', value: 50000 } },
  { id: 'title_beloved', name: 'فرمانروای محبوب', description: 'محبوبیت ۹۵ را لمس کرده‌اید.',
    condition: { metric: 'max_popularity', op: '>=', value: 95 } },
  { id: 'title_diplomat', name: 'دیپلمات اعظم', description: 'با ۳ کشور پیمان اتحاد دارید.',
    condition: { metric: 'alliances', op: '>=', value: 3 } },
  { id: 'title_architect', name: 'معمار امپراتوری', description: 'مجموع سطوح ساختمان‌ها به ۳۰ رسیده است.',
    condition: { metric: 'building_levels_total', op: '>=', value: 30 } },
  { id: 'title_sultan', name: 'سلطان تجارت', description: '۴ پیمان تجاری فعال دارید.',
    condition: { metric: 'trade_pacts', op: '>=', value: 4 } },
  { id: 'title_defender', name: 'دفاع‌گر مردم', description: 'امنیت را به ۹۵ رسانده‌اید.',
    condition: { metric: 'security', op: '>=', value: 95 } },
  { id: 'title_destroyer', name: 'ویرانگر دشمنان', description: '۷ پیروزی نظامی کسب کرده‌اید.',
    condition: { metric: 'wars_won', op: '>=', value: 7 } },
  { id: 'title_eternal', name: 'فرمانروای ماندگار', description: '۲۰۰ روز حکومت کرده‌اید.',
    condition: { metric: 'day', op: '>=', value: 200 } },
  { id: 'title_mighty', name: 'پادشاه نیرومند', description: 'پادشاهی را به سطح ۸ رسانده‌اید.',
    condition: { metric: 'level', op: '>=', value: 8 } },
];
