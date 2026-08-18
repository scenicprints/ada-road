// ═══════════════════════════════════════════════════════════════════════
//  FIREBASE CONFIG
//
//  These values are MEANT to be public — that is how Firebase is designed.
//  Nothing here is a password. What actually protects the data is the
//  security rules on Google's servers, which nobody can reach from here.
//  (This is exactly why a GitHub write token could not be used instead:
//   that one IS a password, and a web page cannot keep one.)
//
//  Project: ada-road · Spark (free) · Firestore nam5, production mode
// ═══════════════════════════════════════════════════════════════════════

export const FIREBASE = {
  apiKey: 'AIzaSyCuDByoMD4DfO4PI0oh0WgeSSNCdIHhuVg',
  authDomain: 'ada-road.firebaseapp.com',
  projectId: 'ada-road',
  storageBucket: 'ada-road.firebasestorage.app',
  messagingSenderId: '52043918041',
  appId: '1:52043918041:web:4cb72cbbda79268b2c6cc8',
};

/** The single shared plan both phones read and write. */
export const PLAN_ID = 'ada';

export const cloudConfigured = () => Boolean(FIREBASE.apiKey && FIREBASE.projectId);
