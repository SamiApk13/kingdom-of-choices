/**
 * ui/screens/market.js — بند 19/45: بازار با قیمت‌های پویا
 */
import { el, fmt } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar, RES_META } from '../components.js';
import { sound } from '../../services/sound.js';

export function renderMarket(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'بازار')));
  page.append(el('p', { class: 'muted mb-8' }, `قیمت‌ها هر روز بر اساس عرضه و تقاضا تغییر می‌کنند. کارمزد معامله: ${fmt(game.config.market.feePct * 100)}٪`));

  const amounts = [50, 100, 250];
  for (const res of ['food', 'wood', 'stone', 'iron']) {
    const meta = RES_META[res];
    const price = s.market.prices[res];
    const base = game.config.market.base[res];
    const trend = s.market.trend[res];
    const trendTxt = trend === 'up' ? '▲ صعودی' : trend === 'down' ? '▼ نزولی' : '— ثابت';
    const trendCls = trend === 'up' ? 'v-pos' : trend === 'down' ? 'v-neg' : 'muted';
    const cheap = price < base * 0.9;
    const expensive = price > base * 1.1;

    page.append(el('div', { class: 'card' },
      el('div', { class: 'card-title' }, icon(meta.icon), meta.name,
        el('span', { class: 'tag ' + (cheap ? 'gain' : expensive ? 'cost' : '') }, cheap ? 'ارزان' : expensive ? 'گران' : 'عادی')),
      el('div', { class: 'report-line' }, el('span', {}, 'قیمت هر واحد'), el('b', {}, `${fmt(price)} سکه`)),
      el('div', { class: 'report-line' }, el('span', {}, 'روند'), el('span', { class: trendCls }, trendTxt)),
      el('div', { class: 'report-line' }, el('span', {}, 'موجودی شما'), el('b', {}, fmt(s.resources[res]))),
      el('div', { class: 'btn-row mt-8' },
        amounts.map((n) => el('button', { class: 'btn btn-sm', disabled: s.resources.coins < Math.ceil(n * price * 1.05), onclick: () => trade(ctx, res, n, 'buy') }, `خرید ${fmt(n)}`)),
      ),
      el('div', { class: 'btn-row mt-8' },
        amounts.map((n) => el('button', { class: 'btn btn-sm', disabled: s.resources[res] < n, onclick: () => trade(ctx, res, n, 'sell') }, `فروش ${fmt(n)}`)),
      ),
    ));
  }
  root.append(page);
}

function trade(ctx, res, amount, dir) {
  const res2 = ctx.game.marketTrade(res, amount, dir);
  if (res2.ok) {
    sound.coin();
    ctx.toastInfo(dir === 'buy' ? 'خرید انجام شد.' : 'فروش انجام شد.');
    ctx.refresh();
  } else ctx.toastError('امکان معامله نیست.');
}
