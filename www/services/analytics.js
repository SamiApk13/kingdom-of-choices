/**
 * services/analytics.js
 * ------------------------------------------------------------
 * بند 63: رویدادهای آماری. در نسخه آفلاین فقط در حافظه محلی ثبت
 * می‌شوند و هیچ داده‌ای به بیرون ارسال نمی‌شود. در نسخه آنلاین،
 * همین نقطه به سرویس تحلیل متصل می‌شود.
 */
const events = [];

export const analytics = {
  track(name, payload = {}) {
    events.push({ name, payload, at: Date.now() });
    if (events.length > 500) events.shift();
  },
  all() { return [...events]; },
};
