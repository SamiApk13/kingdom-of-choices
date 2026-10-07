/**
 * assets/icons.js
 * ------------------------------------------------------------
 * آیکن‌های برداری داخل‌خطی (بدون فونت/فایل خارجی) تا بازی کاملاً
 * آفلاین کار کند. هر آیکن یک رشته SVG است با رنگ‌پذیری currentColor.
 */

const I = (paths, viewBox = '0 0 24 24') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" aria-hidden="true">${paths}</svg>`;

export const ICONS = {
  coins: I('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6.5l1.6 3.2 3.5.5-2.5 2.5.6 3.5-3.2-1.7-3.2 1.7.6-3.5-2.5-2.5 3.5-.5z"/>'),
  food: I('<path d="M12 3c-4 3-7 6-7 10a7 7 0 0014 0c0-4-3-7-7-10zm0 3.2c2.8 2.3 4.6 4.4 4.6 6.8A4.6 4.6 0 0112 17.6 4.6 4.6 0 017.4 13c0-2.4 1.8-4.5 4.6-6.8z"/>'),
  wood: I('<rect x="3" y="9" width="18" height="3" rx="1.5"/><rect x="5" y="13.5" width="18" height="3" rx="1.5" transform="translate(-2 0)"/><rect x="5" y="4.5" width="14" height="3" rx="1.5" transform="translate(2 0)"/>'),
  stone: I('<path d="M4 14l3-7 6-2 7 4-1 8-8 4-7-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 7l5 5 8-1M12 12l-2 8" stroke="currentColor" stroke-width="1.5" fill="none"/>'),
  iron: I('<path d="M5 8h14l2 3-9 9-9-9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2"/>'),
  population: I('<circle cx="9" cy="8" r="3.2"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M3.5 19c.5-3.4 2.8-5.2 5.5-5.2s5 1.8 5.5 5.2zM13.6 18c.4-2.4 1.6-3.8 3-3.8 1.5 0 2.8 1.4 3.2 3.8z"/>'),
  popularity: I('<path d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3.1A4.6 4.6 0 0120 10c0 5.7-8 11-8 11z"/>'),
  security: I('<path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" fill="none"/>'),
  military: I('<path d="M6.5 3.5L12 7l5.5-3.5L19 12l-7 9-7-9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.4"/>'),
  knowledge: I('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 7h7M8 10.5h7" stroke="currentColor" stroke-width="1.6"/>'),
  influence: I('<path d="M12 2l2.4 5.3 5.6.6-4.2 3.9 1.2 5.7L12 14.8 7 17.5l1.2-5.7L4 7.9l5.6-.6z"/>'),
  credibility: I('<path d="M5 16l-2-9 4 2 3-4h4l3 4 4-2-2 9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 16h14v4H5z"/>'),
  morale: I('<path d="M4 20V4h2v7h12l-3-3 3 3-3 3 3-3H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  xp: I('<path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  crown: I('<path d="M4 18l-1.5-9 5 3L12 5l4.5 7 5-3L20 18z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="4" y="18" width="16" height="3" rx="1"/>'),
  castle: I('<path d="M3 21V9h3V6h2v3h3V6h2v3h3V6h2v3h3v12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 21v-5a2 2 0 014 0v5" stroke="currentColor" stroke-width="2" fill="none"/>'),
  scroll: I('<path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.6"/>'),
  map: I('<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="currentColor" stroke-width="1.6"/>'),
  hammer: I('<path d="M13 6l5-3 3 5-5 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M11 8L3 19l2 2 8-11" fill="none" stroke="currentColor" stroke-width="2"/>'),
  sword: I('<path d="M4 20l9-9M4 20l3 .5L20 7l-3-3L4 17z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 10l3 3" stroke="currentColor" stroke-width="2"/>'),
  globe: I('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/>'),
  market: I('<path d="M4 10l1-6h14l1 6M4 10a2.5 2.5 0 005 0 2.5 2.5 0 005 0 2.5 2.5 0 005 0M5 10v10h14V10M10 20v-6h4v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  target: I('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.6"/>'),
  flask: I('<path d="M10 3h4M11 3v6l-6 10a2 2 0 001.7 3h10.6A2 2 0 0019 19L13 9V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.5 15h7" stroke="currentColor" stroke-width="2"/>'),
  book: I('<path d="M12 6c-2-1.5-5-1.5-8-1v14c3-.5 6-.5 8 1 2-1.5 5-1.5 8-1V5c-3-.5-6-.5-8 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 6v14" stroke="currentColor" stroke-width="1.6"/>'),
  clock: I('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'),
  alert: I('<path d="M12 3L2 20h20z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="17" r="1.2"/>'),
  home: I('<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  chess: I('<path d="M8 21h8M9 18h6M10 18c0-3 3-3 3-6 0-2-1.5-3-1.5-5L9 9l1-4 4 3 2 4c0 3-3 3-3 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  gear: I('<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  trophy: I('<path d="M8 4h8v6a4 4 0 01-8 0z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 5H4a4 4 0 004 5M16 5h4a4 4 0 01-4 5M12 14v4M8 21h8M9 18h6" fill="none" stroke="currentColor" stroke-width="2"/>'),
  flag: I('<path d="M5 21V4M5 4h13l-3 4 3 4H5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  ship: I('<path d="M3 15l2 4h14l2-4zM12 4v11M12 4l6 9H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'),
  wheat: I('<path d="M12 21V8M12 8c-3 0-5-2-5-5 3 0 5 2 5 5zm0 0c3 0 5-2 5-5-3 0-5 2-5 5zM12 13c-3 0-5-2-5-5 3 0 5 2 5 5zm0 0c3 0 5-2 5-5-3 0-5 2-5 5z" fill="none" stroke="currentColor" stroke-width="1.8"/>'),
  hand: I('<path d="M7 11V6a1.5 1.5 0 013 0v4V4.5a1.5 1.5 0 013 0V10V6a1.5 1.5 0 013 0v7c0 4-2 7-6 7s-6-3-6-7v-3a1.5 1.5 0 013 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>'),
};

export function icon(name, cls = 'ico') {
  return `<span class="${cls} ico-${name}">${ICONS[name] || ICONS.alert}</span>`;
}

/** آیکن دسته‌بندی رویدادها (بند 9) */
export const EVENT_CATEGORY_ICON = {
  economic: 'coins',
  military: 'sword',
  political: 'crown',
  social: 'population',
  natural: 'wheat',
  trade: 'market',
  diplomatic: 'globe',
  cultural: 'trophy',
  science: 'flask',
  crisis: 'alert',
  story: 'scroll',
};
