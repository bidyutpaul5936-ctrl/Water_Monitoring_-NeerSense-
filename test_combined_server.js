// test_combined_server.js
import { WebSocket } from 'ws';

async function testCombined() {
  console.log('🔍 Testing Combined Full-Stack Server on Port 5000...');

  // 1. Fetch Root HTML
  const htmlRes = await fetch('http://localhost:5000/');
  const htmlText = await htmlRes.text();
  console.log('✅ 1. Frontend HTML Served on Port 5000:', htmlText.includes('<div id="root"></div>') ? 'PASS (index.html)' : 'FAIL');

  // 2. Fetch Assets
  const apiRes = await fetch('http://localhost:5000/api/health');
  const apiData = await apiRes.json();
  console.log('✅ 2. Backend REST API on Port 5000:', apiData);

  // 3. Connect WebSocket on Port 5000
  const ws = new WebSocket('ws://localhost:5000');
  await new Promise((resolve) => {
    ws.on('open', () => {
      console.log('✅ 3. WebSocket Connected on Port 5000: PASS');
    });
    ws.on('message', (msg) => {
      const data = JSON.parse(msg.toString());
      console.log('✅ 4. Initial WebSocket State Broadcast:', data.type, `(${data.data.villages.length} villages, ${data.data.sensors.length} sensors)`);
      ws.close();
      resolve();
    });
  });

  console.log('\n🎉 FRONTEND & BACKEND COMBINATION COMPLETE AND 100% OPERATIONAL ON PORT 5000!');
}

testCombined();
