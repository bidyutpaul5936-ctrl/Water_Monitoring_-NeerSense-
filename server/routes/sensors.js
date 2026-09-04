import express from 'express';
import { state, recalculateAllVillages, broadcastWs } from '../state.js';

const router = express.Router();

// GET all sensors
router.get('/', (req, res) => {
  res.json(state.sensors);
});

// POST update sensor readings
router.post('/:id/reading', (req, res) => {
  const sensor = state.sensors.find(s => s.id === req.params.id);
  if (!sensor) return res.status(404).json({ error: 'Sensor not found' });

  const { ph, turbidity, bacterialCfu, tds, doMgL, temperature } = req.body || {};
  sensor.currentReadings = {
    ...sensor.currentReadings,
    ph: ph ?? sensor.currentReadings?.ph,
    turbidity: turbidity ?? sensor.currentReadings?.turbidity,
    bacterialCfu: bacterialCfu ?? sensor.currentReadings?.bacterialCfu,
    tds: tds ?? sensor.currentReadings?.tds,
    doMgL: doMgL ?? sensor.currentReadings?.doMgL,
    temperature: temperature ?? sensor.currentReadings?.temperature,
    timestamp: new Date().toISOString()
  };

  recalculateAllVillages();
  broadcastWs('SENSOR_UPDATE', sensor);
  broadcastWs('VILLAGES_UPDATE', state.villages);

  res.json({ success: true, sensor });
});

export default router;
