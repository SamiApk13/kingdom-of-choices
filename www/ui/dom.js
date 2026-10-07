/**
 * ui/dom.js
 * ------------------------------------------------------------
 * ابزارهای ساخت دام و قالب‌بندی اعداد فارسی.
 */
const faNum = new Intl.NumberFormat('fa-IR');
const faNum1 = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 });

export function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '۰';
  return faNum.format(Math.round(n));
}
export function fmt1(n) { return faNum1.format(n); }
export function signed(n) { return (n > 0 ? '+' : '') + fmt(n); }

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

/* ---------- مودال ---------- */
let modalBackdrop = null;

export function showModal(contentNode, opts = {}) {
  closeModal();
  const root = document.getElementById('modal-root');
  modalBackdrop = el('div', { class: 'modal-backdrop', onclick: (e) => { if (e.target === modalBackdrop && opts.dismissable !== false) closeModal(); } });
  const box = el('div', { class: 'modal' + (opts.center ? ' center' : '') }, contentNode);
  modalBackdrop.append(box);
  root.append(modalBackdrop);
  return modalBackdrop;
}

export function closeModal() {
  if (modalBackdrop) { modalBackdrop.remove(); modalBackdrop = null; }
}

export function confirmModal(message, onYes, opts = {}) {
  const content = el('div', {},
    el('h3', {}, opts.title || 'تأیید'),
    el('p', { class: 'small mb-8', style: 'color:var(--text-1)' }, message),
    el('div', { class: 'btn-row mt-12' },
      el('button', { class: 'btn btn-gold flex-1', onclick: () => { closeModal(); onYes(); } }, opts.yes || 'تأیید'),
      el('button', { class: 'btn flex-1', onclick: () => closeModal() }, 'انصراف'),
    ),
  );
  showModal(content, { center: true });
}

/** معادل فارسی روز/سال بازی */
export function gameDate(day) {
  const year = Math.floor((day - 1) / 120) + 1;
  const d = ((day - 1) % 120) + 1;
  return { year, d, text: `روز ${fmt(day)} سلطنت (سال ${fmt(year)})` };
}
