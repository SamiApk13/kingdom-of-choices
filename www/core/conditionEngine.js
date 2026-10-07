/**
 * core/conditionEngine.js
 * ------------------------------------------------------------
 * بند 75: موتور شرط عمومی. شرط‌ها داده‌محور هستند و با ترکیب
 * AND / OR / NOT ارزیابی می‌شوند.
 *
 * نمونه شرط:
 * { and: [ { res:'food', op:'<', value:100 }, { levelMin:10 } ] }
 *
 * انواع شرط پشتیبانی‌شده:
 *  res / stat / levelMin / levelMax / dayMin / dayMax / building / tech
 *  flag / notFlag / relation / atWar / allied / chance / style / tileOwned
 *  missionDone / achievement / generalCount / unitCount / militaryMin
 */

function cmp(a, op, b) {
  switch (op) {
    case '>=': return a >= b;
    case '<=': return a <= b;
    case '>': return a > b;
    case '<': return a < b;
    case '==': return a === b;
    case '!=': return a !== b;
    default: return a >= b;
  }
}

/**
 * @param {object|undefined} cond - شرط داده‌محور
 * @param {object} ctx - { state, config, content }
 */
export function evalCondition(cond, ctx) {
  if (!cond) return true;
  if (Array.isArray(cond)) return cond.every((c) => evalCondition(c, ctx));

  if (cond.and) return cond.and.every((c) => evalCondition(c, ctx));
  if (cond.or) return cond.or.some((c) => evalCondition(c, ctx));
  if (cond.not) return !evalCondition(cond.not, ctx);

  const s = ctx.state;
  const res = (key) => s.resources[key] ?? 0;

  if ('res' in cond) return cmp(res(cond.res), cond.op || '>=', cond.value);
  if ('stat' in cond) return cmp(s.stats?.[cond.stat] ?? 0, cond.op || '>=', cond.value);
  if ('levelMin' in cond) return s.kingdom.level >= cond.levelMin;
  if ('levelMax' in cond) return s.kingdom.level <= cond.levelMax;
  if ('dayMin' in cond) return s.kingdom.day >= cond.dayMin;
  if ('dayMax' in cond) return s.kingdom.day <= cond.dayMax;

  if ('building' in cond) {
    const b = s.buildings[cond.building];
    if (!b || b.level <= 0) return false;
    return !cond.minLevel || b.level >= cond.minLevel;
  }
  if ('tech' in cond) return (s.research?.unlocked || []).includes(cond.tech);

  if ('flag' in cond) {
    const v = !!s.flags[cond.flag];
    return cond.equals === undefined ? v : s.flags[cond.flag] === cond.equals;
  }
  if ('notFlag' in cond) return !s.flags[cond.notFlag];

  if ('relation' in cond) {
    const c = s.countries[cond.relation];
    if (!c) return false;
    return cmp(c.relation, cond.op || '>=', cond.value);
  }
  if ('atWar' in cond) return !!s.countries[cond.atWar]?.atWar;
  if ('allied' in cond) return !!s.countries[cond.allied]?.alliance;

  if ('style' in cond) return s.kingdom.style === cond.style;
  if ('tileOwned' in cond) return (s.ownedTiles || []).includes(cond.tileOwned);
  if ('missionDone' in cond) return !!s.missions?.claimed?.[cond.missionDone];
  if ('achievement' in cond) return !!s.achievements?.[cond.achievement];
  if ('generalCount' in cond) return (s.generals || []).length >= cond.generalCount;
  if ('unitCount' in cond) {
    const total = Object.values(s.military?.units || {}).reduce((a, b) => a + b, 0);
    return total >= cond.unitCount;
  }
  if ('militaryMin' in cond) return militaryPowerEstimate(s, ctx.config) >= cond.militaryMin;
  if ('chance' in cond) return Math.random() * 100 < cond.chance;

  console.warn('[conditionEngine] شرط ناشناخته:', cond);
  return false;
}

import { estimateMilitaryPower } from './warEngine.js';
export function militaryPowerEstimate(state, config) {
  return estimateMilitaryPower(state, config);
}

/** نسخه متنی/قابل‌نمایش شرط برای رابط کاربری */
export function describeCondition(cond, names = {}) {
  if (!cond) return '';
  if (cond.and) return cond.and.map((c) => describeCondition(c, names)).filter(Boolean).join(' و ');
  if (cond.or) return cond.or.map((c) => describeCondition(c, names)).filter(Boolean).join(' یا ');
  if (cond.not) return 'نه: ' + describeCondition(cond.not, names);
  if ('res' in cond) return `${names[cond.res] || cond.res} ${cond.op || '≥'} ${cond.value}`;
  if ('stat' in cond) return `${names[cond.stat] || cond.stat} ${cond.op || '≥'} ${cond.value}`;
  if ('levelMin' in cond) return `سطح پادشاهی ≥ ${cond.levelMin}`;
  if ('dayMin' in cond) return `روز ≥ ${cond.dayMin}`;
  if ('building' in cond) return `ساختمان ${names[cond.building] || cond.building}`;
  if ('tech' in cond) return `فناوری ${names[cond.tech] || cond.tech}`;
  if ('flag' in cond) return `پرچم ${cond.flag}`;
  return '';
}
