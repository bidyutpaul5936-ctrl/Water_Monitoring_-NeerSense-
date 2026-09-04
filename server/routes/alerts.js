import express from 'express';
import { state, broadcastWs } from '../state.js';

const router = express.Router();

// GET all alerts
router.get('/', (req, res) => {
  res.json(state.alerts);
});

// Acknowledge alert
router.post('/:id/acknowledge', (req, res) => {
  const alert = state.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  alert.acknowledged = true;
  alert.acknowledgedBy = req.body?.acknowledgedBy || 'District Surveillance Officer';
  alert.acknowledgedAt = new Date().toISOString();

  broadcastWs('ALERT_ACKNOWLEDGED', alert);
  res.json({ success: true, alert });
});

// Dispatch response action
router.post('/:id/action', (req, res) => {
  const alert = state.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const newAction = {
    id: `act-${Date.now()}`,
    type: req.body?.type || 'WATER_TREATMENT_CHLORINATION',
    description: req.body?.description || 'Response action dispatched',
    status: req.body?.status || 'DISPATCHED',
    assignedTo: req.body?.assignedTo || 'District Health Team',
    dispatchedAt: new Date().toISOString()
  };

  alert.actionsTaken = alert.actionsTaken || [];
  alert.actionsTaken.push(newAction);

  broadcastWs('ACTION_UPDATED', { alertId: alert.id, action: newAction });
  res.json({ success: true, alert, action: newAction });
});

export default router;
