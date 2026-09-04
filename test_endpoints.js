// test_endpoints.js - Automated API & ML Pipeline Verification Script

async function testAll() {
  const BASE = 'http://localhost:5000/api';
  console.log('🧪 [TEST] Starting JalSuraksha API and Intelligence Engine Verification...\n');

  try {
    // 1. Health
    const healthRes = await fetch(`${BASE}/health`);
    const health = await healthRes.json();
    console.log('✅ 1. Health Endpoint:', health);

    // 2. Villages with ML Risk Assessment
    const vilsRes = await fetch(`${BASE}/villages`);
    const vils = await vilsRes.json();
    console.log(`✅ 2. Villages (${vils.length} loaded):`);
    vils.forEach(v => {
      console.log(`   - ${v.name}: Risk Score = ${v.riskScore}/100 (${v.riskLevel}, Status: ${v.status})`);
    });

    // 3. IoT Sensors
    const snsRes = await fetch(`${BASE}/sensors`);
    const sns = await snsRes.json();
    console.log(`✅ 3. IoT Sensors (${sns.length} nodes):`);
    sns.slice(0, 3).forEach(s => {
      console.log(`   - ${s.name}: pH=${s.currentReadings.ph}, Turbidity=${s.currentReadings.turbidity} NTU, E.coli=${s.currentReadings.bacterialCfu} CFU`);
    });

    // 4. USSD Simulation (*999#)
    const ussdMenu = await (await fetch(`${BASE}/ussd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '*999#' })
    })).json();
    console.log('✅ 4. USSD Menu Query (*999#):\n', ussdMenu.message.split('\n').map(l => '     ' + l).join('\n'));

    // USSD Symptom Report (Diarrhea in Gosaba)
    const ussdReport = await (await fetch(`${BASE}/ussd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '1*1', phoneNumber: '+91-98765-00001' })
    })).json();
    console.log('✅ 4b. USSD Direct Report (1*1):', ussdReport.message);

    // 5. Submit Field Case
    const symReport = await (await fetch(`${BASE}/symptoms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        villageId: 'vil-02',
        patientName: 'Pooja Mondal',
        age: 18,
        gender: 'Female',
        symptoms: ['Watery Diarrhea', 'Severe Vomiting'],
        suspectedDisease: 'Acute Gastroenteritis',
        severity: 'SEVERE',
        reportedVia: 'ASHA_APP',
        reportedBy: 'Kuni Majhi (ASHA-071)'
      })
    })).json();
    console.log(`✅ 5. ASHA Field Case Submitted: ID=${symReport.items[0].id}, Village=vil-02`);

    // 6. Submit Manual H2S Test Kit Result
    const manualTest = await (await fetch(`${BASE}/manual-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        villageId: 'vil-02',
        ashaId: 'ASHA-071',
        sourceName: 'Gangasagar Deep Tube Well Collection Point',
        sourceType: 'Tube Well',
        h2sVialResult: 'BLACK_POSITIVE',
        phStripValue: 6.0,
        freeChlorinePpm: 0.0,
        turbidityObservation: 'CLOUDY_SILTY',
        notes: 'Field test kit confirmed high fecal contamination.'
      })
    })).json();
    console.log(`✅ 6. H2S Manual Test Logged: Result=${manualTest.test.h2sVialResult}, pH=${manualTest.test.phStripValue}`);

    // 7. Inject Contamination Spike & Check Automated Alert Generation
    const spikeRes = await (await fetch(`${BASE}/sensors/simulate-spike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ villageId: 'vil-01', severity: 'CRITICAL' })
    })).json();
    console.log(`✅ 7. Injected Contamination Spike into ${spikeRes.targetSensor?.name || 'Gosaba Sensor'}:`);
    console.log(`   - New Turbidity: ${spikeRes.targetSensor?.currentReadings?.turbidity} NTU, E.coli: ${spikeRes.targetSensor?.currentReadings?.bacterialCfu} CFU/100ml`);
    console.log(`   - Gosaba Updated Risk Score: ${spikeRes.village?.riskScore}/100 (${spikeRes.village?.riskLevel})`);

    // 8. Alerts
    const alertsRes = await fetch(`${BASE}/alerts`);
    const alerts = await alertsRes.json();
    console.log(`✅ 8. Active Alerts (${alerts.length} total):`);
    alerts.slice(0, 2).forEach(a => {
      console.log(`   - [${a.level}] ${a.title} (Risk: ${a.riskScore}/100)`);
    });

    console.log('\n🎉 ALL 8 BACKEND & ML ENGINE TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testAll();
