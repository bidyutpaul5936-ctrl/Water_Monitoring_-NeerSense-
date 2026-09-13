/**
 * seed_rtdb.js — Seeds Firebase Realtime Database & Firestore for NeerSense
 * Target Project: neersense-894ef
 * 
 * Datasets seeded:
 * 1. system_credentials (Admin, ASHA, Hygiene)
 * 2. system/adminSession (single admin lock initialization)
 * 3. users (pre-authorized personnel accounts)
 * 4. villages (all 8 West Bengal monitoring villages)
 * 5. sensors (IoT water monitoring nodes with live readings)
 * 6. waterReports (verified public water reports)
 * 7. Hygiene_Department/waterReports (pending & verified pipeline)
 * 8. Asha_Workers (ASHA field submissions & test logs)
 * 9. alerts (public water safety alerts & boil advisories)
 * 10. symptoms (community waterborne symptom logs)
 * 11. manualTests (H2S test vial records)
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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

console.log('🚀 Initializing Firebase for seeding...');
console.log('Database URL:', firebaseConfig.databaseURL);
console.log('Project ID:  ', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app, firebaseConfig.databaseURL);
let firestore = null;
try {
  firestore = getFirestore(app);
} catch (e) {
  console.warn('Firestore client init note:', e.message);
}

// ─── Datasets ─────────────────────────────────────────────────────────────

const credentialsData = {
  admin: {
    role: 'admin',
    phone: '9876543213',
    pin: '4321',
    name: 'Dr. Suresh Mishra (CDMO)',
    designation: 'Chief District Medical Officer',
    department: 'Purba Medinipur Health Directorate',
    requiresPin: true,
    updatedAt: new Date().toISOString()
  },
  asha: {
    role: 'asha',
    phone: '9876543211',
    pin: '1234',
    name: 'Sunita Roy (Senior ASHA)',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    requiresPin: true,
    updatedAt: new Date().toISOString()
  },
  hygiene: {
    role: 'hygiene',
    phone: '9876543212',
    pin: '2345',
    name: 'Animesh Banerjee (Sanitary Inspector)',
    department: 'Water Quality & Health Surveillance',
    requiresPin: true,
    updatedAt: new Date().toISOString()
  }
};

const usersData = {
  '9876543213': {
    phone: '9876543213',
    name: 'Dr. Suresh Mishra (CDMO)',
    role: 'admin',
    title: 'District CDMO',
    department: 'Purba Medinipur Health Directorate',
    pin: '4321',
    createdAt: new Date().toISOString()
  },
  '9876543211': {
    phone: '9876543211',
    name: 'Sunita Roy (Senior ASHA)',
    role: 'asha',
    title: 'ASHA Field Worker',
    department: 'National Rural Health Mission',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    pin: '1234',
    createdAt: new Date().toISOString()
  },
  '9876543212': {
    phone: '9876543212',
    name: 'Animesh Banerjee (Sanitary Inspector)',
    role: 'hygiene',
    title: 'Sanitary Inspector',
    department: 'Water Quality & Health Surveillance',
    pin: '2345',
    createdAt: new Date().toISOString()
  }
};

const villagesData = [
  {
    id: 'vil-01',
    name: 'Gosaba Island (Rangabelia)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [22.1652, 88.8080],
    population: 11200,
    primarySource: 'Pond Sand Filter & Deep Tube Wells',
    riskScore: 62,
    riskLevel: 'MODERATE',
    status: 'ELEVATED',
    ashaWorker: 'Sunita Roy (ASHA-109)',
    panchayatHead: 'Subrata Das (Pradhan)',
    waterSourcesCount: 8,
    activeSensorsCount: 4,
    weather: { temp: 31.0, rainfall: 24.0, humidity: 82, forecast: 'Scattered Showers' }
  },
  {
    id: 'vil-02',
    name: 'Sagar Island (Gangasagar)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [21.6444, 88.0827],
    population: 9450,
    primarySource: 'Deep Tube Well & Pond Sand Filter',
    riskScore: 78,
    riskLevel: 'HIGH',
    status: 'SURGE_WARNING',
    ashaWorker: 'Kuni Majhi (ASHA-071)',
    panchayatHead: 'Laxman Nayak (Pradhan)',
    waterSourcesCount: 7,
    activeSensorsCount: 3,
    weather: { temp: 29.4, rainfall: 42.5, humidity: 88, forecast: 'Heavy Monsoon Rain' }
  },
  {
    id: 'vil-03',
    name: 'Kakdwip (Harwood Point)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [21.8767, 88.1887],
    population: 14200,
    primarySource: 'Piped Water Supply & Mark-II Tube Wells',
    riskScore: 40,
    riskLevel: 'LOW',
    status: 'NORMAL',
    ashaWorker: 'Anima Saikia (ASHA-042)',
    panchayatHead: 'Bhaben Roy (Pradhan)',
    waterSourcesCount: 6,
    activeSensorsCount: 2,
    weather: { temp: 32.1, rainfall: 12.0, humidity: 79, forecast: 'Partly Cloudy' }
  },
  {
    id: 'vil-04',
    name: 'Basanti (Sonakhali Char)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [22.1932, 88.7188],
    population: 8600,
    primarySource: 'Pond Sand Filter & Handpumps',
    riskScore: 54,
    riskLevel: 'MODERATE',
    status: 'WATCHLIST',
    ashaWorker: 'Shabana Khan (ASHA-188)',
    panchayatHead: 'Mohd. Imran (Pradhan)',
    waterSourcesCount: 6,
    activeSensorsCount: 2,
    weather: { temp: 30.5, rainfall: 18.0, humidity: 76, forecast: 'Overcast & Drizzle' }
  },
  {
    id: 'vil-05',
    name: 'Khatra (Mukutmanipur Dam)',
    district: 'Bankura',
    state: 'West Bengal',
    coordinates: [22.9817, 86.8528],
    population: 7800,
    primarySource: 'Dam Intake & Deep Bore Wells',
    riskScore: 35,
    riskLevel: 'LOW',
    status: 'NORMAL',
    ashaWorker: 'Lalita Mandavi (ASHA-019)',
    panchayatHead: 'Ramesh Murmu (Pradhan)',
    waterSourcesCount: 5,
    activeSensorsCount: 2,
    weather: { temp: 34.5, rainfall: 5.0, humidity: 65, forecast: 'Clear & Sunny' }
  },
  {
    id: 'vil-06',
    name: 'Jhargram (Belpahari Forest)',
    district: 'Jhargram',
    state: 'West Bengal',
    coordinates: [22.6342, 86.7583],
    population: 6200,
    primarySource: 'Hilly Natural Spring & Ring Wells',
    riskScore: 48,
    riskLevel: 'MODERATE',
    status: 'NORMAL',
    ashaWorker: 'Sumita Soren (ASHA-055)',
    panchayatHead: 'Deben Hansda (Pradhan)',
    waterSourcesCount: 5,
    activeSensorsCount: 1,
    weather: { temp: 31.8, rainfall: 14.0, humidity: 72, forecast: 'Passing Clouds' }
  },
  {
    id: 'vil-07',
    name: 'Digha (Shankarpur Coastal)',
    district: 'Purba Medinipur',
    state: 'West Bengal',
    coordinates: [21.6266, 87.5074],
    population: 10400,
    primarySource: 'Deep Tube Well (Reverse Osmosis Unit)',
    riskScore: 30,
    riskLevel: 'LOW',
    status: 'NORMAL',
    ashaWorker: 'Rupa Jana (ASHA-088)',
    panchayatHead: 'Tarun Mondal (Pradhan)',
    waterSourcesCount: 8,
    activeSensorsCount: 2,
    weather: { temp: 30.0, rainfall: 22.0, humidity: 85, forecast: 'Coastal Breeze' }
  },
  {
    id: 'vil-08',
    name: 'Kaliachak (Sujapur GP)',
    district: 'Malda',
    state: 'West Bengal',
    coordinates: [24.9083, 88.0264],
    population: 15600,
    primarySource: 'Deep Aquifer Tube Wells & Standposts',
    riskScore: 68,
    riskLevel: 'HIGH',
    status: 'SURGE_WARNING',
    ashaWorker: 'Nazma Begum (ASHA-132)',
    panchayatHead: 'Abdul Hannan (Pradhan)',
    waterSourcesCount: 9,
    activeSensorsCount: 3,
    weather: { temp: 33.0, rainfall: 35.0, humidity: 80, forecast: 'Monsoon Thunderstorm' }
  }
];

const sensorsData = [
  {
    id: 'sns-01',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    name: 'Gosaba Riverbank PSF Intake #1',
    sourceType: 'Pond Sand Filter',
    coordinates: [22.1680, 88.8050],
    status: 'ALERT',
    healthStatus: 'ACTIVE',
    batteryPct: 92,
    lastCalibrated: '2026-08-15',
    currentReadings: {
      ph: 8.4,
      turbidity: 24.8,
      bacterialCfu: 180,
      tds: 410,
      doMgL: 4.8,
      temperature: 28.5,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'sns-02',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    name: 'Rangabelia Primary School Handpump',
    sourceType: 'Tube Well',
    coordinates: [22.1610, 88.8120],
    status: 'WARNING',
    healthStatus: 'ACTIVE',
    batteryPct: 88,
    lastCalibrated: '2026-08-20',
    currentReadings: {
      ph: 6.9,
      turbidity: 7.2,
      bacterialCfu: 65,
      tds: 320,
      doMgL: 6.2,
      temperature: 27.8,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'sns-03',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    name: 'Gosaba Market Deep Tube Well',
    sourceType: 'Deep Tube Well',
    coordinates: [22.1640, 88.8090],
    status: 'NORMAL',
    healthStatus: 'ACTIVE',
    batteryPct: 76,
    lastCalibrated: '2026-08-01',
    currentReadings: {
      ph: 7.2,
      turbidity: 3.1,
      bacterialCfu: 8,
      tds: 210,
      doMgL: 7.1,
      temperature: 26.5,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'sns-04',
    villageId: 'vil-02',
    villageName: 'Sagar Island (Gangasagar)',
    name: 'Gangasagar Deep Aquifer Point #1',
    sourceType: 'Deep Tube Well',
    coordinates: [21.6450, 88.0810],
    status: 'CRITICAL',
    healthStatus: 'ACTIVE',
    batteryPct: 95,
    lastCalibrated: '2026-08-10',
    currentReadings: {
      ph: 5.8,
      turbidity: 38.5,
      bacterialCfu: 320,
      tds: 580,
      doMgL: 3.5,
      temperature: 29.8,
      timestamp: new Date().toISOString()
    }
  }
];

const waterReportsData = [
  {
    id: 'rep-wb-001',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    sourceName: 'Pond Sand Filter Unit #2',
    sourceType: 'Pond Sand Filter',
    ph: 7.1,
    turbidity: 4.2,
    fecalColiform: 0,
    eColi: 0,
    tds: 290,
    do: 6.8,
    safetyStatus: 'SAFE',
    classification: 'SAFE',
    status: 'APPROVED',
    isApproved: true,
    isVerified: true,
    verifiedBy: 'Dr. Suresh Mishra (CDMO)',
    verifiedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    classifiedBy: 'Animesh Banerjee (Sanitary Inspector)',
    classifiedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    submittedBy: 'Sunita Roy (Senior ASHA)',
    submittedByPhone: '9876543211',
    reportedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    notes: 'Chlorination complete. Safe for drinking.'
  },
  {
    id: 'rep-wb-002',
    villageId: 'vil-02',
    villageName: 'Sagar Island (Gangasagar)',
    sourceName: 'Gangasagar South Ring Well',
    sourceType: 'Ring Well',
    ph: 6.2,
    turbidity: 22.5,
    fecalColiform: 140,
    eColi: 75,
    tds: 680,
    do: 4.2,
    safetyStatus: 'CONTAMINATED',
    classification: 'CONTAMINATED',
    status: 'APPROVED',
    isApproved: true,
    isVerified: true,
    verifiedBy: 'Dr. Suresh Mishra (CDMO)',
    verifiedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    classifiedBy: 'Animesh Banerjee (Sanitary Inspector)',
    classifiedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    submittedBy: 'Kuni Majhi (ASHA-071)',
    submittedByPhone: '9876543211',
    reportedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    notes: 'Coliform contamination detected. Boil water advisory active.'
  },
  {
    id: 'rep-wb-003',
    villageId: 'vil-03',
    villageName: 'Kakdwip (Harwood Point)',
    sourceName: 'Kakdwip Mark-II Tube Well #4',
    sourceType: 'Handpump',
    ph: 7.4,
    turbidity: 2.8,
    fecalColiform: 5,
    eColi: 0,
    tds: 310,
    do: 7.0,
    safetyStatus: 'MODERATE',
    classification: 'MODERATE',
    status: 'PENDING_VERIFICATION',
    isApproved: false,
    isVerified: false,
    classifiedBy: 'Animesh Banerjee (Sanitary Inspector)',
    classifiedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    submittedBy: 'Anima Saikia (ASHA-042)',
    reportedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    notes: 'Borderline coliform reading. Recommend secondary sampling.'
  }
];

const alertsData = [
  {
    id: 'alt-wb-801',
    villageId: 'vil-02',
    villageName: 'Sagar Island (Gangasagar)',
    level: 'HIGH',
    riskScore: 78,
    title: 'CONTAMINATION ALERT: Sagar Island Ring Well #2',
    message: 'E.coli detected at 75 CFU/100ml. Boil all drinking water for at least 10 minutes before use.',
    status: 'ACTIVE',
    advisory: 'Boil water thoroughly. Use alternative deep tube well.',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    issuedBy: 'Dr. Suresh Mishra (CDMO)'
  },
  {
    id: 'alt-wb-802',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    level: 'MODERATE',
    riskScore: 62,
    title: 'MONSOON RUN-OFF WATCH: Gosaba Riverbank',
    message: 'Turbidity elevated following rainfall. Chlorine dosing increased at PSF unit.',
    status: 'ACTIVE',
    advisory: 'Filter water through clean cloth and boil before drinking.',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    issuedBy: 'Animesh Banerjee (Sanitary Inspector)'
  }
];

const symptomsData = [
  {
    id: 'sym-wb-101',
    villageId: 'vil-02',
    villageName: 'Sagar Island (Gangasagar)',
    patientName: 'Subir Mondal',
    patientAge: 32,
    patientGender: 'Male',
    symptoms: ['Watery Diarrhea', 'Abdominal Cramps', 'Mild Fever'],
    suspectedDisease: 'Acute Gastroenteritis',
    severity: 'MODERATE',
    waterSourceUsed: 'Gangasagar South Ring Well',
    reportedVia: 'ASHA_APP',
    reportedBy: 'Kuni Majhi (ASHA-071)',
    timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
    status: 'ORS_DISPATCHED'
  },
  {
    id: 'sym-wb-102',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    patientName: 'Mita Das',
    patientAge: 24,
    patientGender: 'Female',
    symptoms: ['Nausea', 'Vomiting', 'Fatigue'],
    suspectedDisease: 'Suspected Waterborne Gastro',
    severity: 'MILD',
    waterSourceUsed: 'Pond Sand Filter Unit #2',
    reportedVia: 'VILLAGER_PORTAL',
    reportedBy: 'Citizen Direct',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'TRIAGED'
  }
];

const manualTestsData = [
  {
    id: 'tst-wb-201',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    ashaId: 'ASHA-109',
    ashaName: 'Sunita Roy (Senior ASHA)',
    sourceName: 'Pond Sand Filter Unit #2',
    sourceType: 'Pond Sand Filter',
    h2sVialResult: 'YELLOW_NEGATIVE',
    phStripValue: 7.0,
    freeChlorinePpm: 0.5,
    turbidityObservation: 'CLEAR',
    smellTasteIssue: false,
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    notes: 'Chlorine residual adequate. Water safe.'
  },
  {
    id: 'tst-wb-202',
    villageId: 'vil-02',
    villageName: 'Sagar Island (Gangasagar)',
    ashaId: 'ASHA-071',
    ashaName: 'Kuni Majhi',
    sourceName: 'Gangasagar South Ring Well',
    sourceType: 'Ring Well',
    h2sVialResult: 'BLACK_POSITIVE',
    phStripValue: 6.2,
    freeChlorinePpm: 0.0,
    turbidityObservation: 'CLOUDY_SILTY',
    smellTasteIssue: true,
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    notes: 'H2S vial turned jet black within 24h. Heavy microbial presence.'
  }
];

// ─── Execute Seeding ──────────────────────────────────────────────────────

async function runSeed() {
  console.log('\n========================================');
  console.log('⚡ STARTING NEERSENSE DATABASE SEEDING ⚡');
  console.log('========================================\n');

  try {
    // 1. system_credentials
    console.log('1/10 Seeding system_credentials (Admin, ASHA, Hygiene)...');
    for (const [roleKey, cred] of Object.entries(credentialsData)) {
      await set(ref(rtdb, `system_credentials/${roleKey}`), cred);
    }
    console.log('   ✅ system_credentials seeded.');

    // 2. system/adminSession
    console.log('2/10 Initializing system/adminSession lock status...');
    await set(ref(rtdb, 'system/adminSession'), {
      isLoggedIn: false,
      phone: null,
      name: null,
      sessionId: null,
      lastHeartbeat: 0,
      initializedAt: new Date().toISOString()
    });
    console.log('   ✅ system/adminSession initialized.');

    // 3. users
    console.log('3/10 Seeding users registry for authorized personnel...');
    for (const [phone, u] of Object.entries(usersData)) {
      await set(ref(rtdb, `users/${phone}`), u);
    }
    // Also seed into asha_workers and hygiene_users nodes
    await set(ref(rtdb, 'asha_workers/ASHA_654311'), {
      ashaKey: 'ASHA_654311',
      ashaId: 'ASHA-109',
      ashaName: 'Sunita Roy (Senior ASHA)',
      contactNumber: '9876543211',
      villageId: 'vil-01',
      villageName: 'Gosaba Island (Rangabelia)',
      role: 'ASHA',
      pin: '1234',
      updatedAt: Date.now()
    });
    await set(ref(rtdb, 'hygiene_users/9876543212'), {
      phone: '9876543212',
      name: 'Animesh Banerjee (Sanitary Inspector)',
      role: 'HYGIENE',
      department: 'Water Quality & Health Surveillance',
      pin: '2345',
      updatedAt: Date.now()
    });
    console.log('   ✅ users, asha_workers, hygiene_users seeded.');

    // 4. villages
    console.log('4/10 Seeding villages directory (8 West Bengal villages)...');
    const villagesMap = {};
    villagesData.forEach(v => { villagesMap[v.id] = v; });
    await set(ref(rtdb, 'villages'), villagesMap);
    console.log('   ✅ villages seeded (8 villages).');

    // 5. sensors
    console.log('5/10 Seeding sensors & IoT monitoring points...');
    const sensorsMap = {};
    sensorsData.forEach(s => { sensorsMap[s.id] = s; });
    await set(ref(rtdb, 'sensorNodes'), sensorsMap);
    await set(ref(rtdb, 'sensors'), sensorsMap);
    console.log('   ✅ sensorNodes & sensors seeded.');

    // 6. waterReports (Verified Public Reports)
    console.log('6/10 Seeding verified public waterReports...');
    const reportsMap = {};
    waterReportsData.forEach(r => { reportsMap[r.id] = r; });
    await set(ref(rtdb, 'waterReports'), reportsMap);
    console.log('   ✅ waterReports seeded.');

    // 7. Hygiene_Department & Admin verification nodes
    console.log('7/10 Seeding Hygiene_Department/waterReports & Admin/verifiedWaterReports...');
    await set(ref(rtdb, 'Hygiene_Department/waterReports'), reportsMap);
    const verifiedOnly = {};
    waterReportsData.filter(r => r.isVerified).forEach(r => { verifiedOnly[r.id] = r; });
    await set(ref(rtdb, 'Admin/verifiedWaterReports'), verifiedOnly);
    console.log('   ✅ Hygiene & Admin pipelines synchronized.');

    // 8. Asha_Workers/ waterReports & manualTests
    console.log('8/10 Seeding Asha_Workers sub-nodes...');
    await set(ref(rtdb, 'Asha_Workers/ASHA_654311/waterReports'), reportsMap);
    const testsMap = {};
    manualTestsData.forEach(t => { testsMap[t.id] = t; });
    await set(ref(rtdb, 'Asha_Workers/ASHA_654311/manualTests'), testsMap);
    await set(ref(rtdb, 'manualTests'), testsMap);
    console.log('   ✅ Asha_Workers & manualTests seeded.');

    // 9. alerts
    console.log('9/10 Seeding outbreak alerts & advisories...');
    const alertsMap = {};
    alertsData.forEach(a => { alertsMap[a.id] = a; });
    await set(ref(rtdb, 'alerts'), alertsMap);
    console.log('   ✅ alerts seeded.');

    // 10. symptoms
    console.log('10/10 Seeding community symptoms & surveillance logs...');
    const symptomsMap = {};
    symptomsData.forEach(s => { symptomsMap[s.id] = s; });
    await set(ref(rtdb, 'symptoms'), symptomsMap);
    await set(ref(rtdb, 'Villagers/healthReports'), symptomsMap);
    console.log('   ✅ symptoms & Villagers/healthReports seeded.');

    console.log('\n======================================================');
    console.log('🎉 ALL NEERSENSE DATASETS SUCCESSFULLY STORED IN RTDB!');
    console.log('======================================================\n');

    // Test a read back
    const verifySnap = await get(ref(rtdb, 'villages/vil-01/name'));
    console.log('Verification check: village vil-01 name =', verifySnap.val());

    // Optional: Secondary dual-seed to Firestore if rules permit
    if (firestore) {
      try {
        console.log('Attempting secondary Firestore sync (if permissions allow)...');
        for (const v of villagesData) {
          await setDoc(doc(firestore, 'villages', v.id), v, { merge: true });
        }
        for (const [roleKey, cred] of Object.entries(credentialsData)) {
          await setDoc(doc(firestore, 'system_credentials', roleKey), cred, { merge: true });
        }
        console.log('   ✅ Firestore secondary sync succeeded.');
      } catch (fsErr) {
        console.log('   ℹ️ Firestore secondary note (non-critical):', fsErr.message);
      }
    }

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }

  process.exit(0);
}

runSeed();
