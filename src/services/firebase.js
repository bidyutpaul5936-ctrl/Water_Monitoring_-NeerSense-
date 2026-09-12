// firebase.js — NeerSense Firebase Initialization
// Project: neersense-1 | Realtime Database + Firestore

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://neersense-1-default-rtdb.asia-southeast1.firebasedatabase.app',
};

export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app;
let db;   // Firestore (optional, for reports/extended data)
let rtdb; // Realtime Database — primary store

try {
  if (!isFirebaseConfigured()) {
    console.warn('[NeerSense Firebase] Missing config — Firebase disabled.');
    app = null; db = null; rtdb = null;
  } else {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

    // ── Realtime Database (primary - Asia Southeast 1) ─────────────────────
    const rtdbUrl = firebaseConfig.databaseURL || 'https://neersense-1-default-rtdb.asia-southeast1.firebasedatabase.app';
    rtdb = getDatabase(app, rtdbUrl);
    console.info(`[NeerSense Firebase] ⚡ Realtime Database connected at ${rtdbUrl}`);

    // ── Firestore (secondary, for water reports / extended data) ───────────
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch (fsErr) {
      console.warn('[NeerSense Firebase] Firestore init warning:', fsErr.message);
      db = null;
    }
  }
} catch (err) {
  console.error('[NeerSense Firebase] Initialization error:', err);
  app = null; db = null; rtdb = null;
}

export { app, db, rtdb, firebaseConfig };
export default app;
