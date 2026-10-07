/**
 * content/units.js
 * ------------------------------------------------------------
 * بند 15: واحدهای نظامی. هزینه استخدام، نگهداری، قدرت و پیش‌نیازها
 * همگی داده‌محورند.
 */
export const UNITS = [
  {
    id: 'unit_infantry_001', name: 'پیاده‌نظام', type: 'melee',
    description: 'ستون اصلی ارتش؛ ارزان، در دسترس و قابل‌اعتماد.',
    cost: { coins: 5, food: 1 }, upkeep: 0.2, power: 2, defense: 2, speed: 2,
    minLevel: 1, icon: 'sword',
  },
  {
    id: 'unit_spear_001', name: 'نیزه‌دار', type: 'melee',
    description: 'متخصص نبرد با سواره‌نظام دشمن.',
    cost: { coins: 7, food: 1 }, upkeep: 0.25, power: 2.5, defense: 3, speed: 2,
    minLevel: 2, icon: 'military',
  },
  {
    id: 'unit_archer_001', name: 'کماندار', type: 'ranged',
    description: 'حمایت از راه دور؛ در دفاع پشت دیوارها بی‌نظیر است.',
    cost: { coins: 9, food: 1 }, upkeep: 0.3, power: 3, defense: 2, speed: 2,
    minLevel: 3, icon: 'target',
  },
  {
    id: 'unit_cavalry_001', name: 'سواره‌نظام', type: 'cavalry',
    description: 'نیروی ضربتی سریع؛ نیازمند فناوری پرورش اسب.',
    cost: { coins: 18, food: 2 }, upkeep: 0.6, power: 6, defense: 3, speed: 5,
    minLevel: 5, requiresTech: 'tech_horse_001', icon: 'flag',
  },
  {
    id: 'unit_guard_001', name: 'نگهبان قلعه', type: 'guard',
    description: 'نیروی زبده دفاع از دژ؛ نیازمند ساخت قلعه.',
    cost: { coins: 12, food: 1 }, upkeep: 0.4, power: 4, defense: 6, speed: 1,
    minLevel: 5, requiresBuilding: 'building_castle_001', icon: 'security',
  },
];
