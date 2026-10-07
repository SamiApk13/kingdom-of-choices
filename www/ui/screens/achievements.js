/**
 * ui/screens/achievements.js — بند 25/26: دستاوردها و لقب‌ها
 */
import { el, fmt } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar } from '../components.js';

export function renderAchievements(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'دستاوردها و لقب‌ها')));

  page.append(el('div', { class: 'section-title' }, icon('crown'), 'لقب‌ها'));
  if (!s.titles.length) page.append(el('p', { class: 'muted' }, 'هنوز لقبی کسب نکرده‌اید.'));
  for (const id of s.titles) {
    const tDef = game.content.titles.find((x) => x.id === id);
    if (!tDef) continue;
    const active = s.activeTitle === id;
    page.append(el('div', { class: 'list-item', style: 'cursor:pointer', onclick: () => {
      s.activeTitle = active ? null : id; game.save(); ctx.refresh();
      ctx.toastInfo(active ? 'لقب برداشته شد.' : `لقب فعال: ${tDef.name}`);
    } },
      el('div', { class: 'thumb' }, '👑'),
      el('div', { class: 'info' }, el('h4', {}, tDef.name), el('p', {}, tDef.description)),
      el('span', { class: 'tag ' + (active ? 'gain' : '') }, active ? 'فعال' : 'انتخاب'),
    ));
  }

  page.append(el('div', { class: 'section-title' }, icon('trophy'), 'دستاوردها'));
  for (const a of game.content.achievements) {
    const got = !!s.achievements[a.id];
    page.append(el('div', { class: 'list-item', style: got ? '' : 'opacity:0.55' },
      el('div', { class: 'thumb' }, icon(a.icon || 'trophy')),
      el('div', { class: 'info' }, el('h4', {}, a.name), el('p', {}, a.description)),
      got ? el('span', { class: 'tag gain' }, `روز ${fmt(s.achievements[a.id].day)}`) : el('span', { class: 'tag' }, 'قفل'),
    ));
  }
  root.append(page);
}
