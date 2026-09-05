// api.js - Centralized API Service for NeerSense (REST / Local Server)
const API_BASE = '/api';

export const api = {
  // ─── Villages ─────────────────────────────────────────────────────────────
  async getVillages() {
    try {
      const res = await fetch(`${API_BASE}/villages`);
      if (!res.ok) throw new Error('Failed to fetch villages');
      return await res.json();
    } catch (err) {
      console.warn('[api] getVillages REST failed:', err.message);
      return [];
    }
  },

  async getVillageById(id) {
    try {
      const res = await fetch(`${API_BASE}/villages/${id}`);
      if (!res.ok) throw new Error('Failed to fetch village details');
      return await res.json();
    } catch (err) {
      console.warn('[api] getVillageById REST failed:', err.message);
      return null;
    }
  },

  // ─── Sensors ──────────────────────────────────────────────────────────────
  async getSensors() {
    try {
      const res = await fetch(`${API_BASE}/sensors`);
      if (!res.ok) throw new Error('Failed to fetch sensors');
      return await res.json();
    } catch (err) {
      console.warn('[api] getSensors REST failed:', err.message);
      return [];
    }
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
    try {
      const res = await fetch(`${API_BASE}/symptoms`);
      if (!res.ok) throw new Error('Failed to fetch symptoms');
      return await res.json();
    } catch (err) {
      console.warn('[api] getSymptoms REST failed:', err.message);
      return [];
    }
  },

  async submitSymptoms(data) {
    const res = await fetch(`${API_BASE}/symptoms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit symptoms');
    return res.json();
  },

  async updateSymptomStatus(id, status) {
    const res = await fetch(`${API_BASE}/symptoms/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update symptom status');
    return res.json();
  },

  // ─── Alerts ───────────────────────────────────────────────────────────────
  async getAlerts() {
    try {
      const res = await fetch(`${API_BASE}/alerts`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return await res.json();
    } catch (err) {
      console.warn('[api] getAlerts REST failed:', err.message);
      return [];
    }
  },

  async acknowledgeAlert(alertId, acknowledgedBy) {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgedBy })
    });
    return res.json();
  },

  async dispatchResponseAction(alertId, actionData) {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData)
    });
    return res.json();
  },

  async updateActionStatus(alertId, actionId, status) {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/action/${actionId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // ─── Manual Tests ─────────────────────────────────────────────────────────
  async getManualTests() {
    try {
      const res = await fetch(`${API_BASE}/manual-tests`);
      if (!res.ok) throw new Error('Failed to fetch manual test logs');
      return await res.json();
    } catch (err) {
      console.warn('[api] getManualTests REST failed:', err.message);
      return [];
    }
  },

  async submitManualTest(testData) {
    const res = await fetch(`${API_BASE}/manual-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    if (!res.ok) throw new Error('Failed to log water test');
    return res.json();
  },

  // ─── Water Reports ────────────────────────────────────────────────────────
  async getWaterReports() {
    try {
      const res = await fetch(`${API_BASE}/water-reports`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('[api] getWaterReports REST failed:', err.message);
      return [];
    }
  },

  async createWaterReport(reportData) {
    try {
      const res = await fetch(`${API_BASE}/water-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[api] createWaterReport network error, generating local fallback report:', err.message);
      const fallbackReport = {
        ...reportData,
        id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        status: reportData.status || 'PENDING_CLASSIFICATION',
        isApproved: false
      };
      return { success: true, report: fallbackReport, isLocalFallback: true };
    }
  },

  async classifyWaterReport(id, classificationData = {}) {
    const res = await fetch(`${API_BASE}/water-reports/${id}/classify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classificationData)
    });
    if (!res.ok) throw new Error('Failed to classify water report');
    return res.json();
  },

  async verifyWaterReport(id, verificationData = {}) {
    const res = await fetch(`${API_BASE}/water-reports/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData)
    });
    if (!res.ok) throw new Error('Failed to verify water report');
    return res.json();
  },

  async rejectWaterReport(id, reasonData = {}) {
    const res = await fetch(`${API_BASE}/water-reports/${id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reasonData)
    });
    if (!res.ok) throw new Error('Failed to reject water report');
    return res.json();
  },

  async alterWaterReport(id, alterationData = {}) {
    const res = await fetch(`${API_BASE}/water-reports/${id}/alter`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alterationData)
    });
    if (!res.ok) throw new Error('Failed to alter water report');
    return res.json();
  },

  async deleteWaterReport(id) {
    const res = await fetch(`${API_BASE}/water-reports/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // ─── Telephony (USSD / SMS) ───────────────────────────────────────────────
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

  // ─── ML Config ────────────────────────────────────────────────────────────
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

  // ─── Admin ────────────────────────────────────────────────────────────────
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
