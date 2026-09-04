import { predictionEngine } from './mlEngine.js';
import { 
  initialSensors, 
  initialSymptoms, 
  initialAlerts, 
  manualTestKitLogs 
} from './mockData.js';

export const defaultVillages = [
  {
    id: 'vil-01',
    name: 'Majuli Char (Kamalabari)',
    district: 'Majuli',
    state: 'Assam',
    coordinates: [26.9634, 94.2215],
    population: 8450,
    primarySource: 'River Intake & Ring Wells',
    riskScore: null,
    riskLevel: 'NO_DATA',
    status: 'NO_DATA',
    ashaWorker: 'Anima Saikia (ASHA-042)',
    panchayatHead: 'Bhaben Kalita (Sarpanch)',
    waterSourcesCount: 6,
    activeSensorsCount: 0
  },
  {
    id: 'vil-02',
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
    activeSensorsCount: 0
  },
  {
    id: 'vil-03',
    name: 'Thuamul Rampur (Dhanurjaya)',
    district: 'Kalahandi',
    state: 'Odisha',
    coordinates: [19.5781, 83.0247],
    population: 6800,
    primarySource: 'Hilly Natural Spring & Handpumps',
    riskScore: null,
    riskLevel: 'NO_DATA',
    status: 'NO_DATA',
    ashaWorker: 'Kuni Majhi (ASHA-071)',
    panchayatHead: 'Laxman Nayak (Sarpanch)',
    waterSourcesCount: 5,
    activeSensorsCount: 0
  },
  {
    id: 'vil-04',
    name: 'Tauru Sub-division (Hassanpur)',
    district: 'Nuh (Mewat)',
    state: 'Haryana',
    coordinates: [28.1158, 77.0118],
    population: 14500,
    primarySource: 'Canal Supply & High TDS Borewells',
    riskScore: null,
    riskLevel: 'NO_DATA',
    status: 'NO_DATA',
    ashaWorker: 'Shabana Khan (ASHA-188)',
    panchayatHead: 'Mohd. Imran (Sarpanch)',
    waterSourcesCount: 9,
    activeSensorsCount: 0
  },
  {
    id: 'vil-05',
    name: 'Abujhmad Foothills (Kaspal)',
    district: 'Narayanpur (Bastar)',
    state: 'Chhattisgarh',
    coordinates: [19.7150, 81.2520],
    population: 5400,
    primarySource: 'Forest Stream & Mark-II Handpumps',
    riskScore: null,
    riskLevel: 'NO_DATA',
    status: 'NO_DATA',
    ashaWorker: 'Lalita Mandavi (ASHA-019)',
    panchayatHead: 'Ramesh Netam (Mukhya)',
    waterSourcesCount: 4,
    activeSensorsCount: 0
  }
];

export const state = {
  villages: JSON.parse(JSON.stringify(defaultVillages)),
  waterReports: [], // Empty initially - waiting for Admin input!
  sensors: [],      // Empty initially
  symptoms: [],     // Empty initially - waiting for Villager input!
  alerts: [],       // Empty initially
  manualTests: [],  // Empty initially
  wss: null
};

export function setWss(serverWss) {
  state.wss = serverWss;
}

export function broadcastWs(type, data) {
  if (!state.wss) return;
  const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  state.wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(payload);
    }
  });
}

export function recalculateAllVillages() {
  if (state.sensors.length === 0 && state.symptoms.length === 0 && state.manualTests.length === 0 && state.waterReports.length === 0) {
    state.villages = state.villages.map(village => ({
      ...village,
      riskScore: null,
      riskLevel: 'NO_DATA',
      status: 'NO_DATA'
    }));
    return;
  }

  state.villages = state.villages.map(village => {
    const assessment = predictionEngine.evaluateVillageRisk(village, state.sensors, state.symptoms, state.manualTests);
    return {
      ...village,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      status: assessment.status,
      assessment
    };
  });
}

export function resetToEmptyState() {
  state.waterReports = [];
  state.symptoms = [];
  state.alerts = [];
  state.sensors = [];
  state.manualTests = [];
  state.villages = JSON.parse(JSON.stringify(defaultVillages));
  broadcastWs('WATER_REPORTS_UPDATE', state.waterReports);
  broadcastWs('NEW_SYMPTOMS', []);
  broadcastWs('VILLAGES_UPDATE', state.villages);
}

export function loadBaselineSampleData() {
  state.waterReports = [
    {
      id: 'rep-sample-1',
      villageId: 'vil-01',
      villageName: 'Majuli Char (Kamalabari)',
      sourceName: 'Kamalabari Brahmaputra River Intake #1',
      sourceType: 'River Intake',
      ph: 7.8,
      turbidity: 18.5,
      tds: 340,
      bacterialCfu: 140,
      safetyStatus: 'CONTAMINATED',
      advisory: 'Severe silt & coliform surge detected. Boil water for 10 min before drinking.',
      submittedBy: 'Anima Saikia (ASHA-042)',
      submissionRole: 'ASHA',
      ashaFieldNotes: 'High muddy water after monsoon floods. 4 children reported acute diarrhea.',
      h2sVialResult: 'BLACK_CONTAMINATED',
      status: 'APPROVED',
      isApproved: true,
      verifiedBy: 'Dr. Suresh Mishra, CDMO (District Health Authority)',
      verifiedAt: new Date(Date.now() - 3600000).toISOString(),
      verificationRemarks: 'Lab confirmed fecal coliform contamination. Emergency chlorine halazone tablets distributed.',
      timestamp: new Date().toISOString()
    },
    {
      id: 'rep-sample-2',
      villageId: 'vil-02',
      villageName: 'Gosaba Island (Rangabelia)',
      sourceName: 'Rangabelia Community Deep Tube Well #2',
      sourceType: 'Deep Tube Well',
      ph: 7.1,
      turbidity: 2.1,
      tds: 210,
      bacterialCfu: 0,
      safetyStatus: 'SAFE',
      advisory: 'Water quality is within permissible limits (BIS IS 10500:2012). Safe to drink.',
      submittedBy: 'Priyanka Mondal (ASHA-109)',
      submissionRole: 'ASHA',
      ashaFieldNotes: 'Deep well water looks crystal clear, odorless, used by 180 families.',
      h2sVialResult: 'YELLOW_SAFE',
      status: 'APPROVED',
      isApproved: true,
      verifiedBy: 'Executive Engineer, District Jal Shakti Lab',
      verifiedAt: new Date(Date.now() - 7200000).toISOString(),
      verificationRemarks: 'Routine test verified safe. Periodic chlorination up to standard.',
      timestamp: new Date().toISOString()
    },
    {
      id: 'rep-sample-3',
      villageId: 'vil-03',
      villageName: 'Thuamul Rampur (Dhanurjaya)',
      sourceName: 'Dhanurjaya Village Ring Well #3',
      sourceType: 'Ring Well',
      ph: 6.2,
      turbidity: 8.4,
      tds: 280,
      bacterialCfu: 45,
      safetyStatus: 'WARNING',
      advisory: 'Moderate turbidity and bacterial traces. Disinfect with chlorine tablets before drinking.',
      submittedBy: 'Kuni Majhi (ASHA-071)',
      submissionRole: 'ASHA',
      ashaFieldNotes: 'Well wall cracked after rain. H2S test vial turned slightly gray after 18 hours.',
      h2sVialResult: 'BLACK_CONTAMINATED',
      status: 'PENDING_APPROVAL',
      isApproved: false,
      verifiedBy: null,
      verifiedAt: null,
      verificationRemarks: null,
      timestamp: new Date().toISOString()
    }
  ];
  state.sensors = JSON.parse(JSON.stringify(initialSensors));
  state.symptoms = JSON.parse(JSON.stringify(initialSymptoms));
  state.alerts = JSON.parse(JSON.stringify(initialAlerts));
  state.manualTests = JSON.parse(JSON.stringify(manualTestKitLogs));
  recalculateAllVillages();
  broadcastWs('WATER_REPORTS_UPDATE', state.waterReports);
  broadcastWs('NEW_SYMPTOMS', state.symptoms);
  broadcastWs('VILLAGES_UPDATE', state.villages);
}
