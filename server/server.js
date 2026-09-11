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
import mlAnalysisRouter from './routes/mlAnalysis.js';

// Fixed Credentials Store (Single Admin System)
const SERVER_CREDENTIALS = {
  admin: {
    phone: '9876543213',
    pin: '1234',
    name: 'Dr. Suresh Mishra (CDMO)',
    role: 'admin',
    department: 'Jal Shakti & Health Ministry',
    title: 'District Surveillance Administrator',
  },
  official: {
    phone: '9876543213',
    pin: '1234',
    name: 'Dr. Suresh Mishra (CDMO)',
    role: 'official',
    department: 'District Administration',
    title: 'Government Health Officer (CDMO)',
  },
  asha: {
    phone: '9876543211',
    pin: '5678',
    name: 'Kuni Majhi (ASHA-071)',
    role: 'asha',
    department: 'Community Health Surveillance',
    title: 'ASHA Field Worker',
  },
  hygiene: {
    phone: '9876543212',
    pin: '4321',
    name: 'Dr. Meena Kumari (Hygiene Dept)',
    role: 'hygiene',
    department: 'Hygiene & Lab Testing Dept',
    title: 'Water & Sanitation Officer',
  },
};

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

// Active single-admin session tracking
let activeAdminSession = null;

// Authentication Endpoints
app.post('/api/auth/login', (req, res) => {
  const { phone, pin, role, sessionId, forceTakeover } = req.body || {};

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }

  const roleKey = String(role || '').toLowerCase();
  const isAdminRole = roleKey === 'admin' || roleKey === 'official';

  // Strict Single-Admin Enforcement:
  // 1. Only the single designated admin user can log in as admin
  // 2. Only one user can be logged in as admin at any given time
  if (isAdminRole) {
    const designatedAdmin = SERVER_CREDENTIALS.admin || SERVER_CREDENTIALS.official;
    const designatedPhone = designatedAdmin ? designatedAdmin.phone : '9876543213';

    if (phone !== designatedPhone) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: In NeerSense, there is strictly only one authorized District Admin user. Other users cannot log in as Admin.'
      });
    }

    // Check if another admin session is already actively logged in
    if (activeAdminSession && activeAdminSession.isLoggedIn) {
      const isSameSession = sessionId && activeAdminSession.sessionId === sessionId;
      const isStale = (Date.now() - activeAdminSession.lastActive) > 15 * 60 * 1000;

      if (!isSameSession && !isStale && !forceTakeover) {
        return res.status(403).json({
          success: false,
          isAdminLocked: true,
          message: 'Admin Access Locked: Only one user can log in as Admin. An Admin session is already active. Additional logins are blocked.'
        });
      }
    }
  }

  // Villager login does not require PIN
  if (role === 'villager') {
    return res.json({
      success: true,
      user: {
        phone,
        role: 'villager',
        name: 'Citizen User',
        title: 'Villager / Citizen',
        department: 'Public Health & Citizen Services'
      }
    });
  }

  // Check matching role credentials
  const targetUser = SERVER_CREDENTIALS[role] || Object.values(SERVER_CREDENTIALS).find(u => u.phone === phone);

  if (!targetUser) {
    return res.status(401).json({ success: false, message: 'Unrecognized credentials. Role account not found.' });
  }

  if (targetUser.phone !== phone || targetUser.pin !== pin) {
    return res.status(401).json({ success: false, message: 'Invalid phone number or PIN for this department.' });
  }

  // If Admin logged in, lock the exclusive active admin session
  if (isAdminRole) {
    const assignedSessionId = sessionId || ('ADMIN_SESS_' + Date.now());
    activeAdminSession = {
      phone: targetUser.phone,
      name: targetUser.name,
      isLoggedIn: true,
      sessionId: assignedSessionId,
      loginTime: new Date().toISOString(),
      lastActive: Date.now()
    };
    console.log(`[NeerSense Server] 🔒 Single Admin session exclusively locked to: ${targetUser.phone}`);
  }

  return res.json({
    success: true,
    user: {
      phone: targetUser.phone,
      name: targetUser.name,
      role: targetUser.role,
      department: targetUser.department,
      title: targetUser.title
    },
    sessionId: isAdminRole ? activeAdminSession.sessionId : null
  });
});

// Logout endpoint — releases the single admin lock
app.post('/api/auth/logout', (req, res) => {
  const { role, phone } = req.body || {};
  const roleKey = String(role || '').toLowerCase();
  if (roleKey === 'admin' || roleKey === 'official' || (activeAdminSession && activeAdminSession.phone === phone)) {
    activeAdminSession = null;
    console.log('[NeerSense Server] 🔓 Single Admin session released.');
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Query single-admin status
app.get('/api/auth/admin-status', (req, res) => {
  const isLocked = !!(activeAdminSession && activeAdminSession.isLoggedIn && (Date.now() - activeAdminSession.lastActive < 15 * 60 * 1000));
  res.json({
    success: true,
    isAdminLoggedIn: isLocked,
    activePhone: isLocked ? activeAdminSession.phone : null,
    loginTime: isLocked ? activeAdminSession.loginTime : null
  });
});

app.get('/api/auth/users', (req, res) => {
  // Public directory without PINs
  const publicDirectory = Object.values(SERVER_CREDENTIALS).map(({ pin, ...safeUser }) => safeUser);
  res.json({ success: true, users: publicDirectory });
});

// Registration endpoint for first-time personnel
app.post('/api/auth/register', (req, res) => {
  const { phone, pin, role, name, villageId, villageName } = req.body || {};
  if (!phone || !name || !role) {
    return res.status(400).json({ success: false, message: 'Phone, name, and role are required.' });
  }
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit phone number is required.' });
  }

  const roleKey = String(role).toLowerCase();

  // Strict Single-Admin Registration Check
  if (roleKey === 'admin' || roleKey === 'official') {
    const existingAdmin = SERVER_CREDENTIALS.admin || SERVER_CREDENTIALS.official;
    if (existingAdmin && existingAdmin.phone && existingAdmin.phone !== cleanPhone) {
      return res.status(403).json({
        success: false,
        message: 'Registration Denied: In NeerSense, there is strictly only one Admin permitted. The District Admin account is already claimed and registered.'
      });
    }
  }
  const titleMap = {
    asha: 'ASHA Field Worker',
    hygiene: 'Water & Sanitation Officer',
    villager: 'Villager / Citizen',
    admin: 'District Surveillance Administrator',
    official: 'Government Health Officer (CDMO)'
  };
  const deptMap = {
    asha: 'Community Health Surveillance',
    hygiene: 'Hygiene & Lab Testing Dept',
    villager: 'Public Health & Citizen Services',
    admin: 'Jal Shakti & Health Ministry',
    official: 'District Administration'
  };

  const newUser = {
    phone: cleanPhone,
    pin: pin ? String(pin).trim() : '1234',
    name: name.trim(),
    role: roleKey,
    department: deptMap[roleKey] || 'Public Health Services',
    title: titleMap[roleKey] || 'Authorized Personnel',
    villageId: villageId || null,
    villageName: villageName || ''
  };

  SERVER_CREDENTIALS[roleKey] = newUser;
  SERVER_CREDENTIALS[cleanPhone] = newUser;

  console.log(`[NeerSense Server] First-time personnel registered: ${cleanPhone} (${name} - ${roleKey})`);
  return res.json({ success: true, user: newUser });
});

// PIN self-update endpoint — syncs the in-memory server store when user changes PIN via RTDB
app.post('/api/auth/update-pin', (req, res) => {
  const { role, newPin } = req.body || {};
  if (!role || !newPin) {
    return res.status(400).json({ success: false, message: 'role and newPin are required.' });
  }
  const roleKey = String(role).toLowerCase();
  const targetKey = (roleKey === 'official' || roleKey === 'admin') ? 'admin' : roleKey;
  if (!SERVER_CREDENTIALS[targetKey]) {
    return res.status(404).json({ success: false, message: 'Role not found.' });
  }
  if (String(newPin).trim().length < 4) {
    return res.status(400).json({ success: false, message: 'PIN must be at least 4 characters.' });
  }
  // Update in-memory store (survives only until server restart — RTDB is the source of truth)
  SERVER_CREDENTIALS[targetKey].pin = String(newPin).trim();
  if (SERVER_CREDENTIALS.official && (targetKey === 'admin' || targetKey === 'official')) {
    SERVER_CREDENTIALS.official.pin = String(newPin).trim();
  }
  console.log(`[NeerSense Server] PIN updated in-memory for role: ${targetKey}`);
  return res.json({ success: true, message: `PIN updated for ${targetKey}.` });
});

// Modular Routes
app.use('/api/water-reports', waterReportsRouter);
app.use('/api/symptoms', symptomsRouter);
app.use('/api/manual-tests', manualTestsRouter);
app.use('/api/villages', villagesRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/ml', mlAnalysisRouter);
app.use('/api', adminRouter); // provides /clear-all, /load-sample, /ml/config, /sensors/simulate-spike
app.use('/api', telephonyRouter); // /api/ussd, /api/sms-gateway

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
  console.log(`[NeerSense Combined Server] Running on http://localhost:${PORT}`);
});
