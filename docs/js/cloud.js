// ═══════════════════════════════════════════════════════════════════════
//  SYNC
//
//  Keeps Kevin's Android and Ada's iPhone looking at the same plan.
//
//  Deliberately optional: if config.js hasn't been filled in, every
//  function here quietly does nothing and the app runs on local storage
//  alone. Nothing breaks, it just doesn't share.
//
//  Offline is handled by Firestore itself — writes made with no signal are
//  queued on the phone and sent when it comes back.
// ═══════════════════════════════════════════════════════════════════════

import { FIREBASE, PLAN_ID, cloudConfigured } from './config.js';
import { state, mergeRemote, connectCloud } from './store.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.5/';

export const cloud = {
  status: cloudConfigured() ? 'connecting' : 'off',
  lastSync: null,
  error: '',
};

let docRef = null, setDocFn = null, statusChanged = () => {};

export function onCloudStatus(fn) { statusChanged = fn; }

function mark(status, error = '') {
  cloud.status = status;
  cloud.error = error;
  statusChanged();
}

export async function startCloud() {
  if (!cloudConfigured()) return;

  try {
    const [{ initializeApp }, auth, fs] = await Promise.all([
      import(SDK + 'firebase-app.js'),
      import(SDK + 'firebase-auth.js'),
      import(SDK + 'firebase-firestore.js'),
    ]);

    const app = initializeApp(FIREBASE);

    // Anonymous sign-in: no login screen for Ada, but the rules can still
    // refuse anybody who isn't signed in at all.
    await auth.signInAnonymously(auth.getAuth(app));

    let db;
    try {
      db = fs.initializeFirestore(app, {
        localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
      });
    } catch (e) {
      db = fs.getFirestore(app);   // persistence unavailable; still works online
    }

    docRef = fs.doc(db, 'plans', PLAN_ID);
    setDocFn = (data) => fs.setDoc(docRef, data, { merge: true });

    // Anything the other phone writes lands here.
    fs.onSnapshot(docRef,
      (snap) => {
        mark('on');
        cloud.lastSync = new Date();
        if (snap.exists()) mergeRemote(snap.data());
      },
      (err) => mark('error', err.code || 'unavailable')
    );

    connectCloud(push);
    push(state);
  } catch (e) {
    mark('error', (e && e.code) || 'failed to start');
  }
}

let pending = null, timer = null;

/** Debounced, because ticking three steps quickly shouldn't be three writes. */
function push(snapshot) {
  if (!setDocFn) return;
  pending = { steps: snapshot.steps, costs: snapshot.costs,
              custom: snapshot.custom, answers: snapshot.answers };
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      await setDocFn(pending);
      cloud.lastSync = new Date();
      if (cloud.status !== 'on') mark('on');
    } catch (e) {
      // Offline writes are queued by Firestore, so this is not an error
      // worth showing her.
      mark('error', (e && e.code) || 'write failed');
    }
  }, 700);
}
