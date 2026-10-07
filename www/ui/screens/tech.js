/**
 * ui/screens/tech.js — بند 23: درخت فناوری
 */
import { el, fmt } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar, RES_META } from '../components.js';
import { sound } from '../../services/sound.js';

const BRANCH_NAMES = { agriculture: 'کشاورزی', economy: 'اقتصاد', military: 'نظامی', building: 'ساختمان', trade: 'تجارت', defense: 'دفاع', science: 'علم' };

export function renderTech(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'فناوری')));
  page.append(el('p', { class: 'muted mb-8' }, `دانش: ${fmt(s.resources.knowledge)} • ${s.research.current ? `در حال تحقیق: ${fmt(Math.ceil(s.research.progress))} روز مانده` : 'ظرفیت تحقیق آزاد است'}`));

  const branches = {};
  for (const t of game.content.technologies) {
    (branches[t.branch] ||= []).push(t);
  }
  for (const [branch, techs] of Object.entries(branches)) {
    page.append(el('div', { class: 'section-title' }, BRANCH_NAMES[branch] || branch));
    for (const t of techs) {
      const researched = s.research.unlocked.includes(t.id);
      const current = s.research.current === t.id;
      const reqOk = (t.requires || []).every((r) => s.research.unlocked.includes(r));
      const levelOk = !t.minLevel || s.kingdom.level >= t.minLevel;
      const afford = Object.entries(t.cost).every(([k, v]) => s.resources[k] >= v);
      const locked = !reqOk || !levelOk;

      const costTags = Object.entries(t.cost).map(([k, v]) =>
        el('span', { class: 'tag cost' }, `${fmt(v)} ${k === 'knowledge' ? 'دانش' : RES_META[k]?.name || k}`));

      page.append(el('div', { class: 'card', style: locked ? 'opacity:0.6' : '' },
        el('div', { class: 'card-title' }, icon('flask'), t.name,
          researched ? el('span', { class: 'tag gain' }, 'تحقیق شده') :
          current ? el('span', { class: 'tag cost' }, `در حال تحقیق — ${fmt(Math.ceil(s.research.progress))} روز`) : null),
        el('p', { class: 'card-sub' }, t.description),
        !reqOk ? el('p', { class: 'muted mt-8' }, `پیش‌نیاز: ${t.requires.map((r) => game.content.technologies.find((x) => x.id === r)?.name).join('، ')}`) : null,
        !levelOk ? el('p', { class: 'muted mt-8' }, `نیازمند سطح پادشاهی ${fmt(t.minLevel)}`) : null,
        !researched && !current ? el('div', { class: 'btn-row mt-8' },
          el('div', { class: 'choice-meta flex-1' }, ...costTags, el('span', { class: 'tag' }, `${fmt(t.days)} روز`)),
          el('button', { class: 'btn btn-sm btn-gold', disabled: locked || !afford || !!s.research.current, onclick: () => {
            const res = game.researchTech(t.id);
            if (res.ok) { sound.click(); ctx.toastInfo('تحقیق آغاز شد.'); ctx.refresh(); }
            else ctx.toastError('امکان تحقیق نیست.');
          } }, 'تحقیق'),
        ) : null,
      ));
    }
  }
  root.append(page);
}
