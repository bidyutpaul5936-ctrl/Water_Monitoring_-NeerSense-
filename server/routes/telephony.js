import express from 'express';
import { state, recalculateAllVillages, broadcastWs } from '../state.js';

const router = express.Router();

// USSD Gateway Simulator (*999#)
router.post('/ussd', (req, res) => {
  const { input, phoneNumber } = req.body || {};

  if (!input || input === '*999#' || input === '*999') {
    return res.json({
      message: "JAL SURAKSHA HEALTH (Toll-Free):\n1. Report Diarrhea/Vomiting\n2. Report Fever/Jaundice\n3. Check Water Source Safety\n4. Request ASHA Visit\nReply with number (1-4):",
      continueSession: true
    });
  }

  if (input === '1') {
    return res.json({
      message: "DIARRHEA/CHOLERA REPORT:\nReply with Village Code:\n1. Majuli\n2. Gosaba\n3. Thuamul\n4. Tauru\n5. Bastar",
      continueSession: true
    });
  }

  if (input === '1*1' || input === '1*2' || input === '1*3' || input === '1*4' || input === '1*5') {
    const villageIdx = Number(input.split('*')[1]) - 1;
    const targetVil = state.villages[villageIdx] || state.villages[0];

    const newSym = {
      id: `ussd-${Date.now()}`,
      villageId: targetVil.id,
      villageName: targetVil.name,
      patientName: `USSD User (${phoneNumber || '98765-XXXXX'})`,
      age: 30,
      gender: 'Unknown',
      householdId: 'HH-USSD-DIRECT',
      symptoms: ['Watery Diarrhea', 'Dehydration'],
      suspectedDisease: 'Acute Diarrheal Infection',
      severity: 'SEVERE',
      waterSourceUsed: targetVil.primarySource,
      reportedVia: 'USSD_CODE',
      reportedBy: `Feature Phone (*999#)`,
      timestamp: new Date().toISOString(),
      status: 'REPORTED'
    };
    state.symptoms.unshift(newSym);
    recalculateAllVillages();
    broadcastWs('NEW_SYMPTOMS', [newSym]);
    broadcastWs('VILLAGES_UPDATE', state.villages);

    return res.json({
      message: `Thank you! Report logged for ${targetVil.name}. ASHA worker ${targetVil.ashaWorker} notified. Start ORS immediately. End of session.`,
      continueSession: false
    });
  }

  if (input === '3') {
    const criticalVils = state.villages.filter(v => v.riskScore && v.riskScore >= 65).map(v => v.name).join(', ');
    return res.json({
      message: `WATER SAFETY ALERT:\nHigh Risk Zones: ${criticalVils || 'None recorded yet'}.\nPlease boil water for 10 min. For chlorine tablets, contact your ASHA worker.`,
      continueSession: false
    });
  }

  res.json({
    message: "Thank you for contacting JalSuraksha. Stay hydrated with safe boiled water. Call 104 for Health Helpline.",
    continueSession: false
  });
});

// SMS Gateway Simulator
router.post('/sms-gateway', (req, res) => {
  const { from, body } = req.body || {};
  const upper = (body || '').toUpperCase();
  
  let targetVil = state.villages[0];
  if (upper.includes('MAJULI')) targetVil = state.villages[0];
  else if (upper.includes('GOSABA')) targetVil = state.villages[1];
  else if (upper.includes('THUAMUL') || upper.includes('KALAHANDI')) targetVil = state.villages[2];
  else if (upper.includes('TAURU') || upper.includes('MEWAT')) targetVil = state.villages[3];
  else if (upper.includes('BASTAR') || upper.includes('KASPAL')) targetVil = state.villages[4];

  const newSym = {
    id: `sms-${Date.now()}`,
    villageId: targetVil.id,
    villageName: targetVil.name,
    patientName: `SMS Sender (${from || '+91-98765-XXXXX'})`,
    age: 25,
    gender: 'Unknown',
    householdId: 'HH-SMS-GATEWAY',
    symptoms: upper.includes('CHOLERA') ? ['Watery Diarrhea', 'Severe Vomiting'] : ['Abdominal Pain', 'Fever'],
    suspectedDisease: upper.includes('CHOLERA') ? 'Cholera' : 'Water-borne Infection',
    severity: 'SEVERE',
    waterSourceUsed: targetVil.primarySource,
    reportedVia: 'SMS_GATEWAY',
    reportedBy: `SMS (${from || 'Mobile'})`,
    timestamp: new Date().toISOString(),
    status: 'REPORTED'
  };

  state.symptoms.unshift(newSym);
  recalculateAllVillages();
  broadcastWs('NEW_SYMPTOMS', [newSym]);
  broadcastWs('VILLAGES_UPDATE', state.villages);

  res.json({
    success: true,
    replySms: `JalSuraksha: Report registered for ${targetVil.name}. ASHA notified. Boil water before drinking.`
  });
});

export default router;
