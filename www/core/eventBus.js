/**
 * core/eventBus.js
 * ------------------------------------------------------------
 * سیستم انتشار/اشتراک رویدادها برای جداسازی موتور بازی از رابط کاربری
 * (بند 91: هسته به جزئیات UI وابسته نیست؛ UI فقط به رویدادها گوش می‌دهد).
 */
export function createEventBus() {
  const listeners = new Map();
  return {
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return () => listeners.get(event)?.delete(fn);
    },
    once(event, fn) {
      const off = this.on(event, (payload) => { off(); fn(payload); });
      return off;
    },
    emit(event, payload) {
      const set = listeners.get(event);
      if (!set) return;
      for (const fn of [...set]) {
        try { fn(payload); } catch (e) { console.error(`[eventBus] handler error for "${event}"`, e); }
      }
    },
    clear() { listeners.clear(); },
  };
}

export const bus = createEventBus();
