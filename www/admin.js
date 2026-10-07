/**
 * admin.js — پنل مدیریت محلی (بندهای 55 تا 62)
 * ------------------------------------------------------------
 * - فعال/غیرفعال کردن هر آیتم محتوا بدون تغییر کد (بند 7 و 56/57/58)
 * - ویرایش بالانس از طریق Remote Config محلی (بند 31)
 * - فیچر فلگ‌ها (بند 61)
 * تغییرات در کدهای koc_content_overrides و koc_remote_config ذخیره می‌شوند
 * و توسط هسته در بارگذاری بعدی اعمال می‌شوند.
 */
import { registerAllContent, content } from './content/index.js';
import { getRawContent, setItemEnabled, saveContentOverrides, getContent } from './core/contentManager.js';
import { storage } from './services/storage.js';
import { el, clear, fmt, closeModal, showModal } from './ui/dom.js';
import { DEFAULT_CONFIG } from './config/gameConfig.js';

registerAllContent();
// بارگذاری وضعیت فعلی غیرفعال‌ها
try {
  const raw = storage.get('koc_content_overrides');
  if (raw) for (const [id, ov] of Object.entries(JSON.parse(raw))) if (ov.enabled === false) setItemEnabled(id, false);
} catch {}

const root = document.getElementById('admin-root');
let tab = 'content';

const COLLECTIONS = [
  ['events', 'رویدادها'],
  ['buildings', 'ساختمان‌ها'],
  ['units', 'واحدهای نظامی'],
  ['generals', 'ژنرال‌ها'],
  ['countries', 'کشورها'],
  ['missions', 'مأموریت‌ها'],
  ['achievements', 'دستاوردها'],
  ['technologies', 'فناوری‌ها'],
  ['titles', 'لقب‌ها'],
];

function render() {
  clear(root);
  root.append(el('div', { class: 'tabs' },
    [['content', 'محتوا'], ['balance', 'بالانس و تنظیمات'], ['flags', 'فیچر فلگ‌ها']].map(([id, label]) =>
      el('button', { class: 'tab' + (tab === id ? ' active' : ''), onclick: () => { tab = id; render(); } }, label)),
  ));

  if (tab === 'content') renderContent();
  else if (tab === 'balance') renderBalance();
  else renderFlags();
}

function renderContent() {
  const counts = el('div', { class: 'card' },
    el('div', { class: 'card-title' }, 'خلاصه محتوا'),
    el('div', { class: 'choice-meta' }, COLLECTIONS.map(([name, label]) =>
      el('span', { class: 'tag' }, `${label}: ${fmt(getRawContent(name).length)}`))),
  );
  root.append(counts);
  root.append(el('p', { class: 'admin-note' }, 'غیرفعال‌کردن یک آیتم فوراً روی بازی اثر می‌گذارد (بارگذاری بعدی صفحه بازی). هسته بازی هرگز تغییر نمی‌کند.'));

  const sel = { collection: 'events' };
  const listWrap = el('div', {});

  const picker = el('div', { class: 'tabs mt-12' }, COLLECTIONS.map(([name, label]) =>
    el('button', { class: 'tab' + (sel.collection === name ? ' active' : ''), onclick: (e) => {
      sel.collection = name; render();
    } }, label)));
  root.append(picker);

  const items = getContent(sel.collection);
  for (const it of items) {
    const enabled = it.enabled !== false;
    listWrap.append(el('div', { class: 'list-item' },
      el('div', { class: 'info' },
        el('h4', {}, it.name || it.title || it.id),
        el('p', {}, it.id + (it.category ? ` • ${it.category}` : '') + (it.rarity ? ` • ${it.rarity}` : '')),
      ),
      el('button', {
        class: 'btn btn-sm ' + (enabled ? '' : 'btn-red'),
        onclick: () => {
          setItemEnabled(it.id, !enabled);
          saveContentOverrides(storage);
          render();
        },
      }, enabled ? 'غیرفعال کن' : 'فعال کن'),
    ));
  }
  root.append(listWrap);
}

function renderBalance() {
  const raw = storage.get('koc_remote_config');
  let current = {};
  try { current = raw ? JSON.parse(raw) : {}; } catch {}

  const area = el('textarea', { class: 'json', dir: 'ltr' }, JSON.stringify(current, null, 2));
  root.append(el('div', { class: 'card' },
    el('div', { class: 'card-title' }, 'Remote Config (بند 31)'),
    el('p', { class: 'admin-note' }, 'هر کلید اینجا روی تنظیمات پیش‌فرض بازی سوار می‌شود. مثال: {"start":{"coins":1000}} یا {"xp":{"decisionXp":25}} — ساختار کامل در config/gameConfig.js'),
    area,
    el('div', { class: 'btn-row mt-8' },
      el('button', { class: 'btn btn-gold btn-sm', onclick: () => {
        try {
          const obj = JSON.parse(area.value || '{}');
          storage.set('koc_remote_config', JSON.stringify(obj));
          alert('ذخیره شد. بارگذاری بعدی بازی اعمال می‌شود.');
        } catch (e) { alert('JSON نامعتبر است: ' + e.message); }
      } }, 'ذخیره'),
      el('button', { class: 'btn btn-sm', onclick: () => { storage.remove('koc_remote_config'); render(); } }, 'بازنشانی به پیش‌فرض'),
    ),
  ));

  root.append(el('div', { class: 'card' },
    el('div', { class: 'card-title' }, 'مقادیر پیش‌فرض فعلی'),
    el('textarea', { class: 'json', dir: 'ltr', readonly: 'true' }, JSON.stringify(DEFAULT_CONFIG, null, 2)),
  ));
}

function renderFlags() {
  let current = {};
  try { current = JSON.parse(storage.get('koc_remote_config') || '{}'); } catch {}
  const flags = { ...(DEFAULT_CONFIG.featureFlags), ...(current.featureFlags || {}) };

  const card = el('div', { class: 'card' }, el('div', { class: 'card-title' }, 'فیچر فلگ‌ها (بند 61)'));
  for (const [key, val] of Object.entries(flags)) {
    card.append(el('div', { class: 'report-line', style: 'cursor:pointer', onclick: () => {
      const updated = JSON.parse(storage.get('koc_remote_config') || '{}');
      updated.featureFlags = { ...(updated.featureFlags || {}), [key]: !val };
      storage.set('koc_remote_config', JSON.stringify(updated));
      render();
    } },
      el('span', {}, 'feature.' + key),
      el('span', { class: 'tag ' + (val ? 'gain' : 'risk') }, val ? 'فعال' : 'غیرفعال'),
    ));
  }
  card.append(el('p', { class: 'admin-note mt-8' }, 'غیرفعال‌سازی «market» بازار را از دسترس خارج می‌کند؛ بقیه فلگ‌ها برای نسخه‌های آنلاین آینده آماده‌اند.'));
  root.append(card);
}

render();
