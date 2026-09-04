import express from 'express';
import { state, broadcastWs } from '../state.js';

const router = express.Router();

// GET all water reports (optional ?status= or ?role=villager)
router.get('/', (req, res) => {
  const { status, role, approvedOnly } = req.query;

  if (role === 'villager' || approvedOnly === 'true') {
    // Villagers ONLY see approved reports
    const approved = state.waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);
    return res.json(approved);
  }

  if (status) {
    const filtered = state.waterReports.filter(r => r.status === status.toUpperCase());
    return res.json(filtered);
  }

  // Admin and ASHA see all reports
  res.json(state.waterReports);
});

// POST new water report (Submitted by ASHA / Health Worker for Govt Verification)
router.post('/', (req, res) => {
  const { 
    villageId, 
    villageName, 
    sourceName, 
    sourceType, 
    ph, 
    turbidity, 
    tds, 
    bacterialCfu, 
    h2sVialResult,
    safetyStatus, 
    advisory, 
    submittedBy,
    submissionRole,
    ashaFieldNotes,
    // If explicitly submitted directly by government admin
    directApprove 
  } = req.body || {};

  const isAutoApproved = directApprove === true;

  const newReport = {
    id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    villageId: villageId || 'vil-01',
    villageName: villageName || 'Gosaba Island (Rangabelia)',
    sourceName: sourceName || 'Main Village Well',
    sourceType: sourceType || 'Tube Well / Handpump',
    ph: ph !== undefined && ph !== '' ? Number(ph) : 7.2,
    turbidity: turbidity !== undefined && turbidity !== '' ? Number(turbidity) : 1.8,
    tds: tds !== undefined && tds !== '' ? Number(tds) : 220,
    bacterialCfu: bacterialCfu !== undefined && bacterialCfu !== '' ? Number(bacterialCfu) : 0,
    h2sVialResult: h2sVialResult || 'YELLOW_SAFE',
    safetyStatus: safetyStatus || 'SAFE', // 'SAFE', 'WARNING', 'CONTAMINATED'
    advisory: advisory || (safetyStatus === 'CONTAMINATED' 
      ? 'Contaminated. Boil drinking water for 10 min. Chlorination deployed.' 
      : safetyStatus === 'WARNING' 
      ? 'Moderate risk. Filter and disinfect before drinking.' 
      : 'Water meets drinking standards. Safe to consume.'),
    
    // ASHA & Verification metadata
    submittedBy: submittedBy || 'Kuni Majhi (ASHA-071)',
    submissionRole: submissionRole || 'ASHA',
    ashaFieldNotes: ashaFieldNotes || '',
    submittedAt: new Date().toISOString(),
    
    // Verification status: defaults to PENDING_CLASSIFICATION if submitted by ASHA,
    // or PENDING_APPROVAL if classified, or APPROVED if directApprove
    status: isAutoApproved ? 'APPROVED' : (req.body.status || 'PENDING_CLASSIFICATION'),
    isApproved: isAutoApproved,
    verifiedBy: isAutoApproved ? 'Dr. Suresh Mishra, CDMO' : null,
    verifiedAt: isAutoApproved ? new Date().toISOString() : null,
    verificationRemarks: isAutoApproved ? 'Direct administrative publishing' : null,
    classifiedBy: null,
    classifiedAt: null,

    timestamp: new Date().toISOString()
  };

  state.waterReports.unshift(newReport);

  // If approved, update village risk scores immediately
  if (newReport.isApproved) {
    const targetVil = state.villages.find(v => v.id === newReport.villageId || v.name === newReport.villageName);
    if (targetVil) {
      if (newReport.safetyStatus === 'CONTAMINATED') {
        targetVil.riskScore = 85;
        targetVil.riskLevel = 'CRITICAL';
        targetVil.status = 'OUTBREAK_TRIGGERED';
      } else if (newReport.safetyStatus === 'WARNING') {
        targetVil.riskScore = 58;
        targetVil.riskLevel = 'MODERATE';
        targetVil.status = 'WATCHLIST';
      } else {
        targetVil.riskScore = 18;
        targetVil.riskLevel = 'SAFE';
        targetVil.status = 'SAFE';
      }
    }
    broadcastWs('VILLAGES_UPDATE', state.villages);
  }

  broadcastWs('WATER_REPORTS_UPDATE', state.waterReports);

  res.json({ success: true, report: newReport, totalReports: state.waterReports.length });
});

// PATCH /api/water-reports/:id/classify - Hygiene Dept classifies safety status and advisory
router.patch('/:id/classify', (req, res) => {
  const { safetyStatus, advisory, classifiedBy, notes } = req.body || {};
  const reportIndex = state.waterReports.findIndex(r => r.id === req.params.id);

  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Water report not found' });
  }

  const report = state.waterReports[reportIndex];
  report.safetyStatus = safetyStatus || 'SAFE';
  report.advisory = advisory || (safetyStatus === 'CONTAMINATED' 
    ? 'Contaminated. Boil drinking water for 10 min. Chlorination deployed.' 
    : safetyStatus === 'WARNING' 
    ? 'Moderate risk. Filter and disinfect before drinking.' 
    : 'Water meets drinking standards. Safe to consume.');
  report.classifiedBy = classifiedBy || 'Dr. Meena Kumari (Hygiene & Public Health Dept)';
  report.classifiedAt = new Date().toISOString();
  report.classificationNotes = notes || '';
  report.status = 'PENDING_APPROVAL'; // Sent to Government Admin for final verification & publishing

  broadcastWs('WATER_REPORTS_UPDATE', state.waterReports);

  res.json({ success: true, report });
});

// PATCH /api/water-reports/:id/verify - Government verifies and approves the report
router.patch('/:id/verify', (req, res) => {
  const { verifiedBy, advisory, remarks, safetyStatus } = req.body || {};
  const reportIndex = state.waterReports.findIndex(r => r.id === req.params.id);

  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Water report not found' });
  }

  const report = state.waterReports[reportIndex];
  report.status = 'APPROVED';
  report.isApproved = true;
  report.verifiedBy = verifiedBy || 'Dr. Suresh Mishra, CDMO & District Surveillance Officer';
  report.verifiedAt = new Date().toISOString();
  report.verificationRemarks = remarks || 'Verified and approved by Government Health Authority. Published to public portal.';

  if (advisory) report.advisory = advisory;
  if (safetyStatus) report.safetyStatus = safetyStatus;

  // Update village risk status based on verified report
  const targetVil = state.villages.find(v => v.id === report.villageId || v.name === report.villageName);
  if (targetVil) {
    if (report.safetyStatus === 'CONTAMINATED') {
      targetVil.riskScore = 85;
      targetVil.riskLevel = 'CRITICAL';
      targetVil.status = 'OUTBREAK_TRIGGERED';
    } else if (report.safetyStatus === 'WARNING') {
      targetVil.riskScore = 58;
      targetVil.riskLevel = 'MODERATE';
      targetVil.status = 'WATCHLIST';
    } else {
      targetVil.riskScore = 18;
      targetVil.riskLevel = 'SAFE';
      targetVil.status = 'SAFE';
    }
    broadcastWs('VILLAGES_UPDATE', state.villages);
  }

  broadcastWs('WATER_REPORTS_UPDATE', state.waterReports);

  res.json({ success: true, report });
});

// PATCH /api/water-reports/:id/reject - Government requests re-test / rejects report
router.patch('/:id/reject', (req, res) => {
  const { reason, rejectedBy } = req.body || {};
  const reportIndex = state.waterReports.findIndex(r => r.id === req.params.id);

  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Water report not found' });
  }

  const report = state.waterReports[reportIndex];
  report.status = 'REJECTED';
  report.isApproved = false;
  report.rejectionReason = reason || 'Field readings inconsistent with standard protocol. Resampling required.';
  report.rejectedBy = rejectedBy || 'District Surveillance Officer';
  report.rejectedAt = new Date().toISOString();

  broadcastWs('WATER_REPORTS_UPDATE', state.waterReports);

  res.json({ success: true, report });
});

// DELETE a water report (Admin)
router.delete('/:id', (req, res) => {
  state.waterReports = state.waterReports.filter(r => r.id !== req.params.id);
  broadcastWs('WATER_REPORTS_UPDATE', state.waterReports);
  res.json({ success: true, remaining: state.waterReports.length });
});

export default router;
