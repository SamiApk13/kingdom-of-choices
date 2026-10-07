/**
 * core/contentManager.js
 * ------------------------------------------------------------
 * بندهای 30/53/90: رجیستری محتوا. تمام محتوای بازی (رویداد، ساختمان،
 * واحد، کشور، مأموریت، دستاورد، فناوری، لقب) در ماژول‌های جدا از هسته
 * قرار دارند و با ID یکتا شناسایی می‌شوند.
 *
 * - مایگریشن محتوای قدیمی (مثلاً فرمت اثر تکی → آرایه‌ای) اینجا انجام می‌شود.
 * - «پنل مدیریت» می‌تواند هر آیتم را غیرفعال کند بدون تغییر کد.
 */

const collections = {};
const overrides = new Map(); // overrides فعال/غیرفعالی از پنل مدیریت

export function registerCollection(name, items, migrateItem) {
  const list = items.map((item, idx) => migrateItem ? migrateItem(item) : item);
  collections[name] = list;
  // بررسی یکتا بودن IDها (بند 53)
  const ids = new Set();
  for (const it of list) {
    if (!it.id) console.error(`[content] آیتم بدون ID در ${name}:`, it);
    if (ids.has(it.id)) console.error(`[content] ID تکراری ${it.id} در ${name}`);
    ids.add(it.id);
  }
}

export function getContent(name) {
  const list = collections[name] || [];
  return list.map((item) => {
    const ov = overrides.get(item.id);
    return ov ? { ...item, ...ov } : item;
  });
}

export function getRawContent(name) {
  return collections[name] || [];
}

export function getById(name, id) {
  const item = (collections[name] || []).find((i) => i.id === id);
  if (!item) return null;
  const ov = overrides.get(id);
  return ov ? { ...item, ...ov } : item;
}

/** غیرفعال/فعال کردن یک آیتم از پنل مدیریت */
export function setItemEnabled(id, enabled) {
  overrides.set(id, { enabled });
}

export function listCollections() {
  return Object.keys(collections);
}

/** مایگریشن محتوای رویداد از فرمت قدیمی (بند 90):
 *  نسخه 1: choice.effect (تکی) → نسخه 2: choice.effects (آرایه) */
export function migrateEvent_v1toV2(ev) {
  const out = { ...ev };
  if (out.choices) {
    out.choices = out.choices.map((ch) => {
      const c = { ...ch };
      if (c.effect && !c.effects) { c.effects = [c.effect]; delete c.effect; }
      return c;
    });
  }
  return out;
}

/** بارگذاری overrides ذخیره‌شده پنل مدیریت */
export function loadContentOverrides(storage) {
  try {
    const raw = storage.get('koc_content_overrides');
    if (!raw) return;
    const obj = JSON.parse(raw);
    for (const [id, ov] of Object.entries(obj)) overrides.set(id, ov);
  } catch (e) {
    console.warn('[content] بارگذاری overrides ناموفق بود', e);
  }
}

export function saveContentOverrides(storage) {
  const obj = Object.fromEntries(overrides);
  storage.set('koc_content_overrides', JSON.stringify(obj));
}
