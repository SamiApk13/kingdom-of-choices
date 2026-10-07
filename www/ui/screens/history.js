/**
 * ui/screens/history.js — بند 28: تاریخ سلطنت من + خط زمان
 */
import { el, fmt } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar } from '../components.js';

export function renderHistory(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  const hs = s.history.stats;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'تاریخ سلطنت من')));

  const stats = [
    ['روز سلطنت', fmt(s.kingdom.day)],
    ['تعداد تصمیم‌ها', fmt(hs.decisions)],
    ['جنگ‌ها', fmt(hs.wars)],
    ['پیروزی‌ها', fmt(hs.wins)],
    ['شکست‌ها', fmt(hs.losses)],
    ['بیشترین ثروت', fmt(hs.peakCoins) + ' سکه'],
    ['بیشترین محبوبیت', fmt(hs.maxPopularity)],
    ['کمترین محبوبیت', fmt(hs.minPopularity)],
    ['بزرگ‌ترین قلمرو', fmt(s.ownedTiles.length) + ' منطقه'],
    ['روزهای بدون جنگ', fmt(hs.daysWithoutWar)],
    ['بزرگ‌ترین بحران', hs.biggestCrisis || '—'],
    ['لقب‌ها', fmt(s.titles.length)],
    ['دستاوردها', fmt(Object.keys(s.achievements).length)],
  ];
  page.append(el('div', { class: 'card' },
    stats.map(([k, v]) => el('div', { class: 'report-line' }, el('span', {}, k), el('b', {}, v))),
  ));

  page.append(el('div', { class: 'section-title' }, icon('book'), 'خط زمان سلطنت'));
  const timeline = [...s.history.timeline].reverse().slice(0, 60);
  page.append(el('div', { class: 'timeline' },
    timeline.map((item) => el('div', { class: 'tl-item' },
      el('div', { class: 'day' }, `روز ${fmt(item.day)}`),
      el('div', {}, item.text))),
  ));
  root.append(page);
}
