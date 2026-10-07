/**
 * core/rng.js
 * ------------------------------------------------------------
 * ابزارهای تصادف: بند 73 — تصادف وزنی (Weighted Random) به‌جای تصادف ساده.
 */

/** انتخاب یک آیتم بر اساس وزن؛ وزن‌ها می‌توانند عدد یا تابع باشند. */
export function weightedPick(items, weightFn = (x) => x.weight ?? 1, rnd = Math.random) {
  const pool = [];
  let total = 0;
  for (const item of items) {
    const w = Math.max(0, Number(weightFn(item)) || 0);
    if (w > 0) { pool.push({ item, w }); total += w; }
  }
  if (!pool.length) return null;
  let r = rnd() * total;
  for (const p of pool) {
    r -= p.w;
    if (r <= 0) return p.item;
  }
  return pool[pool.length - 1].item;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/** احتمال وقوع (۰ تا ۱۰۰) */
export function chance(pct) {
  return Math.random() * 100 < pct;
}

/** نرمال‌سازی حول یک مقدار با پراکندگی درصدی */
export function jitter(value, pct) {
  const delta = value * (pct / 100);
  return value + randFloat(-delta, delta);
}
