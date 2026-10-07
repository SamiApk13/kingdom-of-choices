/**
 * services/notification.js
 * ------------------------------------------------------------
 * بند 47: سیستم اعلان داخل‌بازی (Toast + مرکز اعلان)، داده‌محور.
 */
const queue = [];
let host = null;

export function initNotifications(containerEl) {
  host = containerEl;
}

export function toast(message, kind = 'info', ttl = 3200) {
  if (!host) { console.log('[toast]', message); return; }
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.textContent = message;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 350);
  }, ttl);
  queue.push({ message, kind, at: Date.now() });
  if (queue.length > 60) queue.shift();
}

export function notifySuccess(m) { return toast(m, 'success'); }
export function notifyError(m) { return toast(m, 'error'); }
export function notifyInfo(m) { return toast(m, 'info'); }
export function notifyWarn(m) { return toast(m, 'warn'); }
