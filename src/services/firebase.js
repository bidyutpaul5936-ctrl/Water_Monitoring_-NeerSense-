// firebase.js — NeerSense Firebase Initialization (Firestore + Realtime Database)
// All config values are loaded from environment variables (VITE_ prefix for Vite)

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  enableIndexedDbPersistence,
  connectFirestoreEmulator
} from 'firebase/firestore';
import {
  getDatabase,
  connectDatabaseEmulator
} from 'firebase/database';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyNeerSenseDefaultKey_2026',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'neersense-a5df3.firebaseapp.com',
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://neersense-a5df3-default-rtdb.firebaseio.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || 'neersense-a5df3',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'neersense-a5df3.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || '1:1029384756:web:neersenseweb',
};

// Check if Firebase project is configured
export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.projectId);

// Initialize Firebase only once (avoid duplicate app errors in HMR)
let app;
let db;
let rtdb;

try {
  if (!isFirebaseConfigured()) {
    console.warn('[NeerSense Firebase] Missing Firebase config — Firebase disabled.');
    app = null;
    db = null;
    rtdb = null;
  } else {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);

    // Initialize Realtime Database (RTDB)
    try {
      rtdb = getDatabase(app, firebaseConfig.databaseURL);
      console.info(`[NeerSense Firebase] ⚡ Realtime Database connected: ${firebaseConfig.databaseURL}`);
    } catch (rtdbErr) {
      console.warn('[NeerSense Firebase] RTDB init warning:', rtdbErr.message);
      rtdb = null;
    }

    // Enable offline persistence (IndexedDB) for Firestore
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('[NeerSense Firebase] Offline persistence failed — multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        console.warn('[NeerSense Firebase] Offline persistence not supported in this browser.');
      }
    });

    // Optionally connect to local emulator
    if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      connectFirestoreEmulator(db, 'localhost', 8080);
      if (rtdb) connectDatabaseEmulator(rtdb, 'localhost', 9000);
      console.info('[NeerSense Firebase] Connected to local Firebase emulators');
    }

    console.info(`[NeerSense Firebase] Project connected: ${firebaseConfig.projectId}`);
  }
} catch (err) {
  console.error('[NeerSense Firebase] Initialization error:', err);
  app = null;
  db = null;
  rtdb = null;
}

export { app, db, rtdb, firebaseConfig };
export default app;
