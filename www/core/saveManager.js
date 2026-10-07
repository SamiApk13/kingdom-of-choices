/**
 * core/saveManager.js
 * ------------------------------------------------------------
 * بندهای 29/33/65/66: سیستم ذخیره امن با نسخه‌بندی، مایگریشن،
 * پشتیبان‌گیری چرخشی، اعتبارسنجی و خروجی/ورودی.
 *
 * ساختار:
 *  - ذخیره اصلی:      کلید پیکربندی (save.key)
 *  - پشتیبان‌ها:       ..._backup_1 تا _backup_3 (چرخشی)
 *  - خرابی داده:      بازیابی خودکار از پشتیبان (بند 65)
 */

export const SAVE_SCHEMA_VERSION = 2;

/** اعتبارسنجی حداقلی یک ذخیره */
export function validateSave(data) {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.saveVersion !== 'number') return false;
  if (!data.kingdom || typeof data.kingdom.name !== 'string') return false;
  if (!data.resources || typeof data.resources.coins !== 'number') return false;
  if (!data.buildings || typeof data.buildings !== 'object') return false;
  return true;
}

/**
 * زنجیره مایگریشن‌ها (بند 29/67): هر تابع یک نسخه را به بعدی تبدیل می‌کند.
 * برای هر تغییر ساختار، یک مایگریشن جدید اضافه کنید؛ مایگریشن‌های قدیمی هرگز تغییر نمی‌کنند.
 */
export const migrations = {
  // نسخه ۱ → ۲: قدرت نظامی از resources خارج شد، آمار تاریخچه و بازار اضافه شد
  1: (data) => {
    const d = { ...data };
    if (d.resources?.militaryPower !== undefined) {
      d.stats = { ...(d.stats || {}), militaryBase: d.resources.militaryPower };
      delete d.resources.militaryPower;
    }
    d.stats = { popularity: d.popularity ?? 70, security: d.security ?? 60, morale: d.morale ?? 70, ...(d.stats || {}) };
    d.history = d.history || { timeline: [], stats: baseHistoryStats() };
    d.market = d.market || { prices: { food: 2, wood: 3, stone: 4, iron: 12 }, trend: {}, shocks: {} };
    d.missions = d.missions || { progress: {}, claimed: {}, counters: {} };
    d.saveVersion = 2;
    return d;
  },
};

export function baseHistoryStats() {
  return {
    decisions: 0, wars: 0, wins: 0, losses: 0, peaces: 0,
    maxPopularity: 0, minPopularity: 100, peakCoins: 0,
    biggestCrisis: null, daysWithoutWar: 0, totalCoinsEarned: 0,
  };
}

/** اجرای مایگریشن تا آخرین نسخه */
export function migrate(data) {
  let d = data;
  let guard = 0;
  while (d.saveVersion < SAVE_SCHEMA_VERSION && guard++ < 50) {
    const fn = migrations[d.saveVersion];
    if (!fn) throw new Error(`مایگریشن برای نسخه ${d.saveVersion} وجود ندارد`);
    d = fn(d);
  }
  return d;
}

export function createSaveManager(storage, key = 'koc_save_v2', backupCount = 3) {
  const backupKey = (i) => `${key}_backup_${i}`;

  function writeRaw(k, data) {
    storage.set(k, JSON.stringify(data));
  }
  function readRaw(k) {
    const raw = storage.get(k);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  return {
    /** ذخیره اتمیک: ابتدا اعتبارسنجی، سپس پشتیبان‌گیری چرخشی، سپس نوشتن */
    save(state) {
      if (!validateSave(state)) {
        console.error('[save] اعتبارسنجی ناموفق بود؛ ذخیره انجام نشد تا داده خراب نشود.');
        return false;
      }
      // چرخش پشتیبان‌ها: ۲ <- ۱، ۳ <- ۲ ...
      for (let i = backupCount; i > 1; i--) {
        const prev = storage.get(backupKey(i - 1));
        if (prev) storage.set(backupKey(i), prev);
      }
      const current = storage.get(key);
      if (current) storage.set(backupKey(1), current);

      const payload = { ...state, saveVersion: SAVE_SCHEMA_VERSION, updatedAt: Date.now() };
      try {
        writeRaw(key, payload);
        return true;
      } catch (e) {
        console.error('[save] خطا در نوشتن؛ بازگردانی انجام نشد چون داده جدید نوشته نشد.', e);
        return false;
      }
    },

    /** بارگذاری با مایگریشن خودکار و بازیابی از پشتیبان در صورت خرابی */
    load() {
      const attempts = [key, ...Array.from({ length: backupCount }, (_, i) => backupKey(i + 1))];
      for (const k of attempts) {
        const data = readRaw(k);
        if (!data) continue;
        try {
          const migrated = migrate(data);
          if (validateSave(migrated)) {
            return { state: migrated, fromBackup: k !== key, version: migrated.saveVersion };
          }
        } catch (e) {
          console.warn(`[save] داده ${k} قابل بازیابی نبود:`, e);
        }
      }
      return null;
    },

    /** خروجی متنی برای انتقال بین دستگاه‌ها (بند 33) */
    export(state) {
      return btoa(unescape(encodeURIComponent(JSON.stringify({ ...state, saveVersion: SAVE_SCHEMA_VERSION }))));
    },
    import(text) {
      try {
        const data = JSON.parse(decodeURIComponent(escape(atob(text.trim()))));
        const migrated = migrate(data);
        if (!validateSave(migrated)) return null;
        return migrated;
      } catch (e) {
        console.error('[save] ورودی نامعتبر است', e);
        return null;
      }
    },

    clear() {
      storage.remove(key);
      for (let i = 1; i <= backupCount; i++) storage.remove(backupKey(i));
    },

    exists() {
      return !!storage.get(key);
    },
  };
}
