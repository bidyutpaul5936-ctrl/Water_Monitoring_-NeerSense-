/**
 * seed_rtdb.js — Seeds the Firebase Realtime Database with NeerSense data
 * Run with: node scripts/seed_rtdb.js
 */

const DB_URL = 'https://neersense-a5df3-default-rtdb.firebaseio.com';

// ─── Village Data ───────────────────────────────────────────────────────────
const villages = {
  'vil-01': {
    name: 'Gosaba Island (Rangabelia)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [22.1652, 88.8080],
    population: 11200,
    primarySource: 'Pond Sand Filter & Deep Tube Wells',
    riskScore: 62,
    riskLevel: 'MODERATE',
    status: 'ELEVATED',
    ashaWorker: 'Priyanka Mondal (ASHA-109)',
    panchayatHead: 'Subrata Das (Pradhan)',
    waterSourcesCount: 8,
    activeSensorsCount: 4,
    weather: { temp: 31.0, rainfall: 24.0, humidity: 82, forecast: 'Scattered Showers' },
    createdAt: Date.now()
  },
  'vil-02': {
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
    weather: { temp: 29.4, rainfall: 42.5, humidity: 88, forecast: 'Heavy Monsoon Rain' },
    createdAt: Date.now()
  },
  'vil-03': {
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
    weather: { temp: 32.1, rainfall: 12.0, humidity: 79, forecast: 'Partly Cloudy' },
    createdAt: Date.now()
  },
  'vil-04': {
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
    weather: { temp: 30.5, rainfall: 18.0, humidity: 76, forecast: 'Overcast & Drizzle' },
    createdAt: Date.now()
  },
  'vil-05': {
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
    weather: { temp: 34.5, rainfall: 5.0, humidity: 65, forecast: 'Clear & Sunny' },
    createdAt: Date.now()
  },
  'vil-06': {
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
    weather: { temp: 31.8, rainfall: 14.0, humidity: 72, forecast: 'Passing Clouds' },
    createdAt: Date.now()
  },
  'vil-07': {
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
    weather: { temp: 30.0, rainfall: 22.0, humidity: 85, forecast: 'Coastal Breeze' },
    createdAt: Date.now()
  }
};

// ─── Sample Alerts ──────────────────────────────────────────────────────────
const alerts = {
  'alert-001': {
    title: 'High Coliform Count Detected',
    message: 'E.coli levels exceeded 100 CFU/100ml at Sagar Island primary tube well. Immediate boil-water advisory issued.',
    villageName: 'Sagar Island (Gangasagar)',
    villageId: 'vil-02',
    severity: 'CRITICAL',
    type: 'CONTAMINATION',
    acknowledged: false,
    actions: [],
    createdAt: Date.now() - 3600000
  },
  'alert-002': {
    title: 'Turbidity Spike Warning',
    message: 'Post-monsoon turbidity rose to 15 NTU at Gosaba Island pond filter outlet. Filtration maintenance recommended.',
    villageName: 'Gosaba Island (Rangabelia)',
    villageId: 'vil-01',
    severity: 'WARNING',
    type: 'QUALITY_DEGRADATION',
    acknowledged: false,
    actions: [],
    createdAt: Date.now() - 7200000
  }
};

// ─── Sample Water Reports ───────────────────────────────────────────────────
const waterReports = {
  'wr-001': {
    villageName: 'Sagar Island (Gangasagar)',
    villageId: 'vil-02',
    submittedBy: 'Kuni Majhi (ASHA-071)',
    role: 'asha',
    testType: 'H2S Vial Test',
    result: 'POSITIVE',
    notes: 'Black coloration appeared within 24 hours. Source: Main tube well near school.',
    status: 'PENDING',
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000
  },
  'wr-002': {
    villageName: 'Gosaba Island (Rangabelia)',
    villageId: 'vil-01',
    submittedBy: 'Priyanka Mondal (ASHA-109)',
    role: 'asha',
    testType: 'H2S Vial Test',
    result: 'NEGATIVE',
    notes: 'No color change after 48 hours. Source: Community pond sand filter outlet.',
    status: 'VERIFIED',
    verifiedAt: Date.now() - 900000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 900000
  }
};

// ─── Sample Symptoms ────────────────────────────────────────────────────────
const symptoms = {
  'sym-001': {
    villageName: 'Sagar Island (Gangasagar)',
    villageId: 'vil-02',
    symptoms: ['Diarrhea', 'Stomach cramps', 'Fever'],
    ageGroup: 'Child (5-12)',
    severity: 'Moderate',
    reportedBy: 'Community Member',
    createdAt: Date.now() - 5400000
  },
  'sym-002': {
    villageName: 'Basanti (Sonakhali Char)',
    villageId: 'vil-04',
    symptoms: ['Nausea', 'Vomiting'],
    ageGroup: 'Adult (18-60)',
    severity: 'Mild',
    reportedBy: 'Community Member',
    createdAt: Date.now() - 10800000
  }
};

// ─── Sample ASHA Workers ──────────────────────────────────────────────────
const Asha_Workers = {
  'ASHA_071': {
    profile: {
      ashaId: 'ASHA-071',
      ashaKey: 'ASHA_071',
      ashaName: 'Kuni Majhi (ASHA-071)',
      villageId: 'vil-02',
      villageName: 'Sagar Island (Gangasagar)',
      contactNumber: '+91 98765 43210',
      role: 'ASHA',
      updatedAt: Date.now()
    },
    waterReports: {
      'wr-001': {
        id: 'wr-001',
        ashaKey: 'ASHA_071',
        ashaName: 'Kuni Majhi (ASHA-071)',
        villageId: 'vil-02',
        villageName: 'Sagar Island (Gangasagar)',
        sourceName: 'Main tube well near school',
        sourceType: 'Tube Well / Handpump',
        h2sResult: true,
        h2sVialResult: 'BLACK_CONTAMINATED',
        ph: 7.2,
        turbidity: 4.5,
        tds: 340,
        bacterialCfu: 45,
        safetyStatus: 'CONTAMINATED',
        status: 'PENDING_CLASSIFICATION',
        submittedBy: 'Kuni Majhi (ASHA-071)',
        submissionRole: 'ASHA',
        ashaFieldNotes: 'Black coloration appeared within 24 hours. Source: Main tube well near school.',
        isApproved: false,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: Date.now() - 1800000
      }
    },
    manualTests: {},
    symptoms: {}
  },
  'ASHA_109': {
    profile: {
      ashaId: 'ASHA-109',
      ashaKey: 'ASHA_109',
      ashaName: 'Priyanka Mondal (ASHA-109)',
      villageId: 'vil-01',
      villageName: 'Gosaba Island (Rangabelia)',
      contactNumber: '+91 98765 43211',
      role: 'ASHA',
      updatedAt: Date.now()
    },
    waterReports: {
      'wr-002': {
        id: 'wr-002',
        ashaKey: 'ASHA_109',
        ashaName: 'Priyanka Mondal (ASHA-109)',
        villageId: 'vil-01',
        villageName: 'Gosaba Island (Rangabelia)',
        sourceName: 'Community pond sand filter outlet',
        sourceType: 'Pond Sand Filter',
        h2sResult: false,
        h2sVialResult: 'YELLOW_SAFE',
        ph: 7.0,
        turbidity: 1.2,
        tds: 210,
        bacterialCfu: 0,
        safetyStatus: 'SAFE',
        status: 'APPROVED',
        submittedBy: 'Priyanka Mondal (ASHA-109)',
        submissionRole: 'ASHA',
        ashaFieldNotes: 'No color change after 48 hours. Clear water.',
        isApproved: true,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: Date.now() - 900000
      }
    },
    manualTests: {},
    symptoms: {}
  }
};

// ─── Seed Function ──────────────────────────────────────────────────────────
async function seedPath(path, data) {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to seed ${path}: ${res.status} — ${err}`);
  }
  const result = await res.json();
  console.log(`✅ Seeded /${path} — ${Object.keys(data).length} records`);
  return result;
}

async function main() {
  console.log('🌱 NeerSense Realtime Database Seeder');
  console.log(`   Target: ${DB_URL}`);
  console.log('─'.repeat(50));

  try {
    await seedPath('villages', villages);
    await seedPath('alerts', alerts);
    await seedPath('waterReports', waterReports);
    await seedPath('symptoms', symptoms);
    await seedPath('Asha_Workers', Asha_Workers);

    console.log('─'.repeat(50));
    console.log('🎉 All data seeded successfully!');
    console.log('   View your data at:');
    console.log('   https://console.firebase.google.com/u/0/project/neersense-a5df3/database/neersense-a5df3-default-rtdb/data');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

main();
