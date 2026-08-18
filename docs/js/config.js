// ═══════════════════════════════════════════════════════════════════════
//  FIREBASE CONFIG
//
//  These values are MEANT to be public — that is how Firebase is designed.
//  Nothing here is a password. What actually protects the data is the
//  security rules on Google's servers, which nobody can reach from here.
//  (This is exactly why a GitHub write token could not be used instead:
//   that one IS a password, and a web page cannot keep one.)
//
//  Until this is filled in, the app runs perfectly well on one phone —
//  it just doesn't share anything with the other one.
// ═══════════════════════════════════════════════════════════════════════

export const FIREBASE = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

/** The single shared plan both phones read and write. */
export const PLAN_ID = 'ada';

export const cloudConfigured = () => Boolean(FIREBASE.apiKey && FIREBASE.projectId);
