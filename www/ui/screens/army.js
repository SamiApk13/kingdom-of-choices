/**
 * ui/screens/army.js — بندهای 15/16/43: ارتش، واحدها و ژنرال‌ها
 */
import { el, fmt } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar, RES_META } from '../components.js';
import { estimateMilitaryPower } from '../../core/warEngine.js';
import { sound } from '../../services/sound.js';

export function renderArmy(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'ارتش پادشاهی')));

  const total = Object.values(s.military.units).reduce((a, b) => a + b, 0);
  const power = estimateMilitaryPower(s, game.config, game.content);
  let upkeep = 0;
  for (const u of game.content.units) upkeep += (s.military.units[u.id] || 0) * u.upkeep;
  upkeep += s.generals.length * game.config.generals.upkeepPerDay;

  page.append(el('div', { class: 'stat-tiles' },
    statTile('population', fmt(total), 'کل نیروها'),
    statTile('military', fmt(power), 'قدرت کل'),
    statTile('morale', fmt(s.stats.morale), 'روحیه'),
  ));
  page.append(el('p', { class: 'muted mb-8' }, `هزینه نگهداری روزانه: ${fmt(Math.round(upkeep))} سکه • آموزش: سطح ${fmt(s.military.training)} • ظرفیت سربازگیری از جمعیت است.`));

  page.append(el('div', { class: 'section-title' }, 'واحدها'));
  for (const def of game.content.units) {
    const count = s.military.units[def.id] || 0;
    const techLocked = def.requiresTech && !s.research.unlocked.includes(def.requiresTech);
    const bLocked = def.requiresBuilding && !(s.buildings[def.requiresBuilding]?.level > 0);
    const levelLocked = s.kingdom.level < def.minLevel;
    const locked = techLocked || bLocked || levelLocked;

    let lockNote = '';
    if (techLocked) lockNote = `نیازمند فناوری «${game.content.technologies.find((t) => t.id === def.requiresTech)?.name}»`;
    else if (bLocked) lockNote = `نیازمند «${game.content.buildings.find((b) => b.id === def.requiresBuilding)?.name}»`;
    else if (levelLocked) lockNote = `نیازمند سطح پادشاهی ${fmt(def.minLevel)}`;

    page.append(el('div', { class: 'list-item' },
      el('div', { class: 'thumb' }, icon(def.icon)),
      el('div', { class: 'info' },
        el('h4', {}, `${def.name} — ${fmt(count)} نفر`),
        el('p', {}, locked ? lockNote : `${def.description} | قدرت ${fmt(def.power)} • هزینه ${fmt(def.cost.coins)} سکه • نگهداری ${fmt(def.upkeep)}/روز`),
      ),
      locked ? el('span', { class: 'tag risk' }, 'قفل') : el('div', { class: 'btn-row' },
        el('button', { class: 'btn btn-sm', onclick: () => doRecruit(ctx, def.id, 1) }, '+۱'),
        el('button', { class: 'btn btn-sm btn-gold', onclick: () => doRecruit(ctx, def.id, 10) }, '+۱۰'),
        count > 0 ? el('button', { class: 'btn btn-sm btn-red', onclick: () => doDismiss(ctx, def.id) }, '-۱۰') : null,
      ),
    ));
  }

  /* آموزش ارتش */
  if (s.military.training < 5) {
    const cost = s.military.training * 150;
    page.append(el('div', { class: 'card' },
      el('div', { class: 'card-title' }, icon('target'), `ارتقای آموزش ارتش (سطح ${fmt(s.military.training)} ← ${fmt(s.military.training + 1)})`),
      el('p', { class: 'card-sub' }, 'هر سطح آموزش، قدرت کل ارتش را ۱۲٪ افزایش می‌دهد.'),
      el('button', { class: 'btn btn-gold btn-sm mt-8', disabled: s.resources.coins < cost, onclick: () => {
        s.resources.coins -= cost; s.military.training += 1; game.save(); sound.build(); ctx.toastInfo('آموزش ارتش ارتقا یافت.'); ctx.refresh();
      } }, `ارتقا (${fmt(cost)} سکه)`),
    ));
  }

  /* ژنرال‌ها (بند 16) */
  page.append(el('div', { class: 'section-title' }, 'ژنرال‌ها'));
  if (!s.generals.length) page.append(el('p', { class: 'muted' }, 'هنوز ژنرالی استخدام نکرده‌اید. ژنرال قدرت ارتش را چند برابر می‌کند.'));
  for (const g of s.generals) {
    page.append(el('div', { class: 'list-item' },
      el('div', { class: 'thumb' }, '🎖️'),
      el('div', { class: 'info' },
        el('h4', {}, `${g.name} «${g.epithet}»`),
        el('p', {}, `${g.traitName} • قدرت +${fmt(g.power)}٪ • وفاداری ${fmt(g.loyalty)}`),
        el('div', { class: 'progress thin mt-8' }, el('span', { style: `width:${g.loyalty}%;background:${g.loyalty < 30 ? 'var(--danger)' : 'var(--gold)'}` })),
      ),
    ));
  }
  const candidates = game.content.generals.filter((g) => !s.generals.some((x) => x.id === g.id));
  for (const g of candidates.slice(0, 3)) {
    page.append(el('div', { class: 'list-item' },
      el('div', { class: 'thumb' }, '🛡️'),
      el('div', { class: 'info' },
        el('h4', {}, g.name),
        el('p', {}, g.description),
        el('p', {}, `${g.traitName}`),
      ),
      el('button', { class: 'btn btn-sm', disabled: s.resources.coins < g.hireCost, onclick: () => {
        const res = game.hireGeneral(g.id);
        if (res.ok) { sound.victory(); ctx.toastInfo(`${g.name} به ارتش پیوست!`); ctx.refresh(); }
        else ctx.toastError('امکان استخدام نیست.');
      } }, `استخدام ${fmt(g.hireCost)} سکه`),
    ));
  }

  root.append(page);
}

function statTile(iconName, value, label) {
  return el('div', { class: 'stat-tile' }, icon(iconName), el('b', {}, value), el('span', {}, label));
}

function doRecruit(ctx, unitId, n) {
  const res = ctx.game.recruit(unitId, n);
  if (res.ok) { sound.click(); ctx.refresh(); }
  else {
    const msgs = { 'cannot-afford': 'سکه/غذای کافی نیست.', 'no-pop': 'جمعیت کافی برای سربازگیری نیست.', tech: 'فناوری لازم را ندارید.', building: 'ساختمان لازم را ندارید.' };
    ctx.toastError(msgs[res.error] || res.error);
  }
}
function doDismiss(ctx, unitId) {
  ctx.game.dismiss(unitId, 10);
  ctx.refresh();
}
