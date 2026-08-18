// ═══════════════════════════════════════════════════════════════════════
//  STATE
//
//  Two layers, deliberately:
//
//    data.js  — the steps themselves. Comes from the app. Kevin edits it
//               and pushes; both phones get the new wording.
//    here     — what has happened to each step, keyed by its ID.
//
//  Because progress is keyed by ID and never by wording, the steps can be
//  rewritten, reordered or replaced without anyone losing a tick.
//
//  It saves to the phone first, always, so the app works with no signal.
//  The cloud copy is what keeps Kevin's Android and Ada's iPhone agreeing.
// ═══════════════════════════════════════════════════════════════════════

import { COSTS } from './data.js';

const KEY = 'ada-road';
const SCHEMA = 1;

/** Every item carries the time it changed, so two phones can be merged
 *  item by item instead of one overwriting the other wholesale. */
export const state = {
  schema: SCHEMA,
  steps: {},   // id -> { done, note, date, at }
  costs: {},   // id -> { amt, at }
  seen: {},    // small ui flags
};

let onChange = () => {};
export function subscribe(fn) { onChange = fn; }

/* ── reading ─────────────────────────────────────────────────────── */

export function step(id) {
  return state.steps[id] || { done: false, note: '', date: '' };
}

export function costOf(id) {
  if (state.costs[id] && typeof state.costs[id].amt === 'number') return state.costs[id].amt;
  const seed = [...COSTS.out, ...COSTS.in].find(c => c.id === id);
  return seed ? seed.amt : 0;
}

/* ── writing ─────────────────────────────────────────────────────── */

export function setStep(id, patch) {
  state.steps[id] = { ...step(id), ...patch, at: Date.now() };
  persist();
}

export function setCost(id, amt) {
  state.costs[id] = { amt, at: Date.now() };
  persist();
}

/* ── the phone's own copy ────────────────────────────────────────── */

export function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); }
  catch (e) { return false; }          // private browsing; app still runs
  if (!raw) return true;
  try {
    const saved = JSON.parse(raw);
    state.steps = saved.steps || {};
    state.costs = saved.costs || {};
    state.seen  = saved.seen  || {};
  } catch (e) {
    // Keep the damaged copy rather than destroying it silently.
    try { localStorage.setItem(KEY + '-broken-' + Date.now(), raw); } catch (e2) {}
  }
  return true;
}

let timer = null;
function persist() {
  // Deliberately does NOT notify. A local edit is already on screen, and
  // repainting here would replace the text box she is typing into — which
  // drops focus and loses the rest of the word. Only a change arriving
  // from the other phone triggers a repaint (see mergeRemote).
  clearTimeout(timer);
  timer = setTimeout(saveNow, 250);
}

export function saveNow() {
  clearTimeout(timer);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  pushUp(state);
}

// iOS kills a backgrounded web app without warning, so write on the way out.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveNow();
});

/* ── the shared copy ─────────────────────────────────────────────── */

let pushUp = () => {};
export function connectCloud(push) { pushUp = push; }

/**
 * Merge a copy that arrived from the other phone. Newest wins, per item,
 * so both people can be editing different things at the same time without
 * either of them losing work.
 */
export function mergeRemote(remote) {
  if (!remote) return false;
  let changed = false;
  for (const bag of ['steps', 'costs']) {
    const incoming = remote[bag] || {};
    for (const id of Object.keys(incoming)) {
      const mine = state[bag][id];
      const theirs = incoming[id];
      if (!theirs) continue;
      if (!mine || (theirs.at || 0) > (mine.at || 0)) {
        state[bag][id] = theirs;
        changed = true;
      }
    }
  }
  if (changed) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    onChange();
  }
  return changed;
}
