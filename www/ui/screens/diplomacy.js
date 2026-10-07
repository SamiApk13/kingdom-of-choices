/**
 * ui/screens/diplomacy.js — بندهای 17/18/44: دیپلماسی و جنگ
 */
import { el, fmt, showModal, closeModal } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar } from '../components.js';
import { relationLabel, DIPLO_ACTIONS } from '../../core/diplomacyEngine.js';
import { enemyStrength } from '../../core/warEngine.js';
import { sound } from '../../services/sound.js';
import { analytics } from '../../services/analytics.js';

export function renderDiplomacy(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'دیپلماسی')));
  page.append(el('p', { class: 'muted mb-8' }, `قدرت نظامی شما: ${fmt(game.estimateMilitaryPower())} • نفوذ: ${fmt(s.resources.influence)} • اعتبار: ${fmt(s.resources.credibility)}`));

  for (const def of game.content.countries) {
    const c = s.countries[def.id];
    const rel = Math.round(c.relation);
    const relPct = (rel + 100) / 2;
    const knownPower = c.revealed ? fmt(c.power) : '؟؟؟';
    const powerNow = enemyStrength(def, s, game.config);

    const card = el('div', { class: 'card' },
      el('div', { class: 'card-title' }, el('span', { style: 'font-size:19px' }, def.flag), def.name,
        c.atWar ? el('span', { class: 'tag risk' }, 'در حال جنگ') :
        c.alliance ? el('span', { class: 'tag gain' }, 'متحد') :
        c.tradePact ? el('span', { class: 'tag gain' }, 'پیمان تجاری') : null),
      el('p', { class: 'card-sub' }, def.description),
      el('div', { class: 'rel-bar mt-8' },
        el('span', { class: 'small muted' }, relationLabel(rel)),
        el('div', { class: 'rel-track' }, el('span', { class: 'rel-dot', style: `inset-inline-start:${relPct}%` })),
        el('b', { class: 'small' }, fmt(rel)),
      ),
      el('div', { class: 'choice-meta mt-8' },
        el('span', { class: 'tag' }, `قدرت: ${knownPower}`),
        el('span', { class: 'tag' }, `اعتماد: ${fmt(c.trust)}`),
        el('span', { class: 'tag' }, `اقتصاد: ${fmt(def.economy)}`),
      ),
    );

    const actions = el('div', { class: 'btn-row mt-8' });
    if (c.atWar) {
      actions.append(
        el('button', { class: 'btn btn-sm btn-red', onclick: () => startBattle(ctx, def) }, icon('sword'), 'حمله'),
        el('button', { class: 'btn btn-sm', onclick: () => doAction(ctx, 'peace', def) }, 'درخواست صلح'),
      );
    } else {
      actions.append(
        el('button', { class: 'btn btn-sm', onclick: () => giftSheet(ctx, def) }, '🎁 هدیه'),
        !c.tradePact ? el('button', { class: 'btn btn-sm', disabled: !DIPLO_ACTIONS.trade.can(s, c), onclick: () => doAction(ctx, 'trade', def) }, 'تجارت') : null,
        !c.alliance ? el('button', { class: 'btn btn-sm', disabled: !DIPLO_ACTIONS.alliance.can(s, c), onclick: () => doAction(ctx, 'alliance', def) }, 'اتحاد') : null,
        el('button', { class: 'btn btn-sm', onclick: () => doAction(ctx, 'spy', def) }, 'جاسوسی'),
        el('button', { class: 'btn btn-sm', onclick: () => doAction(ctx, 'threaten', def) }, 'تهدید'),
        el('button', { class: 'btn btn-sm btn-red', disabled: c.alliance, onclick: () => warConfirm(ctx, def) }, 'اعلان جنگ'),
      );
    }
    card.append(actions);
    page.append(card);
  }
  root.append(page);
}

function doAction(ctx, action, def) {
  const res = ctx.game.diplomacyAction(action, def.id);
  if (res.ok) { sound.click(); ctx.toastInfo(res.message); }
  else ctx.toastError(res.message || 'شرایط لازم را ندارید.');
  ctx.refresh();
}

function giftSheet(ctx, def) {
  const content = el('div', {},
    el('h3', {}, `ارسال هدیه به ${def.name}`),
    ...[100, 200, 400].map((amount) => el('button', {
      class: 'btn btn-block mb-8',
      onclick: () => { closeModal(); doGift(ctx, def, amount); },
    }, `هدیه ${fmt(amount)} سکه‌ای`)),
  );
  showModal(content, { center: true });
}

function doGift(ctx, def, amount) {
  const s = ctx.game.state;
  if (s.resources.coins < amount) { ctx.toastError('سکه کافی نیست.'); return; }
  const res = ctx.game.diplomacyAction('gift', def.id, amount);
  ctx.toastInfo(res.message || 'هدیه ارسال شد.');
  ctx.refresh();
}

function warConfirm(ctx, def) {
  const { game } = ctx;
  const s = game.state;
  const our = game.estimateMilitaryPower();
  const their = enemyStrength(def, s, game.config);
  const content = el('div', {},
    el('h3', {}, `اعلان جنگ به ${def.name}؟`),
    el('div', { class: 'report-line' }, el('span', {}, 'قدرت شما'), el('b', {}, fmt(our))),
    el('div', { class: 'report-line' }, el('span', {}, 'قدرت تخمینی دشمن'), el('b', {}, fmt(their))),
    el('p', { class: 'muted mt-8' }, our > their ? 'برآورد: شانس پیروزی بالاست، اما جنگ هزینه دارد.' : 'برآورد: دشمن قوی‌تر است؛ ریسک شکست جدی است.'),
    el('div', { class: 'btn-row mt-12' },
      el('button', { class: 'btn btn-red flex-1', onclick: () => { closeModal(); doAction(ctx, 'war', def); analytics.track('war_started', { country: def.id }); } }, 'اعلان جنگ!'),
      el('button', { class: 'btn flex-1', onclick: closeModal }, 'انصراف'),
    ),
  );
  showModal(content, { center: true });
}

function startBattle(ctx, def) {
  const { game } = ctx;
  const res = game.attackCountry(def.id);
  if (!res.ok) { ctx.toastError(res.error === 'no-army' ? 'ارتشی برای حمله ندارید!' : 'امکان حمله نیست.'); return; }
  const b = res.battle;
  if (b.result === 'victory') sound.victory(); else sound.defeat();
  analytics.track(b.result === 'victory' ? 'war_won' : 'war_lost', { country: def.id });

  const r = b.rewards;
  const rewardLines = [];
  if (r.coins) rewardLines.push(['سکه', r.coins]);
  for (const k of ['food', 'wood', 'stone', 'iron']) if (r[k]) rewardLines.push([{ food: 'غذا', wood: 'چوب', stone: 'سنگ', iron: 'آهن' }[k], r[k]]);
  if (r.tiles.length) rewardLines.push(['منطقه فتح‌شده', r.tiles.length]);

  const content = el('div', {},
    el('h3', {}, b.result === 'victory' ? '🏆 پیروزی!' : b.result === 'defeat' ? '💔 شکست' : '🏳️ عقب‌نشینی'),
    el('div', { class: 'report-line' }, el('span', {}, 'ارتش شما'), el('b', {}, fmt(b.ourPower))),
    el('div', { class: 'report-line' }, el('span', {}, 'ارتش دشمن'), el('b', {}, fmt(b.enemyPower))),
    el('div', { class: 'report-line' }, el('span', {}, 'تلفات شما'), el('span', { class: 'v-neg' }, fmt(b.ourLosses))),
    el('div', { class: 'report-line' }, el('span', {}, 'تلفات دشمن'), el('span', { class: 'v-pos' }, fmt(b.enemyLosses))),
    rewardLines.length ? el('div', { class: 'section-title' }, b.result === 'victory' ? 'غنائم' : 'خسارت') : null,
    rewardLines.map(([name, v]) => el('div', { class: 'report-line' }, el('span', {}, name), el('span', { class: v >= 0 ? 'v-pos' : 'v-neg' }, (v > 0 ? '+' : '') + fmt(v)))),
    b.surrender ? el('p', { style: 'color:var(--gold-soft)', class: 'mt-8' }, 'دشمن تسلیم شد و جنگ پایان یافت!') :
      (game.state.countries[def.id]?.atWar ? el('p', { class: 'muted mt-8' }, 'جنگ ادامه دارد؛ می‌توانید دوباره حمله کنید یا صلح بخواهید.') :
      el('p', { class: 'muted mt-8' }, 'جنگ پایان یافت.')),
    el('button', { class: 'btn btn-gold btn-block mt-12', onclick: () => { closeModal(); ctx.refresh(); } }, 'ادامه'),
  );
  showModal(content, { center: true });
}
