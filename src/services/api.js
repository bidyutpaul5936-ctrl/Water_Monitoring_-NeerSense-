// api.js - Centralized API Service for NeerSense
// When VITE_USE_FIRESTORE=true, persistent operations are delegated to Firestore.
// The local Express server is kept for WebSocket sensor telemetry only.

import { firestoreService } from './firestoreService';

const USE_FIRESTORE = import.meta.env.VITE_USE_FIRESTORE === 'true';
const API_BASE = '/api';

// Helper to try Firestore first; fall back to REST if needed
async function withFirestoreFallback(firestoreCall, restCall) {
  if (USE_FIRESTORE) {
    try {
      return await firestoreCall();
    } catch (err) {
      console.warn('[api] Firestore call failed, falling back to REST:', err.message);
      return await restCall();
    }
  }
  return await restCall();
}

export const api = {
  // ─── Villages ─────────────────────────────────────────────────────────────
  async getVillages() {
    return withFirestoreFallback(
      () => firestoreService.getVillages(),
      async () => {
        const res = await fetch(`${API_BASE}/villages`);
        if (!res.ok) throw new Error('Failed to fetch villages');
        return res.json();
      }
    );
  },

  async getVillageById(id) {
    return withFirestoreFallback(
      () => firestoreService.getVillageById(id),
      async () => {
        const res = await fetch(`${API_BASE}/villages/${id}`);
        if (!res.ok) throw new Error('Failed to fetch village details');
        return res.json();
      }
    );
  },

  // ─── Sensors (WebSocket / REST only — not in Firestore) ──────────────────
  async getSensors() {
    const res = await fetch(`${API_BASE}/sensors`);
    if (!res.ok) throw new Error('Failed to fetch sensors');
    return res.json();
  },

  async updateSensorReading(sensorId, readings) {
    const res = await fetch(`${API_BASE}/sensors/${sensorId}/reading`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readings)
    });
    return res.json();
  },

  async simulateContaminationSpike(villageId, severity = 'CRITICAL') {
    const res = await fetch(`${API_BASE}/sensors/simulate-spike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ villageId, severity })
    });
    return res.json();
  },

  // ─── Symptoms ─────────────────────────────────────────────────────────────
  async getSymptoms() {
    return withFirestoreFallback(
      () => firestoreService.getSymptoms(),
      async () => {
        const res = await fetch(`${API_BASE}/symptoms`);
        if (!res.ok) throw new Error('Failed to fetch symptoms');
        return res.json();
      }
    );
  },

  async submitSymptoms(data) {
    return withFirestoreFallback(
      () => firestoreService.submitSymptoms(data),
      async () => {
        const res = await fetch(`${API_BASE}/symptoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to submit symptoms');
        return res.json();
      }
    );
  },

  // ─── Alerts ───────────────────────────────────────────────────────────────
  async getAlerts() {
    return withFirestoreFallback(
      () => firestoreService.getAlerts(),
      async () => {
        const res = await fetch(`${API_BASE}/alerts`);
        if (!res.ok) throw new Error('Failed to fetch alerts');
        return res.json();
      }
    );
  },

  async acknowledgeAlert(alertId, acknowledgedBy) {
    return withFirestoreFallback(
      () => firestoreService.acknowledgeAlert(alertId, acknowledgedBy),
      async () => {
        const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ acknowledgedBy })
        });
        return res.json();
      }
    );
  },

  async dispatchResponseAction(alertId, actionData) {
    return withFirestoreFallback(
      () => firestoreService.dispatchResponseAction(alertId, actionData),
      async () => {
        const res = await fetch(`${API_BASE}/alerts/${alertId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actionData)
        });
        return res.json();
      }
    );
  },

  async updateActionStatus(alertId, actionId, status) {
    return withFirestoreFallback(
      () => firestoreService.updateActionStatus(alertId, actionId, status),
      async () => {
        const res = await fetch(`${API_BASE}/alerts/${alertId}/action/${actionId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        return res.json();
      }
    );
  },

  // ─── Manual Tests ─────────────────────────────────────────────────────────
  async getManualTests() {
    return withFirestoreFallback(
      () => firestoreService.getManualTests(),
      async () => {
        const res = await fetch(`${API_BASE}/manual-tests`);
        if (!res.ok) throw new Error('Failed to fetch manual test logs');
        return res.json();
      }
    );
  },

  async submitManualTest(testData) {
    return withFirestoreFallback(
      () => firestoreService.submitManualTest(testData),
      async () => {
        const res = await fetch(`${API_BASE}/manual-tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        });
        if (!res.ok) throw new Error('Failed to log water test');
        return res.json();
      }
    );
  },

  // ─── Water Reports ────────────────────────────────────────────────────────
  async getWaterReports() {
    return withFirestoreFallback(
      () => firestoreService.getWaterReports(),
      async () => {
        const res = await fetch(`${API_BASE}/water-reports`);
        if (!res.ok) return [];
        return res.json();
      }
    );
  },

  async createWaterReport(reportData) {
    return withFirestoreFallback(
      () => firestoreService.createWaterReport(reportData),
      async () => {
        const res = await fetch(`${API_BASE}/water-reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });
        if (!res.ok) throw new Error('Failed to create water report');
        return res.json();
      }
    );
  },

  async classifyWaterReport(id, classificationData = {}) {
    return withFirestoreFallback(
      () => firestoreService.classifyWaterReport(id, classificationData),
      async () => {
        const res = await fetch(`${API_BASE}/water-reports/${id}/classify`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(classificationData)
        });
        if (!res.ok) throw new Error('Failed to classify water report');
        return res.json();
      }
    );
  },

  async verifyWaterReport(id, verificationData = {}) {
    return withFirestoreFallback(
      () => firestoreService.verifyWaterReport(id, verificationData),
      async () => {
        const res = await fetch(`${API_BASE}/water-reports/${id}/verify`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verificationData)
        });
        if (!res.ok) throw new Error('Failed to verify water report');
        return res.json();
      }
    );
  },

  async rejectWaterReport(id, reasonData = {}) {
    return withFirestoreFallback(
      () => firestoreService.rejectWaterReport(id, reasonData),
      async () => {
        const res = await fetch(`${API_BASE}/water-reports/${id}/reject`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reasonData)
        });
        if (!res.ok) throw new Error('Failed to reject water report');
        return res.json();
      }
    );
  },

  async deleteWaterReport(id) {
    return withFirestoreFallback(
      () => firestoreService.deleteWaterReport(id),
      async () => {
        const res = await fetch(`${API_BASE}/water-reports/${id}`, {
          method: 'DELETE'
        });
        return res.json();
      }
    );
  },

  // ─── Telephony (USSD / SMS — REST only) ───────────────────────────────────
  async queryUssd(input, sessionCode = 'sess-1', phoneNumber = '9876543210') {
    const res = await fetch(`${API_BASE}/ussd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, sessionCode, phoneNumber })
    });
    return res.json();
  },

  async sendSmsGateway(from, body) {
    const res = await fetch(`${API_BASE}/sms-gateway`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, body })
    });
    return res.json();
  },

  // ─── ML Config (REST only) ────────────────────────────────────────────────
  async getMlConfig() {
    const res = await fetch(`${API_BASE}/ml/config`);
    return res.json();
  },

  async updateMlConfig(config) {
    const res = await fetch(`${API_BASE}/ml/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  async getMicrolearning() {
    const res = await fetch(`${API_BASE}/microlearning`);
    return res.json();
  },

  // ─── Admin (REST only — clears in-memory server state) ───────────────────
  async clearAllData() {
    const res = await fetch(`${API_BASE}/admin/clear-all`, {
      method: 'POST'
    });
    return res.json();
  },

  async loadSampleData() {
    const res = await fetch(`${API_BASE}/admin/load-sample`, {
      method: 'POST'
    });
    return res.json();
  }
};
