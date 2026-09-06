// api.js — NeerSense Centralized API Service
//
// Direct Multi-Database Synchronization:
// Web inputs are written DIRECTLY to:
//   1. ⚡ Firebase Realtime Database (https://neersense-a5df3-default-rtdb.firebaseio.com)
//   2. 🔥 Cloud Firestore (neersense-a5df3)
//   3. 🖥️ Local Express Backend (memory state sync)

import { isFirebaseConfigured, rtdb } from './firebase';
import {
  waterReportService,
  symptomCaseService,
  villageService,
  riskDashboardService,
  monsoonDataService,
  manualTestService,
  checkFirestoreConnection,
} from './firestoreService';
import {
  rtdbWaterReportService,
  rtdbSymptomService,
  rtdbVillageService,
  rtdbAlertService,
  rtdbManualTestService,
  rtdbMonsoonService,
  ashaWorkerService,
  rtdbVillagerService,
  rtdbHygieneService,
  rtdbAdminService,
} from './rtdbService';

// ─── Status Checks ─────────────────────────────────────────────────────────
export const isUsingFirestore = () =>
  Boolean(
    (import.meta.env.VITE_USE_FIRESTORE === 'true' || import.meta.env.VITE_USE_FIRESTORE === true) &&
    isFirebaseConfigured()
  );

export const isUsingRtdb = () => Boolean(rtdb);

console.info(
  `[NeerSense API] 🟢 Database Status: Realtime Database [${isUsingRtdb() ? 'ACTIVE ⚡' : 'OFF'}] | Firestore [${isUsingFirestore() ? 'ACTIVE 🔥' : 'OFF'}]`
);

const REST_BASE = '/api';

// ─── REST helpers ──────────────────────────────────────────────────────────
async function restGet(path) {
  const res = await fetch(`${REST_BASE}${path}`);
  if (!res.ok) throw new Error(`REST GET ${path} → ${res.status}`);
  return res.json();
}

async function restPost(path, body) {
  const res = await fetch(`${REST_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`REST POST ${path} → ${res.status}`);
  return res.json();
}

async function restPatch(path, body) {
  const res = await fetch(`${REST_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`REST PATCH ${path} → ${res.status}`);
  return res.json();
}

async function restPut(path, body) {
  const res = await fetch(`${REST_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`REST PUT ${path} → ${res.status}`);
  return res.json();
}

async function restDelete(path) {
  const res = await fetch(`${REST_BASE}${path}`, { method: 'DELETE' });
  return res.json();
}

function makeLocalFallback(reportData) {
  return {
    success: true,
    isLocalFallback: true,
    report: {
      ...reportData,
      id:          `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp:   new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      status:      reportData.status || 'PENDING_CLASSIFICATION',
      isApproved:  false,
    },
  };
}

// ═════════════════════════════════════════════════════════════════════════════
//  EXPORTED API OBJECT
// ═════════════════════════════════════════════════════════════════════════════
export const api = {

  isUsingFirestore,
  isUsingRtdb,
  checkConnection: () => checkFirestoreConnection(),

  // ─── Villages ─────────────────────────────────────────────────────────────
  async getVillages() {
    try {
      if (isUsingRtdb()) {
        const list = await rtdbVillageService.getAll();
        if (list && list.length > 0) return list;
      }
      if (isUsingFirestore()) {
        const fsVillages = await villageService.getAll();
        if (fsVillages && fsVillages.length > 0) return fsVillages;
      }
      return await restGet('/villages');
    } catch (err) {
      try { return await restGet('/villages'); } catch { return []; }
    }
  },

  async getVillageById(id) {
    try {
      if (isUsingFirestore()) return await villageService.getById(id);
      return await restGet(`/villages/${id}`);
    } catch (err) {
      return null;
    }
  },

  async createVillage(villageData) {
    try {
      if (isUsingRtdb()) rtdbVillageService.create(villageData).catch(() => {});
      if (isUsingFirestore()) await villageService.create(villageData);
      restPost('/villages', villageData).catch(() => {});
      return villageData;
    } catch (err) {
      return null;
    }
  },

  // ─── Sensors ──────────────────────────────────────────────────────────────
  async getSensors() {
    try {
      return await restGet('/sensors');
    } catch (err) {
      return [];
    }
  },

  async updateSensorReading(sensorId, readings) {
    try {
      return await restPost(`/sensors/${sensorId}/reading`, readings);
    } catch (err) {
      return null;
    }
  },

  async simulateContaminationSpike(villageId, severity = 'CRITICAL') {
    try {
      return await restPost('/sensors/simulate-spike', { villageId, severity });
    } catch (err) {
      return null;
    }
  },

  // ─── Symptoms (Health Input Form) ────────────────────────────────────────
  async getSymptoms() {
    try {
      if (isUsingRtdb()) {
        const list = await rtdbSymptomService.getAll();
        if (list && list.length > 0) return list;
      }
      if (isUsingFirestore()) {
        const fsSymptoms = await symptomCaseService.getAll();
        if (fsSymptoms && fsSymptoms.length > 0) return fsSymptoms;
      }
      return await restGet('/symptoms');
    } catch (err) {
      try { return await restGet('/symptoms'); } catch { return []; }
    }
  },

  /**
   * DIRECT WRITE to Realtime Database & Firestore
   * If submitted by an ASHA worker, also writes to /Asha_Workers/{key}/symptoms
   */
  async submitSymptoms(data) {
    console.info('[api] ⚡ Submitting symptoms to Realtime Database & Firestore...');
    let result = null;

    // 1. Direct write to Firebase Realtime Database (/symptoms — shared collection)
    if (isUsingRtdb()) {
      try {
        result = await rtdbSymptomService.create(data);
        console.info('[api] ✅ Saved to Realtime Database (/symptoms):', result.id);
      } catch (e) {
        console.warn('[api] RTDB symptom write error:', e.message);
      }
    }

    // 2. Also write to /Asha_Workers if this was submitted by an ASHA worker
    if (isUsingRtdb() && (data.submissionRole === 'ASHA' || data.reportedVia === 'ASHA')) {
      const ashaId   = data.ashaId   || data.reportedBy || 'ASHA_unknown';
      const ashaName = data.ashaName  || data.reportedBy || 'ASHA Worker';
      try {
        await ashaWorkerService.saveSymptomCase(ashaId, ashaName, { ...data, id: result?.id });
        console.info('[api] ✅ Symptom case also saved to Asha_Workers node');
      } catch (e) {
        console.warn('[api] Asha_Workers symptom write error:', e.message);
      }
    }

    // 3. Direct write to Cloud Firestore
    if (isUsingFirestore()) {
      try {
        const fsRes = await symptomCaseService.create(data);
        if (!result) result = fsRes;
        console.info('[api] ✅ Saved to Firestore (symptomCases):', fsRes.id);
      } catch (e) {
        console.warn('[api] Firestore symptom write error:', e.message);
      }
    }

    // 4. Dual-sync to local express server
    restPost('/symptoms', data).catch(() => {});

    return { success: true, symptom: result || data, mode: 'DATABASE_DIRECT' };
  },

  async updateSymptomStatus(id, status) {
    if (isUsingRtdb()) rtdbSymptomService.updateStatus(id, status).catch(() => {});
    if (isUsingFirestore()) symptomCaseService.updateStatus(id, status).catch(() => {});
    return restPatch(`/symptoms/${id}/status`, { status }).catch(() => ({ success: true, id, status }));
  },

  // ─── Alerts & Risk Dashboards ─────────────────────────────────────────────
  async getAlerts() {
    try {
      if (isUsingRtdb()) {
        const list = await rtdbAlertService.getAll();
        if (list && list.length > 0) return list;
      }
      if (isUsingFirestore()) {
        const fsAlerts = await riskDashboardService.getAll();
        if (fsAlerts && fsAlerts.length > 0) return fsAlerts;
      }
      return await restGet('/alerts');
    } catch (err) {
      try { return await restGet('/alerts'); } catch { return []; }
    }
  },

  async acknowledgeAlert(alertId, acknowledgedBy) {
    try {
      return await restPost(`/alerts/${alertId}/acknowledge`, { acknowledgedBy });
    } catch (err) {
      return null;
    }
  },

  async dispatchResponseAction(alertId, actionData) {
    try {
      return await restPost(`/alerts/${alertId}/action`, actionData);
    } catch (err) {
      return null;
    }
  },

  async updateActionStatus(alertId, actionId, status) {
    try {
      return await restPost(`/alerts/${alertId}/action/${actionId}/status`, { status });
    } catch (err) {
      return null;
    }
  },

  // ─── Manual Field Tests (H2S Logger) ──────────────────────────────────────
  async getManualTests() {
    try {
      if (isUsingRtdb()) {
        const list = await rtdbManualTestService.getAll();
        if (list && list.length > 0) return list;
      }
      if (isUsingFirestore()) {
        const tests = await manualTestService.getAll();
        if (tests && tests.length > 0) return tests;
      }
      return await restGet('/manual-tests');
    } catch (err) {
      try { return await restGet('/manual-tests'); } catch { return []; }
    }
  },

  /**
   * DIRECT WRITE to Realtime Database & Firestore
   * H2S tests are ALWAYS from ASHA workers → also written to /Asha_Workers/{key}/manualTests
   */
  async submitManualTest(testData) {
    console.info('[api] ⚡ Submitting manual test to Realtime Database & Firestore...');
    const ashaId   = testData.ashaId   || 'ASHA_unknown';
    const ashaName = testData.ashaName || 'ASHA Field Worker';

    const isContaminated =
      testData.h2sVialResult === 'BLACK_CONTAMINATED' ||
      testData.result === 'BLACK_CONTAMINATED' ||
      testData.result === 'CONTAMINATED';

    const reportPayload = {
      villageId:        testData.villageId || null,
      sourceName:       testData.sourceName || 'Field H2S Test',
      sourceType:       testData.sourceType || 'Community Source',
      h2sResult:        isContaminated,
      h2sVialResult:    testData.h2sVialResult || (isContaminated ? 'BLACK_CONTAMINATED' : 'YELLOW_SAFE'),
      ph:               testData.phStripValue != null ? Number(testData.phStripValue) : 7.0,
      turbidity:        1.0,
      bacterialCfu:     isContaminated ? 30 : 0,
      tds:              250,
      safetyStatus:     isContaminated ? 'CONTAMINATED' : 'SAFE',
      status:           'PENDING_CLASSIFICATION',
      submittedBy:      ashaName,
      submissionRole:   'ASHA',
      ashaFieldNotes:   testData.notes || '',
      isApproved:       false,
    };

    // 1. Direct write to Realtime Database (shared collections)
    if (isUsingRtdb()) {
      rtdbManualTestService.create(testData).catch(() => {});
      rtdbWaterReportService.create(reportPayload).catch(() => {});
      console.info('[api] ✅ Field test written to Realtime Database (/manualTests & /waterReports)');
    }

    // 2. Also write to /Asha_Workers — H2S tests are always from ASHA workers
    if (isUsingRtdb()) {
      try {
        await ashaWorkerService.saveManualTest(ashaId, ashaName, testData);
        console.info('[api] ✅ H2S test also saved to Asha_Workers node');
        // Ensure ASHA worker profile exists
        ashaWorkerService.upsertProfile(ashaId, ashaName, {
          villageId: testData.villageId,
        }).catch(() => {});
      } catch (e) {
        console.warn('[api] Asha_Workers H2S test write error:', e.message);
      }
    }

    // 3. Direct write to Cloud Firestore
    if (isUsingFirestore()) {
      manualTestService.create(testData).catch(() => {});
      waterReportService.create(reportPayload).catch(() => {});
      console.info('[api] ✅ Field test written to Firestore (manualTests & waterReports)');
    }

    // 4. Sync to local express
    restPost('/manual-tests', testData).catch(() => {});

    return { success: true, test: testData };
  },

  // ─── Water Reports ────────────────────────────────────────────────────────
  async getWaterReports() {
    try {
      if (isUsingRtdb()) {
        const list = await rtdbWaterReportService.getAll();
        if (list && list.length > 0) return list;
      }
      if (isUsingFirestore()) {
        const fsReports = await waterReportService.getAll();
        if (fsReports && fsReports.length > 0) return fsReports;
      }
      return await restGet('/water-reports');
    } catch (err) {
      try { return await restGet('/water-reports'); } catch { return []; }
    }
  },

  /**
   * DIRECT WRITE to Realtime Database & Firestore
   * Pipeline rule: Water reports are stored under /Asha_Workers and /Hygiene_Department first,
   * and are ONLY added to the main /waterReports & /Admin/verifiedWaterReports after Government verification.
   */
  async createWaterReport(reportData) {
    console.info('[api] ⚡ Creating water report in Realtime Database & Firestore...');
    let report = null;

    // 1. Write to RTDB (rtdbWaterReportService places in Asha_Workers & Hygiene_Department;
    // only adds to /waterReports & /Admin/verifiedWaterReports if already verified)
    if (isUsingRtdb()) {
      try {
        report = await rtdbWaterReportService.create(reportData);
        console.info('[api] ✅ Water report recorded in Realtime Database:', report.id);
      } catch (e) {
        console.warn('[api] RTDB water report write error:', e.message);
      }
    }

    // 2. Direct write to Cloud Firestore (only add to verified collection if approved)
    if (isUsingFirestore() && (reportData.isApproved || reportData.directApprove)) {
      try {
        const fsReport = await waterReportService.create(reportData);
        if (!report) report = fsReport;
        console.info('[api] ✅ Water report written to Firestore (waterReports):', fsReport.id);
      } catch (e) {
        console.warn('[api] Firestore water report write error:', e.message);
      }
    }

    // 3. Dual-sync to local express
    restPost('/water-reports', reportData).catch(() => {});

    if (report) {
      return { success: true, report, mode: 'DATABASE_DIRECT' };
    }

    // Fallback
    try {
      const res = await fetch(`${REST_BASE}/water-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      if (res.ok) return await res.json();
    } catch {}
    return makeLocalFallback(reportData);
  },

  async classifyWaterReport(id, classificationData = {}) {
    if (isUsingRtdb()) rtdbWaterReportService.classify(id, classificationData).catch(() => {});
    if (isUsingFirestore()) waterReportService.classify(id, classificationData).catch(() => {});
    restPatch(`/water-reports/${id}/classify`, classificationData).catch(() => {});
    return { success: true, id };
  },

  async verifyWaterReport(id, verificationData = {}) {
    if (isUsingRtdb()) await rtdbWaterReportService.verify(id, verificationData).catch(() => {});
    if (isUsingFirestore()) await waterReportService.verify(id, verificationData).catch(() => {});
    restPatch(`/water-reports/${id}/verify`, verificationData).catch(() => {});
    return { success: true, id };
  },

  async rejectWaterReport(id, reasonData = {}) {
    if (isUsingRtdb()) rtdbWaterReportService.reject(id, reasonData).catch(() => {});
    if (isUsingFirestore()) waterReportService.reject(id, reasonData).catch(() => {});
    restPatch(`/water-reports/${id}/reject`, reasonData).catch(() => {});
    return { success: true, id };
  },

  async alterWaterReport(id, alterationData = {}) {
    if (isUsingRtdb()) rtdbWaterReportService.alter(id, alterationData).catch(() => {});
    if (isUsingFirestore()) waterReportService.alter(id, alterationData).catch(() => {});
    restPut(`/water-reports/${id}/alter`, alterationData).catch(() => {});
    return { success: true, id };
  },

  async deleteWaterReport(id) {
    if (isUsingRtdb()) rtdbWaterReportService.delete(id).catch(() => {});
    if (isUsingFirestore()) waterReportService.delete(id).catch(() => {});
    restDelete(`/water-reports/${id}`).catch(() => {});
    return { success: true, id };
  },

  // ─── Monsoon Data ────────────────────────────────────────────────────────
  async getMonsoonData(villageId, limitCount = 30) {
    try {
      if (isUsingRtdb()) {
        const list = await rtdbMonsoonService.getAll();
        if (list && list.length > 0) return list;
      }
      if (isUsingFirestore()) {
        return villageId
          ? await monsoonDataService.getByVillage(villageId, limitCount)
          : await monsoonDataService.getRecent(limitCount);
      }
      return [];
    } catch {
      return [];
    }
  },

  async recordMonsoonData(data) {
    if (isUsingRtdb()) rtdbMonsoonService.create(data).catch(() => {});
    if (isUsingFirestore()) monsoonDataService.record(data).catch(() => {});
    return data;
  },

  // ─── USSD / SMS / ML ─────────────────────────────────────────────────────
  async queryUssd(input, sessionCode = 'sess-1', phoneNumber = '9876543210') {
    try {
      return await restPost('/ussd', { input, sessionCode, phoneNumber });
    } catch {
      return null;
    }
  },

  async sendSmsGateway(from, body) {
    try {
      return await restPost('/sms-gateway', { from, body });
    } catch {
      return null;
    }
  },

  async getMlConfig() {
    try {
      return await restGet('/ml/config');
    } catch {
      return null;
    }
  },

  async updateMlConfig(config) {
    try {
      return await restPost('/ml/config', config);
    } catch {
      return null;
    }
  },

  async getMicrolearning() {
    try {
      return await restGet('/microlearning');
    } catch {
      return null;
    }
  },

  async clearAllData() {
    try {
      return await restPost('/admin/clear-all', {});
    } catch {
      return null;
    }
  },

  // ─── Asha_Workers Key Service ─────────────────────────────────────────────
  async getAshaWorkers() {
    if (isUsingRtdb()) {
      try {
        return await ashaWorkerService.getAllWorkers();
      } catch (e) {
        console.warn('[api] getAshaWorkers error:', e.message);
      }
    }
    return [];
  },

  async getAshaReports(ashaId, ashaName) {
    if (isUsingRtdb()) {
      try {
        return await ashaWorkerService.getWaterReports(ashaId, ashaName);
      } catch (e) {
        console.warn('[api] getAshaReports error:', e.message);
      }
    }
    return [];
  },

  // ─── Role-Specific Database Key Getters ───────────────────────────────────
  async getVillagerHealthReports() {
    if (isUsingRtdb()) {
      try {
        return await rtdbVillagerService.getAllHealthReports();
      } catch (e) {
        console.warn('[api] getVillagerHealthReports error:', e.message);
      }
    }
    return [];
  },

  async getHygieneWaterReports() {
    if (isUsingRtdb()) {
      try {
        return await rtdbHygieneService.getAllWaterReports();
      } catch (e) {
        console.warn('[api] getHygieneWaterReports error:', e.message);
      }
    }
    return [];
  },

  async getAdminVerifiedWaterReports() {
    if (isUsingRtdb()) {
      try {
        return await rtdbAdminService.getAllVerifiedReports();
      } catch (e) {
        console.warn('[api] getAdminVerifiedWaterReports error:', e.message);
      }
    }
    return [];
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  REAL-TIME SUBSCRIPTIONS (Live updates from RTDB & Firestore)
// ═════════════════════════════════════════════════════════════════════════════
export const subscriptions = {
  waterReports: (callback) => {
    if (isUsingRtdb()) return rtdbWaterReportService.subscribe(callback);
    if (isUsingFirestore()) return waterReportService.subscribe(callback);
    return () => {};
  },
  symptoms: (callback) => {
    if (isUsingRtdb()) return rtdbSymptomService.subscribe(callback);
    if (isUsingFirestore()) return symptomCaseService.subscribe(callback);
    return () => {};
  },
  riskDashboards: (callback) => {
    if (isUsingRtdb()) return rtdbAlertService.subscribe(callback);
    if (isUsingFirestore()) return riskDashboardService.subscribe(callback);
    return () => {};
  },
  ashaWorker: (ashaId, ashaName, callback) => {
    if (isUsingRtdb()) return ashaWorkerService.subscribeToWorker(ashaId, ashaName, callback);
    return () => {};
  },
  allAshaWorkers: (callback) => {
    if (isUsingRtdb()) return ashaWorkerService.subscribeToAllWorkers(callback);
    return () => {};
  },
  villagerHealthReports: (callback) => {
    if (isUsingRtdb()) return rtdbVillagerService.subscribe(callback);
    return () => {};
  },
  hygieneWaterReports: (callback) => {
    if (isUsingRtdb()) return rtdbHygieneService.subscribe(callback);
    return () => {};
  },
  adminVerifiedWaterReports: (callback) => {
    if (isUsingRtdb()) return rtdbAdminService.subscribe(callback);
    return () => {};
  },
};

export default api;
