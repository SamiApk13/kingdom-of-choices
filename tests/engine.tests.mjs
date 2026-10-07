/**
 * tests/engine.tests.mjs
 * ------------------------------------------------------------
 * بند 68: تست‌های واحد برای موتورهای اقتصاد، تصمیم، جنگ، دیپلماسی،
 * پیشرفت، ذخیره و مایگریشن + یکپارچگی محتوا.
 * هم در نود (npm test) و هم در مرورگر (tests/run-tests.html) اجرا می‌شود.
 */
import { weightedPick } from '../www/core/rng.js';
import { evalCondition } from '../www/core/conditionEngine.js';
import { applyEffects } from '../www/core/effectEngine.js';
import { computeDaily } from '../www/core/economyEngine.js';
import { migrate, createSaveManager, validateSave } from '../www/core/saveManager.js';
import { resolveBattle, estimateMilitaryPower } from '../www/core/warEngine.js';
import { registerAllContent, content } from '../www/content/index.js';
import { createGame } from '../www/core/gameEngine.js';
import { metricValue } from '../www/core/progressionEngine.js';
import { DEFAULT_CONFIG } from '../www/config/gameConfig.js';

registerAllContent();

const results = [];
export function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (e) {
    results.push({ name, ok: false, error: String(e?.stack || e) });
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function assertEq(a, b, msg) { if (a !== b) throw new Error(`${msg || 'not equal'}: ${a} !== ${b}`); }

function memStorage() {
  const m = new Map();
  return { get: (k) => (m.has(k) ? m.get(k) : null), set: (k, v) => m.set(k, v), remove: (k) => m.delete(k), isPersistent: false };
}

/* ---------- rng ---------- */
test('weightedPick به سمت وزن بالاتر متمایل است', () => {
  const items = [{ id: 'a', weight: 999 }, { id: 'b', weight: 1 }];
  const counts = { a: 0, b: 0 };
  for (let i = 0; i < 400; i++) counts[weightedPick(items).id]++;
  assert(counts.a > counts.b * 10, 'توزیع وزنی درست نیست');
});

/* ---------- شرط‌ها ---------- */
test('موتور شرط: AND / OR / NOT و منابع', () => {
  const state = { resources: { food: 50, coins: 200 }, kingdom: { level: 5 }, stats: { popularity: 40 }, buildings: {}, research: { unlocked: [] }, flags: { x: true }, countries: {}, military: { units: {} }, history: { stats: {} }, missions: {}, achievements: {}, generals: [] };
  const ctx = { state, config: DEFAULT_CONFIG, content };
  assert(evalCondition({ res: 'food', op: '<', value: 100 }, ctx));
  assert(evalCondition({ and: [{ res: 'coins', op: '>=', value: 100 }, { levelMin: 3 }] }, ctx));
  assert(!evalCondition({ and: [{ res: 'food', op: '>=', value: 100 }, { levelMin: 3 }] }, ctx));
  assert(evalCondition({ or: [{ res: 'food', op: '>=', value: 100 }, { flag: 'x' }] }, ctx));
  assert(evalCondition({ not: { res: 'food', op: '>=', value: 100 } }, ctx));
  assert(!evalCondition({ flag: 'y' }, ctx));
});

/* ---------- اثرها ---------- */
test('موتور اثر: منابع و محبوبیت', () => {
  const state = { resources: { coins: 100 }, stats: { popularity: 50 }, flags: {}, kingdom: { xp: 0 }, countries: {}, research: { unlocked: [] }, missions: {}, titles: [] };
  const ctx = { state, config: DEFAULT_CONFIG, content };
  applyEffects([
    { type: 'resource', res: 'coins', amount: 50 },
    { type: 'popularity', amount: 10 },
    { type: 'add_flag', flag: 'f1' },
  ], ctx);
  assertEq(state.resources.coins, 150, 'سکه');
  assertEq(state.stats.popularity, 60, 'محبوبیت');
  assert(state.flags.f1 === true, 'پرچم');
});

/* ---------- اقتصاد ---------- */
test('اقتصاد: تولید روزانه و مالیات', () => {
  const storage = memStorage();
  const game = createGame({ storage, content });
  game.newGame({ rulerName: 'تست', kingdomName: 'تستستان', style: 'warrior' });
  const daily = game.dailyPreview();
  assert(daily.production.food > 0, 'مزرعه غذا تولید می‌کند');
  assert(daily.tax > 0, 'مالیات باید مثبت باشد');
  assert(daily.net.coins !== undefined, 'خالص سکه محاسبه شود');
});

/* ---------- ذخیره و مایگریشن ---------- */
test('مایگریشن نسخه 1 به 2 انجام می‌شود', () => {
  const v1 = {
    saveVersion: 1, kingdom: { name: 'کهن', level: 3, day: 10, xp: 0, flag: '🏰', color: '#fff', style: 'warrior' },
    resources: { coins: 10, food: 10, wood: 10, stone: 10, iron: 10, population: 100, militaryPower: 55 },
    popularity: 60, security: 50, morale: 60, buildings: {},
  };
  const v2 = migrate(structuredClone(v1));
  assertEq(v2.saveVersion, 2, 'نسخه');
  assertEq(v2.resources.militaryPower, undefined, 'مilitaryPower باید حذف شده باشد');
  assertEq(v2.stats.popularity, 60, 'محبوبیت منتقل شد');
  assert(v2.market && v2.missions && v2.history, 'ساختارهای جدید ساخته شدند');
  assert(validateSave(v2), 'اعتبارسنجی ذخیره مهاجرت‌شده');
});

test('سیو منیجر: ذخیره/بارگذاری/پشتیبان', () => {
  const storage = memStorage();
  const sm = createSaveManager(storage, 't_save', 3);
  const state = { saveVersion: 2, kingdom: { name: 'x' }, resources: { coins: 1 }, buildings: {} };
  assert(sm.save(state), 'ذخیره اول موفق');
  assert(sm.save({ ...state, resources: { coins: 2 } }), 'ذخیره دوم موفق');
  // خراب کردن ذخیره اصلی؛ پشتیبان باید نجات دهد
  storage.set('t_save', '{{خراب');
  const loaded = sm.load();
  assert(loaded && loaded.fromBackup === true, 'بازیابی از پشتیبان');
  // خروجی/ورودی
  const text = sm.export(state);
  const back = sm.import(text);
  assert(back && back.kingdom.name === 'x', 'گردش خروجی/ورودی');
});

/* ---------- جنگ ---------- */
test('جنگ: گزارش معتبر و تلفات معقول', () => {
  const storage = memStorage();
  const game = createGame({ storage, content });
  game.newGame({ rulerName: 'تست', kingdomName: 'تستستان', style: 'warrior' });
  game.recruit('unit_infantry_001', 100);
  const country = content.countries[0];
  const battle = resolveBattle(game.state, game.config, country, content, { weAttack: true });
  assert(['victory', 'defeat', 'retreat'].includes(battle.result), 'نتیجه معتبر');
  assert(battle.ourPower > 0 && battle.enemyPower > 0, 'قدرت‌ها مثبت');
  assert(battle.ourLosses >= 0 && battle.ourLosses <= 200, 'تلفات در محدوده');
});

/* ---------- بازی کامل: تصمیم و پیشروی روز ---------- */
test('چرخه کامل: انتخاب → پیشروی روز → رویداد بعدی', () => {
  const storage = memStorage();
  const game = createGame({ storage, content });
  game.newGame({ rulerName: 'آریا', kingdomName: 'نور', style: 'merchant' });
  const day0 = game.state.kingdom.day;
  const ev = game.currentEvent();
  assert(ev, 'رویداد روز باید وجود داشته باشد');
  const choice = ev.choices.find((c) => true);
  const res = game.choose(choice.id);
  if (!res.ok && res.error === 'cannot-afford') {
    const alt = ev.choices.find((c) => !c.costs || Object.keys(c.costs).length === 0);
    if (!alt) return; // حداقل یک گزینه رایگان معمولاً هست
    const res2 = game.choose(alt.id);
    assert(res2.ok, 'انتخاب رایگان باید ممکن باشد');
  } else {
    assert(res.ok, 'انتخاب باید اعمال شود');
  }
  assert(game.state.kingdom.day === day0 + 1, 'روز باید جلو برود');
  assert(game.currentEvent(), 'رویداد روز بعد انتخاب شده');
});

/* ---------- دیپلماسی ---------- */
test('دیپلماسی: هدیه رابطه را بهتر می‌کند', () => {
  const storage = memStorage();
  const game = createGame({ storage, content });
  game.newGame({ rulerName: 'تست', kingdomName: 'تستستان', style: 'merchant' });
  const cid = content.countries[0].id;
  const before = game.state.countries[cid].relation;
  const res = game.diplomacyAction('gift', cid);
  assert(res.ok, 'هدیه باید ممکن باشد');
  assert(game.state.countries[cid].relation > before, 'رابطه بهتر شد');
});

/* ---------- پیشرفت ---------- */
test('سطح و دستاورد با پیشرفت کار می‌کنند', () => {
  const storage = memStorage();
  const game = createGame({ storage, content });
  game.newGame({ rulerName: 'تست', kingdomName: 'تستستان', style: 'warrior' });
  const s = game.state;
  s.kingdom.xp += 10_000;
  // شبیه‌سازی تیک سطح با یک انتخاب
  const ev = game.currentEvent();
  const free = ev.choices.find((c) => !c.costs || !Object.keys(c.costs).length) || ev.choices[0];
  game.choose(free.id);
  assert(s.kingdom.level >= 2, 'سطح باید بالا رفته باشد');
  assert(Object.keys(s.achievements).length >= 1, 'دستاورد اولین تاج باید باز شود');
});

/* ---------- یکپارچگی محتوا ---------- */
test('محتوا: رویدادها، مأموریت‌ها و زنجیره‌ها معتبرند', () => {
  const events = content.events;
  assert(events.length >= 30, `حداقل 30 رویداد لازم است (${events.length} موجود)`);
  const ids = new Set(events.map((e) => e.id));
  for (const ev of events) {
    assert(ev.choices.length >= 2, `${ev.id}: حداقل دو انتخاب`);
    if (ev.choices.some((c) => c.followUpEvent)) {
      for (const c of ev.choices) {
        if (c.followUpEvent) assert(ids.has(c.followUpEvent), `${ev.id}: زنجیره ${c.followUpEvent} وجود ندارد`);
      }
    }
  }
  const missionIds = new Set(content.missions.map((m) => m.id));
  for (const m of content.missions) {
    if (m.requiresMission) assert(missionIds.has(m.requiresMission), `${m.id}: مأموریت پیش‌نیاز نیست`);
  }
  assert(content.countries.length === 5, '۵ کشور اولیه');
});

test('متریک‌های مأموریت مقدار برمی‌گردانند', () => {
  const storage = memStorage();
  const game = createGame({ storage, content });
  game.newGame({ rulerName: 'تست', kingdomName: 'تستستان', style: 'popular' });
  for (const m of content.missions) {
    const v = metricValue(game.state, m.condition.metric, { config: game.config, content });
    assert(typeof v === 'number' && !isNaN(v), `متریک ${m.condition.metric} عددی نیست`);
  }
});

export function getResults() { return results; }
