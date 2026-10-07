/**
 * ui/screens/map.js — بندهای 20/21/41: نقشه قلمرو و گسترش
 */
import { el, fmt, showModal, closeModal } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar, RES_META } from '../components.js';
import { TILE_TYPE_NAMES, TILE_PRODUCTION } from '../../content/mapTiles.js';
import { sound } from '../../services/sound.js';

const TYPE_ICO = { capital: '👑', farm: '🌾', forest: '🌲', mine: '⛏️', quarry: '🪨', village: '🏘️', plain: '', river: '🌊', mountain: '⛰️' };

export function renderMap(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' },
    el('h2', {}, 'نقشه قلمرو'),
    el('span', { class: 'level-chip' }, `${fmt(s.ownedTiles.length)} منطقه`),
  ));

  const expandable = new Set(game.adjacentExpandableTiles().map((t) => t.id));
  const expanding = new Set(s.expansions.map((e) => e.tileId));

  const xs = [...new Set(game.content.mapTiles.map((t) => t.x))].sort((a, b) => a - b);
  const ys = [...new Set(game.content.mapTiles.map((t) => t.y))].sort((a, b) => a - b);
  const grid = el('div', { class: 'map-grid', style: `grid-template-columns: repeat(${xs.length}, 1fr); --kingdom-color:${s.kingdom.color}` });

  for (const y of ys) {
    for (const x of xs) {
      const t = game.content.mapTiles.find((m) => m.x === x && m.y === y);
      if (!t) { grid.append(el('div')); continue; }
      const owned = s.ownedTiles.includes(t.id);
      const countryDef = t.startOwner && t.startOwner !== 'player' ? game.content.countries.find((c) => c.id === t.startOwner) : null;
      const cls = ['tile', t.type];
      if (owned) cls.push('owned');
      if (countryDef) cls.push('enemy-owned');
      if (expandable.has(t.id)) cls.push('expandable');
      const tileEl = el('div', { class: cls.join(' '), onclick: () => tileDetails(ctx, t, owned, countryDef) },
        countryDef ? el('span', { class: 'owner-dot', style: `background:${countryDef.color}` }) : null,
        TYPE_ICO[t.type] || '',
      );
      grid.append(tileEl);
    }
  }

  page.append(el('div', { class: 'map-wrap' }, grid));
  page.append(el('div', { class: 'map-legend' },
    el('span', {}, el('i', { style: 'background:var(--kingdom-color,' + s.kingdom.color + ')' }), 'قلمرو شما'),
    el('span', {}, el('i', { style: 'background:#2c2a1e' }), 'آزاد'),
    el('span', {}, el('i', { style: 'background:#37322e' }), 'کوهستان'),
    el('span', {}, el('i', { style: 'background:#1e3547' }), 'رود'),
    el('span', {}, el('i', { style: 'background:#a83232' }), 'کشورهای همسایه'),
  ));

  const cost = game.expansionCost();
  page.append(el('div', { class: 'card' },
    el('div', { class: 'card-title' }, icon('map'), 'گسترش قلمرو'),
    el('p', { class: 'small muted' }, `روی کاشی‌های دارای علامت «+» کنار قلمرو خود بزنید. هزینه هر گشایش با رشد قلمرو بیشتر می‌شود.`),
    el('div', { class: 'choice-meta mt-8' },
      el('span', { class: 'tag cost' }, `${fmt(cost.coins)} سکه`),
      el('span', { class: 'tag cost' }, `${fmt(cost.influence)} نفوذ`),
      el('span', { class: 'tag cost' }, `${fmt(cost.population)} جمعیت`),
      el('span', { class: 'tag' }, `${fmt(cost.days)} روز`),
    ),
  ));

  root.append(page);
}

function tileDetails(ctx, t, owned, countryDef) {
  const { game } = ctx;
  const s = game.state;
  const expandable = game.adjacentExpandableTiles().some((x) => x.id === t.id);
  const expanding = s.expansions.find((e) => e.tileId === t.id);
  const cost = game.expansionCost();
  const prod = Object.entries(TILE_PRODUCTION[t.type] || {});

  const content = el('div', {},
    el('h3', {}, `${TYPE_ICO[t.type] || ''} ${t.name}`),
    el('p', { class: 'muted mb-8' }, `نوع: ${TILE_TYPE_NAMES[t.type]} • مالک: ${owned ? 'شما' : countryDef ? countryDef.name : 'آزاد'}`),
    prod.length ? el('div', { class: 'section-title' }, 'تولید در روز (پس از تملک)') : null,
    prod.map(([k, v]) => el('div', { class: 'report-line' }, el('span', {}, RES_META[k]?.name || k), el('span', { class: 'v-pos' }, `+${fmt(v)}`))),
    t.locked ? el('p', { class: 'muted mt-8' }, '⛔ این منطقه غیرقابل گشایش است (عوارض طبیعی).') : null,
    countryDef ? el('p', { class: 'muted mt-8' }, '⚔️ خاک کشورهای همسایه فقط با جنگ قابل فتح است.') : null,
    expanding ? el('p', { class: 'mt-8', style: 'color:var(--gold-soft)' }, `⏳ گشایش در جریان — ${fmt(expanding.daysLeft)} روز مانده`) : null,
  );

  if (expandable && !owned && !expanding) {
    content.append(el('div', { class: 'section-title' }, 'هزینه گشایش'));
    content.append(el('div', { class: 'choice-meta' },
      el('span', { class: 'tag cost' }, `${fmt(cost.coins)} سکه`),
      el('span', { class: 'tag cost' }, `${fmt(cost.influence)} نفوذ`),
      el('span', { class: 'tag cost' }, `${fmt(cost.population)} جمعیت`),
    ));
    content.append(el('button', { class: 'btn btn-gold btn-block mt-12', onclick: () => {
      const res = game.expandTile(t.id);
      if (res.ok) { sound.build(); ctx.toastInfo('گشایش منطقه آغاز شد.'); closeModal(); ctx.refresh(); }
      else ctx.toastError('امکان گشایش نیست: ' + res.error);
    } }, 'گشایش این منطقه'));
  }

  content.append(el('button', { class: 'btn btn-block mt-8', onclick: closeModal }, 'بستن'));
  showModal(content, { center: true });
}
