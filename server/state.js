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
    name: 'Gosaba Island (Rangabelia)',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    coordinates: [22.1652, 88.8080],
    population: 11200,
    primarySource: 'Pond Sand Filter & Deep Tube Wells',
    riskScore: null,
    riskLevel: 'NO_DATA',
    status: 'NO_DATA',
    ashaWorker: 'Assigned ASHA Worker',
    panchayatHead: 'Gram Panchayat Office',
    waterSourcesCount: 8,
    activeSensorsCount: 0
  },
  {
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
    activeSensorsCount: 0
  },
  {
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
    activeSensorsCount: 0
  },
  {
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
    activeSensorsCount: 0
  },
  {
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
    activeSensorsCount: 0
  },
  {
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
    activeSensorsCount: 0
  },
  {
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
    activeSensorsCount: 0
  },
  {
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
  resetToEmptyState();
}

