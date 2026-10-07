/**
 * ui/screens/ending.js — بند 27/78: پایان‌های مختلف و New Game+
 */
import { el, fmt } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { sound } from '../../services/sound.js';

const ENDINGS = {
  golden_empire: { art: '🌟', title: 'امپراتوری طلایی', tone: 'win',
    text: 'پادشاهی شما به اوج شکوه رسید. مورخان این دوره را «عصر طلایی» خواهند نامید.' },
  revolt: { art: '🔥', title: 'شورش مردمی', tone: 'lose',
    text: 'مردم که دیگر توان نداشتند، به خیابان‌ها ریختند و کاخ سقوط کرد.' },
  conquered: { art: '⚔️', title: 'فتح توسط دشمن', tone: 'lose',
    text: 'ارتش دشمن از دروازه‌ها گذشت؛ پرچم شما پایین کشیده شد.' },
  economic_collapse: { art: '📉', title: 'فروپاشی اقتصادی', tone: 'lose',
    text: 'خزانه خالی ماند، بدهی‌ها کمر پادشاهی را شکست.' },
  famine: { art: '🥀', title: 'قحطی بزرگ', tone: 'lose',
    text: 'انبارها خالی ماند و قحطی، پادشاهی را از درون تهی کرد.' },
};

export function renderEnding(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  const end = s.ended || { type: 'revolt', day: s.kingdom.day };
  const meta = ENDINGS[end.type] || ENDINGS.revolt;
  const hs = s.history.stats;
  if (meta.tone === 'win') sound.victory(); else sound.defeat();

  root.append(el('div', { class: 'ending' },
    el('div', { class: 'big' }, meta.art),
    el('h1', {}, meta.title),
    el('p', {}, end.text || meta.text),
    el('div', { class: 'card', style: 'width:100%;max-width:380px;text-align:right' },
      line('طول سلطنت', `${fmt(end.day)} روز`),
      line('سطح پادشاهی', fmt(s.kingdom.level)),
      line('تصمیم‌های گرفته‌شده', fmt(hs.decisions)),
      line('جنگ‌ها / پیروزی‌ها', `${fmt(hs.wars)} / ${fmt(hs.wins)}`),
      line('اوج ثروت', `${fmt(hs.peakCoins)} سکه`),
      line('دستاوردها', fmt(Object.keys(s.achievements).length)),
      line('لقب‌های ماندگار', fmt(s.titles.length)),
    ),
    el('p', { class: 'muted', style: 'max-width:360px' }, 'در سلطنت بعدی (New Game+) لقب‌ها و دستاوردهای شما ماندگارند؛ پادشاهی از نو آغاز می‌شود.'),
    el('button', { class: 'btn btn-gold', onclick: () => {
      game.recordLeaderboardEntry();
      game.startNewGamePlus();
      sound.levelup();
      ctx.toastInfo('سلطنت جدید آغاز شد!');
      ctx.nav('dashboard');
    } }, 'سلطنت جدید (New Game+)'),
    el('button', { class: 'btn btn-ghost', onclick: () => { game.recordLeaderboardEntry(); ctx.nav('home'); } }, 'بازگشت به منوی اصلی'),
  ));
}

function line(k, v) {
  return el('div', { class: 'report-line' }, el('span', {}, k), el('b', {}, v));
}
