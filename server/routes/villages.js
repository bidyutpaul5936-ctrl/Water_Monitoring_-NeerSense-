import express from 'express';
import { state, recalculateAllVillages } from '../state.js';

const router = express.Router();

// GET all villages
router.get('/', (req, res) => {
  recalculateAllVillages();
  res.json(state.villages);
});

// GET village by ID with related records
router.get('/:id', (req, res) => {
  recalculateAllVillages();
  const village = state.villages.find(v => v.id === req.params.id);
  if (!village) return res.status(404).json({ error: 'Village not found' });

  const villageSensors = state.sensors.filter(s => s.villageId === village.id);
  const villageSymptoms = state.symptoms.filter(s => s.villageId === village.id);
  const villageAlerts = state.alerts.filter(a => a.villageId === village.id);
  const villageTests = state.manualTests.filter(t => t.villageId === village.id);
  const villageWaterReports = state.waterReports.filter(r => r.villageId === village.id);

  res.json({
    village,
    sensors: villageSensors,
    symptoms: villageSymptoms,
    alerts: villageAlerts,
    manualTests: villageTests,
    waterReports: villageWaterReports
  });
});

export default router;
