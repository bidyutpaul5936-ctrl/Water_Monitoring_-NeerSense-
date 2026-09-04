// api.js - Centralized API Service for JalSuraksha

const API_BASE = '/api';

export const api = {
  async getVillages() {
    const res = await fetch(`${API_BASE}/villages`);
    if (!res.ok) throw new Error('Failed to fetch villages');
    return res.json();
  },

  async getVillageById(id) {
    const res = await fetch(`${API_BASE}/villages/${id}`);
    if (!res.ok) throw new Error('Failed to fetch village details');
    return res.json();
  },

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

  async getSymptoms() {
    const res = await fetch(`${API_BASE}/symptoms`);
    if (!res.ok) throw new Error('Failed to fetch symptoms');
    return res.json();
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

  async getAlerts() {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
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

  async getManualTests() {
    const res = await fetch(`${API_BASE}/manual-tests`);
    if (!res.ok) throw new Error('Failed to fetch manual test logs');
    return res.json();
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

  async getWaterReports() {
    const res = await fetch(`${API_BASE}/water-reports`);
    if (!res.ok) return [];
    return res.json();
  },

  async createWaterReport(reportData) {
    const res = await fetch(`${API_BASE}/water-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) throw new Error('Failed to create water report');
    return res.json();
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

  async deleteWaterReport(id) {
    const res = await fetch(`${API_BASE}/water-reports/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

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
