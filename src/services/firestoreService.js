// firestoreService.js — NeerSense Firebase Data Connect → Firestore mapping
//
// Schema source (from Firebase Data Connect SDL):
//   Village, User, WaterReport, SymptomCase, RiskDashboard, MonsoonData
//
// Each @table maps to a Firestore top-level collection with the same name.
// Direct writes from the web UI are sanitized and written with setDoc(..., { merge: true }).

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

// ─── Collection name constants (match @table names) ───────────────────────────
export const COLLECTIONS = {
  VILLAGES:        'villages',       // Village @table
  USERS:           'users',          // User @table
  WATER_REPORTS:   'waterReports',   // WaterReport @table
  SYMPTOM_CASES:   'symptomCases',   // SymptomCase @table
  RISK_DASHBOARDS: 'riskDashboards', // RiskDashboard @table
  MONSOON_DATA:    'monsoonData',    // MonsoonData @table
  MANUAL_TESTS:    'manualTests',    // Manual field test logs
};

// ─── Guard: throw friendly error if Firebase is not configured ─────────────────
function requireDb() {
  if (!db) throw new Error('Firebase not configured. Please verify your VITE_FIREBASE_* keys in .env');
  return db;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Remove undefined values to prevent Firestore "Unsupported field value: undefined" errors
 */
export function sanitizeForFirestore(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = (val && typeof val === 'object' && val.constructor?.name === 'Object')
        ? sanitizeForFirestore(val)
        : val;
    }
  }
  return clean;
}

/**
 * Convert a Firestore document snapshot to a plain JS object
 * Resolves nested Timestamp → ISO string, and stores id at doc.id
 */
function docToObj(snap) {
  if (!snap.exists()) return null;
  const data = snap.data();
  return { id: snap.id, ...flattenTimestamps(data) };
}

function flattenTimestamps(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val instanceof Timestamp) {
      result[key] = val.toDate().toISOString();
    } else if (val && typeof val === 'object' && !Array.isArray(val) && val.constructor?.name !== 'DocumentReference') {
      result[key] = flattenTimestamps(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

function collectionRef(name) {
  return collection(requireDb(), name);
}

// ─────────────────────────────────────────────────────────────────────────────
//  VILLAGE  (type Village @table)
//  Fields: name, region, district, latitude, longitude, population,
//          vulnerabilityIndex
// ─────────────────────────────────────────────────────────────────────────────
export const villageService = {
  async getAll() {
    const snap = await getDocs(query(collectionRef(COLLECTIONS.VILLAGES), orderBy('name')));
    return snap.docs.map(docToObj);
  },

  async getById(id) {
    const snap = await getDoc(doc(requireDb(), COLLECTIONS.VILLAGES, id));
    return docToObj(snap);
  },

  async create(data) {
    const docId = data.id || `vil-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ref = doc(requireDb(), COLLECTIONS.VILLAGES, docId);
    const payload = sanitizeForFirestore({
      name:               data.name,
      region:             data.region || '',
      district:           data.district || '',
      latitude:           Number(data.latitude) || 0,
      longitude:          Number(data.longitude) || 0,
      population:         data.population ? Number(data.population) : null,
      vulnerabilityIndex: data.vulnerabilityIndex ? Number(data.vulnerabilityIndex) : null,
      createdAt:          serverTimestamp(),
    });
    await setDoc(ref, payload, { merge: true });
    return { id: docId, ...payload };
  },

  async update(id, data) {
    const ref = doc(requireDb(), COLLECTIONS.VILLAGES, id);
    const payload = sanitizeForFirestore({
      ...data,
      updatedAt: serverTimestamp(),
    });
    await setDoc(ref, payload, { merge: true });
    return { id, ...data };
  },

  async delete(id) {
    await deleteDoc(doc(requireDb(), COLLECTIONS.VILLAGES, id));
    return { id };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  USER  (type User @table)
//  Fields: role, preferredLanguage, contactNumber, assignedVillage (ref)
// ─────────────────────────────────────────────────────────────────────────────
export const userService = {
  async getAll() {
    const snap = await getDocs(collectionRef(COLLECTIONS.USERS));
    return snap.docs.map(docToObj);
  },

  async getById(id) {
    const snap = await getDoc(doc(requireDb(), COLLECTIONS.USERS, id));
    return docToObj(snap);
  },

  async getByRole(role) {
    const snap = await getDocs(
      query(collectionRef(COLLECTIONS.USERS), where('role', '==', role))
    );
    return snap.docs.map(docToObj);
  },

  async upsert(uid, data) {
    const ref = doc(requireDb(), COLLECTIONS.USERS, uid);
    const payload = sanitizeForFirestore({
      role:              data.role,
      preferredLanguage: data.preferredLanguage || 'en',
      contactNumber:     data.contactNumber || '',
      assignedVillageId: data.assignedVillageId || null,
      updatedAt:         serverTimestamp(),
    });
    await setDoc(ref, payload, { merge: true });
    return { id: uid, ...data };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  WATER REPORT  (type WaterReport @table)
//  Fields: village (ref), reportedAt, h2sResult, ph, turbidity, eColi,
//          tds, do, recordedBy (ref)
// ─────────────────────────────────────────────────────────────────────────────
export const waterReportService = {
  async getAll() {
    const snap = await getDocs(
      query(collectionRef(COLLECTIONS.WATER_REPORTS), orderBy('reportedAt', 'desc'))
    );
    return snap.docs.map(docToObj);
  },

  async getByVillage(villageId) {
    const snap = await getDocs(
      query(
        collectionRef(COLLECTIONS.WATER_REPORTS),
        where('villageId', '==', villageId),
        orderBy('reportedAt', 'desc')
      )
    );
    return snap.docs.map(docToObj);
  },

  async getApproved() {
    const snap = await getDocs(
      query(
        collectionRef(COLLECTIONS.WATER_REPORTS),
        where('isApproved', '==', true),
        orderBy('reportedAt', 'desc')
      )
    );
    return snap.docs.map(docToObj);
  },

  async create(data) {
    const docId = data.id || `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ref = doc(requireDb(), COLLECTIONS.WATER_REPORTS, docId);

    const isContaminated =
      data.h2sResult === true ||
      data.h2sVialResult === 'BLACK_CONTAMINATED' ||
      data.safetyStatus === 'CONTAMINATED';

    const payload = sanitizeForFirestore({
      // Schema fields (WaterReport @table)
      villageId:    data.villageId || null,
      villageName:  data.villageName || '',
      reportedAt:   serverTimestamp(),
      h2sResult:    isContaminated,
      ph:           data.ph != null ? Number(data.ph) : null,
      turbidity:    data.turbidity != null ? Number(data.turbidity) : null,
      eColi:        data.bacterialCfu != null ? Number(data.bacterialCfu) : (data.eColi != null ? Number(data.eColi) : null),
      tds:          data.tds != null ? Number(data.tds) : null,
      do:           data.dissolvedOxygen != null ? Number(data.dissolvedOxygen) : (data.do != null ? Number(data.do) : null),
      recordedById: data.recordedById || null,

      // App-specific extended fields
      sourceName:       data.sourceName || '',
      sourceType:       data.sourceType || 'Community Source',
      h2sVialResult:    data.h2sVialResult || (isContaminated ? 'BLACK_CONTAMINATED' : 'YELLOW_SAFE'),
      safetyStatus:     data.safetyStatus || (isContaminated ? 'CONTAMINATED' : 'SAFE'),
      advisory:         data.advisory || (isContaminated ? 'Water is contaminated. Boil before use or request chlorine tablets.' : 'Safe for drinking.'),
      status:           data.directApprove ? 'APPROVED' : (data.status || 'PENDING_CLASSIFICATION'),
      submittedBy:      data.submittedBy || data.testedBy || 'ASHA Field Worker',
      submissionRole:   data.submissionRole || 'ASHA',
      ashaFieldNotes:   data.ashaFieldNotes || data.notes || '',
      isApproved:       Boolean(data.directApprove || data.isApproved),
      isAltered:        Boolean(data.isAltered),
      timestamp:        data.timestamp || new Date().toISOString(),
    });

    await setDoc(ref, payload, { merge: true });
    console.info(`[NeerSense Firebase] ✅ WaterReport document ${docId} written directly to Firestore`);
    return { id: docId, ...payload, reportedAt: new Date().toISOString() };
  },

  async classify(id, data) {
    const ref = doc(requireDb(), COLLECTIONS.WATER_REPORTS, id);
    const payload = sanitizeForFirestore({
      safetyStatus:       data.safetyStatus,
      status:             'PENDING_APPROVAL',
      classifiedBy:       data.classifiedBy || 'Hygiene Department',
      advisory:           data.advisory || '',
      classificationNote: data.notes || data.note || '',
      classifiedAt:       serverTimestamp(),
    });
    await setDoc(ref, payload, { merge: true });
    console.info(`[NeerSense Firebase] ✅ WaterReport ${id} classified directly in Firestore`);
    return { id, ...data };
  },

  async verify(id, data) {
    const ref = doc(requireDb(), COLLECTIONS.WATER_REPORTS, id);
    const payload = sanitizeForFirestore({
      isApproved:   true,
      status:       'APPROVED',
      verifiedBy:   data.verifiedBy || 'Government Official',
      safetyStatus: data.safetyStatus || undefined,
      advisory:     data.advisory || undefined,
      remarks:      data.remarks || '',
      verifiedAt:   serverTimestamp(),
    });
    await setDoc(ref, payload, { merge: true });
    console.info(`[NeerSense Firebase] ✅ WaterReport ${id} verified & published directly in Firestore`);
    return { id, ...data };
  },

  async reject(id, data) {
    const ref = doc(requireDb(), COLLECTIONS.WATER_REPORTS, id);
    const payload = sanitizeForFirestore({
      status:          'REJECTED',
      isApproved:      false,
      rejectionReason: data.reason || 'Re-test requested by Government.',
      rejectedAt:      serverTimestamp(),
    });
    await setDoc(ref, payload, { merge: true });
    console.info(`[NeerSense Firebase] ✅ WaterReport ${id} marked REJECTED directly in Firestore`);
    return { id, ...data };
  },

  async alter(id, data) {
    const ref = doc(requireDb(), COLLECTIONS.WATER_REPORTS, id);
    const payload = sanitizeForFirestore({
      ...data,
      isAltered:                true,
      alterationPermissionToken: data.permissionToken || null,
      alterationReason:          data.permissionReason || '',
      alteredBy:                 data.alteredBy || '',
      alteredAt:                 serverTimestamp(),
    });
    await setDoc(ref, payload, { merge: true });
    console.info(`[NeerSense Firebase] ✅ WaterReport ${id} altered under permission directly in Firestore`);
    return { id, ...data };
  },

  async delete(id) {
    await deleteDoc(doc(requireDb(), COLLECTIONS.WATER_REPORTS, id));
    console.info(`[NeerSense Firebase] ✅ WaterReport ${id} deleted directly from Firestore`);
    return { id };
  },

  // Real-time listener for live updates
  subscribe(callback) {
    const q = query(
      collectionRef(COLLECTIONS.WATER_REPORTS),
      orderBy('reportedAt', 'desc'),
      limit(100)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(docToObj));
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SYMPTOM CASE  (type SymptomCase @table)
//  Fields: village (ref), reportedAt, symptomList, urgencyLevel,
//          triageStatus, reportedBy (ref)
// ─────────────────────────────────────────────────────────────────────────────
export const symptomCaseService = {
  async getAll() {
    const snap = await getDocs(
      query(collectionRef(COLLECTIONS.SYMPTOM_CASES), orderBy('reportedAt', 'desc'))
    );
    return snap.docs.map(docToObj);
  },

  async create(data) {
    const docId = data.id || `sym-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ref = doc(requireDb(), COLLECTIONS.SYMPTOM_CASES, docId);

    const symptomsList = Array.isArray(data.symptoms)
      ? data.symptoms.join(', ')
      : (data.symptomList || '');

    const payload = sanitizeForFirestore({
      // Schema fields (SymptomCase @table)
      villageId:     data.villageId || null,
      villageName:   data.villageName || '',
      reportedAt:    serverTimestamp(),
      symptomList:   symptomsList,
      urgencyLevel:  data.severity === 'CRITICAL' ? 3 : data.severity === 'SEVERE' ? 2 : (data.urgencyLevel != null ? Number(data.urgencyLevel) : 1),
      triageStatus:  data.triageStatus || (data.severity === 'CRITICAL' ? 'FLAGGED_HIGH' : 'PENDING'),
      recordedById:  data.recordedById || null,

      // App-specific fields
      patientName:     data.patientName || 'Citizen Direct Report',
      patientAge:      data.age != null ? Number(data.age) : (data.patientAge != null ? Number(data.patientAge) : null),
      patientGender:   data.gender || data.patientGender || '',
      symptoms:        data.symptoms || [],
      suspectedDisease: data.suspectedDisease || '',
      severity:        data.severity || 'MODERATE',
      waterSourceUsed: data.waterSourceUsed || '',
      reportedVia:     data.reportedVia || 'WEB_APP',
      contactNumber:   data.contactNumber || '',
      notes:           data.notes || '',
      status:          data.status || 'PENDING',
      reportedBy:      data.reportedBy || '',
      timestamp:       data.timestamp || new Date().toISOString(),
    });

    await setDoc(ref, payload, { merge: true });
    console.info(`[NeerSense Firebase] ✅ SymptomCase document ${docId} written directly to Firestore`);
    return { id: docId, ...payload, reportedAt: new Date().toISOString() };
  },

  async updateStatus(id, status) {
    const ref = doc(requireDb(), COLLECTIONS.SYMPTOM_CASES, id);
    await setDoc(ref, {
      triageStatus: status,
      status:       status,
      updatedAt:    serverTimestamp(),
    }, { merge: true });
    console.info(`[NeerSense Firebase] ✅ SymptomCase ${id} status updated directly in Firestore`);
    return { id, status };
  },

  // Real-time listener
  subscribe(callback) {
    const q = query(
      collectionRef(COLLECTIONS.SYMPTOM_CASES),
      orderBy('reportedAt', 'desc'),
      limit(200)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(docToObj));
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  MANUAL FIELD TESTS
// ─────────────────────────────────────────────────────────────────────────────
export const manualTestService = {
  async getAll() {
    const snap = await getDocs(
      query(collectionRef(COLLECTIONS.MANUAL_TESTS), orderBy('timestamp', 'desc'), limit(100))
    );
    return snap.docs.map(docToObj);
  },

  async create(data) {
    const docId = data.id || `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ref = doc(requireDb(), COLLECTIONS.MANUAL_TESTS, docId);
    const payload = sanitizeForFirestore({
      ...data,
      createdAt: serverTimestamp(),
      timestamp: data.timestamp || new Date().toISOString(),
    });
    await setDoc(ref, payload, { merge: true });
    console.info(`[NeerSense Firebase] ✅ ManualTest document ${docId} written directly to Firestore`);
    return { id: docId, ...payload };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  RISK DASHBOARD  (type RiskDashboard @table)
//  Fields: village (ref), riskScore, calculatedAt, alertLevel, statusNotes
// ─────────────────────────────────────────────────────────────────────────────
export const riskDashboardService = {
  async getAll() {
    const snap = await getDocs(
      query(collectionRef(COLLECTIONS.RISK_DASHBOARDS), orderBy('calculatedAt', 'desc'))
    );
    return snap.docs.map(docToObj);
  },

  async getByVillage(villageId) {
    const snap = await getDocs(
      query(
        collectionRef(COLLECTIONS.RISK_DASHBOARDS),
        where('villageId', '==', villageId),
        orderBy('calculatedAt', 'desc'),
        limit(1)
      )
    );
    return snap.docs.length ? docToObj(snap.docs[0]) : null;
  },

  async upsertForVillage(villageId, data) {
    const docId = `risk-${villageId}`;
    const ref = doc(requireDb(), COLLECTIONS.RISK_DASHBOARDS, docId);
    const payload = sanitizeForFirestore({
      villageId,
      villageName:  data.villageName || '',
      riskScore:    Number(data.riskScore) || 0,
      calculatedAt: serverTimestamp(),
      alertLevel:   data.alertLevel || 'LOW',
      statusNotes:  data.statusNotes || '',
    });
    await setDoc(ref, payload, { merge: true });
    console.info(`[NeerSense Firebase] ✅ RiskDashboard document ${docId} written directly to Firestore`);
    return { id: docId, ...payload };
  },

  // Real-time listener
  subscribe(callback) {
    return onSnapshot(collectionRef(COLLECTIONS.RISK_DASHBOARDS), (snap) => {
      callback(snap.docs.map(docToObj));
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  MONSOON DATA  (type MonsoonData @table)
//  Fields: village (ref), recordedAt, rainfallIntensity, humidity
// ─────────────────────────────────────────────────────────────────────────────
export const monsoonDataService = {
  async getRecent(limitCount = 50) {
    const snap = await getDocs(
      query(
        collectionRef(COLLECTIONS.MONSOON_DATA),
        orderBy('recordedAt', 'desc'),
        limit(limitCount)
      )
    );
    return snap.docs.map(docToObj);
  },

  async getByVillage(villageId, limitCount = 30) {
    const snap = await getDocs(
      query(
        collectionRef(COLLECTIONS.MONSOON_DATA),
        where('villageId', '==', villageId),
        orderBy('recordedAt', 'desc'),
        limit(limitCount)
      )
    );
    return snap.docs.map(docToObj);
  },

  async record(data) {
    const docId = data.id || `mon-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ref = doc(requireDb(), COLLECTIONS.MONSOON_DATA, docId);
    const payload = sanitizeForFirestore({
      villageId:          data.villageId || null,
      villageName:        data.villageName || '',
      recordedAt:         serverTimestamp(),
      rainfallIntensity:  data.rainfallIntensity != null ? Number(data.rainfallIntensity) : null,
      humidity:           data.humidity != null ? Number(data.humidity) : null,
      timestamp:          new Date().toISOString(),
    });
    await setDoc(ref, payload, { merge: true });
    console.info(`[NeerSense Firebase] ✅ MonsoonData document ${docId} written directly to Firestore`);
    return { id: docId, ...payload };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  BATCH SEED — populate Firestore with initial village data
// ─────────────────────────────────────────────────────────────────────────────
export async function seedInitialVillages(villageList) {
  const db_ = requireDb();
  const batch = writeBatch(db_);
  for (const v of villageList) {
    const ref = doc(collectionRef(COLLECTIONS.VILLAGES));
    batch.set(ref, sanitizeForFirestore({
      name:               v.name,
      region:             v.region || 'West Bengal',
      district:           v.district || '',
      latitude:           Number(v.latitude) || 0,
      longitude:          Number(v.longitude) || 0,
      population:         v.population || null,
      vulnerabilityIndex: v.vulnerabilityIndex || null,
      createdAt:          serverTimestamp(),
    }));
  }
  await batch.commit();
  console.info(`[NeerSense Firestore] Seeded ${villageList.length} villages`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  CHECK CONNECTION — simple connectivity test
// ─────────────────────────────────────────────────────────────────────────────
export async function checkFirestoreConnection() {
  try {
    if (!isFirebaseConfigured()) return { connected: false, reason: 'Not configured' };
    await getDocs(query(collectionRef(COLLECTIONS.VILLAGES), limit(1)));
    return { connected: true };
  } catch (err) {
    return { connected: false, reason: err.message };
  }
}
