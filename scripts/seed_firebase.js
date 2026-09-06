/**
 * seed_firebase.js — Seeds Firebase Firestore with the 6 schema tables:
 * - Village
 * - User
 * - WaterReport
 * - SymptomCase
 * - RiskDashboard
 * - MonsoonData
 *
 * Usage:
 *   node scripts/seed_firebase.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present
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
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN || 'neersense-a5df3.firebaseapp.com',
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID || 'neersense-a5df3',
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET || 'neersense-a5df3.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.log('⚠️ Warning: VITE_FIREBASE_API_KEY not found in .env. Please set it before running this seed script.');
  console.log('Example config target:', firebaseConfig.projectId);
}

const villagesData = [
  {
    id: 'vil-01',
    name: 'Gosaba Island (Rangabelia)',
    region: 'Sundarbans Coastal',
    district: 'South 24 Parganas',
    latitude: 22.1652,
    longitude: 88.8080,
    population: 11200,
    vulnerabilityIndex: 0.72,
  },
  {
    id: 'vil-02',
    name: 'Sagar Island (Gangasagar)',
    region: 'Sundarbans Estuary',
    district: 'South 24 Parganas',
    latitude: 21.6444,
    longitude: 88.0827,
    population: 9450,
    vulnerabilityIndex: 0.85,
  },
  {
    id: 'vil-03',
    name: 'Kakdwip (Harwood Point)',
    region: 'Mainland Delta',
    district: 'South 24 Parganas',
    latitude: 21.8767,
    longitude: 88.1887,
    population: 14200,
    vulnerabilityIndex: 0.44,
  },
  {
    id: 'vil-04',
    name: 'Basanti (Canning Block)',
    region: 'Sundarbans Interior',
    district: 'South 24 Parganas',
    latitude: 22.2131,
    longitude: 88.6750,
    population: 8900,
    vulnerabilityIndex: 0.68,
  },
  {
    id: 'vil-05',
    name: 'Namkhana (Hatania-Doania)',
    region: 'Coastal Buffer',
    district: 'South 24 Parganas',
    latitude: 21.7648,
    longitude: 88.2325,
    population: 10500,
    vulnerabilityIndex: 0.58,
  }
];

const usersData = [
  {
    id: 'usr-asha-01',
    role: 'ASHA',
    preferredLanguage: 'bn',
    contactNumber: '+91 98310 11223',
    assignedVillageId: 'vil-01',
  },
  {
    id: 'usr-asha-02',
    role: 'ASHA',
    preferredLanguage: 'bn',
    contactNumber: '+91 98310 44556',
    assignedVillageId: 'vil-02',
  },
  {
    id: 'usr-hygiene-01',
    role: 'HYGIENE_VOLUNTEER',
    preferredLanguage: 'bn',
    contactNumber: '+91 98310 77889',
    assignedVillageId: 'vil-01',
  },
  {
    id: 'usr-govt-01',
    role: 'GOVERNMENT',
    preferredLanguage: 'en',
    contactNumber: '+91 33 2214 5555',
    assignedVillageId: null,
  }
];

async function seed() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log(`[Seed] Connected to Firebase Project: ${firebaseConfig.projectId}`);

    // 1. Seed Villages
    console.log('[Seed] Seeding Villages...');
    for (const v of villagesData) {
      await setDoc(doc(db, 'villages', v.id), {
        ...v,
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    // 2. Seed Users
    console.log('[Seed] Seeding Users...');
    for (const u of usersData) {
      await setDoc(doc(db, 'users', u.id), {
        ...u,
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    // 3. Seed Water Reports
    console.log('[Seed] Seeding Sample Water Reports...');
    const waterReports = [
      {
        id: 'rep-01',
        villageId: 'vil-01',
        villageName: 'Gosaba Island (Rangabelia)',
        sourceName: 'Pond Sand Filter #2',
        sourceType: 'COMMUNITY_FILTER',
        h2sResult: false,
        h2sVialResult: 'YELLOW_SAFE',
        ph: 7.2,
        turbidity: 2.1,
        eColi: 0,
        tds: 240,
        do: 6.8,
        safetyStatus: 'SAFE',
        status: 'APPROVED',
        isApproved: true,
        recordedById: 'usr-asha-01',
        submittedBy: 'Priyanka Mondal (ASHA-109)',
        reportedAt: serverTimestamp()
      },
      {
        id: 'rep-02',
        villageId: 'vil-02',
        villageName: 'Sagar Island (Gangasagar)',
        sourceName: 'Deep Tube Well near Ghat 4',
        sourceType: 'TUBE_WELL',
        h2sResult: true,
        h2sVialResult: 'BLACK_CONTAMINATED',
        ph: 6.4,
        turbidity: 8.5,
        eColi: 45,
        tds: 710,
        do: 4.1,
        safetyStatus: 'CONTAMINATED',
        status: 'REJECTED',
        isApproved: false,
        rejectionReason: 'Turbidity values inconsistent with visual sample. Retest required.',
        recordedById: 'usr-asha-02',
        submittedBy: 'Kuni Majhi (ASHA-071)',
        reportedAt: serverTimestamp()
      }
    ];

    for (const wr of waterReports) {
      await setDoc(doc(db, 'waterReports', wr.id), wr, { merge: true });
    }

    // 4. Seed Symptom Cases
    console.log('[Seed] Seeding Symptom Cases...');
    const symptoms = [
      {
        id: 'sym-01',
        villageId: 'vil-02',
        villageName: 'Sagar Island (Gangasagar)',
        symptomList: 'Diarrhea, Dehydration, Vomiting',
        urgencyLevel: 3,
        triageStatus: 'FLAGGED_HIGH',
        recordedById: 'usr-asha-02',
        patientAge: 38,
        patientGender: 'Female',
        reportedAt: serverTimestamp()
      }
    ];
    for (const sc of symptoms) {
      await setDoc(doc(db, 'symptomCases', sc.id), sc, { merge: true });
    }

    // 5. Seed Risk Dashboards
    console.log('[Seed] Seeding Risk Dashboards...');
    for (const v of villagesData) {
      await setDoc(doc(db, 'riskDashboards', `risk-${v.id}`), {
        villageId: v.id,
        villageName: v.name,
        riskScore: Math.round(v.vulnerabilityIndex * 100),
        alertLevel: v.vulnerabilityIndex > 0.7 ? 'HIGH' : v.vulnerabilityIndex > 0.5 ? 'MODERATE' : 'LOW',
        statusNotes: `Surveillance active for ${v.name}`,
        calculatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 6. Seed Monsoon Data
    console.log('[Seed] Seeding Monsoon Data...');
    const monsoonRecords = [
      {
        id: 'mon-01',
        villageId: 'vil-01',
        villageName: 'Gosaba Island (Rangabelia)',
        rainfallIntensity: 28.5,
        humidity: 84.0,
        recordedAt: serverTimestamp()
      },
      {
        id: 'mon-02',
        villageId: 'vil-02',
        villageName: 'Sagar Island (Gangasagar)',
        rainfallIntensity: 45.0,
        humidity: 89.0,
        recordedAt: serverTimestamp()
      }
    ];
    for (const m of monsoonRecords) {
      await setDoc(doc(db, 'monsoonData', m.id), m, { merge: true });
    }

    console.log('✅ Successfully seeded all 6 schema tables in Firebase!');
  } catch (err) {
    console.error('❌ Error during Firebase seeding:', err.message);
  }
}

seed();
