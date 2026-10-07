/**
 * content/generals.js
 * ------------------------------------------------------------
 * بند 16: ژنرال‌ها. ویژگی‌ها: جنگجو/مدافع/استراتژیست/سریع/کاریزماتیک.
 * وفاداری پایین می‌تواند به خیانت منجر شود.
 */
export const GENERALS = [
  {
    id: 'general_arshan_001', name: 'آرشان', epithet: 'شیر میدان',
    trait: 'warrior', traitName: 'جنگجو (+۱۰٪ حمله)',
    level: 2, power: 10, loyalty: 75, hireCost: 600,
    description: 'فرمانده‌ای بی‌باک که در خط مقدم می‌جنگد.',
  },
  {
    id: 'general_banoo_002', name: 'بانو مهتاب', epithet: 'سپر سرزمین',
    trait: 'defender', traitName: 'مدافع (+۱۰٪ دفاع)',
    level: 2, power: 9, loyalty: 85, hireCost: 650,
    description: 'استاد دفاع؛ دیوارها با او زنده‌اند.',
  },
  {
    id: 'general_soren_003', name: 'سورن', epithet: 'عقبه‌اندیش',
    trait: 'strategist', traitName: 'استراتژیست (+۵٪ اثر تصمیم نظامی)',
    level: 3, power: 12, loyalty: 65, hireCost: 900,
    description: 'ذهنی که نبرد را قبل از شروع می‌برد.',
  },
  {
    id: 'general_kave_004', name: 'کاوه', epithet: 'تندباد',
    trait: 'fast', traitName: 'سریع (+۱۰٪ سرعت)',
    level: 1, power: 7, loyalty: 80, hireCost: 450,
    description: 'سواره‌نظام او زودتر از خبر می‌رسد.',
  },
  {
    id: 'general_ghazal_005', name: 'غزل', epithet: 'دلِ ارتش',
    trait: 'charismatic', traitName: 'کاریزماتیک (+۵٪ روحیه)',
    level: 2, power: 8, loyalty: 90, hireCost: 700,
    description: 'سربازان برای او می‌میرند؛ روحیه ارتش با او بالا می‌ماند.',
  },
];
