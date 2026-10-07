/**
 * services/sound.js
 * ------------------------------------------------------------
 * بند 48: سیستم صدا. افکت‌ها به‌صورت رویه‌ای با WebAudio ساخته می‌شوند
 * تا بازی هیچ فایل صوتی خارجی‌ای نیاز نداشته باشد (آفلاین کامل).
 * در آینده می‌توان فایل‌های واقعی موسیقی را جایگزین کرد.
 */
let ctx = null;
let master = null;
const settings = { sfx: true, volume: 80 };

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = settings.volume / 100;
    master.connect(ctx.destination);
  } catch { ctx = null; }
  return ctx;
}

function tone(freq, dur = 0.12, type = 'sine', gainV = 0.25, delay = 0) {
  const c = ensureCtx();
  if (!c || !settings.sfx) return;
  try {
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainV, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {}
}

export const sound = {
  configure(s) {
    if (s.sfx !== undefined) settings.sfx = s.sfx;
    if (s.volume !== undefined) settings.volume = s.volume;
    if (master) master.gain.value = settings.volume / 100;
  },
  unlock() { ensureCtx()?.resume?.(); },
  click() { tone(660, 0.06, 'triangle', 0.12); },
  coin() { tone(880, 0.08, 'square', 0.12); tone(1320, 0.1, 'square', 0.1, 0.07); },
  build() { tone(220, 0.15, 'sawtooth', 0.15); tone(330, 0.12, 'sawtooth', 0.12, 0.1); },
  victory() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.2, i * 0.12)); },
  defeat() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.22, 'sawtooth', 0.16, i * 0.15)); },
  decision() { tone(440, 0.09, 'sine', 0.16); tone(550, 0.12, 'sine', 0.14, 0.08); },
  alert() { tone(300, 0.25, 'square', 0.14); tone(300, 0.25, 'square', 0.14, 0.3); },
  levelup() { [660, 880, 1100, 1320].forEach((f, i) => tone(f, 0.14, 'triangle', 0.18, i * 0.09)); },
  notification() { tone(980, 0.07, 'sine', 0.1); },
};
