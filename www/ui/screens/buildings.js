/**
 * ui/screens/buildings.js — بند 42: ساختمان‌ها (ساخته‌شده/قابل ساخت/قفل)
 */
import { el, fmt } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar, RES_META } from '../components.js';
import { getBuildingProduction } from '../../core/economyEngine.js';
import { sound } from '../../services/sound.js';

export function renderBuildings(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'ساختمان‌ها')));

  const builderBusy = Object.values(s.buildings).some((b) => b.progress !== null && b.progress !== undefined);
  if (builderBusy) {
    page.append(el('div', { class: 'card', style: 'border-color:rgba(224,169,74,0.4)' },
      el('div', { class: 'card-title' }, icon('hammer'), 'کارگران مشغول‌اند — فقط یک پروژه هم‌زمان')));
  }

  const groups = { built: [], available: [], locked: [] };
  for (const def of game.content.buildings) {
    const st = game.buildingStatus(def.id);
    if (!st) continue;
    const owned = st.owned.level > 0;
    if (owned) groups.built.push(st);
    else if (!st.lockReason && st.nextLevel) groups.available.push(st);
    else groups.locked.push(st);
  }

  const section = (title, list, isBuilt) => {
    if (!list.length) return;
    page.append(el('div', { class: 'section-title' }, title));
    for (const st of list) page.append(buildingCard(ctx, st, isBuilt, builderBusy));
  };
  section('ساخته‌شده', groups.built, true);
  section('قابل ساخت', groups.available, false);
  section('قفل', groups.locked, false);

  root.append(page);
}

function buildingCard(ctx, st, isBuilt, builderBusy) {
  const { game } = ctx;
  const s = game.state;
  const { def, owned, nextLevel, lockReason } = st;

  const prodNow = isBuilt ? getBuildingProduction(def, owned.level, s, game.config, game.content) : null;
  const prodLines = [];
  if (isBuilt) {
    for (const [k, v] of Object.entries(prodNow.production)) {
      if (v) prodLines.push(el('span', { class: 'tag gain' }, `+${fmt(v)} ${RES_META[k]?.name || k}/روز`));
    }
    for (const [k, v] of Object.entries(prodNow.maintenance)) {
      if (v) prodLines.push(el('span', { class: 'tag cost' }, `-${fmt(v)} ${RES_META[k]?.name || k}/روز`));
    }
    if (def.id === 'building_house_001') prodLines.push(el('span', { class: 'tag gain' }, `ظرفیت جمعیت: ${fmt(game.housingCapacity())}`));
    if (def.id === 'building_wall_001' || def.id === 'building_castle_001') prodLines.push(el('span', { class: 'tag gain' }, 'تقویت دفاع در جنگ'));
    if (def.id === 'building_barracks_001') prodLines.push(el('span', { class: 'tag gain' }, 'افزایش روحیه ارتش'));
  }

  const underConstruction = owned.progress !== null && owned.progress !== undefined;

  const meta = el('div', { class: 'choice-meta mt-8' }, prodLines);

  let action = null;
  if (underConstruction) {
    action = el('span', { class: 'tag cost' }, `در حال ساخت: ${fmt(Math.ceil(owned.progress))} روز مانده`);
  } else if (lockReason) {
    action = el('span', { class: 'tag risk' }, lockReason);
  } else if (!nextLevel) {
    action = el('span', { class: 'tag' }, 'حداکثر سطح');
  } else {
    const costTags = Object.entries(st.cost).filter(([, v]) => v > 0).map(([k, v]) => el('span', { class: 'tag cost' }, `${fmt(v)} ${RES_META[k]?.name || k}`));
    const afford = Object.entries(st.cost).every(([k, v]) => (s.resources[k] ?? 0) >= v);
    action = el('div', { class: 'btn-row mt-8' },
      el('div', { class: 'choice-meta flex-1' }, ...costTags, el('span', { class: 'tag' }, `${fmt(st.days)} روز`)),
      el('button', {
        class: 'btn btn-sm ' + (afford && !builderBusy ? 'btn-gold' : ''),
        disabled: !afford || builderBusy || (isBuilt && false),
        onclick: (e) => {
          e.stopPropagation();
          const res = game.buildOrUpgrade(def.id);
          if (res.ok) { sound.build(); ctx.toastInfo(isBuilt ? 'ارتقا آغاز شد.' : 'ساخت آغاز شد.'); ctx.refresh(); }
          else {
            const msgs = { 'cannot-afford': 'منابع کافی نیست.', 'builder-busy': 'کارگران مشغول پروژه دیگری‌اند.', 'in-progress': 'قبلاً در حال ساخت است.' };
            ctx.toastError(msgs[res.error] || res.error);
          }
        },
      }, isBuilt ? `ارتقا به سطح ${fmt(st.targetLevel)}` : 'ساخت'),
    );
  }

  return el('div', { class: 'card' },
    el('div', { class: 'card-title' }, icon(def.icon || 'castle'),
      `${def.name} — سطح ${fmt(owned.level)}${def.maxLevel ? ` از ${fmt(def.maxLevel)}` : ''}`),
    el('p', { class: 'card-sub' }, def.description),
    meta,
    action,
  );
}
