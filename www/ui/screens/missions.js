/**
 * ui/screens/missions.js — بند 24/46: مأموریت‌ها و دستاوردها
 */
import { el, fmt } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar, RES_META } from '../components.js';
import { missionProgress, isMissionAvailable } from '../../core/progressionEngine.js';
import { sound } from '../../services/sound.js';

let activeTab = 'daily';

export function renderMissions(root, ctx) {
  const { game } = ctx;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'مأموریت‌ها')));

  const tabs = [['daily', 'روزانه'], ['weekly', 'هفتگی'], ['story', 'داستانی'], ['ach', 'دستاوردها']];
  page.append(el('div', { class: 'tabs' }, tabs.map(([id, label]) =>
    el('button', { class: 'tab' + (activeTab === id ? ' active' : ''), onclick: () => { activeTab = id; ctx.refresh(); } }, label))));

  const s = game.state;
  if (activeTab === 'ach') {
    renderAchievementsTab(page, ctx);
    root.append(page);
    return;
  }

  let list = [];
  if (activeTab === 'daily') list = s.missions.dailyIds.map((id) => game.content.missions.find((m) => m.id === id)).filter(Boolean);
  else if (activeTab === 'weekly') list = s.missions.weeklyIds.map((id) => game.content.missions.find((m) => m.id === id)).filter(Boolean);
  else list = game.content.missions.filter((m) => m.type === 'story');

  if (!list.length) page.append(el('p', { class: 'muted' }, 'مأموریتی نیست.'));
  for (const m of list) {
    const available = isMissionAvailable(s, m);
    const claimed = !!s.missions.claimed[m.id];
    const prog = missionProgress(s, m, { config: game.config, content: game.content });
    const pct = Math.round(prog.pct * 100);

    page.append(el('div', { class: 'card', style: !available && !claimed ? 'opacity:0.55' : '' },
      el('div', { class: 'card-title' }, icon('target'), m.title,
        claimed ? el('span', { class: 'tag gain' }, 'دریافت شد') :
        !available ? el('span', { class: 'tag' }, 'قفل') : null),
      el('p', { class: 'card-sub' }, m.description),
      el('div', { class: 'progress mt-8' }, el('span', { style: `width:${pct}%` })),
      el('div', { class: 'report-line mt-8' },
        el('span', { class: 'small muted' }, `پیشرفت: ${fmt(prog.current)} از ${fmt(prog.target)}`),
        rewardTags(m.reward),
      ),
      !claimed && prog.done && available ? el('button', { class: 'btn btn-gold btn-block mt-8', onclick: () => {
        const res = game.claimMission(m.id);
        if (res.ok) { sound.levelup(); ctx.toastInfo('پاداش مأموریت دریافت شد!'); ctx.refresh(); }
      } }, 'دریافت پاداش') :
      !available && m.requiresMission ? el('p', { class: 'muted mt-8' }, 'ابتدا مأموریت قبلی داستانی را کامل کنید.') : null,
    ));
  }
  root.append(page);
}

function rewardTags(reward) {
  const out = [];
  for (const [k, v] of Object.entries(reward || {})) {
    if (k === 'xp') out.push(el('span', { class: 'tag gain' }, `+${fmt(v)} تجربه`));
    else if (k === 'title') out.push(el('span', { class: 'tag gain' }, '🏅 لقب'));
    else out.push(el('span', { class: 'tag gain' }, `+${fmt(v)} ${RES_META[k]?.name || k}`));
  }
  return el('span', { class: 'choice-meta' }, ...out);
}

function renderAchievementsTab(page, ctx) {
  const { game } = ctx;
  const s = game.state;
  for (const a of game.content.achievements) {
    const got = !!s.achievements[a.id];
    page.append(el('div', { class: 'list-item', style: got ? '' : 'opacity:0.6' },
      el('div', { class: 'thumb' }, icon(a.icon || 'trophy')),
      el('div', { class: 'info' },
        el('h4', {}, a.name, got ? el('span', { class: 'tag gain' }, '✓') : null),
        el('p', {}, a.description),
      ),
      got ? el('span', { class: 'small muted' }, `روز ${fmt(s.achievements[a.id].day)}`) : null,
    ));
  }
}
