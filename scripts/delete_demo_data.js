/**
 * delete_demo_data.js — Clears all demo data across Firebase Realtime Database,
 * Firestore, and local server, ensuring only user-inputted data is stored.
 *
 * Usage: node scripts/delete_demo_data.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
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

const RTDB_URL = 'https://neersense-a5df3-default-rtdb.firebaseio.com';

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN || 'neersense-a5df3.firebaseapp.com',
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID || 'neersense-a5df3',
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET || 'neersense-a5df3.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

// ─── 1. Clean Firebase Realtime Database ─────────────────────────────────────
async function cleanRtdb() {
  console.log('\n🧹 1. Cleaning Firebase Realtime Database...');
  
  // Nodes to wipe completely
  const nodesToClear = [
    'waterReports',
    'symptoms',
    'alerts',
    'manualTests',
    'Asha_Workers',
    'monsoonData'
  ];

  for (const node of nodesToClear) {
    try {
      const res = await fetch(`${RTDB_URL}/${node}.json`, {
        method: 'DELETE',
      });
      if (res.ok) {
        console.log(`   ✅ Deleted RTDB node: /${node}`);
      } else {
        console.warn(`   ⚠️ Could not delete /${node}: ${res.status}`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Error deleting /${node}:`, err.message);
    }
  }

  // Clean villages of all demo risk scores/status
  const cleanVillages = {
    'vil-01': {
      id: 'vil-01',
      name: 'Gosaba Island (Rangabelia)',
      district: 'South 24 Parganas',
      state: 'West Bengal',
      coordinates: [22.1652, 88.8080],
      population: 11200,
      primarySource: 'Pond Sand Filter & Deep Tube Wells',
      riskScore: null,
      riskLevel: 'NO_DATA',
      status: 'NO_DATA',
      ashaWorker: 'Priyanka Mondal (ASHA-109)',
      panchayatHead: 'Subrata Das (Pradhan)',
      waterSourcesCount: 8,
      activeSensorsCount: 0,
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
      riskScore: null,
      riskLevel: 'NO_DATA',
      status: 'NO_DATA',
      ashaWorker: 'Kuni Majhi (ASHA-071)',
      panchayatHead: 'Laxman Nayak (Pradhan)',
      waterSourcesCount: 7,
      activeSensorsCount: 0,
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
      riskScore: null,
      riskLevel: 'NO_DATA',
      status: 'NO_DATA',
      ashaWorker: 'Anima Saikia (ASHA-042)',
      panchayatHead: 'Bhaben Roy (Pradhan)',
      waterSourcesCount: 6,
      activeSensorsCount: 0,
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
      riskScore: null,
      riskLevel: 'NO_DATA',
      status: 'NO_DATA',
      ashaWorker: 'Shabana Khan (ASHA-188)',
      panchayatHead: 'Mohd. Imran (Pradhan)',
      waterSourcesCount: 6,
      activeSensorsCount: 0,
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
      riskScore: null,
      riskLevel: 'NO_DATA',
      status: 'NO_DATA',
      ashaWorker: 'Lalita Mandavi (ASHA-019)',
      panchayatHead: 'Ramesh Murmu (Pradhan)',
      waterSourcesCount: 5,
      activeSensorsCount: 0,
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
      riskScore: null,
      riskLevel: 'NO_DATA',
      status: 'NO_DATA',
      ashaWorker: 'Sumita Soren (ASHA-055)',
      panchayatHead: 'Deben Hansda (Pradhan)',
      waterSourcesCount: 5,
      activeSensorsCount: 0,
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
      riskScore: null,
      riskLevel: 'NO_DATA',
      status: 'NO_DATA',
      ashaWorker: 'Rupa Jana (ASHA-088)',
      panchayatHead: 'Tarun Mondal (Pradhan)',
      waterSourcesCount: 8,
      activeSensorsCount: 0,
      updatedAt: Date.now()
    }
  };

  try {
    const res = await fetch(`${RTDB_URL}/villages.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanVillages),
    });
    if (res.ok) {
      console.log('   ✅ Reset RTDB /villages to clean state (no demo scores/alerts)');
    }
  } catch (err) {
    console.warn('   ⚠️ Error resetting RTDB villages:', err.message);
  }
}

// ─── 2. Clean Cloud Firestore ────────────────────────────────────────────────
async function cleanFirestore() {
  if (!firebaseConfig.apiKey) {
    console.log('\n⏩ 2. Skipping Firestore (no apiKey found)');
    return;
  }

  console.log('\n🧹 2. Cleaning Cloud Firestore demo collections...');
  try {
    const app = initializeApp(firebaseConfig, 'cleanerApp');
    const db = getFirestore(app);

    const collectionsToClean = [
      'waterReports',
      'symptomCases',
      'riskDashboards',
      'manualTests',
      'monsoonData'
    ];

    for (const colName of collectionsToClean) {
      try {
        const colRef = collection(db, colName);
        const snapshot = await getDocs(colRef);
        let count = 0;
        for (const docSnap of snapshot.docs) {
          await deleteDoc(doc(db, colName, docSnap.id));
          count++;
        }
        console.log(`   ✅ Firestore '${colName}': deleted ${count} demo documents`);
      } catch (err) {
        console.warn(`   ⚠️ Firestore '${colName}' cleanup error:`, err.message);
      }
    }
  } catch (err) {
    console.warn('   ⚠️ Firestore cleanup init error:', err.message);
  }
}

// ─── 3. Clean Local Express Server State ─────────────────────────────────────
async function cleanExpressServer() {
  console.log('\n🧹 3. Resetting local server state...');
  try {
    const res = await fetch('http://localhost:5000/api/admin/clear-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      console.log('   ✅ Express server state reset to clean empty state');
    } else {
      console.log('   ℹ️ Express server not responding at port 5000 (running in dev/static mode)');
    }
  } catch {
    console.log('   ℹ️ Express server not running (skipping REST reset)');
  }
}

async function main() {
  console.log('═════════════════════════════════════════════════════════');
  console.log('  NEERSENSE — DELETE ALL DEMO DATA SCRIPT');
  console.log('  Ensuring only user-inputted data will be stored.');
  console.log('═════════════════════════════════════════════════════════');

  await cleanRtdb();
  await cleanFirestore();
  await cleanExpressServer();

  console.log('\n═════════════════════════════════════════════════════════');
  console.log('🎉 ALL DEMO DATA HAS BEEN DELETED!');
  console.log('   The system is now completely clean.');
  console.log('   Only data submitted through forms will be stored.');
  console.log('═════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal error during cleanup:', err);
  process.exit(1);
});
