// ═══════════════════════════════════════════════════════════════════════
//  THE WELCOME
//
//  This app is a surprise. Nobody is going to be standing next to her
//  explaining it, so the first thirty seconds have to do that themselves —
//  warmly, and without asking her to fill anything in.
//
//  Ottis is on every card and speaks on every card. English chrome,
//  Nicaraguan Spanish from him, same as everywhere else.
//
//  The "add to home screen" card is platform-specific, because the steps
//  really are different on her iPhone and Kevin's Android — and it is
//  skipped entirely once the app is already installed.
// ═══════════════════════════════════════════════════════════════════════

import { ottisSVG } from './ottis.js';

const KEY = 'ada-road-welcomed';

/** Installed to the home screen and launched from there? */
export const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

const platform = () => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
};

export function needsWelcome() {
  try { return !localStorage.getItem(KEY); } catch (e) { return false; }
}
function remember() { try { localStorage.setItem(KEY, '1'); } catch (e) {} }

/* ── the share / menu glyphs, so the instruction is recognisable ──── */
const SHARE_IOS = `<svg viewBox="0 0 24 24" class="gly" aria-hidden="true">
  <path d="M12 15V3.5"/><path d="M8.2 7.2 12 3.4l3.8 3.8"/>
  <path d="M6 11H5a1.6 1.6 0 0 0-1.6 1.6v6.8A1.6 1.6 0 0 0 5 21h14a1.6 1.6 0 0 0 1.6-1.6v-6.8A1.6 1.6 0 0 0 19 11h-1"/></svg>`;
const MENU_ANDROID = `<svg viewBox="0 0 24 24" class="gly" aria-hidden="true">
  <circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>`;
const PLUS_SQUARE = `<svg viewBox="0 0 24 24" class="gly" aria-hidden="true">
  <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4"/><path d="M12 8.4v7.2M8.4 12h7.2"/></svg>`;

function installCard() {
  const p = platform();
  if (p === 'ios') {
    return {
      ottis: 'idle',
      says: 'Ponéme en tu pantalla, pues.',
      title: 'Keep me on your home screen',
      body: 'So you can open me with one tap, and I still work with no signal.',
      steps: [
        { icon: SHARE_IOS, text: 'Tap the <b>Share</b> button at the bottom of Safari' },
        { icon: PLUS_SQUARE, text: 'Scroll down and tap <b>Add to Home Screen</b>' },
        { icon: '', text: 'Tap <b>Add</b>, then open me from the new icon' },
      ],
      note: 'This only works in Safari — Chrome on iPhone cannot do it.',
    };
  }
  if (p === 'android') {
    return {
      ottis: 'idle',
      says: 'Ponéme en tu pantalla, pues.',
      title: 'Keep me on your home screen',
      body: 'So you can open me with one tap, and I still work with no signal.',
      steps: [
        { icon: MENU_ANDROID, text: 'Tap the <b>⋮</b> menu at the top right of Chrome' },
        { icon: PLUS_SQUARE, text: 'Tap <b>Add to Home screen</b> or <b>Install app</b>' },
        { icon: '', text: 'Confirm, then open me from the new icon' },
      ],
      note: '',
    };
  }
  return {
    ottis: 'idle',
    says: 'Ponéme en tu pantalla, pues.',
    title: 'Keep me somewhere easy',
    body: 'On a phone you can add me to the home screen and open me with one tap.',
    steps: [{ icon: '', text: 'Bookmark this page, or open it on your phone to install it' }],
    note: '',
  };
}

function cards() {
  const list = [
    {
      ottis: 'greet',
      says: '¡Ideay, Ada! Te estábamos esperando.',
      title: 'Hola, Ada.',
      body: 'This is your road to a classroom of your own — every step of it, in order, from the papers you need to the day you get hired. I will keep you company the whole way.',
    },
    {
      ottis: 'idle',
      says: 'Una sola cosa a la vez. Vos podés.',
      title: 'One step at a time',
      body: 'Hoy only ever shows you one thing. Never a list, never everything at once. And when a step is out of your hands, it says so and you get the day off.',
    },
    {
      ottis: 'idle',
      says: 'Mirá qué lindo el parque.',
      title: 'Your road is a park',
      body: 'El parque is the whole journey as somewhere you can wander. I stand on the step you are on. Every lamp is a step, and the ones behind you stay lit.',
    },
    {
      ottis: 'idle',
      says: 'Todo está aquí, tranquila.',
      title: 'Everything else is there when you want it',
      body: 'El camino lists all thirty-two steps — tick any of them, whenever you actually did it. Dinero keeps the costs and the grants, and every figure can be corrected.',
    },
  ];
  if (!isInstalled()) list.push(installCard());
  list.push({
    ottis: 'proud',
    says: 'Vamos, Adamar. Un paso a la vez.',
    title: "That's everything.",
    body: 'No accounts, nothing to set up. Whatever you tick is saved, and it shows up on the other phone too.',
    last: true,
  });
  return list;
}

/**
 * Runs the welcome over the top of the app. Resolves when she is done —
 * whether she stepped through it or skipped it.
 */
export function runWelcome({ replay = false } = {}) {
  return new Promise((resolve) => {
    const CARDS = cards();
    let at = 0;

    const el = document.createElement('div');
    el.className = 'welcome';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Welcome');
    document.body.appendChild(el);

    function finish() {
      if (!replay) remember();
      el.classList.add('going');
      setTimeout(() => { el.remove(); resolve(); }, 260);
    }

    function draw() {
      const c = CARDS[at];
      el.innerHTML = `
        <div class="w-inner">
          <div class="w-perch">
            ${ottisSVG(c.ottis)}
            <p class="w-says">${c.says}</p>
          </div>
          <div class="w-card">
            <h2>${c.title}</h2>
            <p>${c.body}</p>
            ${c.steps ? `<ol class="w-steps">${c.steps.map(s => `
              <li>${s.icon ? `<span class="w-ic">${s.icon}</span>` : '<span class="w-ic w-ic-none"></span>'}<span>${s.text}</span></li>`).join('')}</ol>` : ''}
            ${c.note ? `<p class="w-note">${c.note}</p>` : ''}
          </div>
          <div class="w-foot">
            <div class="w-dots">${CARDS.map((_, i) => `<i class="${i === at ? 'on' : ''}"></i>`).join('')}</div>
            <button type="button" class="w-go" data-w="next">${at === CARDS.length - 1 ? "Let's start" : 'Next'}</button>
            ${at === CARDS.length - 1 ? '' : '<button type="button" class="w-skip" data-w="skip">Skip</button>'}
          </div>
        </div>`;
    }

    el.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-w]');
      if (!b) return;
      if (b.dataset.w === 'skip') return finish();
      if (at < CARDS.length - 1) { at++; draw(); el.querySelector('.w-inner').scrollTop = 0; }
      else finish();
    });

    draw();
  });
}
