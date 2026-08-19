// ═══════════════════════════════════════════════════════════════════════
//  ADA'S ROAD
//
//  Hoy       — one step. Never two. Plus Ottis.
//  El parque — the roadmap. For feeling, not for doing.
//  El camino — every step in order, tickable in any order. Hard data.
//  Dinero    — costs and offsets, every figure editable.
//  Settings  — behind the gear: version, updates, sync.
// ═══════════════════════════════════════════════════════════════════════

import { PHASES, COSTS, SAYS, APP_NAME, QUESTIONS, SUB_RATE, SUB_DAYS_PER_WEEK, SUB_WEEKS } from './data.js';
import { ottisSVG, say } from './ottis.js';
import { mountRoadmap } from './roadmap.js';
import * as S from './store.js';
import { startCloud, cloud, onCloudStatus } from './cloud.js';
import { cloudConfigured } from './config.js';
import { runWelcome, needsWelcome, isInstalled } from './onboard.js';
import { celebrateStage } from './celebrate.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The built-in road plus anything she has added herself. */
function phaseSteps(phaseId) {
  const base = (PHASES.find(p => p.id === phaseId) || { steps: [] }).steps;
  return [...base, ...S.customSteps().filter(c => c.phase === phaseId)];
}
const allSteps = () => PHASES.flatMap(p => phaseSteps(p.id));
const nextStep = () => allSteps().find(s => !S.step(s.id).done && s.owner === 'you');
const doneCount = () => allSteps().filter(s => S.step(s.id).done).length;
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US');

let tab = 'hoy';
let mood = 'greet';
let restingToday = false;
let moodTimer = null;
let park = null;              // the roadmap, while it is mounted

/* ── Ottis ───────────────────────────────────────────────────────── */

function ottisBlock() {
  const nt = nextStep();
  let bucket, state;
  if (mood === 'dance')      { bucket = 'proud';    state = 'dance'; }
  else if (mood === 'proud') { bucket = 'proud';    state = 'proud'; }
  else if (!nt)              { bucket = 'finished'; state = 'proud'; }
  else if (restingToday)     { bucket = 'waiting';  state = 'tilt';  }
  else if (mood === 'greet') { bucket = 'greet';    state = 'greet'; }
  else                       { bucket = 'one';      state = 'idle';  }
  return `<div class="perch">${ottisSVG(state)}<p class="bubble">${esc(say(bucket, SAYS))}</p></div>`;
}

/** He reacts, then settles. He never stays excited. */
function setMood(next, settleAfter) {
  mood = next;
  clearTimeout(moodTimer);
  if (settleAfter) moodTimer = setTimeout(() => { mood = 'idle'; if (tab === 'hoy') render(); }, settleAfter);
}

/* ── screens ─────────────────────────────────────────────────────── */

function screenHoy() {
  const nt = nextStep();
  const total = allSteps().length;
  let card;

  if (!nt) {
    card = `<div class="card"><h2>That's the whole road.</h2><p>Every step is behind you.</p></div>`;
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
        ${linksFor(nt)}
        <button class="go" data-act="done" data-id="${nt.id}">I did it</button>
        <details class="more" ${st.note || st.date ? 'open' : ''}>
          <summary>Add a note or a date</summary>
          <label class="lab" for="d-${nt.id}">Target date</label>
          <input class="in" id="d-${nt.id}" type="date" value="${esc(st.date)}" data-act="date" data-id="${nt.id}"/>
          <label class="lab" for="n-${nt.id}">Notes</label>
          <textarea class="in" id="n-${nt.id}" rows="3" data-act="note" data-id="${nt.id}"
            placeholder="Who you spoke to, what they said">${esc(st.note)}</textarea>
        </details>
      </div>
      <button class="link centre" data-act="rest">Nothing I can do today</button>`;
  }
  return `${ottisBlock()}<p class="label">Today</p>${card}
    <p class="tally"><b>${doneCount()}</b> of ${total} steps behind her</p>`;
}

/** El camino — the hard data page. Every step is tickable, in any order,
 *  because she does not do them in the order the list happens to be in. */
function questionsBlock() {
  const total = QUESTIONS.reduce((t, g) => t + g.items.length, 0);
  const done = QUESTIONS.reduce((t, g) => t + g.items.filter(i => S.answer(i.id).trim()).length, 0);
  return `<details class="qs">
    <summary><b>Questions to ask</b><span>${done} of ${total} answered</span></summary>
    <p class="sub">Every answer here removes a guess from the plan.</p>
    ${QUESTIONS.map(g => `<div class="qgroup">
      <h4>${esc(g.who)}${g.tel ? ` <a class="steplink tel" href="tel:${esc(g.tel)}">Call</a>` : ''}</h4>
      ${g.items.map(i => `<div class="q" data-ans="${S.answer(i.id).trim() ? 1 : 0}">
        <p>${esc(i.q)}</p>
        <textarea class="in" rows="2" placeholder="What they told you"
          data-act="answer" data-id="${i.id}">${esc(S.answer(i.id))}</textarea>
      </div>`).join('')}
    </div>`).join('')}
  </details>`;
}

function screenCamino() {
  let n = 0;
  return `<h1>El camino</h1>
    <p class="sub">Every step, in order. Tick anything, whenever you did it.</p>
    ${questionsBlock()}` +
    PHASES.map(p => {
      const steps = phaseSteps(p.id);
      const d = steps.filter(s => S.step(s.id).done).length;
      const rows = steps.map(s => {
        n++;
        const st = S.step(s.id);
        return `<li data-done="${st.done ? 1 : 0}">
          <button class="tick" data-act="toggle" data-id="${s.id}"
                  aria-pressed="${st.done ? 'true' : 'false'}"
                  aria-label="${st.done ? 'Mark not done' : 'Mark done'}: ${esc(s.title)}">
            ${st.done ? '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.2 4.6 8.8 10 3.4"/></svg>' : ''}
          </button>
          <span class="n">${s.custom ? '&#9733;' : String(n).padStart(2, '0')}</span>
          <span class="t">${esc(s.title)}${st.date ? `<i>${esc(prettyDate(st.date))}</i>` : ''}
            ${s.custom && s.detail ? `<i>${esc(s.detail)}</i>` : ''}</span>
          ${s.owner === 'them' && !st.done ? '<span class="tag">Waiting</span>' : ''}
          ${s.custom ? `<span class="mine">
            <button data-act="cup" data-id="${s.id}" aria-label="Move up">&#8593;</button>
            <button data-act="cdown" data-id="${s.id}" aria-label="Move down">&#8595;</button>
            <button data-act="cedit" data-id="${s.id}" aria-label="Edit">&#9998;</button>
            <button data-act="cdel" data-id="${s.id}" aria-label="Delete">&#215;</button>
          </span>` : ''}
        </li>`;
      }).join('');
      return `<div class="phase"><b>${esc(p.title)}</b><span>${d}/${steps.length}</span></div>
              <ol class="road">${rows}</ol>
              <button class="addstep" data-act="cadd" data-phase="${p.id}">+ Add your own step here</button>`;
    }).join('');
}

function screenParque() {
  return `<div class="parkwrap" id="parkwrap">
      <div class="pctrls">
        <button type="button" data-act="pzin" aria-label="Zoom in">+</button>
        <button type="button" data-act="pzout" aria-label="Zoom out">&minus;</button>
        <button type="button" data-act="pwhole" aria-label="See the whole park">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/></svg>
        </button>
        <button type="button" data-act="phere" aria-label="Back to Ottis">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.4"/><circle cx="12" cy="12" r="8.2"/><path d="M12 1.6v2.6M12 19.8v2.6M22.4 12h-2.6M4.2 12H1.6"/></svg>
        </button>
      </div>
      <div class="phud" id="phud"><b></b><span></span></div>
      <div class="pcard" id="pcard" hidden>
        <button type="button" class="x" data-act="pclose" aria-label="Close">&times;</button>
        <b></b><h3></h3><p></p><i></i>
      </div>
    </div>`;
}

function moneyRows(list, side) {
  return list.map(c => `
    <div class="line">
      <span class="lb"><b>${esc(c.label)}</b>${c.note ? `<i>${esc(c.note)}</i>` : ''}</span>
      ${side === 'out' ? `<button class="paid" data-act="paid" data-id="${c.id}"
          aria-pressed="${S.paidState(c.id) ? 'true' : 'false'}"
          aria-label="Mark paid: ${esc(c.label)}">${S.paidState(c.id) ? 'Paid' : 'Pay'}</button>` : ''}
      <input class="amt" type="number" inputmode="numeric" min="0" step="1"
             value="${S.costOf(c.id)}" data-act="amt" data-id="${c.id}" aria-label="${esc(c.label)}"/>
    </div>`).join('');
}
const sum = (list) => list.reduce((t, c) => t + S.costOf(c.id), 0);

function screenDinero() {
  return `<h1>Dinero</h1>
    <p class="sub">Tap any figure to correct it as you confirm it.</p>
    <div class="card flat">
      <h3>What it costs</h3>
      ${moneyRows(COSTS.out, 'out')}
      <div class="total"><span>Total out</span><b id="tOut">${money(sum(COSTS.out))}</b></div>
    </div>
    <div class="card flat">
      <h3>What can come back</h3>
      <p class="hint">Grants are ceilings, not promises.</p>
      ${moneyRows(COSTS.in, 'in')}
      <div class="total"><span>Total in</span><b id="tIn" class="jade">${money(sum(COSTS.in))}</b></div>
    </div>
    ${netBlock()}`;
}

/** Dropping this was the mistake, not a simplification. She needs to know
 *  where she actually stands, not two totals she has to subtract herself. */
function netBlock() {
  const out = sum(COSTS.out), inn = sum(COSTS.in);
  const ahead = inn >= out;
  const paid = COSTS.out.filter(c => S.paidState(c.id)).reduce((t, c) => t + S.costOf(c.id), 0);
  const season = SUB_RATE * SUB_DAYS_PER_WEEK * SUB_WEEKS;
  return `<div class="card flat">
    <h3>Where you stand</h3>
    <div class="total" style="padding-top:6px">
      <span>${ahead ? 'Ahead by' : 'Out of pocket'}</span>
      <b id="tNet" class="${ahead ? 'jade' : ''}">${money(Math.abs(inn - out))}</b>
    </div>
    <p class="hint" id="tPaid">${money(paid)} of that is already paid.</p>
    <p class="note-soft">This leaves out the biggest number of all: a residency year
      with no teaching salary. Substitute work at about ${money(SUB_RATE)} a day is what
      bridges it &mdash; roughly <b>${money(season)}</b> over a school year at
      ${SUB_DAYS_PER_WEEK} days a week.</p>
  </div>`;
}

function screenSettings() {
  // Locally the placeholders are still in version.json — the deploy stamps
  // them. Never show her a raw placeholder.
  const stamped = (s) => (s && !s.includes('__')) ? s : '';
  const v = stamped(BUILD.version) || 'Development build';
  const built = stamped(BUILD.built);
  const syncLine = !cloudConfigured()
    ? 'Not set up yet — this phone is keeping its own copy.'
    : cloud.status === 'on'
      ? (cloud.readOnly ? 'Reading only — this is a development machine'
         : cloud.lastSync ? 'Synced ' + cloud.lastSync.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Connected')
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
    <div class="card flat"><h3>Sharing</h3><p class="hint">${esc(syncLine)}</p></div>
    <div class="card flat">
      <h3>Show me around</h3>
      <p class="hint">${isInstalled() ? 'The welcome again, from the beginning.'
        : 'The welcome again — including how to keep this on your home screen.'}</p>
      <button class="go quiet-go" data-act="tour">Show me around again</button>
    </div>
    <div class="card flat">
      <h3>Start over</h3>
      <p class="hint">Clears every tick, note and figure on this phone.</p>
      <button class="danger" data-act="reset">Erase everything</button>
    </div>`;
}

/** Her step mentions a place; give her the door rather than the name. */
function linksFor(st) {
  const bits = [];
  if (st.link) bits.push(
    '<a class="steplink" href="' + esc(st.link) + '" target="_blank" rel="noopener">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/>' +
    '<path d="M13.5 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.2-1.2"/></svg>' +
    esc(st.linkLabel || 'Open') + '</a>');
  if (st.tel) bits.push(
    '<a class="steplink tel" href="tel:' + esc(st.tel) + '">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z"/></svg>' +
    esc(st.telLabel || 'Call') + '</a>');
  return bits.length ? '<div class="steplinks">' + bits.join('') + '</div>' : '';
}

function prettyDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return '';
  return d + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
}

/* ── render ──────────────────────────────────────────────────────── */

const SCREENS = { hoy: screenHoy, parque: screenParque, camino: screenCamino, dinero: screenDinero, settings: screenSettings };

function render() {
  // The park owns a canvas and a requestAnimationFrame loop, so it has to
  // be torn down before the screen it lives on is thrown away.
  if (park) { park.destroy(); park = null; }

  $('#view').innerHTML = SCREENS[tab]();
  document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $('#gear').setAttribute('aria-selected', String(tab === 'settings'));
  document.body.dataset.tab = tab;

  if (tab === 'parque') mountPark();
}

function mountPark() {
  const host = $('#parkwrap');
  const steps = PHASES.flatMap(p => phaseSteps(p.id).map(s => ({ ...s, stageName: p.title })));
  const firstOpen = steps.findIndex(s => !S.step(s.id).done);
  const hud = $('#phud'), pcard = $('#pcard');

  park = mountRoadmap(host, {
    steps,
    currentIndex: firstOpen < 0 ? steps.length - 1 : firstOpen,
    onPick(s) {
      if (!s) { pcard.hidden = true; hud.hidden = false; return; }
      pcard.querySelector('b').textContent = s.stageName;
      pcard.querySelector('h3').textContent = s.title;
      pcard.querySelector('p').textContent = s.detail || '';
      const done = S.step(s.id).done;
      pcard.querySelector('i').textContent = done ? 'Done. Behind you.'
        : (s.i === (firstOpen < 0 ? steps.length - 1 : firstOpen) ? 'This is where you are.' : 'Ahead of you.');
      pcard.hidden = false; hud.hidden = true;
    },
  });
  hud.querySelector('b').textContent = steps[Math.max(0, firstOpen)] ? steps[Math.max(0, firstOpen)].stageName : '';
  hud.querySelector('span').textContent = steps[Math.max(0, firstOpen)] ? steps[Math.max(0, firstOpen)].title : '';
}

/* ── interaction ─────────────────────────────────────────────────── */

$('#view').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-act]');
  if (!b || b.tagName === 'INPUT' || b.tagName === 'TEXTAREA') return;
  const act = b.dataset.act;

  if (act === 'done') {
    const before = stageOf(b.dataset.id);
    S.setStep(b.dataset.id, { done: true });
    restingToday = false; setMood('proud', 3000); render();
    maybeCelebrate(before);
  } else if (act === 'toggle') {
    // Any step, any order — she does not do them in list order.
    const id = b.dataset.id;
    const before = stageOf(id);
    S.setStep(id, { done: !S.step(id).done });
    render();
    maybeCelebrate(before);
  }
  else if (act === 'paid')  { S.setPaid(b.dataset.id, !S.paidState(b.dataset.id)); render(); }
  else if (act === 'cadd')  { openStepEditor(null, b.dataset.phase); }
  else if (act === 'cedit') { openStepEditor(b.dataset.id); }
  else if (act === 'cdel')  {
    if (window.confirm('Delete this step? It disappears from both phones.')) { S.removeCustom(b.dataset.id); render(); }
  }
  else if (act === 'cup')   { S.moveCustom(b.dataset.id, -1); render(); }
  else if (act === 'cdown') { S.moveCustom(b.dataset.id, 1); render(); }
  else if (act === 'esave') { saveStepEditor(); }
  else if (act === 'ecancel') { closeStepEditor(); }
  else if (act === 'rest')   { restingToday = true;  setMood('idle'); render(); }
  else if (act === 'unrest') { restingToday = false; setMood('idle'); render(); }
  else if (act === 'reset')  { confirmReset(); }
  else if (act === 'update') { checkForUpdate(true); }
  else if (act === 'tour')   { runWelcome({ replay: true }); }
  else if (act === 'pzin')   { park && park.zoom(1.3); }
  else if (act === 'pzout')  { park && park.zoom(1 / 1.3); }
  else if (act === 'pwhole') { park && park.whole(); }
  else if (act === 'phere')  { park && park.focus(); }
  else if (act === 'pclose') { $('#pcard').hidden = true; $('#phud').hidden = false; }
});

// Typing must not re-render, or the field is replaced under her finger.
$('#view').addEventListener('input', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const { act, id } = el.dataset;
  if (act === 'note')        S.setStep(id, { note: el.value });
  else if (act === 'answer') S.setAnswer(id, el.value);
  else if (act === 'date')   S.setStep(id, { date: el.value });
  else if (act === 'amt') {
    S.setCost(id, el.value === '' ? 0 : Number(el.value));
    const o = $('#tOut'), i = $('#tIn'), n = $('#tNet'), pd = $('#tPaid');
    const out = sum(COSTS.out), inn = sum(COSTS.in);
    if (o) o.textContent = money(out);
    if (i) i.textContent = money(inn);
    if (n) {
      n.textContent = money(Math.abs(inn - out));
      n.classList.toggle('jade', inn >= out);
      n.closest('.total').querySelector('span').textContent = inn >= out ? 'Ahead by' : 'Out of pocket';
    }
    if (pd) pd.textContent = money(COSTS.out.filter(c => S.paidState(c.id)).reduce((t, c) => t + S.costOf(c.id), 0)) + ' of that is already paid.';
  }
});

/** Which stage a step belongs to, and whether that stage was finished. */
function stageOf(id) {
  for (const p of PHASES) {
    const steps = phaseSteps(p.id);
    if (steps.some(s => s.id === id)) {
      return { phase: p, wasComplete: steps.every(s => S.step(s.id).done) };
    }
  }
  return null;
}

/** Fires once, when a whole stage closes — never for a single step, or it
 *  stops meaning anything. */
function maybeCelebrate(before) {
  if (!before || before.wasComplete) return;
  const steps = phaseSteps(before.phase.id);
  if (!steps.length || !steps.every(s => S.step(s.id).done)) return;
  setMood('dance', 5200);
  render();
  celebrateStage(before.phase.title, say('proud', SAYS)).then(() => {
    setMood('idle'); render();
  });
}

/* ── her own steps ─────────────────────────────────────────────────── */
let editing = null;

function openStepEditor(id, phase) {
  const c = id ? S.customSteps().find(x => x.id === id) : null;
  editing = { id, phase: c ? c.phase : phase };
  const el = document.createElement('div');
  el.className = 'editor';
  el.id = 'editor';
  el.innerHTML = `<div class="ed-card">
      <h3>${id ? 'Edit your step' : 'Add a step'}</h3>
      <label class="lab" for="ed-t">What is it?</label>
      <input class="in" id="ed-t" type="text" maxlength="90"
        placeholder="Call the district back" value="${esc(c ? c.title : '')}"/>
      <label class="lab" for="ed-d">Any detail (optional)</label>
      <textarea class="in" id="ed-d" rows="2"
        placeholder="Who, what, anything you want to remember">${esc(c ? (c.detail || '') : '')}</textarea>
      <label class="lab">Whose move is it?</label>
      <div class="ed-owner">
        <label><input type="radio" name="edo" value="you" ${!c || c.owner === 'you' ? 'checked' : ''}/> Mine</label>
        <label><input type="radio" name="edo" value="them" ${c && c.owner === 'them' ? 'checked' : ''}/> Waiting on someone</label>
      </div>
      <div class="ed-row">
        <button class="link" data-act="ecancel">Cancel</button>
        <button class="go" data-act="esave">${id ? 'Save' : 'Add it'}</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  // The editor lives outside #view, so the app's delegated click handler
  // never sees it — Save silently did nothing. It wires its own buttons.
  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'esave') saveStepEditor();
    else if (b.dataset.act === 'ecancel') closeStepEditor();
  });
  setTimeout(() => { const t = document.getElementById('ed-t'); if (t) t.focus(); }, 40);
}
function closeStepEditor() {
  const el = document.getElementById('editor');
  if (el) el.remove();
  editing = null;
}
function saveStepEditor() {
  const title = (document.getElementById('ed-t').value || '').trim();
  if (!title) { document.getElementById('ed-t').focus(); return; }
  const detail = (document.getElementById('ed-d').value || '').trim();
  const owner = (document.querySelector('input[name="edo"]:checked') || { value: 'you' }).value;
  if (editing.id) S.editCustom(editing.id, { title, detail, owner });
  else S.addCustom({ title, detail, owner, phase: editing.phase });
  closeStepEditor();
  render();
}
document.addEventListener('click', (ev) => {
  const el = document.getElementById('editor');
  if (el && ev.target === el) closeStepEditor();
});

function confirmReset() {
  if (!window.confirm('Erase every tick, note and figure on this phone?')) return;
  S.state.steps = {}; S.state.costs = {}; S.state.custom = {}; S.state.answers = {};
  S.saveNow(); restingToday = false; render();
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
    } else if (loud && msg) msg.textContent = 'This is the latest version.';
  } catch (e) {
    if (loud && msg) msg.textContent = 'Could not check. Are you online?';
  }
}
function showBanner(version) {
  $('#banner').hidden = false;
  $('#bannerText').textContent = 'Version ' + version + ' is ready';
}
$('#bannerGo').addEventListener('click', async () => {
  $('#bannerGo').textContent = 'Updating…';
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) { await reg.update(); if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' }); }
  } catch (e) {}
  setTimeout(() => location.reload(), 400);
});

/* ── boot ────────────────────────────────────────────────────────── */

const NAV = [['hoy', 'Hoy'], ['parque', 'El parque'], ['camino', 'El camino'], ['dinero', 'Dinero']];
const ICONS = {
  hoy: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
  parque: '<path d="M12 13.5 6.5 20h11z"/><path d="M12 4 8 10.5h8z"/><path d="M12 20v1.6"/><path d="M4 21.4h16"/>',
  camino: '<path d="M8.5 21c0-4.2 7-5.2 7-9.2s-6-4.6-6-8.6"/><circle cx="9.5" cy="3.2" r="1.5"/>',
  dinero: '<circle cx="12" cy="12" r="8.4"/><path d="M14.5 9.3c-.6-.9-1.6-1.3-2.6-1.3-1.4 0-2.4.8-2.4 1.9 0 2.6 5 1.4 5 4.1 0 1.2-1.1 2-2.6 2-1.1 0-2.1-.4-2.7-1.3"/><path d="M12 6.4v11.2"/>',
};
const nav = $('#nav');
NAV.forEach(([k, label]) => {
  const b = document.createElement('button');
  b.type = 'button'; b.dataset.tab = k;
  b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>${label}`;
  b.addEventListener('click', () => { tab = k; render(); $('#view').scrollTop = 0; });
  nav.appendChild(b);
});
$('#gear').addEventListener('click', () => { tab = tab === 'settings' ? 'hoy' : 'settings'; render(); $('#view').scrollTop = 0; });

document.title = APP_NAME;

const storageWorks = S.load();
S.subscribe(() => { if (tab === 'camino' || tab === 'hoy') render(); });
onCloudStatus(() => { if (tab === 'settings') render(); });

render();

if (needsWelcome()) {
  // Ottis does the greeting inside the welcome, so hold his in-app greeting
  // until she has closed it — otherwise he has already said hello to a
  // screen she never saw.
  runWelcome().then(() => { setMood('greet', 2600); render(); setTimeout(() => { if (tab === 'hoy') render(); }, 2650); });
} else {
  setMood('greet', 2600);
  setTimeout(() => { if (tab === 'hoy') render(); }, 2650);
}

if (!storageWorks) {
  $('#banner').hidden = false;
  $('#bannerText').textContent = "This browser won't save anything — try a normal tab";
  $('#bannerGo').hidden = true;
}

readVersion().then(v => {
  BUILD.version = v.version || ''; BUILD.built = v.built || '';
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

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && BUILD.version) checkForUpdate(false);
});
