/**
 * ui/screens/dashboard.js — بند 39: داشبورد مرکزی پادشاهی
 */
import { el, fmt } from '../dom.js';
import { icon, ICONS } from '../../assets/icons.js';
import { renderTopBar, popularityZone } from '../components.js';
import { t } from '../../config/localization.js';

export function renderDashboard(root, ctx) {
  const { game, nav } = ctx;
  const s = game.state;
  if (s.ended) { nav('ending'); return; }

  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });

  /* بنرهای وضعیت فعال */
  const banners = [];
  for (const [id, b] of Object.entries(s.buildings)) {
    if (b.progress !== null && b.progress !== undefined) {
      const def = game.content.buildings.find((x) => x.id === id);
      banners.push({ icon: icon('hammer'), text: `«${def?.name}» در حال ساخت — ${fmt(Math.ceil(b.progress))} روز مانده`, cls: '' });
    }
  }
  if (s.research.current) {
    const tech = game.content.technologies.find((x) => x.id === s.research.current);
    banners.push({ icon: icon('flask'), text: `تحقیق «${tech?.name}» — ${fmt(Math.ceil(s.research.progress))} روز مانده`, cls: '' });
  }
  for (const ex of s.expansions) {
    const tile = game.content.mapTiles.find((x) => x.id === ex.tileId);
    banners.push({ icon: icon('map'), text: `گشایش «${tile?.name}» — ${fmt(ex.daysLeft)} روز مانده`, cls: '' });
  }
  const wars = game.content.countries.filter((c) => s.countries[c.id]?.atWar);
  for (const w of wars) {
    banners.push({ icon: icon('sword'), text: `در جنگ با ${w.name}!`, cls: 'danger' });
  }
  if (s.resources.coins < 0) {
    banners.push({ icon: icon('alert'), text: `خزانه در بدهی است (${fmt(s.bankruptDays || 0)} روز) — خطر فروپاشی اقتصادی!`, cls: 'danger' });
  }
  if (s.resources.food <= 0) {
    banners.push({ icon: icon('alert'), text: 'انبار غذا خالی است! مردم گرسنه‌اند.', cls: 'danger' });
  }
  for (const b of banners) {
    page.append(el('div', { class: 'card' + (b.cls === 'danger' ? ' event-card' : ''), style: b.cls === 'danger' ? 'border-color:#d84a4a66' : '' },
      el('div', { class: 'card-title', html: b.icon }), el('span', { class: 'small' }, b.text)));
  }

  /* قهرمان قلعه */
  const style = game.content.govStyles.find((g) => g.id === s.kingdom.style);
  const activeTitle = game.content.titles.find((x) => x.id === s.activeTitle);
  page.append(el('div', { class: 'castle-hero' },
    el('div', { class: 'castle-art' }, s.kingdom.flag),
    el('div', { class: 'k-name' }, `${s.player.name}${s.player.epithet ? ' ' + s.player.epithet : ''}`),
    el('div', { class: 'k-sub' }, `${style?.name || ''}${activeTitle ? ' • ' + activeTitle.name : ''}${s.ngPlus.count ? ` • سلطنت ${fmt(s.ngPlus.count + 1)}` : ''}`),
  ));

  /* کاشی‌های شاخص حیاتی (بند 11) */
  const milPower = game.estimateMilitaryPower();
  const zone = popularityZone(s.stats.popularity);
  const tile = (iconName, name, value, barPct, barColor, onclick) => el('div', { class: 'stat-tile', onclick },
    icon(iconName), el('b', {}, fmt(value)), el('span', {}, name),
    barPct !== null ? el('div', { class: 'bar' }, el('span', { style: `width:${Math.min(100, barPct)}%;background:${barColor}` })) : null,
  );
  page.append(el('div', { class: 'stat-tiles' },
    tile('popularity', 'محبوبیت', s.stats.popularity, s.stats.popularity, zone.color, () => ctx.info('محبوبیت', `${zone.label}\nمحبوبیت پایین خطر شورش را افزایش می‌دهد و رشد جمعیت را کم می‌کند.`)),
    tile('security', 'امنیت', s.stats.security, s.stats.security, 'var(--blue)', () => ctx.info('امنیت', 'امنیت پایین یعنی جرم، راهزنی و شورش بیشتر. با بودجه امنیت و دیوار بالا می‌ماند.')),
    tile('morale', 'روحیه ارتش', s.stats.morale, s.stats.morale, 'var(--warn)', () => ctx.info('روحیه ارتش', 'روحیه پایین قدرت رزم را کم می‌کند. بودجه ارتش و پادگان آن را بالا نگه می‌دارد.')),
    tile('military', 'قدرت نظامی', milPower, null, null, () => ctx.info('قدرت نظامی', 'بر اساس سربازان، آموزش، روحیه، ژنرال و فناوری محاسبه می‌شود.')),
    tile('knowledge', 'دانش', s.resources.knowledge, null, null, () => ctx.info('دانش', 'برای تحقیق فناوری‌ها لازم است. دانشگاه و بودجه علم تولیدش می‌کنند.')),
    tile('influence', 'نفوذ', s.resources.influence, null, null, () => ctx.info('نفوذ سیاسی', 'برای دیپلماسی و گشایش قلمرو استفاده می‌شود.')),
  ));

  /* دکمه‌های حکومت (بند 39) */
  const atWar = wars.length > 0;
  const btns = [
    ['court', 'scroll', t('dash.court'), !!game.currentEvent()],
    ['governance', 'crown', t('dash.govern'), false],
    ['map', 'map', t('dash.map'), false],
    ['buildings', 'hammer', t('dash.build'), false],
    ['army', 'sword', t('dash.army'), false],
    ['diplomacy', 'globe', t('dash.diplomacy'), atWar],
    ['market', 'market', t('dash.market'), false],
    ['missions', 'target', t('dash.missions'), ctx.hasClaimableMissions()],
    ['tech', 'flask', t('dash.tech'), false],
    ['history', 'book', t('dash.history'), false],
    ['achievements', 'trophy', t('menu.achievements'), false],
    ['settings', 'gear', t('menu.settings'), false],
  ];
  page.append(el('div', { class: 'menu-grid' },
    btns.map(([route, ic, label, dot]) => el('button', {
      class: 'menu-btn' + (route === 'diplomacy' && atWar ? ' danger' : ''),
      onclick: () => nav(route),
    }, dot ? el('span', { class: 'dot' }) : null, icon(ic), label)),
  ));

  root.append(page);
}
