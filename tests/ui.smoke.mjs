/**
 * tests/ui.smoke.mjs — تست دود (Smoke) رابط کاربری با jsdom
 * مسیر کامل: اسپلش → منو → ساخت پادشاه → آموزش → داشبورد → انتخاب تصمیم
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  `<!DOCTYPE html><html dir="rtl" lang="fa"><body>
     <div id="app"></div><div id="modal-root"></div><div id="toasts"></div>
   </body></html>`,
  { url: 'http://localhost/', pretendToBeVisual: true },
);

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.location = dom.window.location;
global.localStorage = dom.window.localStorage;
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
dom.window.scrollTo = () => {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log('  ' + m);
let failed = false;
const check = (cond, ok, bad) => { if (cond) log('✅ ' + ok); else { failed = true; log('❌ ' + bad); } };

await import('../www/ui/app.js');
await sleep(1500);

check(document.querySelector('.home h1'), 'صفحه اصلی بعد از اسپلش نمایش داده شد', 'صفحه اصلی رندر نشد');

// شروع بازی جدید
[...document.querySelectorAll('.home .btn')].find((b) => b.textContent.includes('شروع بازی جدید') || b.textContent.includes('شروع بازی'))?.click();
await sleep(120);
check(location.hash === '#/create', 'ورود به صفحه ساخت پادشاه', 'مسیر ساخت پادشاه باز نشد');

const nameInput = document.querySelector('input[placeholder*="آریا"]');
const kingdomInput = document.querySelector('input[placeholder*="سرزمین"]');
nameInput.value = 'آریا';
kingdomInput.value = 'تستستان';
[...document.querySelectorAll('.btn')].find((b) => b.textContent.includes('آغاز سلطنت'))?.click();
await sleep(200);

check(document.querySelector('.tutorial-overlay'), 'آموزش مرحله‌ای آغاز شد', 'آموزش نمایش داده نشد');
for (let i = 0; i < 10; i++) {
  const next = [...document.querySelectorAll('.tutorial-overlay .btn')].find((b) => b.textContent.includes('بعدی') || b.textContent.includes('شروع سلطنت'));
  if (!next) break;
  next.click();
  await sleep(30);
}
check(!document.querySelector('.tutorial-overlay'), 'آموزش تا انتها طی شد', 'آموزش تمام نشد');

check(document.querySelector('.topbar'), 'نوار منابع بالای داشبورد وجود دارد', 'نوار منابع نیست');
check(document.querySelectorAll('.menu-btn').length >= 8, 'دکمه‌های داشبورد رندر شدند', 'دکمه‌های داشبورد کم است');
check(document.querySelectorAll('.bottom-nav .nav-item').length === 5, 'ناوبری پایین ۵ آیتم دارد', 'ناوبری پایین مشکل دارد');

// رفتن به دربار
[...document.querySelectorAll('.bottom-nav .nav-item')].find((b) => b.textContent.includes('دربار'))?.click();
await sleep(150);
check(document.querySelector('.event-card'), 'رویداد روز در دربار نمایش داده شد', 'کارت رویداد نیست');

// انتخاب یک گزینه
const choice = document.querySelector('.choice');
if (choice) {
  choice.click();
  await sleep(150);
  check(document.querySelector('.modal'), 'مودال گزارش روز باز شد', 'مودال نتیجه باز نشد');
  [...document.querySelectorAll('.modal .btn')].find((b) => b.textContent.includes('ادامه'))?.click();
  await sleep(150);
}
check(JSON.parse(localStorage.getItem('koc_save_v2')).kingdom.day >= 2, 'روز سلطنت جلو رفته و ذخیره شده', 'پیشروی روز/ذخیره مشکل دارد');

// چند صفحه دیگر
for (const [route, marker] of [['#/buildings', '.page-head'], ['#/army', '.page-head'], ['#/diplomacy', '.page-head'], ['#/market', '.page-head'], ['#/missions', '.page-head'], ['#/tech', '.page-head'], ['#/history', '.timeline'], ['#/map', '.map-grid'], ['#/settings', '.page-head']]) {
  location.hash = route;
  await sleep(100);
  check(document.querySelector(marker), `صفحه ${route} رندر شد`, `صفحه ${route} رندر نشد`);
}

console.log(failed ? '\nنتیجه: ❌ خطا در رابط کاربری' : '\nنتیجه: ✅ رابط کاربری سالم است');
process.exit(failed ? 1 : 0);
