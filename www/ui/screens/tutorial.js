/**
 * ui/screens/tutorial.js — بند 3: آموزش ده‌مرحله‌ای
 */
import { el, fmt } from '../dom.js';
import { icon } from '../../assets/icons.js';

const STEPS = [
  { icon: 'coins', title: 'خزانه (سکه)', text: 'سکه ستون اقتصاد شماست؛ با مالیات، بازار و ساختمان‌های تجاری به دست می‌آید و خرج ساخت، ارتش و دیپلماسی می‌شود. اگر خزانه ۷ روز در بدهی بماند، اقتصاد فرومی‌پاشد!' },
  { icon: 'population', title: 'جمعیت', text: 'مردم مالیات می‌دهند و سرباز می‌شوند. جمعیت با غذا، امنیت و رفاه رشد می‌کند و ظرفیت آن با ساخت «خانه» بالا می‌رود.' },
  { icon: 'food', title: 'منابع', text: 'غذا، چوب، سنگ و آهن در نوار بالا دیده می‌شوند. با لمس هر منبع، تولید و مصرف روزانه‌اش را ببینید. مزرعه‌ها غذا، کارگاه‌ها چوب و معادن سنگ و آهن تولید می‌کنند.' },
  { icon: 'popularity', title: 'محبوبیت', text: 'محبوبیت ۰ تا ۱۰۰ است. زیر ۱۰ یعنی خطر شورش! مالیات زیاد و بی‌توجهی به مردم آن را کم و جشن‌ها و رفاه آن را زیاد می‌کند.' },
  { icon: 'sword', title: 'ارتش', text: 'در صفحه ارتش سرباز استخدام کنید. هر سرباز از جمعیت کم می‌شود و خرج نگهداری دارد. روحیه و ژنرال قدرت را چند برابر می‌کنند.' },
  { icon: 'scroll', title: 'اولین تصمیم', text: 'هر روز یک درخواست در «دربار» می‌آید. هر انتخاب حداقل یک مزیت و یک هزینه یا ریسک دارد؛ هیچ انتخابی کاملاً خوب یا بد نیست. هر تصمیم = یک روز سلطنت.' },
  { icon: 'hammer', title: 'ساختمان‌ها', text: 'با ساخت و ارتقای ساختمان‌ها تولید کنید. در هر لحظه فقط یک پروژه ساختمانی فعال است. تالار حکومت، مزرعه، انبار و پادگان از ابتدا با شما هستند.' },
  { icon: 'target', title: 'مأموریت‌ها', text: 'مأموریت‌های روزانه، هفتگی و داستانی پاداش سکه و تجربه می‌دهند. از تب مأموریت‌ها پیگیری‌شان کنید.' },
  { icon: 'map', title: 'نقشه', text: 'قلمرو خود را روی نقشه ببینید. مناطق آزادِ کنار قلمروتان با سکه، نفوذ و جمعیت قابل گشایش‌اند؛ خاک همسایه‌ها فقط با جنگ فتح می‌شود.' },
  { icon: 'clock', title: 'ذخیره بازی', text: 'بازی پس از هر روز خودکار ذخیره می‌شود. می‌توانید ببندید و بعداً ادامه دهید؛ از تنظیمات خروجی هم بگیرید.' },
];

export function showTutorial(game, onDone) {
  const s = game.state;
  let step = s.tutorial.step || 0;
  let overlay = null;

  function draw() {
    overlay?.remove();
    const st = STEPS[step];
    const dots = el('div', { class: 'tutorial-steps' }, STEPS.map((_, i) => el('i', { class: i === step ? 'on' : '' })));
    overlay = el('div', { class: 'tutorial-overlay' },
      el('div', { class: 'tutorial-card' },
        icon(st.icon),
        el('h3', {}, `مرحله ${fmt(step + 1)}: ${st.title}`),
        el('p', {}, st.text),
        dots,
        el('div', { class: 'btn-row' },
          step > 0 ? el('button', { class: 'btn flex-1', onclick: () => { step--; persist(); draw(); } }, 'قبلی') : null,
          el('button', { class: 'btn btn-ghost flex-1', onclick: () => finish(true) }, 'رد کردن'),
          el('button', { class: 'btn btn-gold flex-1', onclick: () => {
            if (step >= STEPS.length - 1) finish(false);
            else { step++; persist(); draw(); }
          } }, step >= STEPS.length - 1 ? 'شروع سلطنت!' : 'بعدی'),
        ),
      ),
    );
    document.body.append(overlay);
  }

  function persist() {
    s.tutorial.step = step;
    game.save();
  }

  function finish(skipped) {
    s.tutorial.done = true;
    s.tutorial.step = 0;
    game.save();
    overlay?.remove();
    onDone(skipped);
  }

  draw();
}
