/**
 * ui/screens/settings.js — تنظیمات، ذخیره، خروجی/ورودی (بند 33)
 */
import { el, fmt, showModal, closeModal, confirmModal } from '../dom.js';
import { icon } from '../../assets/icons.js';
import { renderTopBar } from '../components.js';
import { sound } from '../../services/sound.js';
import { SAVE_SCHEMA_VERSION } from '../../core/saveManager.js';

export function renderSettings(root, ctx) {
  const { game } = ctx;
  const s = game.state;
  root.append(renderTopBar(game));

  const page = el('div', { class: 'page' });
  page.append(el('div', { class: 'page-head' }, el('h2', {}, 'تنظیمات')));

  /* صداها */
  page.append(el('div', { class: 'section-title' }, 'صدا'));
  page.append(el('div', { class: 'card' },
    toggleRow('صدای افکت‌ها', s.settings.sfx, (v) => { s.settings.sfx = v; sound.configure({ sfx: v }); game.save(); ctx.refresh(); }),
    el('div', { class: 'report-line' },
      el('span', {}, 'بلندی صدا'),
      el('input', { type: 'range', min: '0', max: '100', value: String(s.settings.volume), style: 'accent-color:var(--gold)', oninput: (e) => {
        s.settings.volume = +e.target.value; sound.configure({ volume: +e.target.value }); game.save();
      } }),
    ),
    toggleRow('کاهش انیمیشن', s.settings.reduceMotion, (v) => {
      s.settings.reduceMotion = v; document.body.classList.toggle('reduce-motion', v); game.save(); ctx.refresh();
    }),
  ));

  /* ذخیره */
  page.append(el('div', { class: 'section-title' }, 'ذخیره بازی'));
  page.append(el('div', { class: 'card' },
    el('p', { class: 'muted mb-8' }, `ذخیره خودکار پس از هر روز فعال است. نسخه ساختار ذخیره: ${fmt(SAVE_SCHEMA_VERSION)}`),
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn btn-sm', onclick: () => { game.save(); ctx.toastInfo('بازی ذخیره شد.'); } }, 'ذخیره دستی'),
      el('button', { class: 'btn btn-sm', onclick: () => exportSave(ctx) }, 'خروجی ذخیره'),
      el('button', { class: 'btn btn-sm', onclick: () => importSave(ctx) }, 'بازیابی'),
    ),
  ));

  /* شروع دوباره */
  page.append(el('div', { class: 'section-title' }, 'خطرناک'));
  page.append(el('div', { class: 'card' },
    el('button', { class: 'btn btn-red btn-block', onclick: () => {
      confirmModal('آیا مطمئن هستید؟ تمام پیشرفت این سلطنت حذف می‌شود.', () => {
        game.saveManager.clear();
        location.hash = '#/home';
        setTimeout(() => location.reload(), 80);
      }, { title: 'حذف ذخیره', yes: 'حذف کن' });
    } }, 'شروع دوباره (حذف ذخیره)'),
  ));

  page.append(el('div', { class: 'card center-text' },
    el('p', { class: 'small muted' }, 'پادشاه انتخاب‌ها — نسخه ۱٫۰٫۰'),
    el('p', { class: 'small muted' }, 'آفلاین‌اول • داده‌محور • قابل گسترش'),
    el('a', { href: 'admin.html', class: 'small', style: 'color:var(--text-2)' }, 'پنل مدیریت محتوا'),
  ));

  root.append(page);
}

function toggleRow(label, value, onchange) {
  const box = el('div', { class: 'report-line', style: 'cursor:pointer', onclick: () => onchange(!value) },
    el('span', {}, label),
    el('span', { class: 'tag ' + (value ? 'gain' : '') }, value ? 'روشن' : 'خاموش'),
  );
  return box;
}

function exportSave(ctx) {
  const text = ctx.game.saveManager.export(ctx.game.state);
  showModal(el('div', {},
    el('h3', {}, 'خروجی ذخیره'),
    el('p', { class: 'muted mb-8' }, 'این کد را کپی و در جایی امن نگه دارید. با «بازیابی» می‌توانید آن را برگردانید.'),
    el('textarea', { readonly: 'true', style: 'width:100%;height:120px;background:var(--bg-2);color:var(--text-1);border:var(--border);border-radius:8px;padding:8px;font-size:11px', onclick: (e) => e.target.select() }, text),
    el('button', { class: 'btn btn-gold btn-block mt-8', onclick: () => {
      navigator.clipboard?.writeText(text).then(() => ctx.toastInfo('کپی شد!')).catch(() => {});
    } }, 'کپی'),
    el('button', { class: 'btn btn-block mt-8', onclick: closeModal }, 'بستن'),
  ));
}

function importSave(ctx) {
  showModal(el('div', {},
    el('h3', {}, 'بازیابی ذخیره'),
    el('p', { class: 'muted mb-8' }, 'کد ذخیره را وارد کنید. ذخیره فعلی جایگزین می‌شود.'),
    el('textarea', { id: 'import-area', style: 'width:100%;height:120px;background:var(--bg-2);color:var(--text-1);border:var(--border);border-radius:8px;padding:8px;font-size:11px' }),
    el('button', { class: 'btn btn-gold btn-block mt-8', onclick: () => {
      const text = document.getElementById('import-area').value;
      const st = ctx.game.saveManager.import(text);
      if (!st) { ctx.toastError('کد نامعتبر است.'); return; }
      ctx.game.saveManager.save(st); // ذخیره به‌عنوان فایل اصلی + پشتیبان‌گیری از قبلی
      closeModal();
      ctx.toastInfo('ذخیره بازیابی شد.');
      location.hash = '#/home';
      setTimeout(() => location.reload(), 80);
    } }, 'بازیابی'),
    el('button', { class: 'btn btn-block mt-8', onclick: closeModal }, 'انصراف'),
  ));
}
