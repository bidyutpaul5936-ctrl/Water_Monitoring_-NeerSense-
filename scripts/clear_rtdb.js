/**
 * clear_rtdb.js — Clears all demo and seeded data from Firebase Realtime Database
 * Project: neersense-894ef
 * 
 * Clears:
 * - /waterReports
 * - /Hygiene_Department
 * - /Admin
 * - /Asha_Workers
 * - /alerts
 * - /symptoms
 * - /Villagers
 * - /manualTests
 * - /sensors
 * - /sensorNodes
 * - /monsoonData
 * - /users
 * - /asha_workers
 * - /hygiene_users
 * - /villagers
 * - /admin_users
 * - /citizens
 * - /system_credentials
 * - /system
 * 
 * Seeds only clean village references in /villages (8 West Bengal villages)
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, remove, get } from 'firebase/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      process.env[k.trim()] = v.join('=').trim();
    }
  }
}

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBKOF55TObY2Ulve891i-s-RKP4v9VcFtw',
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN || 'neersense-894ef.firebaseapp.com',
  databaseURL:       process.env.VITE_FIREBASE_DATABASE_URL || 'https://neersense-894ef-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID || 'neersense-894ef',
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET || 'neersense-894ef.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '629649423992',
  appId:             process.env.VITE_FIREBASE_APP_ID || '1:629649423992:web:ea5853dd3e6baa03d4b78d',
};

console.log('🚀 Initializing Firebase connection...');
console.log('Database URL:', firebaseConfig.databaseURL);
console.log('Project ID:  ', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app, firebaseConfig.databaseURL);

// Clean Reference Villages (names & locations only, 0 demo data)
const cleanVillages = {
  'vil-01': {
    id: 'vil-01',
    name: 'Gosaba Island (Rangabelia)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [22.1652, 88.8080],
    population: 11200,
    primarySource: 'Pond Sand Filter & Deep Tube Wells',
    updatedAt: Date.now()
  },
  'vil-02': {
    id: 'vil-02',
    name: 'Sagar Island (Gangasagar)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [21.6444, 88.0827],
    population: 9450,
    primarySource: 'Deep Tube Well & Pond Sand Filter',
    updatedAt: Date.now()
  },
  'vil-03': {
    id: 'vil-03',
    name: 'Kakdwip (Harwood Point)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [21.8767, 88.1887],
    population: 14200,
    primarySource: 'Piped Water Supply & Mark-II Tube Wells',
    updatedAt: Date.now()
  },
  'vil-04': {
    id: 'vil-04',
    name: 'Basanti (Sonakhali Char)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [22.1932, 88.7188],
    population: 8600,
    primarySource: 'Pond Sand Filter & Handpumps',
    updatedAt: Date.now()
  },
  'vil-05': {
    id: 'vil-05',
    name: 'Khatra (Mukutmanipur Dam)',
    district: 'Bankura',
    state: 'West Bengal',
    coordinates: [22.9817, 86.8528],
    population: 7800,
    primarySource: 'Dam Intake & Deep Bore Wells',
    updatedAt: Date.now()
  },
  'vil-06': {
    id: 'vil-06',
    name: 'Jhargram (Belpahari Forest)',
    district: 'Jhargram',
    state: 'West Bengal',
    coordinates: [22.6342, 86.7583],
    population: 6200,
    primarySource: 'Hilly Natural Spring & Ring Wells',
    updatedAt: Date.now()
  },
  'vil-07': {
    id: 'vil-07',
    name: 'Digha (Shankarpur Coastal)',
    district: 'Purba Medinipur',
    state: 'West Bengal',
    coordinates: [21.6266, 87.5074],
    population: 10400,
    primarySource: 'Deep Tube Well (Reverse Osmosis Unit)',
    updatedAt: Date.now()
  },
  'vil-08': {
    id: 'vil-08',
    name: 'Kaliachak (Sujapur GP)',
    district: 'Malda',
    state: 'West Bengal',
    coordinates: [24.9083, 88.0264],
    population: 15600,
    primarySource: 'Deep Aquifer Tube Wells & Standposts',
    updatedAt: Date.now()
  }
};

async function clearDatabase() {
  console.log('\n========================================');
  console.log('🧹 CLEARING ALL DATA FROM NEERSENSE RTDB 🧹');
  console.log('========================================\n');

  const nodesToClear = [
    'waterReports',
    'Hygiene_Department',
    'Admin',
    'Asha_Workers',
    'alerts',
    'symptoms',
    'Villagers',
    'manualTests',
    'sensors',
    'sensorNodes',
    'monsoonData',
    'users',
    'asha_workers',
    'hygiene_users',
    'villagers',
    'admin_users',
    'citizens',
    'system_credentials',
    'system'
  ];

  for (const node of nodesToClear) {
    try {
      await remove(ref(rtdb, node));
      console.log(`   ✅ Cleared /${node}`);
    } catch (err) {
      console.warn(`   ⚠️ Could not clear /${node}:`, err.message);
    }
  }

  // Set clean village references
  console.log('\nSetting clean village reference directory (8 West Bengal villages)...');
  await set(ref(rtdb, 'villages'), cleanVillages);
  console.log('   ✅ /villages initialized with 8 reference locations.');

  // Initialize clean admin session state
  await set(ref(rtdb, 'system/adminSession'), {
    isLoggedIn: false,
    updatedAt: Date.now()
  });
  console.log('   ✅ /system/adminSession set to unlocked/fresh.');

  console.log('\n======================================================');
  console.log('🎉 DATABASE IS NOW COMPLETELY CLEAN & READY FOR FRESH INPUT!');
  console.log('======================================================\n');
  process.exit(0);
}

clearDatabase().catch((err) => {
  console.error('❌ Clear failed:', err);
  process.exit(1);
});
