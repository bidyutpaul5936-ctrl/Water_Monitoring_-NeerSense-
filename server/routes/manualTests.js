import express from 'express';
import { state, recalculateAllVillages, broadcastWs } from '../state.js';

const router = express.Router();

// GET all manual test logs
router.get('/', (req, res) => {
  res.json(state.manualTests);
});

// POST new manual test kit log (ASHA Worker)
router.post('/', (req, res) => {
  const body = req.body || {};
  const newTest = {
    id: `tst-${Date.now()}`,
    villageId: body.villageId || 'vil-01',
    ashaId: body.ashaId || 'ASHA-FIELD',
    ashaName: body.ashaName || 'Field ASHA Worker',
    sourceName: body.sourceName || 'Community Water Point',
    sourceType: body.sourceType || 'Handpump',
    h2sVialResult: body.h2sVialResult || 'YELLOW_NEGATIVE',
    phStripValue: Number(body.phStripValue) || 7.0,
    freeChlorinePpm: Number(body.freeChlorinePpm) || 0.2,
    turbidityObservation: body.turbidityObservation || 'CLEAR',
    smellTasteIssue: Boolean(body.smellTasteIssue),
    notes: body.notes || '',
    timestamp: new Date().toISOString(),
    photoUrl: body.photoUrl || null
  };

  state.manualTests.unshift(newTest);
  recalculateAllVillages();
  
  broadcastWs('NEW_MANUAL_TEST', newTest);
  broadcastWs('VILLAGES_UPDATE', state.villages);

  res.json({ success: true, test: newTest });
});

export default router;
