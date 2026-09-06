// rtdbService.js — NeerSense Firebase Realtime Database Service Layer
//
// Direct real-time reads, writes, and live sync listeners on:
//   https://neersense-a5df3-default-rtdb.firebaseio.com
//
// Node paths & Role-Specific Keys:
//   /Villagers/healthReports                 ← Villagers health reports input
//   /Hygiene_Department/waterReports         ← Water reports under hygiene inspection & classification
//   /Admin/verifiedWaterReports              ← Water reports verified and approved by Government Admin
//   /Asha_Workers/{ashaKey}/waterReports     ← ASHA water reports submissions
//   /Asha_Workers/{ashaKey}/manualTests      ← ASHA field test kits (H2S vials)
//   /Asha_Workers/{ashaKey}/symptoms         ← Symptom cases reported via ASHA
//   /Asha_Workers/{ashaKey}/profile          ← ASHA worker profile
//   /waterReports                            ← Main database of water reports: ADDED AFTER VERIFICATION BY GOVT
//   /symptoms                                ← Global outbreak monitoring symptoms (mirrored from Villagers/healthReports)
//   /villages                                ← Villages reference directory
//   /alerts                                  ← Active outbreak alerts & risk dashboards
//   /manualTests                             ← Field test logs
//   /monsoonData                             ← Rainfall & weather data

import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  serverTimestamp,
} from 'firebase/database';
import { rtdb } from './firebase';

function requireRtdb() {
  if (!rtdb) throw new Error('Realtime Database not initialized');
  return rtdb;
}

function snapshotToArray(snapshot) {
  if (!snapshot.exists()) return [];
  const val = snapshot.val();
  if (Array.isArray(val)) {
    return val.filter(Boolean);
  }
  return Object.entries(val).map(([id, item]) => ({
    id,
    ...(typeof item === 'object' ? item : { value: item }),
  }));
}

// Synchronize water report updates to Asha_Workers if this report belongs to an ASHA worker
async function syncReportToAshaWorker(reportId, updates) {
  try {
    if (!rtdb) return;
    const snap = await get(ref(rtdb, 'Asha_Workers'));
    if (!snap.exists()) return;
    const workers = snap.val();
    for (const [key, worker] of Object.entries(workers)) {
      if (worker.waterReports && worker.waterReports[reportId]) {
        await update(ref(rtdb, `Asha_Workers/${key}/waterReports/${reportId}`), {
          ...updates,
          updatedAt: Date.now(),
        });
        console.info(`[NeerSense RTDB] ⚡ Synced report ${reportId} update to Asha_Workers/${key}`);
        break;
      }
    }
  } catch (e) {
    // Non-blocking background sync
  }
}

async function syncDeleteToAshaWorker(reportId) {
  try {
    if (!rtdb) return;
    const snap = await get(ref(rtdb, 'Asha_Workers'));
    if (!snap.exists()) return;
    const workers = snap.val();
    for (const [key, worker] of Object.entries(workers)) {
      if (worker.waterReports && worker.waterReports[reportId]) {
        await remove(ref(rtdb, `Asha_Workers/${key}/waterReports/${reportId}`));
        break;
      }
    }
  } catch (e) {}
}

// ─────────────────────────────────────────────────────────────────────────────
//  WATER REPORTS (/waterReports)
//
//  Pipeline:
//    1. ASHA submits → stored under /Asha_Workers and /Hygiene_Department (NOT in /waterReports yet)
//    2. Hygiene Dept classifies → updated in /Hygiene_Department and /Asha_Workers
//    3. Govt Admin verifies → OFFICIALLY ADDED to /waterReports and /Admin/verifiedWaterReports
// ─────────────────────────────────────────────────────────────────────────────
export const rtdbWaterReportService = {
  async getAll() {
    const db = requireRtdb();
    // 1. Fetch verified reports from /waterReports (public verified)
    const snapVerified = await get(ref(db, 'waterReports'));
    const verifiedList = snapshotToArray(snapVerified);

    // 2. Fetch reports under /Hygiene_Department/waterReports (pending / in-review)
    const snapHygiene = await get(ref(db, 'Hygiene_Department/waterReports'));
    const hygieneList = snapshotToArray(snapHygiene);

    // 3. Combine and de-duplicate by ID (verified record takes precedence)
    const reportMap = new Map();
    hygieneList.forEach(r => reportMap.set(r.id, r));
    verifiedList.forEach(r => reportMap.set(r.id, r));

    const list = Array.from(reportMap.values());
    return list.sort((a, b) => new Date(b.timestamp || b.reportedAt || 0) - new Date(a.timestamp || a.reportedAt || 0));
  },

  async create(data) {
    const docId = data.id || `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const isContaminated =
      data.h2sResult === true ||
      data.h2sVialResult === 'BLACK_CONTAMINATED' ||
      data.safetyStatus === 'CONTAMINATED';

    const isVerified = Boolean(data.directApprove || data.isApproved || data.status === 'APPROVED');

    const payload = {
      id:               docId,
      villageId:        data.villageId || null,
      villageName:      data.villageName || '',
      sourceName:       data.sourceName || '',
      sourceType:       data.sourceType || 'Community Source',
      h2sResult:        isContaminated,
      h2sVialResult:    data.h2sVialResult || (isContaminated ? 'BLACK_CONTAMINATED' : 'YELLOW_SAFE'),
      ph:               data.ph != null ? Number(data.ph) : 7.0,
      turbidity:        data.turbidity != null ? Number(data.turbidity) : 1.0,
      bacterialCfu:     data.bacterialCfu != null ? Number(data.bacterialCfu) : (data.eColi != null ? Number(data.eColi) : 0),
      tds:              data.tds != null ? Number(data.tds) : 250,
      safetyStatus:     data.safetyStatus || (isContaminated ? 'CONTAMINATED' : 'SAFE'),
      advisory:         data.advisory || (isContaminated ? 'Water is contaminated. Boil before use or request chlorine tablets.' : 'Safe for drinking.'),
      status:           isVerified ? 'APPROVED' : (data.status || 'PENDING_CLASSIFICATION'),
      submittedBy:      data.submittedBy || data.testedBy || 'ASHA Field Worker',
      submissionRole:   data.submissionRole || 'ASHA',
      ashaFieldNotes:   data.ashaFieldNotes || data.notes || '',
      isApproved:       isVerified,
      isAltered:        Boolean(data.isAltered),
      timestamp:        data.timestamp || new Date().toISOString(),
      updatedAt:        Date.now(),
    };

    // A. Store under Hygiene_Department so Hygiene Dept can inspect & classify
    await set(ref(requireRtdb(), `Hygiene_Department/waterReports/${docId}`), payload);
    console.info(`[NeerSense RTDB] ⚡ WaterReport ${docId} stored under Hygiene_Department/waterReports`);

    // B. If submitted by ASHA, also save under Asha_Workers
    if (payload.submissionRole === 'ASHA' || payload.submittedBy?.includes('ASHA')) {
      const ashaId = data.ashaId || payload.submittedBy;
      const ashaName = data.ashaName || payload.submittedBy;
      ashaWorkerService.saveWaterReport(ashaId, ashaName, payload).catch(() => {});
    }

    // C. Added to the main database /waterReports and /Admin/verifiedWaterReports ONLY after verification
    if (isVerified) {
      await set(ref(requireRtdb(), `waterReports/${docId}`), payload);
      await set(ref(requireRtdb(), `Admin/verifiedWaterReports/${docId}`), payload);
      console.info(`[NeerSense RTDB] ⚡ Verified WaterReport ${docId} added to /waterReports & /Admin/verifiedWaterReports`);
    } else {
      console.info(`[NeerSense RTDB] ⏳ WaterReport ${docId} stored under role keys (Asha_Workers & Hygiene_Department) awaiting government verification`);
    }

    return payload;
  },

  async classify(id, data) {
    const payload = {
      safetyStatus:       data.safetyStatus,
      status:             'PENDING_APPROVAL',
      classifiedBy:       data.classifiedBy || 'Hygiene Department',
      advisory:           data.advisory || '',
      classificationNote: data.notes || data.note || '',
      classifiedAt:       new Date().toISOString(),
      updatedAt:          Date.now(),
    };

    // Update in Hygiene_Department
    await update(ref(requireRtdb(), `Hygiene_Department/waterReports/${id}`), payload);
    // Sync to Asha_Workers
    syncReportToAshaWorker(id, payload).catch(() => {});
    console.info(`[NeerSense RTDB] ⚡ WaterReport ${id} classified under Hygiene_Department/waterReports`);
    return { id, ...payload };
  },

  async verify(id, data) {
    // 1. Fetch current record from Hygiene_Department or Asha_Workers or existing
    let existingReport = null;
    try {
      const snapH = await get(ref(requireRtdb(), `Hygiene_Department/waterReports/${id}`));
      if (snapH.exists()) existingReport = snapH.val();
    } catch {}

    if (!existingReport) {
      try {
        const snapW = await get(ref(requireRtdb(), `waterReports/${id}`));
        if (snapW.exists()) existingReport = snapW.val();
      } catch {}
    }

    const verificationPayload = {
      ...(existingReport || {}),
      id,
      isApproved:   true,
      status:       'APPROVED',
      verifiedBy:   data.verifiedBy || 'Government Official',
      remarks:      data.remarks || '',
      verifiedAt:   new Date().toISOString(),
      updatedAt:    Date.now(),
    };
    if (data.safetyStatus) verificationPayload.safetyStatus = data.safetyStatus;
    if (data.advisory) verificationPayload.advisory = data.advisory;

    // 2. NOW OFFICIALLY ADD TO /waterReports (ONLY ADDED AFTER VERIFIED BY GOVERNMENT)
    await set(ref(requireRtdb(), `waterReports/${id}`), verificationPayload);

    // 3. ADD TO /Admin/verifiedWaterReports
    await set(ref(requireRtdb(), `Admin/verifiedWaterReports/${id}`), verificationPayload);

    // 4. Update status in Hygiene_Department
    await update(ref(requireRtdb(), `Hygiene_Department/waterReports/${id}`), {
      isApproved:   true,
      status:       'APPROVED',
      verifiedBy:   verificationPayload.verifiedBy,
      verifiedAt:   verificationPayload.verifiedAt,
      remarks:      verificationPayload.remarks,
      safetyStatus: verificationPayload.safetyStatus,
      advisory:     verificationPayload.advisory,
      updatedAt:    Date.now(),
    }).catch(() => {});

    // 5. Update status in Asha_Workers
    syncReportToAshaWorker(id, {
      isApproved:   true,
      status:       'APPROVED',
      verifiedBy:   verificationPayload.verifiedBy,
      verifiedAt:   verificationPayload.verifiedAt,
      remarks:      verificationPayload.remarks,
      safetyStatus: verificationPayload.safetyStatus,
      advisory:     verificationPayload.advisory,
      updatedAt:    Date.now(),
    }).catch(() => {});

    console.info(`[NeerSense RTDB] ⚡ WaterReport ${id} VERIFIED BY GOVERNMENT & ADDED TO /waterReports & /Admin/verifiedWaterReports`);
    return verificationPayload;
  },

  async reject(id, data) {
    const payload = {
      status:          'REJECTED',
      isApproved:      false,
      rejectionReason: data.reason || 'Re-test requested by Government.',
      rejectedAt:      new Date().toISOString(),
      updatedAt:       Date.now(),
    };
    // Ensure it is removed from /waterReports and /Admin/verifiedWaterReports
    await remove(ref(requireRtdb(), `waterReports/${id}`)).catch(() => {});
    await remove(ref(requireRtdb(), `Admin/verifiedWaterReports/${id}`)).catch(() => {});
    // Update in Hygiene_Department
    await update(ref(requireRtdb(), `Hygiene_Department/waterReports/${id}`), payload).catch(() => {});
    // Update in Asha_Workers
    syncReportToAshaWorker(id, payload).catch(() => {});
    console.info(`[NeerSense RTDB] ⚡ WaterReport ${id} marked REJECTED (re-test requested) in Hygiene_Department & Asha_Workers`);
    return { id, ...payload };
  },

  async alter(id, data) {
    const payload = {
      ...data,
      isAltered:                true,
      alterationPermissionToken: data.permissionToken || null,
      alterationReason:          data.permissionReason || '',
      alteredBy:                 data.alteredBy || '',
      alteredAt:                 new Date().toISOString(),
      updatedAt:                 Date.now(),
    };
    // Update in /waterReports if already verified
    try {
      const snap = await get(ref(requireRtdb(), `waterReports/${id}`));
      if (snap.exists()) {
        await update(ref(requireRtdb(), `waterReports/${id}`), payload);
        await update(ref(requireRtdb(), `Admin/verifiedWaterReports/${id}`), payload).catch(() => {});
      }
    } catch {}

    // Update in Hygiene_Department
    await update(ref(requireRtdb(), `Hygiene_Department/waterReports/${id}`), payload).catch(() => {});
    // Update in Asha_Workers
    syncReportToAshaWorker(id, payload).catch(() => {});
    console.info(`[NeerSense RTDB] ⚡ WaterReport ${id} altered in Realtime Database`);
    return { id, ...payload };
  },

  async delete(id) {
    await remove(ref(requireRtdb(), `waterReports/${id}`)).catch(() => {});
    await remove(ref(requireRtdb(), `Admin/verifiedWaterReports/${id}`)).catch(() => {});
    await remove(ref(requireRtdb(), `Hygiene_Department/waterReports/${id}`)).catch(() => {});
    syncDeleteToAshaWorker(id).catch(() => {});
    console.info(`[NeerSense RTDB] ⚡ WaterReport ${id} deleted across all nodes`);
    return { id };
  },

  // Live listener for real-time streaming (listens to both verified and pending queues)
  subscribe(callback) {
    if (!rtdb) return () => {};
    let active = true;

    const emit = async () => {
      if (!active) return;
      try {
        const list = await rtdbWaterReportService.getAll();
        if (active) callback(list);
      } catch {}
    };

    const unsubW = onValue(ref(rtdb, 'waterReports'), () => emit());
    const unsubH = onValue(ref(rtdb, 'Hygiene_Department/waterReports'), () => emit());

    return () => {
      active = false;
      off(ref(rtdb, 'waterReports'), 'value', unsubW);
      off(ref(rtdb, 'Hygiene_Department/waterReports'), 'value', unsubH);
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SYMPTOMS (/symptoms)
// ─────────────────────────────────────────────────────────────────────────────
export const rtdbSymptomService = {
  async getAll() {
    const snap = await get(ref(requireRtdb(), 'symptoms'));
    const list = snapshotToArray(snap);
    return list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  },

  async create(data) {
    const docId = data.id || `sym-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id:               docId,
      villageId:        data.villageId || null,
      villageName:      data.villageName || '',
      patientName:      data.patientName || 'Citizen Direct Report',
      age:              data.age != null ? Number(data.age) : (data.patientAge != null ? Number(data.patientAge) : null),
      gender:           data.gender || data.patientGender || '',
      symptoms:         data.symptoms || [],
      symptomList:      Array.isArray(data.symptoms) ? data.symptoms.join(', ') : (data.symptomList || ''),
      suspectedDisease: data.suspectedDisease || '',
      severity:         data.severity || 'MODERATE',
      urgencyLevel:     data.severity === 'CRITICAL' ? 3 : data.severity === 'SEVERE' ? 2 : (data.urgencyLevel != null ? Number(data.urgencyLevel) : 1),
      triageStatus:     data.triageStatus || (data.severity === 'CRITICAL' ? 'FLAGGED_HIGH' : 'PENDING'),
      waterSourceUsed:  data.waterSourceUsed || '',
      reportedVia:      data.reportedVia || 'WEB_APP',
      contactNumber:    data.contactNumber || '',
      notes:            data.notes || '',
      status:           data.status || 'PENDING',
      reportedBy:       data.reportedBy || '',
      timestamp:        data.timestamp || new Date().toISOString(),
      updatedAt:        Date.now(),
    };

    // 1. Direct write to /symptoms (global disease outbreak tracker)
    await set(ref(requireRtdb(), `symptoms/${docId}`), payload);
    // 2. Direct write to /Villagers/healthReports (Villagers health reports database)
    await set(ref(requireRtdb(), `Villagers/healthReports/${docId}`), payload);
    console.info(`[NeerSense RTDB] ⚡ Symptom ${docId} written directly to /symptoms & /Villagers/healthReports`);
    return payload;
  },

  async updateStatus(id, status) {
    const payload = {
      triageStatus: status,
      status:       status,
      updatedAt:    Date.now(),
    };
    await update(ref(requireRtdb(), `symptoms/${id}`), payload);
    console.info(`[NeerSense RTDB] ⚡ Symptom ${id} status updated in Realtime Database`);
    return { id, status };
  },

  subscribe(callback) {
    if (!rtdb) return () => {};
    const symRef = ref(rtdb, 'symptoms');
    const listener = onValue(symRef, (snap) => {
      const list = snapshotToArray(snap);
      list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      callback(list);
    });
    return () => off(symRef, 'value', listener);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  VILLAGES (/villages)
// ─────────────────────────────────────────────────────────────────────────────
export const rtdbVillageService = {
  async getAll() {
    const snap = await get(ref(requireRtdb(), 'villages'));
    return snapshotToArray(snap);
  },

  async create(data) {
    const docId = data.id || `vil-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: docId,
      name: data.name,
      district: data.district || '',
      region: data.region || '',
      state: data.state || 'West Bengal',
      latitude: Number(data.latitude) || 0,
      longitude: Number(data.longitude) || 0,
      population: data.population ? Number(data.population) : null,
      vulnerabilityIndex: data.vulnerabilityIndex ? Number(data.vulnerabilityIndex) : null,
      updatedAt: Date.now(),
    };
    await set(ref(requireRtdb(), `villages/${docId}`), payload);
    return payload;
  },

  subscribe(callback) {
    if (!rtdb) return () => {};
    const vRef = ref(rtdb, 'villages');
    const listener = onValue(vRef, (snap) => {
      callback(snapshotToArray(snap));
    });
    return () => off(vRef, 'value', listener);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  ALERTS & RISK DASHBOARDS (/alerts)
// ─────────────────────────────────────────────────────────────────────────────
export const rtdbAlertService = {
  async getAll() {
    const snap = await get(ref(requireRtdb(), 'alerts'));
    return snapshotToArray(snap);
  },

  async upsert(id, data) {
    const docId = id || `alert-${Date.now()}`;
    const payload = {
      id: docId,
      ...data,
      updatedAt: Date.now(),
    };
    await set(ref(requireRtdb(), `alerts/${docId}`), payload);
    return payload;
  },

  subscribe(callback) {
    if (!rtdb) return () => {};
    const alertRef = ref(rtdb, 'alerts');
    const listener = onValue(alertRef, (snap) => {
      callback(snapshotToArray(snap));
    });
    return () => off(alertRef, 'value', listener);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  MANUAL FIELD TESTS (/manualTests)
// ─────────────────────────────────────────────────────────────────────────────
export const rtdbManualTestService = {
  async getAll() {
    const snap = await get(ref(requireRtdb(), 'manualTests'));
    return snapshotToArray(snap);
  },

  async create(data) {
    const docId = data.id || `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: docId,
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      updatedAt: Date.now(),
    };
    await set(ref(requireRtdb(), `manualTests/${docId}`), payload);
    console.info(`[NeerSense RTDB] ⚡ ManualTest ${docId} written directly to Realtime Database`);
    return payload;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  MONSOON DATA (/monsoonData)
// ─────────────────────────────────────────────────────────────────────────────
export const rtdbMonsoonService = {
  async getAll() {
    const snap = await get(ref(requireRtdb(), 'monsoonData'));
    return snapshotToArray(snap);
  },

  async create(data) {
    const docId = data.id || `mon-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: docId,
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      updatedAt: Date.now(),
    };
    await set(ref(requireRtdb(), `monsoonData/${docId}`), payload);
    return payload;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  ASHA WORKERS  (/Asha_Workers)
//
//  Structure in RTDB:
//    Asha_Workers/
//      {ashaKey}/
//        profile        → name, id, villageId, contactNumber
//        waterReports/
//          {reportId}   → water quality field tests submitted by this ASHA
//        manualTests/
//          {testId}     → H2S vial & field strip tests submitted by this ASHA
//        symptoms/
//          {caseId}     → symptom cases filed by this ASHA
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a safe RTDB key from an ASHA worker name or ID */
function ashaKey(ashaId, ashaName) {
  const raw = ashaId || ashaName || 'ASHA_unknown';
  // Strip special characters that RTDB forbids in keys: . # $ [ ] /
  return raw.replace(/[.#$\[\]/\s]/g, '_').substring(0, 64);
}

export const ashaWorkerService = {

  /**
   * Write ASHA worker profile under Asha_Workers/{key}/profile
   */
  async upsertProfile(ashaId, ashaName, profileData = {}) {
    const key = ashaKey(ashaId, ashaName);
    const payload = {
      ashaKey:       key,
      ashaId:        ashaId || key,
      ashaName:      ashaName || 'ASHA Worker',
      villageId:     profileData.villageId || null,
      villageName:   profileData.villageName || '',
      contactNumber: profileData.contactNumber || '',
      role:          'ASHA',
      updatedAt:     Date.now(),
    };
    await set(ref(requireRtdb(), `Asha_Workers/${key}/profile`), payload);
    console.info(`[NeerSense RTDB] ⚡ ASHA profile saved: Asha_Workers/${key}/profile`);
    return { key, ...payload };
  },

  /**
   * Save a water report under Asha_Workers/{key}/waterReports/{reportId}
   */
  async saveWaterReport(ashaId, ashaName, reportData) {
    const key = ashaKey(ashaId, ashaName);
    const docId = reportData.id || `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const isContaminated =
      reportData.h2sResult === true ||
      reportData.h2sVialResult === 'BLACK_CONTAMINATED' ||
      reportData.safetyStatus === 'CONTAMINATED';

    const payload = {
      id:             docId,
      ashaKey:        key,
      ashaName:       ashaName || 'ASHA Worker',
      villageId:      reportData.villageId || null,
      villageName:    reportData.villageName || '',
      sourceName:     reportData.sourceName || '',
      sourceType:     reportData.sourceType || 'Community Source',
      h2sResult:      isContaminated,
      h2sVialResult:  reportData.h2sVialResult || (isContaminated ? 'BLACK_CONTAMINATED' : 'YELLOW_SAFE'),
      ph:             reportData.ph != null ? Number(reportData.ph) : 7.0,
      turbidity:      reportData.turbidity != null ? Number(reportData.turbidity) : 1.0,
      bacterialCfu:   reportData.bacterialCfu != null ? Number(reportData.bacterialCfu) : 0,
      tds:            reportData.tds != null ? Number(reportData.tds) : 250,
      safetyStatus:   reportData.safetyStatus || (isContaminated ? 'CONTAMINATED' : 'SAFE'),
      advisory:       reportData.advisory || (isContaminated ? 'Water is contaminated. Boil before use.' : 'Safe for drinking.'),
      status:         reportData.status || 'PENDING_CLASSIFICATION',
      ashaFieldNotes: reportData.ashaFieldNotes || reportData.notes || '',
      isApproved:     false,
      submittedBy:    ashaName || reportData.submittedBy || 'ASHA Field Worker',
      submissionRole: 'ASHA',
      timestamp:      reportData.timestamp || new Date().toISOString(),
      updatedAt:      Date.now(),
    };

    await set(ref(requireRtdb(), `Asha_Workers/${key}/waterReports/${docId}`), payload);
    console.info(`[NeerSense RTDB] ⚡ Water report saved: Asha_Workers/${key}/waterReports/${docId}`);
    return { ...payload, ashaPath: `Asha_Workers/${key}/waterReports/${docId}` };
  },

  /**
   * Update a water report's status under Asha_Workers/{key}/waterReports/{reportId}
   */
  async updateWaterReportStatus(ashaId, ashaName, reportId, updates) {
    const key = ashaKey(ashaId, ashaName);
    await update(ref(requireRtdb(), `Asha_Workers/${key}/waterReports/${reportId}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    console.info(`[NeerSense RTDB] ⚡ Water report status updated: Asha_Workers/${key}/waterReports/${reportId}`);
    return { reportId, ...updates };
  },

  /**
   * Save a manual H2S field test under Asha_Workers/{key}/manualTests/{testId}
   */
  async saveManualTest(ashaId, ashaName, testData) {
    const key = ashaKey(ashaId, ashaName);
    const docId = testData.id || `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id:           docId,
      ashaKey:      key,
      ashaName:     ashaName || 'ASHA Worker',
      ...testData,
      submittedBy:  ashaName || testData.submittedBy || 'ASHA Field Worker',
      submissionRole: 'ASHA',
      timestamp:    testData.timestamp || new Date().toISOString(),
      updatedAt:    Date.now(),
    };
    await set(ref(requireRtdb(), `Asha_Workers/${key}/manualTests/${docId}`), payload);
    console.info(`[NeerSense RTDB] ⚡ H2S test saved: Asha_Workers/${key}/manualTests/${docId}`);
    return { ...payload, ashaPath: `Asha_Workers/${key}/manualTests/${docId}` };
  },

  /**
   * Save a symptom case under Asha_Workers/{key}/symptoms/{caseId}
   */
  async saveSymptomCase(ashaId, ashaName, symptomData) {
    const key = ashaKey(ashaId, ashaName);
    const docId = symptomData.id || `sym-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id:               docId,
      ashaKey:          key,
      ashaName:         ashaName || 'ASHA Worker',
      villageId:        symptomData.villageId || null,
      villageName:      symptomData.villageName || '',
      patientName:      symptomData.patientName || 'Patient',
      age:              symptomData.age != null ? Number(symptomData.age) : null,
      gender:           symptomData.gender || '',
      symptoms:         symptomData.symptoms || [],
      symptomList:      Array.isArray(symptomData.symptoms)
                          ? symptomData.symptoms.join(', ')
                          : (symptomData.symptomList || ''),
      suspectedDisease: symptomData.suspectedDisease || '',
      severity:         symptomData.severity || 'MODERATE',
      urgencyLevel:     symptomData.severity === 'CRITICAL' ? 3 : symptomData.severity === 'SEVERE' ? 2 : 1,
      triageStatus:     symptomData.triageStatus || 'PENDING',
      waterSourceUsed:  symptomData.waterSourceUsed || '',
      reportedVia:      symptomData.reportedVia || 'WEB_APP',
      reportedBy:       ashaName || symptomData.reportedBy || '',
      submissionRole:   'ASHA',
      notes:            symptomData.notes || '',
      status:           'PENDING',
      timestamp:        symptomData.timestamp || new Date().toISOString(),
      updatedAt:        Date.now(),
    };
    await set(ref(requireRtdb(), `Asha_Workers/${key}/symptoms/${docId}`), payload);
    console.info(`[NeerSense RTDB] ⚡ Symptom case saved: Asha_Workers/${key}/symptoms/${docId}`);
    return { ...payload, ashaPath: `Asha_Workers/${key}/symptoms/${docId}` };
  },

  /**
   * Get all water reports submitted by a specific ASHA worker
   */
  async getWaterReports(ashaId, ashaName) {
    const key = ashaKey(ashaId, ashaName);
    const snap = await get(ref(requireRtdb(), `Asha_Workers/${key}/waterReports`));
    const list = snapshotToArray(snap);
    return list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  },

  /**
   * Get all manual tests submitted by a specific ASHA worker
   */
  async getManualTests(ashaId, ashaName) {
    const key = ashaKey(ashaId, ashaName);
    const snap = await get(ref(requireRtdb(), `Asha_Workers/${key}/manualTests`));
    const list = snapshotToArray(snap);
    return list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  },

  /**
   * Get all symptom cases submitted by a specific ASHA worker
   */
  async getSymptomCases(ashaId, ashaName) {
    const key = ashaKey(ashaId, ashaName);
    const snap = await get(ref(requireRtdb(), `Asha_Workers/${key}/symptoms`));
    const list = snapshotToArray(snap);
    return list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  },

  /**
   * Get all data for all ASHA workers (for government overview)
   */
  async getAllWorkers() {
    const snap = await get(ref(requireRtdb(), 'Asha_Workers'));
    if (!snap.exists()) return [];
    const val = snap.val();
    return Object.entries(val).map(([key, workerData]) => ({
      ashaKey: key,
      profile: workerData.profile || {},
      waterReports: workerData.waterReports
        ? Object.values(workerData.waterReports)
        : [],
      manualTests: workerData.manualTests
        ? Object.values(workerData.manualTests)
        : [],
      symptoms: workerData.symptoms
        ? Object.values(workerData.symptoms)
        : [],
    }));
  },

  /**
   * Live listener for a specific ASHA worker's reports
   */
  subscribeToWorker(ashaId, ashaName, callback) {
    if (!rtdb) return () => {};
    const key = ashaKey(ashaId, ashaName);
    const workerRef = ref(rtdb, `Asha_Workers/${key}`);
    const listener = onValue(workerRef, (snap) => {
      if (!snap.exists()) return callback({ waterReports: [], manualTests: [], symptoms: [] });
      const val = snap.val();
      callback({
        profile:      val.profile || {},
        waterReports: val.waterReports ? Object.values(val.waterReports).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)) : [],
        manualTests:  val.manualTests  ? Object.values(val.manualTests).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)) : [],
        symptoms:     val.symptoms     ? Object.values(val.symptoms).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)) : [],
      });
    });
    return () => off(workerRef, 'value', listener);
  },

  /**
   * Live listener for all ASHA workers' data (government portal)
   */
  subscribeToAllWorkers(callback) {
    if (!rtdb) return () => {};
    const allRef = ref(rtdb, 'Asha_Workers');
    const listener = onValue(allRef, (snap) => {
      if (!snap.exists()) return callback([]);
      const val = snap.val();
      const workers = Object.entries(val).map(([key, workerData]) => ({
        ashaKey:      key,
        profile:      workerData.profile || {},
        waterReports: workerData.waterReports ? Object.values(workerData.waterReports) : [],
        manualTests:  workerData.manualTests  ? Object.values(workerData.manualTests) : [],
        symptoms:     workerData.symptoms     ? Object.values(workerData.symptoms) : [],
      }));
      callback(workers);
    });
    return () => off(allRef, 'value', listener);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  VILLAGERS (/Villagers)
//  Database key for villagers health condition and symptom inputs
// ─────────────────────────────────────────────────────────────────────────────
export const rtdbVillagerService = {
  async getAllHealthReports() {
    const snap = await get(ref(requireRtdb(), 'Villagers/healthReports'));
    const list = snapshotToArray(snap);
    return list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  },

  async saveHealthReport(data) {
    const docId = data.id || `sym-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: docId,
      ...data,
      submittedVia: 'VILLAGER_HEALTH_PORTAL',
      updatedAt: Date.now(),
    };
    await set(ref(requireRtdb(), `Villagers/healthReports/${docId}`), payload);
    console.info(`[NeerSense RTDB] ⚡ Health report saved: Villagers/healthReports/${docId}`);
    return payload;
  },

  subscribe(callback) {
    if (!rtdb) return () => {};
    const vRef = ref(rtdb, 'Villagers/healthReports');
    const listener = onValue(vRef, (snap) => {
      const list = snapshotToArray(snap);
      list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      callback(list);
    });
    return () => off(vRef, 'value', listener);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  HYGIENE DEPARTMENT (/Hygiene_Department)
//  Database key for hygiene department water quality inspections & classifications
// ─────────────────────────────────────────────────────────────────────────────
export const rtdbHygieneService = {
  async getAllWaterReports() {
    const snap = await get(ref(requireRtdb(), 'Hygiene_Department/waterReports'));
    const list = snapshotToArray(snap);
    return list.sort((a, b) => new Date(b.timestamp || b.reportedAt || 0) - new Date(a.timestamp || a.reportedAt || 0));
  },

  async saveWaterReport(data) {
    const docId = data.id || `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payload = {
      id: docId,
      ...data,
      updatedAt: Date.now(),
    };
    await set(ref(requireRtdb(), `Hygiene_Department/waterReports/${docId}`), payload);
    console.info(`[NeerSense RTDB] ⚡ Water report saved: Hygiene_Department/waterReports/${docId}`);
    return payload;
  },

  async updateClassification(id, data) {
    const payload = {
      ...data,
      updatedAt: Date.now(),
    };
    await update(ref(requireRtdb(), `Hygiene_Department/waterReports/${id}`), payload);
    console.info(`[NeerSense RTDB] ⚡ Hygiene classification updated: Hygiene_Department/waterReports/${id}`);
    return { id, ...payload };
  },

  subscribe(callback) {
    if (!rtdb) return () => {};
    const hRef = ref(rtdb, 'Hygiene_Department/waterReports');
    const listener = onValue(hRef, (snap) => {
      const list = snapshotToArray(snap);
      list.sort((a, b) => new Date(b.timestamp || b.reportedAt || 0) - new Date(a.timestamp || a.reportedAt || 0));
      callback(list);
    });
    return () => off(hRef, 'value', listener);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN (/Admin)
//  Database key for government-verified water reports and official approvals
// ─────────────────────────────────────────────────────────────────────────────
export const rtdbAdminService = {
  async getAllVerifiedReports() {
    const snap = await get(ref(requireRtdb(), 'Admin/verifiedWaterReports'));
    const list = snapshotToArray(snap);
    return list.sort((a, b) => new Date(b.verifiedAt || b.timestamp || 0) - new Date(a.verifiedAt || a.timestamp || 0));
  },

  async saveVerifiedReport(report) {
    const docId = report.id || `rep-${Date.now()}`;
    const payload = {
      ...report,
      isApproved: true,
      status: 'APPROVED',
      verifiedAt: report.verifiedAt || new Date().toISOString(),
      updatedAt: Date.now(),
    };
    await set(ref(requireRtdb(), `Admin/verifiedWaterReports/${docId}`), payload);
    console.info(`[NeerSense RTDB] ⚡ Verified report stored: Admin/verifiedWaterReports/${docId}`);
    return payload;
  },

  subscribe(callback) {
    if (!rtdb) return () => {};
    const aRef = ref(rtdb, 'Admin/verifiedWaterReports');
    const listener = onValue(aRef, (snap) => {
      const list = snapshotToArray(snap);
      list.sort((a, b) => new Date(b.verifiedAt || b.timestamp || 0) - new Date(a.verifiedAt || a.timestamp || 0));
      callback(list);
    });
    return () => off(aRef, 'value', listener);
  },
};


