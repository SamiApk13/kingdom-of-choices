/**
 * core/gameEngine.js
 * ------------------------------------------------------------
 * ارکستراتور اصلی: چرخه روزها، اتصال موتورهای اقتصاد/تصمیم/جنگ/
 * دیپلماسی/پیشرفت، ساخت وضعیت جدید، پایان‌ها و ذخیره خودکار.
 * بند 91: این ماژول به هیچ جزئیات رابط کاربری وابسته نیست.
 */
import { bus } from './eventBus.js';
import { computeDaily, populationChange, marketTick, housingCapacity } from './economyEngine.js';
import { pickDailyEvent, applyChoice, canAffordChoice, tickCooldowns, availableEvents } from './decisionEngine.js';
import { resolveBattle, estimateMilitaryPower } from './warEngine.js';
import { DIPLO_ACTIONS, diplomacyDailyTick } from './diplomacyEngine.js';
import {
  checkLevelUp, xpForLevel, checkAchievements, checkTitles,
  missionProgress, isMissionAvailable, pickDailyMissions, pickWeeklyMissions, metricValue,
} from './progressionEngine.js';
import { applyEffects, clampStat } from './effectEngine.js';
import { evalCondition } from './conditionEngine.js';
import { createSaveManager, SAVE_SCHEMA_VERSION, baseHistoryStats } from './saveManager.js';
import { loadRuntimeConfig } from '../config/gameConfig.js';

const RES_KEYS = ['coins', 'food', 'wood', 'stone', 'iron', 'population', 'knowledge', 'influence', 'credibility'];

export function createGame({ storage, content }) {
  const config = loadRuntimeConfig(storage);
  const saveManager = createSaveManager(storage, config.save.key, config.save.backupCount);
  let state = null;

  /* ------------------------------------------------ ساخت وضعیت جدید */
  function newGame(creator) {
    const start = config.start;
    const st = {
      saveVersion: SAVE_SCHEMA_VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      player: {
        name: creator.rulerName,
        epithet: creator.epithet || '',
        symbol: creator.symbol || 'crown',
        avatar: creator.avatar || 'king',
      },
      kingdom: {
        name: creator.kingdomName,
        flag: creator.flag || '🏰',
        color: creator.color || '#c9a227',
        style: creator.style || 'warrior',
        level: start.level,
        xp: start.xp,
        day: start.day,
      },
      resources: {
        coins: start.coins, food: start.food, wood: start.wood, stone: start.stone, iron: start.iron,
        population: start.population, knowledge: start.knowledge, influence: start.influence,
        credibility: start.credibility,
      },
      stats: {
        popularity: start.popularity + (config.govStyles[creator.style]?.startPopularity || 0),
        security: start.security,
        morale: start.morale,
      },
      taxes: { rate: 'normal', welfare: 'low', security: 'normal' },
      budgets: { army: 1, farm: 1, science: 1 },
      buildings: {
        building_townhall_001: { level: 1, progress: null },
        building_farm_001: { level: 1, progress: null },
        building_warehouse_001: { level: 1, progress: null },
        building_barracks_001: { level: 1, progress: null },
      },
      military: { units: {}, training: 1 },
      generals: [],
      countries: {},
      tiles: [],
      ownedTiles: ['tile_capital'],
      expansions: [],
      market: {
        prices: { ...config.market.base },
        trend: {}, shocks: {},
      },
      research: { unlocked: [], current: null, progress: 0 },
      missions: { progress: {}, claimed: {}, counters: {}, dailyDay: 0, dailyIds: [], weeklyWeek: -1, weeklyIds: [], forced: [] },
      achievements: {},
      titles: [],
      activeTitle: null,
      flags: {},
      cooldowns: {},
      scheduledEvents: [],
      pendingEvent: null,
      history: {
        timeline: [{ day: 1, text: `تاج‌گذاری ${creator.rulerName}؛ پادشاهی «${creator.kingdomName}» آغاز شد.` }],
        stats: { ...baseHistoryStats(), maxPopularity: start.popularity, minPopularity: start.popularity, peakCoins: start.coins },
      },
      settings: { sfx: true, music: true, volume: 80, reduceMotion: false },
      tutorial: { done: !config.featureFlags.tutorial, step: 0 },
      ngPlus: { count: 0 },
      ended: null,
    };

    // کشورها از محتوا (بند 71)
    for (const c of content.countries) {
      st.countries[c.id] = {
        relation: c.startingRelation ?? 0,
        trust: c.trust ?? 50,
        alliance: false, tradePact: false, atWar: false, revealed: false,
        power: c.power, economy: c.economy,
      };
    }
    // کاشی‌های نقشه از محتوا (بند 20)
    st.tiles = content.mapTiles.map((t) => ({ id: t.id, owner: t.startOwner || 'neutral', level: 1 }));

    // واحد اولیه رایگان برای شروع
    st.military.units['unit_infantry_001'] = 20;

    state = st;
    pickNewEvent();
    rollDailyMissions();
    saveManager.save(state);
    bus.emit('game:started', { state });
    return state;
  }

  /* ------------------------------------------------ بارگذاری/ذخیره */
  function load() {
    const res = saveManager.load();
    if (!res) return null;
    state = res.state;
    // همگام‌سازی قدرت کشورها با ذخیره
    for (const c of content.countries) {
      if (!state.countries[c.id]) {
        state.countries[c.id] = { relation: c.startingRelation ?? 0, trust: c.trust ?? 50, alliance: false, tradePact: false, atWar: false, revealed: false, power: c.power, economy: c.economy };
      }
    }
    if (!state.pendingEvent) pickNewEvent();
    rollDailyMissions();
    bus.emit('game:loaded', { state, fromBackup: res.fromBackup });
    return state;
  }

  function save() {
    const ok = saveManager.save(state);
    if (ok) bus.emit('save:done', {});
    return ok;
  }

  /* ------------------------------------------------ رویداد روز */
  function pickNewEvent() {
    // اول رویدادهای زمان‌بندی‌شده (زنجیره‌ها)
    const due = (state.scheduledEvents || []).filter((s) => s.daysLeft <= 0);
    if (due.length) {
      const ev = content.events.find((e) => e.id === due[0].id);
      state.scheduledEvents = state.scheduledEvents.filter((s) => s.daysLeft > 0);
      if (ev) { state.pendingEvent = ev.id; return ev; }
    }
    const ev = pickDailyEvent(state, config, content);
    state.pendingEvent = ev ? ev.id : null;
    return ev;
  }

  function currentEvent() {
    if (!state.pendingEvent) return null;
    return content.events.find((e) => e.id === state.pendingEvent) || null;
  }

  /* ------------------------------------------------ انتخاب در دربار */
  function choose(choiceId) {
    const ev = currentEvent();
    if (!ev) return { ok: false, error: 'no-event' };
    const choice = ev.choices.find((c) => c.id === choiceId);
    if (!choice) return { ok: false, error: 'bad-choice' };
    if (choice.requirements && !evalCondition(choice.requirements, { state, config, content })) {
      return { ok: false, error: 'requirements' };
    }
    if (!canAffordChoice(state, choice)) return { ok: false, error: 'cannot-afford' };

    const { report, randomResults } = applyChoice(state, config, content, ev, choice);
    addTimeline(`${ev.title}: «${choice.title}»`);
    const dayReport = advanceDay();
    save();
    return { ok: true, event: ev, choice, report, randomResults, dayReport };
  }

  function endDayWithoutDecision() {
    addTimeline('روز بدون تصمیم دربار به پایان رسید.');
    state.kingdom.xp += Math.round(config.xp.decisionXp / 3);
    const dayReport = advanceDay();
    save();
    return { ok: true, dayReport };
  }

  /* ------------------------------------------------ پیشروی یک روز */
  function advanceDay() {
    const s = state;
    const daily = computeDaily(s, config, content);
    const report = { day: s.kingdom.day, net: daily.net, events: [], notices: [] };

    // اعمال منابع
    for (const k of ['coins', 'food', 'wood', 'stone', 'iron']) {
      s.resources[k] = Math.max(k === 'coins' ? -Infinity : 0, s.resources[k] + daily.net[k]);
    }
    s.resources.coins = Math.round(s.resources.coins);

    // دانش از بودجه علم
    s.resources.knowledge += daily.sciBudgetCost > 0 ? config.budgets.science.knowledgeGain[s.budgets.science] || 0 : 0;
    // دانش پایه دانشگاه
    const uni = s.buildings['building_university_001'];
    if (uni?.level > 0 && uni.progress === null) s.resources.knowledge += uni.level * 3;

    // روحیه از بودجه ارتش
    s.stats.morale = clampStat(s.stats.morale + (config.budgets.army.moraleGain[s.budgets.army] || 0));

    // اثرهای پادگانی/دفاعی ساختمان‌ها
    const barracks = s.buildings['building_barracks_001'];
    if (barracks?.level > 0 && barracks.progress === null) s.stats.morale = clampStat(s.stats.morale + barracks.level * 0.2);
    const wall = s.buildings['building_wall_001'];
    if (wall?.level > 0 && wall.progress === null) s.stats.security = clampStat(s.stats.security + wall.level * 0.15);
    // نفوذ از دیوان‌سالاری
    for (const tech of content.technologies) {
      if (s.research.unlocked.includes(tech.id) && tech.effects?.influencePerDay) s.resources.influence += tech.effects.influencePerDay;
    }
    // ژنرال کاریزماتیک: روحیه‌بخش روزانه
    if (s.generals.some((g) => g.trait === 'charismatic')) s.stats.morale = clampStat(s.stats.morale + 0.5);

    // اثر مالیات/رفاه/امنیت بر شاخص‌ها
    const taxLevel = config.taxLevels.find((t) => t.id === s.taxes.rate);
    s.stats.popularity = clampStat(s.stats.popularity + taxLevel.popularity + daily.welfare.popularity - 0.3);
    s.stats.security = clampStat(s.stats.security + daily.secLevel.security - 0.4);
    s.stats.morale = clampStat(s.stats.morale - 0.1);

    // جمعیت
    const popDelta = populationChange(s, config, content, daily);
    s.resources.population = Math.max(0, s.resources.population + popDelta);

    // بازار
    marketTick(s, config);

    // ساختمان‌ها: پیشرفت ساخت (سرعت = سبک حکومت × فناوری مهندسی)
    let buildSpeed = config.govStyles[s.kingdom.style]?.buildSpeedMult || 1;
    for (const tech of content.technologies) {
      if (s.research.unlocked.includes(tech.id) && tech.effects?.buildSpeedMult) buildSpeed *= tech.effects.buildSpeedMult;
    }
    for (const [id, b] of Object.entries(s.buildings)) {
      if (b.progress !== null && b.progress !== undefined) {
        b.progress -= 1 * buildSpeed;
        if (b.progress <= 0) {
          b.progress = null;
          b.level += 1;
          report.notices.push(`ساخت «${content.buildings.find((x) => x.id === id)?.name}» کامل شد (سطح ${b.level}).`);
          bus.emit('building:done', { id, level: b.level });
          addTimeline(`ساخت ${content.buildings.find((x) => x.id === id)?.name} به سطح ${b.level} رسید.`);
        }
      }
    }

    // گسترش قلمرو
    const finishedExp = [];
    for (const ex of s.expansions) {
      ex.daysLeft -= 1;
      if (ex.daysLeft <= 0) finishedExp.push(ex);
    }
    for (const ex of finishedExp) {
      s.expansions = s.expansions.filter((e) => e !== ex);
      if (!s.ownedTiles.includes(ex.tileId)) {
        s.ownedTiles.push(ex.tileId);
        const tile = content.mapTiles.find((t) => t.id === ex.tileId);
        const st = s.tiles.find((t) => t.id === ex.tileId);
        if (st) st.owner = 'player';
        s.kingdom.xp += config.xp.expandXp;
        report.notices.push(`منطقه «${tile?.name}» به قلمرو پیوست.`);
        addTimeline(`گشایش منطقه ${tile?.name}`);
      }
    }

    // تحقیق جاری
    if (s.research.current) {
      s.research.progress -= 1;
      if (s.research.progress <= 0) {
        const tech = content.technologies.find((t) => t.id === s.research.current);
        s.research.unlocked.push(s.research.current);
        s.research.current = null;
        s.kingdom.xp += config.xp.researchXp;
        report.notices.push(`فناوری «${tech?.name}» کشف شد!`);
        addTimeline(`کشف فناوری ${tech?.name}`);
        bus.emit('tech:done', { id: tech?.id });
      }
    }

    // کول‌داون‌ها و رویدادهای آینده
    tickCooldowns(s);
    for (const sev of s.scheduledEvents) sev.daysLeft -= 1;

    // دیپلماسی روزانه + حملات دشمن در جنگ
    const enemyAttacks = [];
    const offAttack = bus.on('war:enemyAttack', (p) => enemyAttacks.push(p));
    diplomacyDailyTick(s, config, content);
    offAttack();
    for (const atk of enemyAttacks) {
      const countryDef = content.countries.find((c) => c.id === atk.country);
      const totalUnits = Object.values(s.military.units).reduce((a, b) => a + b, 0);
      if (!countryDef) continue;
      if (totalUnits <= 0) {
        // بدون ارتش: غارت می‌شویم
        const loss = Math.min(s.resources.coins, 200);
        s.resources.coins -= loss;
        s.stats.security = clampStat(s.stats.security - 8);
        report.notices.push(`دشمن ${countryDef.name} بدون مقاومت حمله کرد و ${loss} سکه غارت کرد!`);
        if (s.stats.security <= 5 && s.stats.popularity <= 10) {
          s.ended = ending('conquered', `پادشاهی ${countryDef.name} سرزمین بی‌دفاع شما را فتح کرد.`);
        }
      } else {
        const battle = resolveBattle(s, config, countryDef, content, { weAttack: false });
        applyBattleResult(s, battle, countryDef);
        report.notices.push(battleNotice(countryDef, battle));
      }
    }

    // بحران‌ها: شورش و قحطی (بند 11)
    if (s.stats.popularity <= config.unrest.popularityDanger || s.stats.security <= config.unrest.securityDanger) {
      if (Math.random() * 100 < config.unrest.revoltChanceBase) {
        const loss = Math.min(s.resources.coins, Math.round(s.resources.coins * 0.1) + 50);
        s.resources.coins -= loss;
        s.stats.security = clampStat(s.stats.security - 5);
        s.stats.popularity = clampStat(s.stats.popularity - 3);
        report.notices.push(`شورش کوچک! ${loss} سکه از خزانه کاسته شد و امنیت آسیب دید.`);
        addTimeline('شورش مردمی سرکوب شد؛ هزینه‌هایی داشت.');
        s.history.stats.biggestCrisis = 'شورش مردمی';
        bus.emit('crisis:revolt', {});
      }
    }
    if (s.resources.food <= 0) {
      s.foodCrisisDays = (s.foodCrisisDays || 0) + 1;
      s.stats.popularity = clampStat(s.stats.popularity - 2);
      report.notices.push('انبار غذا خالی است! مردم گرسنه‌اند.');
    } else {
      s.foodCrisisDays = 0;
    }

    // ورشکستگی
    if (s.resources.coins < 0) {
      s.bankruptDays = (s.bankruptDays || 0) + 1;
      report.notices.push('خزانه در بدهی است! ارتش و ژنرال‌ها نگران‌اند.');
      s.stats.morale = clampStat(s.stats.morale - 2);
      for (const g of s.generals) g.loyalty = Math.max(0, g.loyalty - config.generals.loyaltyDecayOnBankrupt);
      checkBetrayal(report);
    } else {
      s.bankruptDays = 0;
    }

    // آمار و تاریخچه
    const hs = s.history.stats;
    hs.maxPopularity = Math.max(hs.maxPopularity, s.stats.popularity);
    hs.minPopularity = Math.min(hs.minPopularity, s.stats.popularity);
    hs.peakCoins = Math.max(hs.peakCoins, s.resources.coins);
    hs.daysWithoutWar = Object.values(s.countries).some((c) => c.atWar) ? 0 : hs.daysWithoutWar + 1;

    // روز جدید
    s.kingdom.day += 1;

    // مأموریت‌های روزانه/هفتگی جدید
    rollDailyMissions();
    // ریست شمارنده‌های روزانه
    s.missions.counters = { decisionsToday: 0, buildsToday: 0, tradesToday: 0, recruitsToday: 0, giftsToday: 0 };

    // سطح، دستاورد، لقب
    const levels = checkLevelUp(s, config);
    if (levels > 0) {
      report.notices.push(`پادشاهی به سطح ${s.kingdom.level} رسید!`);
      addTimeline(`پادشاهی به سطح ${s.kingdom.level} ارتقا یافت.`);
      bus.emit('level:up', { level: s.kingdom.level });
    }
    const achs = checkAchievements(s, config, content);
    for (const a of achs) { report.notices.push(`دستاورد «${a.name}» کسب شد!`); bus.emit('achievement:unlocked', a); }
    const titles = checkTitles(s, config, content);
    for (const t of titles) { report.notices.push(`لقب «${t.name}» به شما اعطا شد!`); bus.emit('title:unlocked', t); }

    // انتخاب رویداد روز بعد
    pickNewEvent();

    // پایان‌ها (بند 27)
    if (!s.ended) {
      if (s.bankruptDays >= 7) s.ended = ending('economic_collapse', 'خزانه هفت روز پیاپی در بدهی ماند و اقتصاد فروپاشید.');
      else if (s.stats.popularity <= 3 && s.stats.security <= 10 && Math.random() < 0.25) s.ended = ending('revolt', 'مردم به خیابان‌ها ریختند و کاخ سقوط کرد.');
      else if ((s.foodCrisisDays || 0) >= 6) s.ended = ending('famine', 'قحطی بزرگ پادشاهی را نابود کرد.');
      else if (s.kingdom.level >= 25 && s.resources.coins >= 80000 && !s.flags.goldenCelebrated) {
        s.flags.goldenCelebrated = true;
        s.ended = ending('golden_empire', 'امپراتوری طلایی شما به اوج قدرت رسید؛ تاریخ نامتان را فراموش نخواهد کرد.', { celebratory: true });
      }
    }

    bus.emit('day:advanced', { report, state: s });
    if (s.ended) bus.emit('game:ended', { ending: s.ended });
    return report;
  }

  function checkBetrayal(report) {
    for (const g of [...state.generals]) {
      if (g.loyalty <= config.generals.betrayalThreshold && Math.random() < 0.3) {
        state.generals = state.generals.filter((x) => x.id !== g.id);
        report.notices.push(`ژنرال ${g.name} خیانت کرد و پادشاهی را ترک کرد!`);
        addTimeline(`خیانت ژنرال ${g.name}`);
      }
    }
  }

  function ending(type, text, extra = {}) {
    return { type, text, day: state.kingdom.day, ...extra };
  }

  function battleNotice(country, battle) {
    if (battle.result === 'victory') return `حمله ${country.name} با موفقیت دفع شد!`;
    if (battle.result === 'defeat') return `حمله ${country.name} سنگین بود؛ نیروهای ما آسیب دیدند.`;
    return `حمله ${country.name} با عقب‌نشینی هر دو طرف پایان یافت.`;
  }

  function applyBattleResult(s, battle, countryDef) {
    const hs = s.history.stats;
    if (battle.result === 'victory') { hs.wins += 1; }
    else if (battle.result === 'defeat') { hs.losses += 1; }
    s.kingdom.xp += battle.rewards.xp;
    for (const k of ['coins', 'food', 'wood', 'stone', 'iron', 'credibility']) {
      s.resources[k] = Math.max(0, s.resources[k] + (battle.rewards[k] || 0));
    }
    s.stats.popularity = clampStat(s.stats.popularity + (battle.rewards.popularity || 0));
    s.stats.morale = clampStat(s.stats.morale + (battle.rewards.morale || 0));
  }

  function addTimeline(text) {
    state.history.timeline.push({ day: state.kingdom.day, text });
    if (state.history.timeline.length > 300) state.history.timeline.shift();
  }

  /* ------------------------------------------------ ساختمان‌ها */
  function buildingStatus(id) {
    const def = content.buildings.find((b) => b.id === id);
    if (!def) return null;
    const owned = state.buildings[id] || { level: 0, progress: null };
    const targetLevel = owned.level + 1;
    const lv = def.levels[targetLevel - 1];
    const lockReason = getBuildingLock(def, targetLevel);
    return { def, owned, targetLevel, nextLevel: lv || null, lockReason,
      cost: lv ? applyBuildCostMult(lv.cost) : null,
      days: lv ? Math.max(1, Math.ceil(lv.buildDays / (config.govStyles[state.kingdom.style]?.buildSpeedMult || 1))) : 0 };
  }

  function getBuildingLock(def, targetLevel) {
    if (def.enabled === false) return 'غیرفعال';
    if (def.minLevel && state.kingdom.level < def.minLevel) return `نیازمند سطح پادشاهی ${def.minLevel}`;
    if (def.requiresBuilding) {
      const req = state.buildings[def.requiresBuilding];
      if (!req || req.level < (def.requiresBuildingLevel || 1)) {
        const name = content.buildings.find((b) => b.id === def.requiresBuilding)?.name || def.requiresBuilding;
        return `نیازمند ${name}`;
      }
    }
    if (def.maxLevel && targetLevel > def.maxLevel) return 'حداکثر سطح';
    return null;
  }

  function applyBuildCostMult(cost) {
    const mult = config.govStyles[state.kingdom.style]?.buildCostMult || 1;
    const out = {};
    for (const [k, v] of Object.entries(cost)) out[k] = Math.round(v * mult);
    return out;
  }

  function canAfford(cost) {
    for (const [k, v] of Object.entries(cost || {})) {
      if ((state.resources[k] ?? 0) < v) return false;
    }
    return true;
  }

  function buildOrUpgrade(id) {
    const st = buildingStatus(id);
    if (!st) return { ok: false, error: 'unknown' };
    if (st.lockReason) return { ok: false, error: st.lockReason };
    if (!st.nextLevel) return { ok: false, error: 'max-level' };
    if (st.owned.progress !== null) return { ok: false, error: 'in-progress' };
    // فقط یک ساخت هم‌زمان
    if (Object.values(state.buildings).some((b) => b.progress !== null)) return { ok: false, error: 'builder-busy' };
    if (!canAfford(st.cost)) return { ok: false, error: 'cannot-afford' };
    for (const [k, v] of Object.entries(st.cost)) state.resources[k] -= v;
    if (st.owned.level === 0) state.buildings[id] = { level: 0, progress: st.days };
    else { st.owned.progress = st.days; }
    state.kingdom.xp += config.xp.buildXp;
    state.missions.counters.buildsToday = (state.missions.counters.buildsToday || 0) + 1;
    bus.emit('building:started', { id });
    save();
    return { ok: true, days: st.days };
  }

  /* ------------------------------------------------ ارتش */
  function recruit(unitId, count = 10) {
    const def = content.units.find((u) => u.id === unitId);
    if (!def) return { ok: false, error: 'unknown' };
    const cost = { coins: def.cost.coins * count, food: def.cost.food * count };
    const armyCostMult = config.govStyles[state.kingdom.style]?.armyCostMult || 1;
    cost.coins = Math.round(cost.coins * armyCostMult);
    if (!canAfford(cost)) return { ok: false, error: 'cannot-afford' };
    if (state.resources.population < count) return { ok: false, error: 'no-pop' };
    if (def.requiresTech && !state.research.unlocked.includes(def.requiresTech)) return { ok: false, error: 'tech' };
    if (def.requiresBuilding) {
      const b = state.buildings[def.requiresBuilding];
      if (!b || b.level <= 0) return { ok: false, error: 'building' };
    }
    state.resources.coins -= cost.coins;
    state.resources.food -= cost.food;
    state.resources.population -= count;
    state.military.units[unitId] = (state.military.units[unitId] || 0) + count;
    state.missions.counters.recruitsToday = (state.missions.counters.recruitsToday || 0) + count;
    bus.emit('army:recruited', { unitId, count });
    save();
    return { ok: true };
  }

  function dismiss(unitId, count = 10) {
    const have = state.military.units[unitId] || 0;
    const n = Math.min(count, have);
    state.military.units[unitId] = have - n;
    state.resources.population += n; // بازگشت به جمعیت
    save();
    return { ok: true, dismissed: n };
  }

  function hireGeneral(genId) {
    const def = content.generals.find((g) => g.id === genId);
    if (!def) return { ok: false, error: 'unknown' };
    if (state.generals.some((g) => g.id === genId)) return { ok: false, error: 'hired' };
    if (state.resources.coins < def.hireCost) return { ok: false, error: 'cannot-afford' };
    state.resources.coins -= def.hireCost;
    state.generals.push({ ...def, loyalty: def.loyalty });
    bus.emit('general:hired', { id: genId });
    save();
    return { ok: true };
  }

  /* ------------------------------------------------ جنگ */
  function attackCountry(countryId) {
    const countryDef = content.countries.find((c) => c.id === countryId);
    const c = state.countries[countryId];
    if (!countryDef || !c) return { ok: false, error: 'unknown' };
    const totalUnits = Object.values(state.military.units).reduce((a, b) => a + b, 0);
    if (totalUnits <= 0) return { ok: false, error: 'no-army' };
    if (!c.atWar) {
      const res = DIPLO_ACTIONS.war.run(state, countryDef);
      if (!res.ok) return res;
    }
    const battle = resolveBattle(state, config, countryDef, content, { weAttack: true });
    applyBattleResult(state, battle, countryDef);
    if (battle.result === 'victory') {
      state.history.stats.wins += 1;
      for (const tileId of battle.rewards.tiles) {
        const tile = state.tiles.find((t) => t.id === tileId);
        if (tile) { tile.owner = 'player'; if (!state.ownedTiles.includes(tileId)) state.ownedTiles.push(tileId); }
      }
      c.relation = Math.max(-100, c.relation - 10);
      if (c.relation <= -95 || state.ownedTiles.filter((id) => id.startsWith(countryId.replace('country_', 'tiles_'))).length >= 3) {
        c.atWar = false; // دشمن تسلیم شد
        battle.surrender = true;
      }
    } else if (battle.result === 'defeat') {
      state.history.stats.losses += 1;
      if (Object.values(state.military.units).every((v) => v <= 0)) {
        state.ended = ending('conquered', `ارتش شما نابود شد و ${countryDef.name} پایتخت را محاصره کرد.`);
      }
    }
    addTimeline(`نبرد با ${countryDef.name}: ${battle.result === 'victory' ? 'پیروزی' : battle.result === 'defeat' ? 'شکست' : 'عقب‌نشینی'}`);
    bus.emit('war:battle', { battle, countryId });
    save();
    return { ok: true, battle };
  }

  /* ------------------------------------------------ دیپلماسی */
  function diplomacyAction(actionId, countryId, param) {
    const countryDef = content.countries.find((c) => c.id === countryId);
    const c = state.countries[countryId];
    if (!countryDef || !c) return { ok: false, error: 'unknown' };
    const action = DIPLO_ACTIONS[actionId];
    if (!action) return { ok: false, error: 'unknown-action' };
    if (!action.can(state, c)) return { ok: false, error: 'requirements' };
    const merged = { ...countryDef, ...c };
    const power = estimateMilitaryPower(state, config, content);
    const res = action.run(state, merged, config, { power, amount: param });
    // بازگردانی مقادیر محاسبه‌شده به وضعیت کشور
    state.countries[countryId].relation = merged.relation;
    state.countries[countryId].trust = merged.trust;
    if (merged.tradePact) state.countries[countryId].tradePact = true;
    if (merged.alliance) state.countries[countryId].alliance = true;
    state.countries[countryId].atWar = merged.atWar;
    state.countries[countryId].revealed = merged.revealed;
    state.countries[countryId].power = merged.power;
    if (actionId === 'gift') state.missions.counters.giftsToday = (state.missions.counters.giftsToday || 0) + 1;
    save();
    return res;
  }

  /* ------------------------------------------------ بازار */
  function marketTrade(res, amount, dir) {
    if (!config.featureFlags.market) return { ok: false, error: 'disabled' };
    const price = state.market.prices[res];
    if (!price) return { ok: false, error: 'unknown' };
    const fee = config.market.feePct;
    if (dir === 'buy') {
      const cost = Math.ceil(amount * price * (1 + fee));
      if (state.resources.coins < cost) return { ok: false, error: 'cannot-afford' };
      state.resources.coins -= cost;
      state.resources[res] += amount;
    } else {
      if (state.resources[res] < amount) return { ok: false, error: 'not-enough' };
      const gain = Math.floor(amount * price * (1 - fee));
      state.resources[res] -= amount;
      state.resources.coins += gain;
    }
    state.kingdom.xp += config.xp.tradeXp;
    state.missions.counters.tradesToday = (state.missions.counters.tradesToday || 0) + 1;
    // خرید/فروش زیاد، قیمت را جابه‌جا می‌کند
    state.market.prices[res] = dir === 'buy' ? Math.round(price * 1.03 * 100) / 100 : Math.round(price * 0.97 * 100) / 100;
    bus.emit('market:trade', { res, amount, dir });
    save();
    return { ok: true };
  }

  /* ------------------------------------------------ گسترش قلمرو */
  function adjacentExpandableTiles() {
    const owned = new Set(state.ownedTiles);
    const pos = Object.fromEntries(content.mapTiles.map((t) => [t.id, t]));
    const out = [];
    for (const t of content.mapTiles) {
      if (owned.has(t.id)) continue;
      const st = state.tiles.find((x) => x.id === t.id);
      if (st && st.owner === 'player') continue;
      const neighbors = content.mapTiles.filter((o) => Math.abs(o.x - t.x) + Math.abs(o.y - t.y) === 1);
      if (neighbors.some((n) => owned.has(n.id))) {
        if (t.startOwner && t.startOwner !== 'neutral' && t.startOwner !== 'player') continue; // خاک کشورهای همسایه فقط با جنگ
        out.push(t);
      }
    }
    return out;
  }

  function expansionCost() {
    const owned = state.ownedTiles.length;
    const base = config.expansion.baseCost;
    const mult = Math.pow(config.expansion.costGrowthPerOwned, Math.max(0, owned - 1));
    return {
      coins: Math.round(base.coins * mult),
      influence: Math.round(base.influence * mult),
      population: Math.round(base.population * mult),
      days: config.expansion.baseDays,
    };
  }

  function expandTile(tileId) {
    const t = content.mapTiles.find((x) => x.id === tileId);
    if (!t) return { ok: false, error: 'unknown' };
    if (state.ownedTiles.includes(tileId)) return { ok: false, error: 'owned' };
    if (state.expansions.some((e) => e.tileId === tileId)) return { ok: false, error: 'in-progress' };
    if (t.minLevel && state.kingdom.level < t.minLevel) return { ok: false, error: `نیازمند سطح ${t.minLevel}` };
    if (!adjacentExpandableTiles().some((x) => x.id === tileId)) return { ok: false, error: 'not-adjacent' };
    const cost = expansionCost();
    if (state.resources.coins < cost.coins || state.resources.influence < cost.influence || state.resources.population < cost.population) {
      return { ok: false, error: 'cannot-afford' };
    }
    state.resources.coins -= cost.coins;
    state.resources.influence -= cost.influence;
    state.resources.population -= cost.population;
    state.expansions.push({ tileId, daysLeft: cost.days });
    bus.emit('expansion:started', { tileId });
    save();
    return { ok: true, cost };
  }

  /* ------------------------------------------------ فناوری */
  function researchTech(techId) {
    const def = content.technologies.find((t) => t.id === techId);
    if (!def) return { ok: false, error: 'unknown' };
    if (state.research.unlocked.includes(techId)) return { ok: false, error: 'done' };
    if (state.research.current) return { ok: false, error: 'busy' };
    if (def.requires?.length && !def.requires.every((r) => state.research.unlocked.includes(r))) return { ok: false, error: 'requires' };
    if (!canAfford(def.cost)) return { ok: false, error: 'cannot-afford' };
    for (const [k, v] of Object.entries(def.cost)) state.resources[k] -= v;
    state.research.current = techId;
    state.research.progress = def.days || 2;
    bus.emit('tech:started', { id: techId });
    save();
    return { ok: true };
  }

  /* ------------------------------------------------ حکومت */
  function setPolicy(kind, value) {
    if (kind === 'tax' || kind === 'welfare' || kind === 'security') state.taxes[kind === 'tax' ? 'rate' : kind] = value;
    else if (['army', 'farm', 'science'].includes(kind)) state.budgets[kind] = value;
    bus.emit('policy:changed', { kind, value });
    save();
    return { ok: true };
  }

  /* ------------------------------------------------ مأموریت‌ها */
  function rollDailyMissions() {
    const s = state;
    const day = s.kingdom.day;
    if (s.missions.dailyDay !== day) {
      s.missions.dailyDay = day;
      s.missions.dailyIds = pickDailyMissions(s, config, content, day).map((m) => m.id);
    }
    const week = Math.floor(day / 7);
    if (s.missions.weeklyWeek !== week) {
      s.missions.weeklyWeek = week;
      s.missions.weeklyIds = pickWeeklyMissions(s, config, content, week).map((m) => m.id);
    }
  }

  function claimMission(missionId) {
    const mission = content.missions.find((m) => m.id === missionId);
    if (!mission) return { ok: false, error: 'unknown' };
    if (state.missions.claimed[missionId]) return { ok: false, error: 'claimed' };
    const prog = missionProgress(state, mission, { config, content });
    if (!prog.done) return { ok: false, error: 'not-done' };
    const rewards = [];
    for (const [k, v] of Object.entries(mission.reward || {})) {
      if (k === 'xp') state.kingdom.xp += v;
      else if (k === 'title') { if (!state.titles.includes(v)) state.titles.push(v); }
      else state.resources[k] = (state.resources[k] || 0) + v;
      rewards.push({ k, v });
    }
    state.missions.claimed[missionId] = { day: state.kingdom.day };
    state.kingdom.xp += config.xp.missionXp;
    bus.emit('mission:claimed', { missionId });
    save();
    return { ok: true, rewards };
  }

  /* ------------------------------------------------ نیو گیم پلاس */
  function startNewGamePlus() {
    const carried = {
      titles: [...state.titles],
      achievements: { ...state.achievements },
      flag: state.kingdom.flag,
      color: state.kingdom.color,
      ngCount: (state.ngPlus?.count || 0) + 1,
      player: state.player,
    };
    // ثبت در جدول رتبه‌بندی محلی
    recordLeaderboardEntry();
    const creator = {
      rulerName: carried.player.name,
      kingdomName: state.kingdom.name,
      epithet: carried.player.epithet,
      symbol: carried.player.symbol,
      flag: carried.flag,
      color: carried.color,
      style: state.kingdom.style,
    };
    newGame(creator);
    state.titles = carried.titles;
    state.achievements = carried.achievements;
    state.ngPlus = { count: carried.ngCount };
    state.tutorial.done = true;
    save();
    return state;
  }

  function recordLeaderboardEntry() {
    try {
      const raw = storage.get('koc_leaderboard');
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        name: state.player.name,
        kingdom: state.kingdom.name,
        day: state.kingdom.day,
        level: state.kingdom.level,
        coins: Math.max(0, state.resources.coins),
        ending: state.ended?.type || 'ongoing',
        date: Date.now(),
      });
      list.sort((a, b) => (b.level * 1000 + b.day) - (a.level * 1000 + a.day));
      storage.set('koc_leaderboard', JSON.stringify(list.slice(0, 50)));
    } catch (e) { console.warn(e); }
  }

  /* ------------------------------------------------ API عمومی */
  return {
    get state() { return state; },
    get config() { return config; },
    get content() { return content; },
    bus,
    newGame, load, save,
    choose, endDayWithoutDecision, currentEvent, availableEvents,
    buildOrUpgrade, buildingStatus,
    recruit, dismiss, hireGeneral,
    attackCountry, diplomacyAction,
    marketTrade, expandTile, adjacentExpandableTiles, expansionCost,
    researchTech, setPolicy,
    claimMission, rollDailyMissions,
    startNewGamePlus, recordLeaderboardEntry,
    estimateMilitaryPower: () => estimateMilitaryPower(state, config, content),
    housingCapacity: () => housingCapacity(state, config, content),
    dailyPreview: () => computeDaily(state, config, content),
    xpForLevel: () => xpForLevel(state.kingdom.level, config),
    saveManager,
  };
}
