/**
 * content/royalStyles.js
 * ------------------------------------------------------------
 * بند 4: سبک‌های حکومت، نمادها، پرچم‌ها، رنگ‌ها و لقب‌های آغازین.
 * مقادیر عددی مزیت‌ها در config/gameConfig.js (بخش govStyles) نگهداری می‌شوند.
 */
export const GOV_STYLES = [
  { id: 'warrior', name: 'جنگجو', icon: 'sword',
    description: 'تمرکز بر قدرت نظامی', bonus: '+۱۰٪ قدرت نظامی، +۵٪ هزینه ارتش' },
  { id: 'merchant', name: 'بازرگان', icon: 'market',
    description: 'تمرکز بر تجارت و درآمد', bonus: '+۱۰٪ درآمد تجارت، -۵٪ قدرت نظامی' },
  { id: 'popular', name: 'محبوب', icon: 'popularity',
    description: 'تمرکز بر دل مردم', bonus: '+۱۰ محبوبیت اولیه، -۵٪ درآمد مالیاتی' },
  { id: 'strategist', name: 'استراتژیست', icon: 'chess',
    description: 'تمرکز بر جاسوسی و سیاست', bonus: '+۱۰٪ اثربخشی جاسوسی، +۵٪ هزینه تصمیمات سیاسی' },
  { id: 'expansionist', name: 'توسعه‌طلب', icon: 'map',
    description: 'تمرکز بر ساخت و گسترش', bonus: '+۱۰٪ سرعت توسعه، +۱۰٪ هزینه ساخت' },
];

export const SYMBOLS = ['crown', 'castle', 'sword', 'flag', 'globe', 'trophy'];

export const FLAGS = ['🏰', '👑', '🦅', '🦁', '🐉', '⚔️', '🌟', '🔥', '🌊', '🌲'];

export const COLORS = [
  { id: 'gold', hex: '#c9a227', name: 'طلایی' },
  { id: 'crimson', hex: '#a83232', name: 'قرمز تیره' },
  { id: 'royal', hex: '#5b4b9e', name: 'ارغوانی' },
  { id: 'emerald', hex: '#2e8b57', name: 'زمردی' },
  { id: 'azure', hex: '#2e6f9e', name: 'لاجوردی' },
  { id: 'silver', hex: '#8a8f98', name: 'نقره‌ای' },
];

export const EPITHETS = ['دادگر', 'فاتح', 'خردمند', 'دلیر', 'ثروتمند', 'سازنده'];
