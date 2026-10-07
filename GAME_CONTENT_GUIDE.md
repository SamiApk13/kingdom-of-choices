# 📖 راهنمای محتوای بازی (GAME CONTENT GUIDE)

این سند توضیح می‌دهد **چگونه بدون دست‌زدن به هسته بازی** محتوا اضافه یا تغییر دهید.
اصل: همه‌چیز داده‌محور است؛ هسته فقط «رجیستری محتوا» را می‌خواند.

> ⚠️ هر آیتم جدید باید **ID یکتا و پایدار** داشته باشد و هرگز بعداً تغییر نکند
> (ذخیره‌ها به این IDها وابسته‌اند). برای نسخه جدید محتوا، یک آیتم با شماره جدید بسازید:
> `event_famine_001` → `event_famine_002`.

---

## 1) افزودن رویداد جدید

فایل: `www/content/events.js` — یک آبجکت به آرایه `EVENTS` اضافه کنید.

```js
{
  id: 'event_winter_002',            // یکتا و پایدار
  title: 'زمستان سخت',
  description: 'برف سنگینی باریده و راه‌ها بسته شده‌اند.',
  category: 'natural',               // economic|military|political|social|natural|trade|diplomatic|cultural|science|crisis|story
  rarity: 'rare',                    // common|rare|epic|legendary (وزن از config.rarityWeights)
  weight: 1,                         // ضریب اضافی احتمال
  minLevel: 3,                       // حداقل سطح پادشاهی برای ظاهرشدن
  cooldown: 15,                      // روز (بند 74: تکرار پشت سر هم ممنوع)
  requirements: { res: 'food', op: '>=', value: 100 },  // شرط ظاهرشدن (اختیاری)
  choices: [
    {
      id: 'clear', title: 'بازگشایی راه‌ها',
      costs: { coins: 120 },                       // پرداخت قطعی
      effects: [ { type: 'security', amount: 5 } ], // اثر قطعی
      randomEffects: [ { chance: 40, label: 'یخ‌بندان', effects: [ { type: 'resource', res: 'food', amount: -40 } ] } ],
      flags: { opened_roads: true },               // پرچم داستانی (بند 10)
      followUpEvent: 'event_thaw_003', followUpDelay: 3, // رویداد زنجیره‌ای
    },
  ],
}
```

- اگر رویداد فقط باید از مسیر زنجیره بیاید: `scheduledOnly: true`.
- هیچ عددی را به منطق اضافه نکنید؛ اثرها فقط از طریق `effects` است.

## 2) افزودن ساختمان جدید

فایل: `www/content/buildings.js`. هر ساختمان آرایه `levels` دارد (هزینه/زمان/تولید هر سطح).

```js
{
  id: 'building_library_002', name: 'کتابخانه', category: 'science',
  description: '...', minLevel: 4, maxLevel: 3, icon: 'book',
  requiresBuilding: 'building_university_001',  // اختیاری
  levels: [
    { cost: { coins: 400, wood: 100 }, buildDays: 3, production: { knowledge: 4 }, maintenance: { coins: 6 } },
    ...
  ],
}
```

## 3) افزودن واحد نظامی جدید

فایل: `www/content/units.js`. برای قفل‌کردن پشت فناوری از `requiresTech` و پشت ساختمان از `requiresBuilding` استفاده کنید.

## 4) افزودن کشور جدید

فایل: `www/content/countries.js`. فیلدها: `power, economy, aggression, trust, startingRelation, tradePreference`.
برای داشتن خاک روی نقشه، چند کاشی با `startOwner: 'کشور_جدید'` در `mapTiles.js` اضافه کنید.

## 5) افزودن مأموریت / دستاورد / لقب / فناوری

- مأموریت: `www/content/missions.js` (فیلد `type`: daily/weekly/story). شرط با `condition.metric` سنجیده می‌شود.
- دستاورد: `www/content/achievements.js`
- لقب: `www/content/titles.js`
- فناوری: `www/content/technologies.js` (فیلد `effects` مثل `militaryMult`, `incomeMult`, `productionMult`)

لیست متریک‌های موجود در `core/progressionEngine.js` → تابع `metricValue` است.

## 6) تغییر بالانس (بدون کد)

همه اعداد در `www/config/gameConfig.js` است. دو راه:

1. **پنل مدیریت** (`/admin.html` → تب «بالانس و تنظیمات»): یک JSON بدهید، مثلاً:
   ```json
   { "start": { "coins": 1000 }, "xp": { "decisionXp": 25 }, "war": { "lootCoinsBase": 600 } }
   ```
   این مقادیر روی پیش‌فرض‌ها سوار می‌شوند (بدون تغییر فایل).

2. یا مستقیم `gameConfig.js` را ویرایش کنید (برای تغییرات دائمی).

## 7) فعال/غیرفعال کردن هر محتوا

پنل مدیریت → تب «محتوا» → دکمه «غیرفعال کن» کنار هر آیتم.
هسته آیتم‌های `enabled: false` را نادیده می‌گیرد. بدون تغییر کد، بدون انتشار نسخه جدید (بند ۳۰).

## 8) مایگریشن ذخیره و محتوا

- **ذخیره:** اگر ساختار Save تغییر کرد، `saveVersion` را در `core/saveManager.js` افزایش دهید و یک تابع مایگریشن در `migrations` اضافه کنید. نمونه نسخه ۱→۲ موجود است.
- **محتوا:** اگر ساختار یک رویداد قدیمی تغییر کرد، در `core/contentManager.js` یک تابع مایگریشن بنویسید (نمونه: `migrateEvent_v1toV2`).

---

## ساختار یک انتخاب (Choice)

| فیلد | توضیح |
|---|---|
| `costs` | منابعی که قطعاً کم می‌شوند (`{coins, food, wood, stone, iron, population}`) |
| `effects` | اثرهای قطعی (منبع/محبوبیت/امنیت/روحیه/رابطه/…) |
| `randomEffects` | اثرهای احتمالی با `chance` درصد |
| `flags` | پرچم‌های داستانی برای رویدادهای آینده |
| `followUpEvent` + `followUpDelay` | رویداد زنجیره‌ای بعدی |

## انواع اثر (`type` در effects)

`resource` • `popularity` • `security` • `morale` • `xp` • `add_flag` • `remove_flag`
• `change_relation` • `spawn_event` • `start_war` • `price_shock` • `timeline` • `title`

برای افزودن نوع اثر جدید، در `core/effectEngine.js` از `registerEffect('نام', تابع)` استفاده کنید
(معماری پلاگین‌مانند؛ بدون تغییر بقیه هسته).
