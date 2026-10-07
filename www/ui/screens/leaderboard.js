/**
 * ui/screens/leaderboard.js — بند 36: رتبه‌بندی (در نسخه آفلاین: محلی)
 */
import { el, fmt } from '../dom.js';
import { renderTopBar } from '../components.js';

const ENDING_NAMES = {
  golden_empire: 'امپراتوری طلایی', revolt: 'شورش مردمی', conquered: 'فتح توسط دشمن',
  economic_collapse: 'فروپاشی اقتصادی', famine: 'قحطی', ongoing: 'ادامه سلطنت',
};

export function renderLeaderboard(root, ctx) {
  const { game, storage } = ctx;
  if (game.state) root.append(renderTopBar(game));
  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' },
    !game.state ? el('button', { class: 'back-btn', onclick: () => location.hash = '#/home' }, '←') : null,
    el('h2', {}, 'رتبه‌بندی پادشاهان')));
  page.append(el('p', { class: 'muted mb-8' }, 'جدول محلی سلطنت‌های شما روی این دستگاه. با اتصال به سرور، جدول آنلاین فعال می‌شود.'));

  let list = [];
  try { list = JSON.parse(storage.get('koc_leaderboard') || '[]'); } catch {}
  if (!list.length) {
    page.append(el('div', { class: 'card center-text' }, el('p', { class: 'muted' }, 'هنوز رکوردی ثبت نشده است.')));
  } else {
    list.forEach((e, i) => {
      page.append(el('div', { class: 'list-item' },
        el('div', { class: 'thumb' }, i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : fmt(i + 1)),
        el('div', { class: 'info' },
          el('h4', {}, `${e.name} — ${e.kingdom}`),
          el('p', {}, `${fmt(e.day)} روز حکومت • سطح ${fmt(e.level)} • ${fmt(e.coins)} سکه • ${ENDING_NAMES[e.ending] || e.ending}`),
        ),
      ));
    });
  }
  root.append(page);
}
