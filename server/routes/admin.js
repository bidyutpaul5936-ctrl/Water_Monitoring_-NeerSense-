import express from 'express';
import { 
  state, 
  resetToEmptyState, 
  loadBaselineSampleData, 
  recalculateAllVillages, 
  broadcastWs 
} from '../state.js';
import { predictionEngine } from '../mlEngine.js';

const router = express.Router();

// POST Clear All Data (Empty state)
router.post('/clear-all', (req, res) => {
  resetToEmptyState();
  res.json({ success: true, message: 'All data cleared. System is in clean empty state.' });
});

// POST Load Demonstration Baseline Sample Data
router.post('/load-sample', (req, res) => {
  loadBaselineSampleData();
  res.json({ success: true, message: 'Demonstration sample data loaded successfully.' });
});

// ML Config GET
router.get('/ml/config', (req, res) => {
  res.json(predictionEngine.config);
});

// ML Config POST
router.post('/ml/config', (req, res) => {
  predictionEngine.updateConfig(req.body);
  recalculateAllVillages();
  broadcastWs('VILLAGES_UPDATE', state.villages);
  res.json({ success: true, config: predictionEngine.config });
});

// Simulate Contamination Spike (Demonstration)
router.post('/sensors/simulate-spike', (req, res) => {
  const { villageId, severity = 'CRITICAL' } = req.body || {};
  let targetSensor = state.sensors.find(s => s.villageId === villageId) || state.sensors[0];

  if (!targetSensor) {
    // Create temporary sensor on demand if none exists
    targetSensor = {
      id: `sns-${Date.now()}`,
      villageId: villageId || 'vil-01',
      name: 'Demonstration Test Point',
      currentReadings: {
        ph: 5.6,
        turbidity: 42.0,
        bacterialCfu: 380,
        tds: 340,
        doMgL: 3.5,
        temperature: 29.0,
        timestamp: new Date().toISOString()
      },
      status: severity === 'CRITICAL' ? 'CRITICAL' : 'ALERT'
    };
    state.sensors.push(targetSensor);
  } else {
    targetSensor.currentReadings = targetSensor.currentReadings || {};
    targetSensor.currentReadings.bacterialCfu = severity === 'CRITICAL' ? 380 : 120;
    targetSensor.currentReadings.turbidity = severity === 'CRITICAL' ? 42.0 : 18.5;
    targetSensor.currentReadings.ph = severity === 'CRITICAL' ? 5.6 : 6.4;
    targetSensor.status = severity === 'CRITICAL' ? 'CRITICAL' : 'ALERT';
  }

  recalculateAllVillages();
  const village = state.villages.find(v => v.id === targetSensor.villageId);

  broadcastWs('SENSOR_UPDATE', targetSensor);
  broadcastWs('VILLAGES_UPDATE', state.villages);

  res.json({ success: true, targetSensor, village });
});

export default router;
