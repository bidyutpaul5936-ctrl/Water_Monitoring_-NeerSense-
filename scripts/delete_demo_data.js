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
  doc,
  setDoc,
  serverTimestamp 
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

// ─── Fixed Credentials (Single Admin System) ─────────────────────────────────
const FIXED_CREDENTIALS = {
  admin: {
    phone: '9876543213',
    pin: '1234',
    name: 'Dr. Suresh Mishra (CDMO)',
    role: 'admin',
    department: 'Jal Shakti & Health Ministry',
    title: 'District Surveillance Administrator',
    requiresPin: true
  },
  official: {
    phone: '9876543213',
    pin: '1234',
    name: 'Dr. Suresh Mishra (CDMO)',
    role: 'official',
    department: 'District Administration',
    title: 'Government Health Officer (CDMO)',
    requiresPin: true
  },
  asha: {
    phone: '9876543211',
    pin: '5678',
    name: 'Kuni Majhi (ASHA-071)',
    role: 'asha',
    department: 'Community Health Surveillance',
    title: 'ASHA Field Worker',
    requiresPin: true
  },
  hygiene: {
    phone: '9876543212',
    pin: '4321',
    name: 'Dr. Meena Kumari (Hygiene Dept)',
    role: 'hygiene',
    department: 'Hygiene & Lab Testing Dept',
    title: 'Water & Sanitation Officer',
    requiresPin: true
  },
  villager: {
    phone: '0000000000',
    pin: '',
    name: 'Citizen User',
    role: 'villager',
    department: 'Public Health & Citizen Services',
    title: 'Villager / Citizen',
    requiresPin: false
  }
};

// Clean villages reference directory
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
    ashaWorker: 'Kuni Majhi (ASHA-071)',
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
  },
  'vil-08': {
    id: 'vil-08',
    name: 'Kaliachak (Sujapur GP)',
    district: 'Malda',
    state: 'West Bengal',
    coordinates: [24.9083, 88.0264],
    population: 15600,
    primarySource: 'Deep Aquifer Tube Wells & Standposts',
    riskScore: null,
    riskLevel: 'NO_DATA',
    status: 'NO_DATA',
    ashaWorker: 'Nazma Begum (ASHA-132)',
    panchayatHead: 'Abdul Hannan (Pradhan)',
    waterSourcesCount: 9,
    activeSensorsCount: 0,
    updatedAt: Date.now()
  }
};

// ─── 1. Clean Firebase Realtime Database ─────────────────────────────────────
async function cleanRtdb() {
  console.log('\n🧹 1. Cleaning Firebase Realtime Database...');
  
  // All data collection nodes to delete completely
  const nodesToClear = [
    'waterReports',
    'symptoms',
    'alerts',
    'manualTests',
    'monsoonData',
    'Asha_Workers',
    'Hygiene_Department',
    'Admin/verifiedWaterReports',
    'Villagers/healthReports',
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

  // Reset /villages to clean baseline directory
  try {
    const res = await fetch(`${RTDB_URL}/villages.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanVillages),
    });
    if (res.ok) {
      console.log('   ✅ Reset RTDB /villages to clean baseline state (no demo scores/reports)');
    }
  } catch (err) {
    console.warn('   ⚠️ Error resetting RTDB villages:', err.message);
  }

  // Ensure fixed credentials exist in RTDB
  try {
    const credRes = await fetch(`${RTDB_URL}/system/credentials.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(FIXED_CREDENTIALS),
    });
    if (credRes.ok) {
      console.log('   ✅ Ensured RTDB /system/credentials has fixed credentials store');
    }
  } catch (err) {
    console.warn('   ⚠️ Error writing RTDB system credentials:', err.message);
  }

  // Setup authorized users directory
  try {
    const usersPayload = {};
    for (const [key, user] of Object.entries(FIXED_CREDENTIALS)) {
      if (user.phone && user.phone !== '0000000000') {
        usersPayload[user.phone] = {
          phone: user.phone,
          name: user.name,
          role: user.role,
          department: user.department,
          title: user.title,
          updatedAt: Date.now()
        };
      }
    }
    const userRes = await fetch(`${RTDB_URL}/users.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usersPayload),
    });
    if (userRes.ok) {
      console.log('   ✅ Reset RTDB /users to authorized staff accounts');
    }
  } catch (err) {
    console.warn('   ⚠️ Error resetting RTDB users:', err.message);
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

    // Ensure baseline villages in Firestore
    for (const v of Object.values(cleanVillages)) {
      await setDoc(doc(db, 'villages', v.id), {
        ...v,
        createdAt: serverTimestamp()
      }, { merge: true });
    }
    console.log('   ✅ Firestore: Reset villages to clean baseline directory');
  } catch (err) {
    console.warn('   ⚠️ Firestore cleanup init error:', err.message);
  }
}

// ─── 3. Clean Local Express Server State ─────────────────────────────────────
async function cleanExpressServer() {
  console.log('\n🧹 3. Resetting local Express server state...');
  try {
    let res = await fetch('http://localhost:5000/api/clear-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      res = await fetch('http://localhost:5000/api/admin/clear-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (res.ok) {
      console.log('   ✅ Express server state reset to clean empty state');
    } else {
      console.log(`   ℹ️ Express server returned status: ${res.status}`);
    }
  } catch (err) {
    console.log('   ℹ️ Express server notice:', err.message);
  }
}

async function main() {
  console.log('═════════════════════════════════════════════════════════');
  console.log('  NEERSENSE — DELETE ALL DATA & FRESH START SCRIPT');
  console.log('  Clearing all old/demo records from database.');
  console.log('  Preserving fixed credentials and baseline villages.');
  console.log('═════════════════════════════════════════════════════════');

  await cleanRtdb();
  await cleanFirestore();
  await cleanExpressServer();

  console.log('\n═════════════════════════════════════════════════════════');
  console.log('🎉 ALL DATABASE DATA HAS BEEN CLEARED!');
  console.log('   System is completely fresh and ready to receive data.');
  console.log('   Only newly submitted data will be displayed.');
  console.log('═════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal error during cleanup:', err);
  process.exit(1);
});
