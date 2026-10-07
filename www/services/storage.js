/**
 * services/storage.js
 * ------------------------------------------------------------
 * لایه ذخیره‌سازی محلی با مهار خطا (بند 65): اگر localStorage در دسترس
 * نبود (حریم خصوصی/مرورگر خاص) به حافظه موقت داخل‌صفحه‌ای سقوط می‌کند.
 */
const memory = new Map();

function lsAvailable() {
  try {
    const k = '__koc_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch { return false; }
}

const useLs = typeof window !== 'undefined' && lsAvailable();

export const storage = {
  get(key) {
    try {
      return useLs ? window.localStorage.getItem(key) : (memory.get(key) ?? null);
    } catch { return memory.get(key) ?? null; }
  },
  set(key, value) {
    try {
      if (useLs) window.localStorage.setItem(key, value);
      else memory.set(key, value);
      return true;
    } catch (e) {
      console.warn('[storage] نوشتن ناموفق؛ ذخیره در حافظه موقت', e);
      memory.set(key, value);
      return false;
    }
  },
  remove(key) {
    try { if (useLs) window.localStorage.removeItem(key); } catch {}
    memory.delete(key);
  },
  isPersistent: useLs,
};
