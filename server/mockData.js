export const initialVillages = [
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
    ashaWorker: 'Priyanka Mondal (ASHA-109)',
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

export const initialSensors = [
  {
    id: 'sns-01',
    villageId: 'vil-01',
    name: 'Gosaba Riverbank PSF Intake #1',
    sourceType: 'Pond Sand Filter',
    coordinates: [22.1680, 88.8050],
    status: 'ALERT',
    healthStatus: 'ACTIVE',
    batteryPct: 92,
    lastCalibrated: '2026-08-15',
    currentReadings: {
      ph: 8.4,
      turbidity: 24.8, // Normal < 5 NTU
      bacterialCfu: 180, // Normal 0 CFU/100ml
      tds: 410,
      doMgL: 4.8,
      temperature: 28.5,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'sns-02',
    villageId: 'vil-01',
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
    villageId: 'vil-03',
    name: 'Thuamul Spring Water Collection Point',
    sourceType: 'Natural Spring',
    coordinates: [19.5820, 83.0290],
    status: 'CRITICAL',
    healthStatus: 'ACTIVE',
    batteryPct: 95,
    lastCalibrated: '2026-08-10',
    currentReadings: {
      ph: 5.8, // Acidic contamination
      turbidity: 38.5, // High silt run-off
      bacterialCfu: 320, // Severe coliform spike
      tds: 580,
      doMgL: 3.5,
      temperature: 29.8,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'sns-05',
    villageId: 'vil-03',
    name: 'Dhanurjaya Main Basti Handpump #2',
    sourceType: 'Handpump (India Mark II)',
    coordinates: [19.5750, 83.0210],
    status: 'ALERT',
    healthStatus: 'ACTIVE',
    batteryPct: 64,
    lastCalibrated: '2026-07-28',
    currentReadings: {
      ph: 6.4,
      turbidity: 16.4,
      bacterialCfu: 140,
      tds: 490,
      doMgL: 5.1,
      temperature: 28.0,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'sns-06',
    villageId: 'vil-02',
    name: 'Gosaba Ferry Ghat Pond Filter',
    sourceType: 'Pond Sand Filter',
    coordinates: [22.1690, 88.8120],
    status: 'WARNING',
    healthStatus: 'ACTIVE',
    batteryPct: 81,
    lastCalibrated: '2026-08-12',
    currentReadings: {
      ph: 7.6,
      turbidity: 11.8,
      bacterialCfu: 92,
      tds: 750, // Salinity surge
      doMgL: 5.5,
      temperature: 30.2,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'sns-07',
    villageId: 'vil-04',
    name: 'Tauru Primary Health Center Water Tank',
    sourceType: 'Overhead Tank',
    coordinates: [28.1180, 77.0150],
    status: 'NORMAL',
    healthStatus: 'ACTIVE',
    batteryPct: 99,
    lastCalibrated: '2026-08-25',
    currentReadings: {
      ph: 7.3,
      turbidity: 2.1,
      bacterialCfu: 0,
      tds: 450,
      doMgL: 7.8,
      temperature: 25.4,
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'sns-08',
    villageId: 'vil-05',
    name: 'Kaspal Forest Spring Reservoir',
    sourceType: 'Natural Spring',
    coordinates: [19.7180, 81.2580],
    status: 'WARNING',
    healthStatus: 'ACTIVE',
    batteryPct: 70,
    lastCalibrated: '2026-08-05',
    currentReadings: {
      ph: 6.7,
      turbidity: 9.6,
      bacterialCfu: 78,
      tds: 280,
      doMgL: 6.0,
      temperature: 27.3,
      timestamp: new Date().toISOString()
    }
  }
];

export const initialSymptoms = [
  {
    id: 'sym-101',
    villageId: 'vil-03',
    patientName: 'Subhash Majhi',
    age: 34,
    gender: 'Male',
    householdId: 'HH-KLH-089',
    symptoms: ['Watery Diarrhea', 'Severe Vomiting', 'Dehydration', 'Abdominal Cramps'],
    suspectedDisease: 'Acute Gastroenteritis / Cholera',
    severity: 'SEVERE',
    waterSourceUsed: 'Thuamul Spring Water Collection Point',
    reportedVia: 'ASHA_APP',
    reportedBy: 'Kuni Majhi (ASHA-071)',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'TRIAGED_ADMITTED',
    lat: 19.5815,
    lng: 83.0285
  },
  {
    id: 'sym-102',
    villageId: 'vil-03',
    patientName: 'Rambha Majhi',
    age: 8,
    gender: 'Female',
    householdId: 'HH-KLH-091',
    symptoms: ['Watery Diarrhea', 'High Fever', 'Lethargy'],
    suspectedDisease: 'Acute Diarrheal Infection',
    severity: 'CRITICAL',
    waterSourceUsed: 'Thuamul Spring Water Collection Point',
    reportedVia: 'VOICE_APP',
    reportedBy: 'Villager Direct',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'ORS_DISPATCHED',
    lat: 19.5822,
    lng: 83.0298
  },
  {
    id: 'sym-103',
    villageId: 'vil-03',
    patientName: 'Bikas Nayak',
    age: 42,
    gender: 'Male',
    householdId: 'HH-KLH-074',
    symptoms: ['Watery Diarrhea', 'Vomiting', 'Muscle Cramps'],
    suspectedDisease: 'Cholera',
    severity: 'SEVERE',
    waterSourceUsed: 'Dhanurjaya Main Basti Handpump #2',
    reportedVia: 'USSD_CODE',
    reportedBy: 'Feature Phone (*999*1#)',
    timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
    status: 'CONFIRMED_FIELD',
    lat: 19.5760,
    lng: 83.0220
  },
  {
    id: 'sym-104',
    villageId: 'vil-01',
    patientName: 'Monoj Saikia',
    age: 19,
    gender: 'Male',
    householdId: 'HH-MAJ-112',
    symptoms: ['Prolonged High Fever', 'Headache', 'Abdominal Pain', 'Rose Spots'],
    suspectedDisease: 'Typhoid Fever',
    severity: 'MODERATE',
    waterSourceUsed: 'Kamalabari Brahmaputra River Intake #1',
    reportedVia: 'ASHA_APP',
    reportedBy: 'Anima Saikia (ASHA-042)',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'ANTIBIOTICS_STARTED',
    lat: 26.9675,
    lng: 94.2185
  },
  {
    id: 'sym-105',
    villageId: 'vil-01',
    patientName: 'Pari Kalita',
    age: 6,
    gender: 'Female',
    householdId: 'HH-MAJ-115',
    symptoms: ['Watery Diarrhea', 'Vomiting', 'Mild Fever'],
    suspectedDisease: 'Acute Gastroenteritis',
    severity: 'SEVERE',
    waterSourceUsed: 'Kamalabari Brahmaputra River Intake #1',
    reportedVia: 'SMS_GATEWAY',
    reportedBy: 'SMS Gateway (+91-98765-XXXXX)',
    timestamp: new Date(Date.now() - 3600000 * 15).toISOString(),
    status: 'ORS_DISPATCHED',
    lat: 26.9660,
    lng: 94.2190
  },
  {
    id: 'sym-106',
    villageId: 'vil-02',
    patientName: 'Anjali Mondal',
    age: 26,
    gender: 'Female',
    householdId: 'HH-GSB-045',
    symptoms: ['Yellow Eyes / Jaundice', 'Dark Urine', 'Fatigue', 'Nausea'],
    suspectedDisease: 'Hepatitis A (Water-borne)',
    severity: 'MODERATE',
    waterSourceUsed: 'Gosaba Ferry Ghat Pond Filter',
    reportedVia: 'ASHA_APP',
    reportedBy: 'Priyanka Mondal (ASHA-109)',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    status: 'BLOOD_SAMPLE_SENT',
    lat: 22.1685,
    lng: 88.8115
  },
  {
    id: 'sym-107',
    villageId: 'vil-05',
    patientName: 'Mangal Netam',
    age: 14,
    gender: 'Male',
    householdId: 'HH-BST-029',
    symptoms: ['Bloody Stools / Dysentery', 'Abdominal Cramps', 'Fever'],
    suspectedDisease: 'Bacillary Dysentery',
    severity: 'MODERATE',
    waterSourceUsed: 'Kaspal Forest Spring Reservoir',
    reportedVia: 'ASHA_APP',
    reportedBy: 'Lalita Mandavi (ASHA-019)',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'MEDICATION_PROVIDED',
    lat: 19.7170,
    lng: 81.2570
  }
];

export const initialAlerts = [
  {
    id: 'alt-801',
    villageId: 'vil-02',
    villageName: 'Sagar Island (Gangasagar, West Bengal)',
    riskScore: 84,
    level: 'CRITICAL',
    title: 'CRITICAL: Severe Pathogen & Diarrhea Cluster Detected',
    message: 'E.coli CFU reached 320/100ml with 3 severe diarrheal cases reported within 400m radius of Deep Tube Well in past 8 hours.',
    channels: ['SMS_BROADCAST', 'IVR_VOICE_CALL', 'ASHA_APP_PUSH', 'DISTRICT_DASHBOARD'],
    recipientsCount: 420,
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    acknowledged: true,
    acknowledgedBy: 'Dr. Suresh Mishra (Chief District Medical Officer)',
    actionsTaken: [
      {
        id: 'act-01',
        type: 'WATER_TREATMENT_CHLORINATION',
        description: 'Super-chlorination squad dispatched to Sagar Island tube well reservoir & distribution points',
        status: 'IN_PROGRESS',
        assignedTo: 'Rapid Water Quality Response Team #3',
        dispatchedAt: new Date(Date.now() - 3600000 * 2.5).toISOString()
      },
      {
        id: 'act-02',
        type: 'ORS_DEPOT_SUPPLY',
        description: 'Delivered 500 ORS sachets + Zinc tablets to ASHA worker Kuni Majhi',
        status: 'COMPLETED',
        assignedTo: 'Block Health Pharmacist',
        dispatchedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'act-03',
        type: 'MOBILE_MEDICAL_CAMP',
        description: 'Deploy 4-person emergency medical van with IV fluids and hydration kits',
        status: 'DISPATCHED',
        assignedTo: 'District Mobile Health Unit #1',
        dispatchedAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ]
  },
  {
    id: 'alt-802',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia, West Bengal)',
    riskScore: 78,
    level: 'HIGH',
    title: 'HIGH RISK: Gosaba River Intake Turbidity & Coliform Surge',
    message: 'Turbidity jumped to 24.8 NTU following 42.5mm monsoon downpour. 2 Typhoid & Gastro cases reported.',
    channels: ['SMS_BROADCAST', 'ASHA_APP_PUSH', 'DISTRICT_DASHBOARD'],
    recipientsCount: 380,
    timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
    acknowledged: true,
    acknowledgedBy: 'District Surveillance Officer (IDSP South 24 Parganas)',
    actionsTaken: [
      {
        id: 'act-04',
        type: 'BOIL_WATER_ADVISORY',
        description: 'Village loudspeaker and SMS broadcast advisory: Boil all drinking water for minimum 10 minutes',
        status: 'COMPLETED',
        assignedTo: 'Panchayat Secretary',
        dispatchedAt: new Date(Date.now() - 3600000 * 9).toISOString()
      },
      {
        id: 'act-05',
        type: 'TEST_KIT_SURVEY',
        description: 'ASHA field survey initiated to test 20 ring wells with H2S test vials',
        status: 'IN_PROGRESS',
        assignedTo: 'ASHA Team Gosaba',
        dispatchedAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ]
  }
];

export const manualTestKitLogs = [
  {
    id: 'tst-201',
    villageId: 'vil-03',
    ashaId: 'ASHA-071',
    ashaName: 'Kuni Majhi',
    sourceName: 'Dug Well near Primary School',
    sourceType: 'Dug Well',
    h2sVialResult: 'BLACK_POSITIVE', // Black = Coliform/Pathogen present
    phStripValue: 6.2,
    freeChlorinePpm: 0.0, // Insufficient chlorination (<0.2 ppm)
    turbidityObservation: 'CLOUDY_SILTY',
    smellTasteIssue: true,
    notes: 'Heavy rainwater run-off entered well rim after overnight downpour.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    photoUrl: null
  },
  {
    id: 'tst-202',
    villageId: 'vil-01',
    ashaId: 'ASHA-042',
    ashaName: 'Anima Saikia',
    sourceName: 'Kamalabari Community Handpump #4',
    sourceType: 'Handpump',
    h2sVialResult: 'YELLOW_NEGATIVE', // Clear/Yellow = Safe
    phStripValue: 7.2,
    freeChlorinePpm: 0.5, // Well chlorinated
    turbidityObservation: 'CLEAR',
    smellTasteIssue: false,
    notes: 'Chlorine tablet added 24 hrs ago, water clear.',
    timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
    photoUrl: null
  }
];

export const microlearningModules = [
  {
    id: 'mod-1',
    title: 'Recognizing Early Dehydration & ORS Preparation',
    titleHindi: 'निर्जलीकरण के लक्षण और ओआरएस (ORS) बनाने की सही विधि',
    titleAssamese: 'ডিহাইড্ৰেচনৰ লক্ষণ আৰু অ’আৰএছ প্ৰস্তুত কৰাৰ নিয়ম',
    category: 'Clinical Field Triage',
    durationMin: 5,
    audioDurationSec: 180,
    steps: [
      {
        step: 1,
        heading: 'Pinch Test & Sunken Eyes',
        headingHindi: 'त्वचा का खिंचाव और धंसी हुई आँखें',
        text: 'Pinch the skin on the child abdomen. If it goes back very slowly (>2 seconds), it indicates severe dehydration. Immediate medical referral is needed.'
      },
      {
        step: 2,
        heading: 'Standard WHO ORS Formulation',
        headingHindi: 'ओआरएस घोल की सही मात्रा',
        text: 'Dissolve 1 whole ORS sachet in exactly 1 Liter of clean boiled & cooled water. Do NOT mix with milk or tea. Discard unused solution after 24 hours.'
      },
      {
        step: 3,
        heading: 'Home Emergency Electrolyte Fallback',
        headingHindi: 'घर पर नमक-चीनी का आपातकालीन घोल',
        text: 'If ORS packet is unavailable: Mix 6 level teaspoons of sugar + 1/2 level teaspoon of salt in 1 liter clean water.'
      }
    ],
    quiz: {
      question: 'After opening and dissolving an ORS sachet in 1 liter water, for how long is the solution safe to consume?',
      questionHindi: 'ओआरएस का घोल बनाने के बाद यह कितने समय तक इस्तेमाल के लिए सुरक्षित रहता है?',
      options: ['6 hours', '24 hours', '48 hours', '1 week'],
      correctAnswer: 1,
      explanation: 'WHO guidelines state ORS solution must be discarded after 24 hours to prevent bacterial multiplication in tropical climates.'
    }
  },
  {
    id: 'mod-2',
    title: 'H2S Water Quality Field Kit Testing Protocol',
    titleHindi: 'एच2एस (H2S) वायल से पानी परीक्षण का सही तरीका',
    category: 'Water Quality Surveillance',
    durationMin: 4,
    audioDurationSec: 150,
    steps: [
      {
        step: 1,
        heading: 'Sample Collection without Contamination',
        headingHindi: 'बिना छुए पानी का नमूना लेना',
        text: 'Pump the tubewell for 2 minutes before filling. Fill the H2S test vial up to the marked 20ml graduation line without touching the inner rim or cap.'
      },
      {
        step: 2,
        heading: '24-48 Hour Room Temperature Incubation',
        headingHindi: 'कमरे के तापमान पर 24 घंटे रखना',
        text: 'Keep the vial at room temperature (25°C-37°C) away from direct sunlight for 24 to 48 hours.'
      },
      {
        step: 3,
        heading: 'Color Interpretation',
        headingHindi: 'रंग देखकर परिणाम की पहचान',
        text: 'Black precipitate = POSITIVE for fecal coliform / enteric pathogens. Clear/Amber = Safe. Log result in the ASHA portal immediately.'
      }
    ],
    quiz: {
      question: 'What does a black color change in an H2S vial test indicate?',
      questionHindi: 'H2S वायल में काला रंग क्या दर्शाता है?',
      options: ['High iron content', 'Presence of fecal coliform & enteric bacteria', 'Excess chlorine residual', 'Safe for drinking'],
      correctAnswer: 1,
      explanation: 'Hydrogen sulfide produced by coliform/enteric bacteria reacts with the iron strip in the vial, turning the water jet black.'
    }
  }
];
