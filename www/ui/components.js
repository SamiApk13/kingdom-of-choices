/**
 * ui/components.js
 * ------------------------------------------------------------
 * اجزای مشترک رابط: نوار بالای منابع، چیپ‌ها، آیتم‌های لیست.
 */
import { el, fmt, signed, showModal, closeModal } from './dom.js';
import { icon } from '../assets/icons.js';
import { t } from '../config/localization.js';

export const RES_META = {
  coins: { icon: 'coins', name: 'سکه' },
  food: { icon: 'food', name: 'غذا' },
  wood: { icon: 'wood', name: 'چوب' },
  stone: { icon: 'stone', name: 'سنگ' },
  iron: { icon: 'iron', name: 'آهن' },
  population: { icon: 'population', name: 'جمعیت' },
  knowledge: { icon: 'knowledge', name: 'دانش' },
  influence: { icon: 'influence', name: 'نفوذ سیاسی' },
  credibility: { icon: 'credibility', name: 'اعتبار سلطنتی' },
};

export const STAT_META = {
  popularity: { icon: 'popularity', name: 'محبوبیت' },
  security: { icon: 'security', name: 'امنیت' },
  morale: { icon: 'morale', name: 'روحیه ارتش' },
  military: { icon: 'military', name: 'قدرت نظامی' },
};

export function popularityZone(v) {
  if (v <= 10) return { label: 'خطر شورش بسیار زیاد', color: 'var(--danger)' };
  if (v <= 30) return { label: 'نارضایتی شدید', color: 'var(--red-bright)' };
  if (v <= 50) return { label: 'وضعیت ضعیف', color: 'var(--warn)' };
  if (v <= 70) return { label: 'عادی', color: 'var(--text-1)' };
  if (v <= 90) return { label: 'خوب', color: 'var(--success)' };
  return { label: 'فوق‌العاده', color: 'var(--gold)' };
}

/* ---------- نوار منابع بالا (بند 6) ---------- */
export function renderTopBar(game, onchange) {
  const s = game.state;
  const daily = game.dailyPreview();
  const need = game.xpForLevel();
  const xpPct = Math.min(100, Math.round((s.kingdom.xp / need) * 100));

  const chips = ['coins', 'food', 'wood', 'stone', 'iron', 'population'].map((k) => {
    const meta = RES_META[k];
    const delta = daily.net[k] ?? 0;
    const chip = el('div', {
      class: 'res-chip' + (k === 'coins' && s.resources.coins < 0 ? ' neg' : ''),
      onclick: () => showResourceDetail(game, k),
    },
      icon(meta.icon),
      el('b', {}, fmt(s.resources[k])),
      k !== 'population' ? el('span', { class: 'delta' + (delta < 0 ? ' neg' : '') }, signed(delta)) : null,
    );
    return chip;
  });

  return el('div', { class: 'topbar' },
    el('div', { class: 'topbar-row1' },
      el('span', { class: 'kingdom-badge' }, el('span', { class: 'flag' }, s.kingdom.flag), s.kingdom.name),
      el('span', { class: 'level-chip' }, `سطح ${fmt(s.kingdom.level)}`),
      el('span', { class: 'day-chip' }, `${t('dash.day')} ${fmt(s.kingdom.day)}`),
    ),
    el('div', { class: 'xpbar' }, el('span', { style: `width:${xpPct}%` })),
    el('div', { class: 'resbar' }, chips),
  );
}

/* ---------- مودال جزئیات منبع (بند 6) ---------- */
export function showResourceDetail(game, key) {
  const s = game.state;
  const daily = game.dailyPreview();
  const meta = RES_META[key] || { name: key, icon: 'coins' };
  const prod = daily.production[key] || 0;
  const cons = daily.consumption[key] || 0;
  const net = daily.net[key] ?? 0;

  const row = (label, value, cls = '') => el('div', { class: 'report-line' }, el('span', {}, label), el('span', { class: cls }, value));
  const content = el('div', {},
    el('div', { class: 'card-title' }, icon(meta.icon), meta.name),
    row('مقدار فعلی', fmt(s.resources[key])),
    row('تولید در روز', signed(prod), 'v-pos'),
    row('مصرف در روز', cons ? signed(-cons) : '۰', cons ? 'v-neg' : ''),
    row('خالص روزانه', signed(net), net >= 0 ? 'v-pos' : 'v-neg'),
    el('p', { class: 'muted mt-8' }, resourceHint(key)),
    el('button', { class: 'btn btn-block mt-12', onclick: closeModal }, t('common.close')),
  );
  showModal(content, { center: true });
}

function resourceHint(key) {
  const hints = {
    coins: 'برای ساخت، تجارت، ارتش و دیپلماسی استفاده می‌شود. از مالیات و ساختمان‌های تجاری به دست می‌آید.',
    food: 'جمعیت و ارتش هر روز غذا مصرف می‌کنند. از مزارع و کاشی‌های کشاورزی تولید می‌شود.',
    wood: 'مصالح اصلی ساختمان‌ها. از کارگاه‌ها و جنگل‌های تحت تملک به دست می‌آید.',
    stone: 'برای دیوار، قلعه و ساختمان‌های دفاعی ضروری است.',
    iron: 'برای ارتش، تجهیزات و فناوری‌های پیشرفته.',
    population: 'نیروی کار و سربازگیری. با غذا، امنیت و رفاه رشد می‌کند.',
    knowledge: 'از دانشگاه و بودجه علم؛ برای تحقیق فناوری‌ها.',
    influence: 'نفوذ سیاسی برای دیپلماسی، گسترش قلمرو و پیمان‌ها.',
    credibility: 'اعتبار سلطنتی برای تصمیم‌های بزرگ و اتحادها.',
  };
  return hints[key] || '';
}

/* ---------- آیتم لیست استاندارد ---------- */
export function listItem({ thumb, title, sub, side, onclick }) {
  return el('div', { class: 'list-item', style: onclick ? 'cursor:pointer' : '' , onclick },
    thumb ? el('div', { class: 'thumb', html: thumb.startsWith('<') ? thumb : undefined }, thumb.startsWith('<') ? undefined : thumb) : null,
    el('div', { class: 'info' },
      el('h4', { html: title }),
      sub ? el('p', {}, sub) : null,
    ),
    side ? el('div', { class: 'side' }, side) : null,
  );
}

/* ---------- برچسب هزینه/اثر برای گزینه‌ها ---------- */
export function costTags(costs) {
  if (!costs || !Object.keys(costs).length) return [el('span', { class: 'tag' }, 'بدون هزینه')];
  return Object.entries(costs).map(([k, v]) => el('span', { class: 'tag cost' }, `${RES_META[k]?.name || k}: ${fmt(v)}`));
}

export function effectTags(effects) {
  if (!effects) return [];
  const out = [];
  for (const e of effects) {
    if (e.type === 'resource') out.push(el('span', { class: 'tag ' + (e.amount >= 0 ? 'gain' : 'cost') }, `${signed(e.amount)} ${RES_META[e.res]?.name || e.res}`));
    else if (e.type === 'popularity') out.push(el('span', { class: 'tag ' + (e.amount >= 0 ? 'gain' : 'risk') }, `${signed(e.amount)} محبوبیت`));
    else if (e.type === 'security') out.push(el('span', { class: 'tag ' + (e.amount >= 0 ? 'gain' : 'risk') }, `${signed(e.amount)} امنیت`));
    else if (e.type === 'morale') out.push(el('span', { class: 'tag ' + (e.amount >= 0 ? 'gain' : 'risk') }, `${signed(e.amount)} روحیه`));
    else if (e.type === 'xp') out.push(el('span', { class: 'tag gain' }, `+${fmt(e.amount)} تجربه`));
    else if (e.type === 'change_relation') out.push(el('span', { class: 'tag' }, 'تغییر رابطه'));
    else if (e.type === 'spawn_event') out.push(el('span', { class: 'tag' }, 'ادامه دارد…'));
    else if (e.type === 'price_shock') out.push(el('span', { class: 'tag' }, 'اثر بر بازار'));
    else if (e.type === 'timeline') out.push(el('span', { class: 'tag' }, 'ثبت در تاریخ'));
  }
  return out;
}
