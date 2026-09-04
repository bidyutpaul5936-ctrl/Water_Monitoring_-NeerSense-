import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { state, setWss, broadcastWs } from './state.js';
import { microlearningModules } from './mockData.js';

// Modular Route Handlers for Different Portals & APIs
import waterReportsRouter from './routes/waterReports.js';
import symptomsRouter from './routes/symptoms.js';
import manualTestsRouter from './routes/manualTests.js';
import adminRouter from './routes/admin.js';
import villagesRouter from './routes/villages.js';
import sensorsRouter from './routes/sensors.js';
import alertsRouter from './routes/alerts.js';
import telephonyRouter from './routes/telephony.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// HTTP Server & WebSockets
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
setWss(wss);

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    data: {
      villages: state.villages,
      waterReports: state.waterReports,
      sensors: state.sensors,
      symptoms: state.symptoms,
      alerts: state.alerts,
      symptomsCount: state.symptoms.length
    }
  }));
});

// Periodic Background Sensor Telemetry (only if sensors exist)
setInterval(() => {
  if (!state.sensors || state.sensors.length === 0) return;

  state.sensors = state.sensors.map(sensor => {
    const r = sensor.currentReadings;
    if (!r) return sensor;

    const phJitter = (Math.random() - 0.5) * 0.05;
    const turbJitter = (Math.random() - 0.5) * 0.2;
    const doJitter = (Math.random() - 0.5) * 0.1;

    return {
      ...sensor,
      currentReadings: {
        ...r,
        ph: Math.round(Math.max(5.0, Math.min(9.5, r.ph + phJitter)) * 10) / 10,
        turbidity: Math.round(Math.max(1.0, r.turbidity + turbJitter) * 10) / 10,
        doMgL: Math.round(Math.max(2.0, Math.min(10.0, r.doMgL + doJitter)) * 10) / 10,
        timestamp: new Date().toISOString()
      }
    };
  });

  broadcastWs('SENSOR_STREAM', state.sensors);
}, 8000);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), connectedClients: wss.clients.size });
});

// Modular Routes
app.use('/api/water-reports', waterReportsRouter);
app.use('/api/symptoms', symptomsRouter);
app.use('/api/manual-tests', manualTestsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/villages', villagesRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api', telephonyRouter); // /api/ussd, /api/sms-gateway
app.use('/api', adminRouter);     // /api/ml/config, /api/sensors/simulate-spike

app.get('/api/microlearning', (req, res) => {
  res.json(microlearningModules);
});

// Serve static frontend build assets
app.use(express.static(distPath));

// Fallback all non-API routes to index.html for Single Page Application
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`[JalSuraksha Combined Server] Running on http://localhost:${PORT}`);
});
