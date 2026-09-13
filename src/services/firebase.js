// firebase.js — NeerSense Firebase Initialization
// Project: neersense-894ef | Realtime Database + Firestore

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyBKOF55TObY2Ulve891i-s-RKP4v9VcFtw',
  authDomain:        import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'neersense-894ef.firebaseapp.com',
  projectId:         import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'neersense-894ef',
  storageBucket:     import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'neersense-894ef.firebasestorage.app',
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '629649423992',
  appId:             import.meta.env?.VITE_FIREBASE_APP_ID || '1:629649423992:web:ea5853dd3e6baa03d4b78d',
  measurementId:     import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || 'G-8TC8D2N21X',
  databaseURL:       import.meta.env?.VITE_FIREBASE_DATABASE_URL || 'https://neersense-894ef-default-rtdb.asia-southeast1.firebasedatabase.app',
};

export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.projectId && firebaseConfig.databaseURL);

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
    const rtdbUrl = firebaseConfig.databaseURL || 'https://neersense-894ef-default-rtdb.asia-southeast1.firebasedatabase.app';
    rtdb = getDatabase(app, rtdbUrl);
    // console.info(`[NeerSense Firebase] ⚡ Realtime Database connected at ${rtdbUrl}`);

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

export { app, db, rtdb, rtdb as database, firebaseConfig };
export default app;
