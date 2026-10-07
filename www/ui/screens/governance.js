/**
 * ui/screens/governance.js — بند 40: حکومت (مالیات، رفاه، امنیت، بودجه‌ها)
 * هر تغییر «پیش‌نمایش اثر» دارد.
 */
import { el, fmt } from '../dom.js';
import { renderTopBar } from '../components.js';
import { sound } from '../../services/sound.js';

export function renderGovernance(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  const cfg = game.config;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'حکومت')));

  /* --- مالیات --- */
  page.append(el('div', { class: 'section-title' }, 'مالیات'));
  const taxBox = el('div', { class: 'card' });
  for (const lvl of cfg.taxLevels) {
    const isCur = s.taxes.rate === lvl.id;
    const row = el('div', { class: 'choice' + (isCur ? ' cant' : ''), style: isCur ? 'border-color:var(--gold)' : '', onclick: () => {
      if (isCur) return;
      game.setPolicy('tax', lvl.id); sound.click(); ctx.refresh();
      ctx.toastInfo(`مالیات «${lvl.name}» شد.`);
    } },
      el('h4', {}, lvl.name, isCur ? ' (فعلی)' : ''),
      el('div', { class: 'choice-meta' },
        el('span', { class: 'tag gain' }, `+${fmt(lvl.coinsPerPop * s.resources.population)} سکه در روز`),
        el('span', { class: 'tag ' + (lvl.popularity >= 0 ? 'gain' : 'risk') }, `${lvl.popularity >= 0 ? '+' : ''}${fmt(lvl.popularity)} محبوبیت در روز`),
        lvl.unrestRisk ? el('span', { class: 'tag risk' }, `+${fmt(lvl.unrestRisk)}٪ خطر شورش`) : null,
      ),
    );
    taxBox.append(row);
  }
  page.append(taxBox);
  page.append(el('p', { class: 'muted mb-8' }, 'مالیات فقط یک دکمه نیست: مالیات زیاد با امنیت بالا و رفاه زیاد قابل تحمل‌تر است.'));

  /* --- رفاه --- */
  page.append(el('div', { class: 'section-title' }, 'رفاه عمومی'));
  const wBox = el('div', { class: 'card' });
  for (const lvl of cfg.welfareLevels) {
    const isCur = s.taxes.welfare === lvl.id;
    wBox.append(el('div', { class: 'choice' + (isCur ? ' cant' : ''), style: isCur ? 'border-color:var(--gold)' : '', onclick: () => {
      if (isCur) return;
      game.setPolicy('welfare', lvl.id); sound.click(); ctx.refresh();
    } },
      el('h4', {}, lvl.name, isCur ? ' (فعلی)' : ''),
      el('div', { class: 'choice-meta' },
        el('span', { class: 'tag cost' }, `${fmt(lvl.costPct * 100)}٪ درآمد مالیاتی`),
        el('span', { class: 'tag ' + (lvl.popularity >= 0 ? 'gain' : 'risk') }, `${lvl.popularity >= 0 ? '+' : ''}${fmt(lvl.popularity)} محبوبیت روز`),
      ),
    ));
  }
  page.append(wBox);

  /* --- امنیت --- */
  page.append(el('div', { class: 'section-title' }, 'بودجه امنیت'));
  const sBox = el('div', { class: 'card' });
  for (const lvl of cfg.securityLevels) {
    const isCur = s.taxes.security === lvl.id;
    sBox.append(el('div', { class: 'choice' + (isCur ? ' cant' : ''), style: isCur ? 'border-color:var(--gold)' : '', onclick: () => {
      if (isCur) return;
      game.setPolicy('security', lvl.id); sound.click(); ctx.refresh();
    } },
      el('h4', {}, lvl.name, isCur ? ' (فعلی)' : ''),
      el('div', { class: 'choice-meta' },
        el('span', { class: 'tag cost' }, `${fmt(lvl.costPerDay)} سکه در روز`),
        el('span', { class: 'tag gain' }, `+${fmt(lvl.security)} امنیت روز`),
        el('span', { class: 'tag' }, `جرم: ${fmt(lvl.crimeRisk)}٪`),
      ),
    ));
  }
  page.append(sBox);

  /* --- بودجه‌ها --- */
  const budgets = [
    ['army', 'بودجه ارتش', cfg.budgets.army.levels, (i) => `روحیه +${fmt(cfg.budgets.army.moraleGain[i])}/روز`],
    ['farm', 'بودجه کشاورزی', cfg.budgets.farm.levels, (i) => `غذا +${fmt(cfg.budgets.farm.foodBonusPct[i] * 100)}٪`],
    ['science', 'بودجه علم', cfg.budgets.science.levels, (i) => `دانش +${fmt(cfg.budgets.science.knowledgeGain[i])}/روز`],
  ];
  page.append(el('div', { class: 'section-title' }, 'بودجه‌های تخصصی'));
  for (const [key, name, levels, descFn] of budgets) {
    const box = el('div', { class: 'card' }, el('div', { class: 'card-title' }, name));
    const row = el('div', { class: 'btn-row' });
    levels.forEach((cost, i) => {
      const isCur = (s.budgets[key] ?? 1) === i;
      row.append(el('button', { class: 'btn btn-sm' + (isCur ? ' btn-gold' : ''), onclick: () => {
        game.setPolicy(key, i); sound.click(); ctx.refresh();
      } }, i === 0 ? 'صفر' : `سطح ${fmt(i)}`, el('small', { class: 'muted', style: 'display:block;font-size:10px' }, `${fmt(cost)} سکه — ${descFn(i)}`)));
    });
    box.append(row);
    page.append(box);
  }

  /* پیش‌نمایش کلی روز */
  const daily = game.dailyPreview();
  page.append(el('div', { class: 'section-title' }, 'پیش‌نمایش اثر روز آینده'));
  page.append(el('div', { class: 'card' },
    ...Object.entries(daily.net).filter(([k]) => k !== 'population').map(([k, v]) =>
      el('div', { class: 'report-line' },
        el('span', {}, { coins: 'سکه', food: 'غذا', wood: 'چوب', stone: 'سنگ', iron: 'آهن' }[k]),
        el('span', { class: v >= 0 ? 'v-pos' : 'v-neg' }, (v > 0 ? '+' : '') + fmt(v))),
    ),
  ));

  root.append(page);
}
