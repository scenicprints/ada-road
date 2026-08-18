// ═══════════════════════════════════════════════════════════════════════
//  ADA'S ROAD
//
//  Hoy      — one step. Never two. Plus Ottis.
//  El camino— every step in order. A reference page, no encouragement.
//  Dinero   — costs and offsets, every figure editable.
//  Settings — version, updates, sync.
// ═══════════════════════════════════════════════════════════════════════

import { PHASES, COSTS, SAYS, APP_NAME } from './data.js';
import { ottisSVG, say } from './ottis.js';
import * as S from './store.js';
import { startCloud, cloud, onCloudStatus } from './cloud.js';
import { cloudConfigured } from './config.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const allSteps = () => PHASES.flatMap(p => p.steps);
const nextStep = () => allSteps().find(s => !S.step(s.id).done && s.owner === 'you');
const doneCount = () => allSteps().filter(s => S.step(s.id).done).length;
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US');

let tab = 'hoy';
let mood = 'greet';          // what Ottis is doing right now
let restingToday = false;    // she tapped "nothing I can do today"
let moodTimer = null;

/* ── Ottis ───────────────────────────────────────────────────────── */

function ottisBlock() {
  const nt = nextStep();
  let bucket, state;

  if (mood === 'proud')            { bucket = 'proud';    state = 'proud'; }
  else if (!nt)                    { bucket = 'finished'; state = 'proud'; }
  else if (restingToday)           { bucket = 'waiting';  state = 'tilt';  }
  else if (mood === 'greet')       { bucket = 'greet';    state = 'greet'; }
  else                             { bucket = 'one';      state = 'idle';  }

  return `
    <div class="perch">
      ${ottisSVG(state)}
      <p class="bubble" id="bubble">${esc(say(bucket, SAYS))}</p>
    </div>`;
}

/** He reacts, then settles back down. He never stays excited. */
function setMood(next, settleAfter) {
  mood = next;
  clearTimeout(moodTimer);
  if (settleAfter) {
    moodTimer = setTimeout(() => { mood = 'idle'; if (tab === 'hoy') render(); }, settleAfter);
  }
}

/* ── screens ─────────────────────────────────────────────────────── */

function screenHoy() {
  const nt = nextStep();
  const total = allSteps().length;
  let card;

  if (!nt) {
    card = `
      <div class="card">
        <h2>That's the whole road.</h2>
        <p>Every step is behind you.</p>
      </div>`;
  } else if (restingToday) {
    const waits = allSteps().filter(s => !S.step(s.id).done && s.owner === 'them');
    card = `
      <div class="card">
        <span class="pill wait">Waiting on someone else</span>
        <h2>Nothing needs you today.</h2>
        ${waits.length ? `<p>Still out with someone else: ${esc(waits.map(w => w.title).join('; '))}.</p>` : ''}
        <button class="link" data-act="unrest">Show me my next step anyway</button>
      </div>`;
  } else {
    const st = S.step(nt.id);
    card = `
      <div class="card">
        <span class="pill">Your move</span>
        <h2>${esc(nt.title)}</h2>
        ${nt.detail ? `<p>${esc(nt.detail)}</p>` : ''}
        <button class="go" data-act="done" data-id="${nt.id}">I did it</button>
        <details class="more" ${st.note || st.date ? 'open' : ''}>
          <summary>Add a note or a date</summary>
          <label class="lab" for="d-${nt.id}">Target date</label>
          <input class="in" id="d-${nt.id}" type="date" value="${esc(st.date)}"
                 data-act="date" data-id="${nt.id}"/>
          <label class="lab" for="n-${nt.id}">Notes</label>
          <textarea class="in" id="n-${nt.id}" rows="3" data-act="note" data-id="${nt.id}"
            placeholder="Who you spoke to, what they said">${esc(st.note)}</textarea>
        </details>
      </div>
      <button class="link centre" data-act="rest">Nothing I can do today</button>`;
  }

  return `
    ${ottisBlock()}
    <p class="label">Today</p>
    ${card}
    <p class="tally"><b>${doneCount()}</b> of ${total} steps behind her</p>`;
}

function screenCamino() {
  let n = 0;
  return `<h1>El camino</h1>
    <p class="sub">Every step, in order. Grey means done.</p>` +
    PHASES.map(p => {
      const d = p.steps.filter(s => S.step(s.id).done).length;
      const rows = p.steps.map(s => {
        n++;
        const st = S.step(s.id);
        return `<li data-done="${st.done ? 1 : 0}">
          <span class="n">${String(n).padStart(2, '0')}</span>
          <span class="t">${esc(s.title)}${st.date ? `<i>${esc(prettyDate(st.date))}</i>` : ''}</span>
          ${s.owner === 'them' && !st.done ? '<span class="tag">Waiting</span>' : ''}
        </li>`;
      }).join('');
      return `<div class="phase"><b>${esc(p.title)}</b><span>${d}/${p.steps.length}</span></div>
              <ol class="road">${rows}</ol>`;
    }).join('');
}

function moneyRows(list) {
  return list.map(c => `
    <div class="line">
      <span class="lb"><b>${esc(c.label)}</b>${c.note ? `<i>${esc(c.note)}</i>` : ''}</span>
      <input class="amt" type="number" inputmode="numeric" min="0" step="1"
             value="${S.costOf(c.id)}" data-act="amt" data-id="${c.id}"
             aria-label="${esc(c.label)}"/>
    </div>`).join('');
}

function screenDinero() {
  return `<h1>Dinero</h1>
    <p class="sub">Tap any figure to correct it as you confirm it.</p>
    <div class="card flat">
      <h3>What it costs</h3>
      ${moneyRows(COSTS.out)}
      <div class="total"><span>Total out</span><b id="tOut">${money(sum(COSTS.out))}</b></div>
    </div>
    <div class="card flat">
      <h3>What can come back</h3>
      <p class="hint">Grants are ceilings, not promises.</p>
      ${moneyRows(COSTS.in)}
      <div class="total"><span>Total in</span><b id="tIn" class="jade">${money(sum(COSTS.in))}</b></div>
    </div>`;
}

const sum = (list) => list.reduce((t, c) => t + S.costOf(c.id), 0);

function screenSettings() {
  // Locally the placeholders are still in version.json — the deploy stamps
  // them. Never show her a raw placeholder.
  const stamped = (s) => (s && !s.includes('__')) ? s : '';
  const v = stamped(BUILD.version) || 'Development build';
  const built = stamped(BUILD.built);
  const syncLine = !cloudConfigured()
    ? 'Not set up yet — this phone is keeping its own copy.'
    : cloud.status === 'on'
      ? (cloud.lastSync ? 'Synced ' + cloud.lastSync.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Connected')
      : cloud.status === 'connecting' ? 'Connecting…'
      : 'Offline — changes are saved here and will sync later';

  return `<h1>Settings</h1>
    <div class="card flat">
      <h3>Version</h3>
      <p class="big-v">${esc(v)}</p>
      <p class="hint">${esc(built ? 'Built ' + built.replace('T', ' ').replace('Z', ' UTC') : '')}</p>
      <button class="go quiet-go" data-act="update">Check for updates</button>
      <p class="hint" id="updMsg"></p>
    </div>
    <div class="card flat">
      <h3>Sharing</h3>
      <p class="hint">${esc(syncLine)}</p>
    </div>
    <div class="card flat">
      <h3>Start over</h3>
      <p class="hint">Clears every tick, note and figure on this phone.</p>
      <button class="danger" data-act="reset">Erase everything</button>
    </div>`;
}

function prettyDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return '';
  return d + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
}

/* ── render ──────────────────────────────────────────────────────── */

const SCREENS = { hoy: screenHoy, camino: screenCamino, dinero: screenDinero, settings: screenSettings };

function render() {
  $('#view').innerHTML = SCREENS[tab]();
  document.querySelectorAll('#nav button').forEach(b =>
    b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $('#gear').setAttribute('aria-selected', String(tab === 'settings'));
}

/* ── interaction ─────────────────────────────────────────────────── */

$('#view').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-act]');
  if (!b || b.tagName === 'INPUT' || b.tagName === 'TEXTAREA') return;
  const act = b.dataset.act;

  if (act === 'done') {
    S.setStep(b.dataset.id, { done: true });
    restingToday = false;
    setMood('proud', 3000);
    render();
  } else if (act === 'rest') {
    // Clear whatever he was doing, or a still-running proud reaction leaves
    // him celebrating over a card that says nothing needs her today.
    restingToday = true;  setMood('idle'); render();
  } else if (act === 'unrest') {
    restingToday = false; setMood('idle'); render();
  }
  else if (act === 'reset')    { confirmReset(); }
  else if (act === 'update')   { checkForUpdate(true); }
});

// Typing must not re-render, or the field is replaced under her finger.
$('#view').addEventListener('input', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const { act, id } = el.dataset;
  if (act === 'note')      S.setStep(id, { note: el.value });
  else if (act === 'date') S.setStep(id, { date: el.value });
  else if (act === 'amt') {
    S.setCost(id, el.value === '' ? 0 : Number(el.value));
    const o = $('#tOut'), i = $('#tIn');
    if (o) o.textContent = money(sum(COSTS.out));
    if (i) i.textContent = money(sum(COSTS.in));
  }
});

function confirmReset() {
  if (!window.confirm('Erase every tick, note and figure on this phone?')) return;
  S.state.steps = {}; S.state.costs = {};
  S.saveNow();
  restingToday = false;
  render();
}

/* ── updates ─────────────────────────────────────────────────────── */

export const BUILD = { version: '', built: '' };

async function readVersion() {
  const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error('no version file');
  return r.json();
}

async function checkForUpdate(loud) {
  const msg = $('#updMsg');
  if (loud && msg) msg.textContent = 'Checking…';
  try {
    const v = await readVersion();
    if (v.version && v.version !== BUILD.version) {
      showBanner(v.version);
      if (loud && msg) msg.textContent = 'Version ' + v.version + ' is ready.';
    } else if (loud && msg) {
      msg.textContent = 'This is the latest version.';
    }
  } catch (e) {
    if (loud && msg) msg.textContent = 'Could not check. Are you online?';
  }
}

function showBanner(version) {
  const bar = $('#banner');
  bar.hidden = false;
  $('#bannerText').textContent = 'Version ' + version + ' is ready';
}

$('#bannerGo').addEventListener('click', async () => {
  $('#bannerGo').textContent = 'Updating…';
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.update();
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  } catch (e) {}
  setTimeout(() => location.reload(), 400);
});

/* ── boot ────────────────────────────────────────────────────────── */

const NAV = [['hoy', 'Hoy'], ['camino', 'El camino'], ['dinero', 'Dinero']];
const ICONS = {
  hoy: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
  camino: '<path d="M8.5 21c0-4.2 7-5.2 7-9.2s-6-4.6-6-8.6"/><circle cx="9.5" cy="3.2" r="1.5"/>',
  dinero: '<circle cx="12" cy="12" r="8.4"/><path d="M14.5 9.3c-.6-.9-1.6-1.3-2.6-1.3-1.4 0-2.4.8-2.4 1.9 0 2.6 5 1.4 5 4.1 0 1.2-1.1 2-2.6 2-1.1 0-2.1-.4-2.7-1.3"/><path d="M12 6.4v11.2"/>',
};

const nav = $('#nav');
NAV.forEach(([k, label]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.tab = k;
  b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>${label}`;
  b.addEventListener('click', () => { tab = k; render(); $('#view').scrollTop = 0; });
  nav.appendChild(b);
});

$('#gear').addEventListener('click', () => {
  tab = tab === 'settings' ? 'hoy' : 'settings';
  render();
  $('#view').scrollTop = 0;
});

document.title = APP_NAME;

const storageWorks = S.load();
S.subscribe(() => {
  // A change arriving from the other phone should repaint what she's looking at.
  if (tab === 'camino' || tab === 'hoy') render();
});
onCloudStatus(() => { if (tab === 'settings') render(); });

render();
setMood('greet', 2600);
setTimeout(() => { if (tab === 'hoy') render(); }, 2650);

if (!storageWorks) {
  $('#banner').hidden = false;
  $('#bannerText').textContent = "This browser won't save anything — try a normal tab";
  $('#bannerGo').hidden = true;
}

readVersion().then(v => {
  BUILD.version = v.version || '';
  BUILD.built = v.built || '';
  if (tab === 'settings') render();
}).catch(() => {});

startCloud();

// The service worker is what makes the app open with no signal. It also
// caches the code, so on localhost it happily serves yesterday's build and
// you debug a ghost. Off by default when developing; add ?sw=1 to test it.
const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
if ('serviceWorker' in navigator && (!LOCAL || location.search.includes('sw=1'))) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Check for a new build when she comes back to the app, not on a timer.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && BUILD.version) checkForUpdate(false);
});
