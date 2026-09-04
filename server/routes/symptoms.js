import express from 'express';
import { state, recalculateAllVillages, broadcastWs } from '../state.js';

const router = express.Router();

// GET all symptoms / health reports
router.get('/', (req, res) => {
  res.json(state.symptoms);
});

// POST new symptoms / health condition report (Villager or ASHA)
router.post('/', (req, res) => {
  const payload = req.body || {};
  const items = Array.isArray(payload) ? payload : [payload];

  const createdItems = [];
  for (const item of items) {
    const newSymptom = {
      id: item.id || `sym-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      villageId: item.villageId || 'vil-01',
      villageName: item.villageName || (state.villages.find(v => v.id === item.villageId)?.name || 'Majuli Char'),
      patientName: item.patientName || 'Anonymous Villager',
      age: Number(item.age) || 28,
      gender: item.gender || 'Other',
      householdId: item.householdId || `HH-RPT-${Math.floor(Math.random() * 900 + 100)}`,
      symptoms: Array.isArray(item.symptoms) ? item.symptoms : [item.symptoms || 'Watery Diarrhea'],
      suspectedDisease: item.suspectedDisease || 'Acute Diarrheal Illness',
      severity: item.severity || 'MODERATE',
      waterSourceUsed: item.waterSourceUsed || 'Local Handpump',
      reportedVia: item.reportedVia || 'WEB_APP',
      reportedBy: item.reportedBy || 'Self Reported',
      timestamp: item.timestamp || new Date().toISOString(),
      status: item.status || 'REPORTED'
    };
    state.symptoms.unshift(newSymptom);
    createdItems.push(newSymptom);
  }

  recalculateAllVillages();
  broadcastWs('NEW_SYMPTOMS', createdItems);
  broadcastWs('VILLAGES_UPDATE', state.villages);

  res.json({ success: true, count: createdItems.length, items: createdItems });
});

export default router;
