/**
 * services/api.js
 * ------------------------------------------------------------
 * بندهای 34/50/92: لایه اتصال به بک‌اند آینده (Backend-Agnostic).
 * نسخه فعلی کاملاً آفلاین است؛ این ماژول قرارداد ارتباط با سرور را
 * از امروز تثبیت می‌کند تا بعداً بدون تغییر هسته متصل شود.
 * هیچ Secret ای سمت کلاینت قرار نمی‌گیرد.
 */
const BASE = (typeof window !== 'undefined' && window.KOC_API_BASE_URL) || '';

async function request(path, options = {}) {
  if (!BASE) return { success: false, offline: true, error: { code: 'OFFLINE_MODE', message: 'بازی در حالت آفلاین است.' } };
  try {
    const res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: { code: 'NETWORK', message: 'اتصال برقرار نشد.' } };
  }
}

export const api = {
  isOnline: () => !!BASE,
  loginGuest: () => request('/api/auth/login', { method: 'POST', body: '{}' }),
  getProfile: () => request('/api/profile'),
  getKingdom: () => request('/api/kingdom'),
  postDecision: (d) => request('/api/kingdom/decision', { method: 'POST', body: JSON.stringify(d) }),
  contentVersion: () => request('/api/content/version'),
  contentEvents: () => request('/api/content/events'),
  pushSave: (s) => request('/api/save', { method: 'POST', body: JSON.stringify(s) }),
  pullSave: () => request('/api/save'),
  leaderboard: () => request('/api/leaderboard'),
  claimMission: (id) => request('/api/missions/claim', { method: 'POST', body: JSON.stringify({ id }) }),
};
