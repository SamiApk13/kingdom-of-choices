/**
 * ui/screens/court.js — بند 8: دربار تصمیم‌گیری
 */
import { el, fmt, showModal, closeModal } from '../dom.js';
import { icon, EVENT_CATEGORY_ICON } from '../../assets/icons.js';
import { renderTopBar, costTags, effectTags } from '../components.js';
import { canAffordChoice } from '../../core/decisionEngine.js';
import { evalCondition } from '../../core/conditionEngine.js';
import { sound } from '../../services/sound.js';
import { analytics } from '../../services/analytics.js';

const CAT_NAMES = {
  economic: 'اقتصادی', military: 'نظامی', political: 'سیاسی', social: 'اجتماعی',
  natural: 'طبیعی', trade: 'تجاری', diplomatic: 'دیپلماتیک', cultural: 'فرهنگی',
  science: 'علمی', crisis: 'بحران', story: 'داستانی',
};

export function renderCourt(root, ctx) {
  const { game, nav } = ctx;
  root.append(renderTopBar(game));
  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'دربار تصمیم‌گیری')));

  const ev = game.currentEvent();
  if (!ev) {
    page.append(el('div', { class: 'card center-text' },
      el('p', { class: 'muted mb-8' }, 'امروز درخواستی در دربار نیست.'),
      el('button', { class: 'btn btn-gold', onclick: () => finishDay(ctx, null) }, 'پایان روز'),
    ));
    root.append(page);
    return;
  }

  const iconName = EVENT_CATEGORY_ICON[ev.category] || 'scroll';
  const card = el('div', { class: 'card event-card' },
    el('div', { class: 'event-head' },
      el('div', { class: 'event-icon' }, icon(iconName)),
      el('div', {},
        el('h3', {}, ev.title),
        el('span', { class: 'cat' }, CAT_NAMES[ev.category] || ev.category, ev.rarity === 'epic' ? ' • حماسی' : ev.rarity === 'legendary' ? ' • افسانه‌ای' : ev.rarity === 'rare' ? ' • کمیاب' : ''),
      ),
    ),
    el('p', { class: 'event-desc' }, ev.description),
  );

  for (const choice of ev.choices) {
    const affordable = canAffordChoice(game.state, choice);
    const reqOk = !choice.requirements || evalCondition(choice.requirements, { state: game.state, config: game.config, content: game.content });
    const div = el('div', { class: 'choice' + (!affordable || !reqOk ? ' cant' : ''), onclick: () => {
      if (!affordable || !reqOk) { ctx.toastError(!affordable ? 'منابع کافی برای این انتخاب نیست.' : 'شرایط لازم را ندارید.'); return; }
      chooseOption(ctx, ev, choice);
    } },
      el('h4', {}, choice.title),
      choice.description ? el('p', {}, choice.description) : null,
      el('div', { class: 'choice-meta' },
        ...costTags(choice.costs),
        ...effectTags(choice.effects),
        choice.randomEffects?.length ? el('span', { class: 'tag risk' }, `ریسک: ${choice.randomEffects.length} حالت تصادفی`) : null,
      ),
    );
    card.append(div);
  }

  page.append(card);
  page.append(el('div', { class: 'center-text' },
    el('button', { class: 'btn btn-ghost btn-sm', onclick: () => finishDay(ctx, ev) }, 'امروز تصمیم نمی‌گیرم (پایان روز)'),
  ));
  root.append(page);
}

function chooseOption(ctx, ev, choice) {
  const { game } = ctx;
  sound.decision();
  analytics.track('decision_made', { event: ev.id, choice: choice.id });
  const res = game.choose(choice.id);
  if (!res.ok) { ctx.toastError('امکان اجرای این انتخاب نیست.'); return; }

  /* مودال نتیجه تصمیم + گزارش روز */
  const lines = [];
  for (const r of res.report) lines.push(el('div', { class: 'report-line' }, el('span', {}, r)));
  for (const rr of res.randomResults) {
    lines.push(el('div', { class: 'report-line' },
      el('span', { style: 'color:var(--warn)' }, `🎲 ${rr.label || 'اتفاق تصادفی'}`),
      el('span', {}, rr.desc.join('، ') || 'اعمال شد'),
    ));
  }
  const dr = res.dayReport;
  const netLines = Object.entries(dr.net)
    .filter(([k]) => ['coins', 'food', 'wood', 'stone', 'iron'].includes(k))
    .map(([k, v]) => el('div', { class: 'report-line' },
      el('span', {}, { coins: 'سکه', food: 'غذا', wood: 'چوب', stone: 'سنگ', iron: 'آهن' }[k]),
      el('span', { class: v >= 0 ? 'v-pos' : 'v-neg' }, (v > 0 ? '+' : '') + fmt(v)),
    ));

  const notices = dr.notices.map((n) => el('div', { class: 'report-line' }, el('span', { style: 'color:var(--gold-soft)' }, n)));

  showModal(el('div', {},
    el('h3', {}, `روز ${fmt(game.state.kingdom.day)} — گزارش دربار`),
    el('div', { class: 'section-title' }, 'نتیجه تصمیم شما'),
    lines.length ? lines : el('p', { class: 'muted' }, 'اثر خاصی نداشت.'),
    el('div', { class: 'section-title' }, 'گردش منابع روز'),
    netLines,
    notices.length ? el('div', { class: 'section-title' }, 'اتفاق‌های امروز') : null,
    notices,
    game.state.pendingEvent ? el('p', { class: 'muted mt-12' }, '📜 درخواست تازه‌ای در دربار است.') : null,
    el('button', { class: 'btn btn-gold btn-block mt-12', onclick: () => { closeModal(); ctx.refresh(); } }, 'ادامه'),
  ));
}

function finishDay(ctx, ev) {
  const { game } = ctx;
  const res = game.endDayWithoutDecision();
  ctx.refresh();
  ctx.toastInfo(`روز ${fmt(game.state.kingdom.day)} آغاز شد.`);
}
