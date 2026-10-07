/**
 * ui/app.js
 * ------------------------------------------------------------
 * نقطه ورود رابط کاربری: اسپلش، منوی اصلی، ساخت پادشاه، روتر،
 * ناوبری پایین و اتصال رویدادهای موتور به صدا/اعلان‌ها.
 * بند 91: رابط کاربری هرگز موتور را مستقیم دستکاری نمی‌کند؛ فقط از
 * API عمومی موتور استفاده می‌کند.
 */
import { storage } from '../services/storage.js';
import { registerAllContent, content } from '../content/index.js';
import { loadContentOverrides } from '../core/contentManager.js';
import { createGame } from '../core/gameEngine.js';
import { el, clear, fmt, showModal, closeModal } from './dom.js';
import { icon } from '../assets/icons.js';
import { t } from '../config/localization.js';
import { sound } from '../services/sound.js';
import { toast, notifyInfo, notifyError, notifySuccess, initNotifications } from '../services/notification.js';
import { analytics } from '../services/analytics.js';
import { missionProgress, isMissionAvailable } from '../core/progressionEngine.js';

import { renderDashboard } from './screens/dashboard.js';
import { renderCourt } from './screens/court.js';
import { renderGovernance } from './screens/governance.js';
import { renderMap } from './screens/map.js';
import { renderBuildings } from './screens/buildings.js';
import { renderArmy } from './screens/army.js';
import { renderDiplomacy } from './screens/diplomacy.js';
import { renderMarket } from './screens/market.js';
import { renderMissions } from './screens/missions.js';
import { renderTech } from './screens/tech.js';
import { renderHistory } from './screens/history.js';
import { renderAchievements } from './screens/achievements.js';
import { renderSettings } from './screens/settings.js';
import { renderLeaderboard } from './screens/leaderboard.js';
import { renderEnding } from './screens/ending.js';
import { showTutorial } from './screens/tutorial.js';

/* ---------- بوت ---------- */
registerAllContent();
loadContentOverrides(storage);
initNotifications(document.getElementById('toasts'));
const game = createGame({ storage, content });
window.KOC = { game }; // برای دیباگ و پنل مدیریت

const app = document.getElementById('app');
const NAV_ROUTES = ['dashboard', 'court', 'buildings', 'army', 'missions'];

const ctx = {
  game, storage, content,
  nav,
  refresh: () => render(route()),
  toastInfo: (m) => notifyInfo(m),
  toastError: (m) => notifyError(m),
  info: (title, text) => showModal(el('div', {},
    el('h3', {}, title),
    ...text.split('\n').map((line) => el('p', { class: 'small', style: 'color:var(--text-1)' }, line)),
    el('button', { class: 'btn btn-block mt-12', onclick: closeModal }, 'بستن'),
  ), { center: true }),
  hasClaimableMissions: () => {
    const s = game.state;
    if (!s) return false;
    const ids = [...(s.missions.dailyIds || []), ...(s.missions.weeklyIds || []),
      ...content.missions.filter((m) => m.type === 'story').map((m) => m.id)];
    return ids.some((id) => {
      const m = content.missions.find((x) => x.id === id);
      if (!m || s.missions.claimed[id] || !isMissionAvailable(s, m)) return false;
      return missionProgress(s, m, { config: game.config, content }).done;
    });
  },
};

/* ---------- اتصال رویدادهای موتور به صدا و اعلان ---------- */
game.bus.on('achievement:unlocked', (a) => { sound.levelup(); notifySuccess(`🏆 دستاورد «${a.name}» کسب شد!`); });
game.bus.on('title:unlocked', (tt) => { sound.levelup(); notifySuccess(`👑 لقب «${tt.name}» اعطا شد!`); });
game.bus.on('level:up', (p) => { sound.levelup(); notifySuccess(`پادشاهی به سطح ${fmt(p.level)} رسید!`); });
game.bus.on('building:done', () => { sound.build(); });
game.bus.on('war:started', () => { sound.alert(); });
game.bus.on('crisis:revolt', () => { sound.alert(); notifyError('شورش! امنیت و خزانه آسیب دید.'); });
game.bus.on('game:ended', () => { analytics.track('game_ended', { ending: game.state.ended?.type }); if (NAV_ROUTES.includes(route()) || route() === 'history') nav('ending'); });
game.bus.on('save:done', () => {}); // ذخیره بی‌صدا انجام می‌شود

/* ---------- روتر ---------- */
function route() {
  const h = (location.hash || '#/home').replace('#/', '');
  return h.split('?')[0] || 'home';
}

function nav(r) {
  if (location.hash === `#/${r}`) render(r);
  else location.hash = `#/${r}`;
}
window.addEventListener('hashchange', () => render(route()));

function render(r) {
  clear(app);
  const s = game.state;
  const inGame = !!s && !['home', 'create'].includes(r);
  app.classList.toggle('no-nav', !inGame);

  const screens = {
    home: renderHome, create: renderCreate,
    dashboard: renderDashboard, court: renderCourt, governance: renderGovernance,
    map: renderMap, buildings: renderBuildings, army: renderArmy,
    diplomacy: renderDiplomacy, market: renderMarket, missions: renderMissions,
    tech: renderTech, history: renderHistory, achievements: renderAchievements,
    settings: renderSettings, leaderboard: renderLeaderboard, ending: renderEnding,
  };

  if (!s && !['home', 'create', 'leaderboard'].includes(r)) { renderHome(app, ctx); return; }
  if (s && ['home', 'create'].includes(r)) { /* اجازه نمایش منو */ }
  (screens[r] || renderHome)(app, ctx);

  if (inGame) renderBottomNav(r);
  if (s && !s.ended && inGame && r !== 'settings') maybeTutorial();
}

function renderBottomNav(active) {
  const s = game.state;
  const items = [
    ['dashboard', 'home', 'داشبورد', false],
    ['court', 'scroll', 'دربار', !!game.currentEvent()],
    ['buildings', 'hammer', 'ساخت', false],
    ['army', 'sword', 'ارتش', false],
    ['missions', 'target', 'مأموریت', ctx.hasClaimableMissions()],
  ];
  const navEl = el('nav', { class: 'bottom-nav' }, items.map(([r, ic, label, dot]) =>
    el('button', { class: 'nav-item' + (active === r ? ' active' : ''), onclick: () => nav(r) },
      dot && active !== r ? el('span', { class: 'dot' }) : null,
      icon(ic), label)));
  document.body.append(navEl);
  // حذف ناوبری قبلی
  document.querySelectorAll('.bottom-nav').forEach((n, i, all) => { if (i < all.length - 1) n.remove(); });
}

function maybeTutorial() {
  const s = game.state;
  if (s.tutorial.done || document.querySelector('.tutorial-overlay')) return;
  showTutorial(game, () => { render(route()); });
}

/* ---------- صفحه اصلی ---------- */
function renderHome(root) {
  const hasSave = game.saveManager.exists();
  root.append(el('div', { class: 'home' },
    el('div', { class: 'crown-art' }, '👑'),
    el('h1', {}, t('app.name')),
    el('p', { class: 'tagline' }, t('app.tagline')),
    hasSave ? el('button', { class: 'btn btn-gold', onclick: () => { startContinue(); } }, 'ادامه بازی') : null,
    el('button', { class: 'btn' + (hasSave ? '' : ' btn-gold'), onclick: () => newGameFlow() }, hasSave ? 'شروع بازی جدید' : t('menu.newGame')),
    hasSave ? el('button', { class: 'btn btn-ghost', onclick: () => { startContinue(true); } }, 'آموزش دوباره') : null,
    el('button', { class: 'btn btn-ghost', onclick: () => nav('leaderboard') }, t('menu.leaderboard')),
    el('button', { class: 'btn btn-ghost', onclick: aboutModal }, t('menu.about')),
    el('p', { class: 'muted small', style: 'margin-top:22px' }, 'نسخه ۱٫۰٫۰ • آفلاین و قابل نصب (PWA)'),
  ));
}

function newGameFlow() {
  if (game.saveManager.exists()) {
    showModal(el('div', {},
      el('h3', {}, 'شروع بازی جدید'),
      el('p', { class: 'small', style: 'color:var(--text-1)' }, 'با شروع بازی جدید، ذخیره فعلی به نسخه پشتیبان منتقل می‌شود اما روی ذخیره اصلی بازنویسی می‌گردد.'),
      el('div', { class: 'btn-row mt-12' },
        el('button', { class: 'btn btn-gold flex-1', onclick: () => { closeModal(); nav('create'); } }, 'بازی جدید'),
        el('button', { class: 'btn flex-1', onclick: closeModal }, 'انصراف'),
      ),
    ), { center: true });
    return;
  }
  nav('create');
}

function startContinue(replayTutorial = false) {
  const res = game.load();
  if (!res) { notifyError('ذخیره‌ای پیدا نشد.'); return; }
  sound.configure(game.state.settings);
  document.body.classList.toggle('reduce-motion', !!game.state.settings.reduceMotion);
  if (res.fromBackup) toast('ذخیره فعلی خراب بود؛ از نسخه پشتیبان بازیابی شد.', 'warn', 5000);
  if (replayTutorial) { game.state.tutorial.done = false; game.save(); }
  if (game.state.ended) nav('ending');
  else nav('dashboard');
}

function aboutModal() {
  showModal(el('div', {},
    el('h3', {}, 'درباره بازی'),
    el('p', { class: 'small', style: 'color:var(--text-1)' }, '«پادشاه انتخاب‌ها» یک بازی استراتژی و شبیه‌سازی داده‌محور است که در آن فرمانروایی می‌کنید و هر انتخاب‌تان سرنوشت پادشاهی را تغییر می‌دهد.'),
    el('p', { class: 'small muted mt-8' }, '• هیچ انتخابی کاملاً خوب یا بد نیست'),
    el('p', { class: 'small muted' }, '• محتوا (رویدادها، ساختمان‌ها، کشورها) بدون تغییر هسته قابل گسترش است'),
    el('p', { class: 'small muted' }, '• بازی آفلاین است و ذخیره‌ها با نسخه‌بندی و پشتیبان محافظت می‌شوند'),
    el('button', { class: 'btn btn-block mt-12', onclick: closeModal }, 'بستن'),
  ), { center: true });
}

/* ---------- ساخت پادشاه (بند 4) ---------- */
function renderCreate(root) {
  let sel = { symbol: 'crown', flag: '🏰', color: '#c9a227', style: 'warrior', epithet: '' };
  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' },
    el('button', { class: 'back-btn', onclick: () => nav('home') }, '←'),
    el('h2', {}, t('create.title'))));

  const nameField = el('input', { type: 'text', placeholder: 'مثلاً: آریا', maxlength: '20' });
  const kingdomField = el('input', { type: 'text', placeholder: 'مثلاً: سرزمین نور', maxlength: '24' });

  page.append(el('div', { class: 'card' },
    el('div', { class: 'form-field' }, el('label', {}, 'نام فرمانروا'), nameField),
    el('div', { class: 'form-field' }, el('label', {}, 'نام پادشاهی'), kingdomField),
  ));

  /* لقب */
  page.append(el('div', { class: 'section-title' }, 'لقب'));
  page.append(el('div', { class: 'picker' }, content.epithets.map((e) => pickItem(e, () => { sel.epithet = e; sync(); }))));

  /* نماد */
  page.append(el('div', { class: 'section-title' }, 'نماد'));
  page.append(el('div', { class: 'picker' }, content.symbols.map((s) =>
    el('div', { class: 'pick-item', 'data-sym': s, onclick: (ev) => { sel.symbol = s; sync(); }, html: icon(s) + `<small style="display:block">${s === 'crown' ? 'تاج' : s === 'castle' ? 'قلعه' : s === 'sword' ? 'شمشیر' : s === 'flag' ? 'درفش' : s === 'globe' ? 'جهان' : 'جام'}</small>` }))));

  /* پرچم */
  page.append(el('div', { class: 'section-title' }, 'پرچم'));
  page.append(el('div', { class: 'picker' }, content.flags.map((f) =>
    el('div', { class: 'pick-item flag', 'data-flag': f, onclick: () => { sel.flag = f; sync(); } }, f))));

  /* رنگ */
  page.append(el('div', { class: 'section-title' }, 'رنگ اصلی'));
  page.append(el('div', { class: 'picker' }, content.colors.map((c) =>
    el('div', { class: 'pick-item', 'data-color': c.hex, onclick: () => { sel.color = c.hex; sync(); } },
      el('span', { class: 'color-dot', style: `background:${c.hex}` }), el('small', { style: 'display:block;font-size:10px' }, c.name)))));

  /* سبک حکومت */
  page.append(el('div', { class: 'section-title' }, 'سبک حکومت'));
  const styleBox = el('div', {});
  for (const g of content.govStyles) {
    styleBox.append(el('div', { class: 'pick-item style-card mb-8', 'data-style': g.id, onclick: () => { sel.style = g.id; sync(); } },
      icon(g.icon),
      el('div', {}, el('b', {}, g.name), el('small', {}, g.description), el('span', { class: 'bonus' }, g.bonus)),
    ));
  }
  page.append(styleBox);

  const startBtn = el('button', { class: 'btn btn-gold btn-block mt-12', onclick: () => {
    const rulerName = nameField.value.trim();
    const kingdomName = kingdomField.value.trim();
    if (!rulerName || !kingdomName) { notifyError(t('create.required')); return; }
    game.newGame({ rulerName, kingdomName, epithet: sel.epithet, symbol: sel.symbol, flag: sel.flag, color: sel.color, style: sel.style });
    analytics.track('kingdom_created', { style: sel.style });
    sound.victory();
    nav('dashboard');
  } }, t('create.start'));
  page.append(startBtn);
  root.append(page);

  function sync() {
    page.querySelectorAll('[data-sym]').forEach((n) => n.classList.toggle('selected', n.dataset.sym === sel.symbol));
    page.querySelectorAll('[data-flag]').forEach((n) => n.classList.toggle('selected', n.dataset.flag === sel.flag));
    page.querySelectorAll('[data-color]').forEach((n) => n.classList.toggle('selected', n.dataset.color === sel.color));
    page.querySelectorAll('[data-style]').forEach((n) => n.classList.toggle('selected', n.dataset.style === sel.style));
  }
  sync();

  function pickItem(text, onclick) {
    const n = el('div', { class: 'pick-item', 'data-ep': text, onclick: (e) => {
      page.querySelectorAll('[data-ep]').forEach((x) => x.classList.remove('selected'));
      n.classList.add('selected');
      onclick();
    } }, text);
    return n;
  }
}

/* ---------- بوت اولیه ---------- */
(async function boot() {
  analytics.track('app_open');
  const splash = el('div', { class: 'splash' },
    el('div', { class: 'crown-art' }, '👑'),
    el('h1', {}, t('app.name')),
    el('p', {}, t('app.tagline')),
    el('div', { class: 'loader' }, el('span')),
  );
  document.body.append(splash);
  sound.configure({ volume: 80 });

  // بررسی نسخه محتوا (بند 32) — در حالت آفلاین بی‌صدا رد می‌شود
  try {
    const res = await fetch('content-version.json', { cache: 'no-cache' });
    const info = await res.json();
    window.KOC_CONTENT_INFO = info;
  } catch {}

  setTimeout(() => {
    splash.remove();
    // اگر ذخیره‌ای هست مستقیم به ادامه بازی برو
    if (game.saveManager.exists()) {
      const res = game.load();
      if (res) {
        sound.configure(game.state.settings);
        document.body.classList.toggle('reduce-motion', !!game.state.settings.reduceMotion);
        nav(game.state.ended ? 'ending' : 'dashboard');
        return;
      }
    }
    nav('home');
  }, 1100);
})();

document.addEventListener('pointerdown', () => sound.unlock(), { once: true });
