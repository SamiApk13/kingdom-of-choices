/**
 * sw.js — Service Worker
 * ------------------------------------------------------------
 * بند 85/88/89: کش آفلاین دارایی‌های استاتیک و داده محتوا با کلید نسخه.
 * استراتژی: برای فایل‌های بازی «اول کش، بعد شبکه» و به‌روزرسانی کش در پس‌زمینه.
 */
const CACHE_KEY = 'koc-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './admin.html',
  './manifest.webmanifest',
  './content-version.json',
  './css/theme.css',
  './css/main.css',
  './assets/fonts/vazirmatn.woff2',
  './assets/fonts/vazirmatn-bold.woff2',
  './assets/icons.js',
  './config/gameConfig.js',
  './config/localization.js',
  './core/eventBus.js', './core/rng.js', './core/conditionEngine.js', './core/effectEngine.js',
  './core/warEngine.js', './core/economyEngine.js', './core/decisionEngine.js',
  './core/diplomacyEngine.js', './core/progressionEngine.js', './core/saveManager.js',
  './core/contentManager.js', './core/gameEngine.js',
  './content/index.js', './content/events.js', './content/buildings.js', './content/units.js',
  './content/generals.js', './content/countries.js', './content/missions.js',
  './content/achievements.js', './content/technologies.js', './content/titles.js',
  './content/mapTiles.js', './content/royalStyles.js',
  './services/storage.js', './services/sound.js', './services/notification.js',
  './services/analytics.js', './services/api.js',
  './ui/app.js', './ui/dom.js', './ui/components.js',
  './ui/screens/dashboard.js', './ui/screens/court.js', './ui/screens/governance.js',
  './ui/screens/map.js', './ui/screens/buildings.js', './ui/screens/army.js',
  './ui/screens/diplomacy.js', './ui/screens/market.js', './ui/screens/missions.js',
  './ui/screens/tech.js', './ui/screens/history.js', './ui/screens/achievements.js',
  './ui/screens/settings.js', './ui/screens/leaderboard.js', './ui/screens/ending.js',
  './ui/screens/tutorial.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_KEY).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_KEY).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fresh = fetch(e.request)
        .then((res) => {
          if (res && res.ok && new URL(e.request.url).origin === location.origin) {
            const clone = res.clone();
            caches.open(CACHE_KEY).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    }),
  );
});
