// exportService.js - Exporting reports in CSV and Printable PDF format

export const exportService = {
  exportVillagesCSV(villages) {
    const headers = ['Village ID', 'Village Name', 'District', 'State', 'Population', 'Risk Score', 'Risk Level', 'Status', 'ASHA Worker', 'Weather Temp (C)', 'Rainfall (mm)'];
    const rows = villages.map(v => [
      v.id,
      `"${v.name}"`,
      `"${v.district}"`,
      `"${v.state}"`,
      v.population,
      v.riskScore,
      v.riskLevel,
      v.status,
      `"${v.ashaWorker}"`,
      v.weather?.temp || '',
      v.weather?.rainfall || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `JalSuraksha_District_Risk_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportSensorsCSV(sensors) {
    const headers = ['Sensor ID', 'Village ID', 'Water Source Name', 'Type', 'Status', 'pH', 'Turbidity (NTU)', 'E.coli (CFU/100ml)', 'TDS (ppm)', 'DO (mg/L)', 'Timestamp'];
    const rows = sensors.map(s => [
      s.id,
      s.villageId,
      `"${s.name}"`,
      `"${s.sourceType}"`,
      s.status,
      s.currentReadings?.ph || '',
      s.currentReadings?.turbidity || '',
      s.currentReadings?.bacterialCfu || '',
      s.currentReadings?.tds || '',
      s.currentReadings?.doMgL || '',
      `"${s.currentReadings?.timestamp || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `JalSuraksha_IoT_Sensor_Telemetry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  printDistrictDossier(districtName, villages, alerts, sensors) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow pop-ups to generate printable report');

    const highRiskVillages = villages.filter(v => v.riskScore >= 65);
    const criticalAlerts = alerts.filter(a => a.level === 'CRITICAL' || a.level === 'HIGH');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>District Health Surveillance Dossier - ${districtName || 'All Districts'}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1e293b; }
          h1 { color: #0369a1; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 4px; }
          .header-meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #f1f5f9; font-weight: 600; color: #334155; }
          .badge-critical { background: #fecaca; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .badge-high { background: #fed7aa; color: #9a3412; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .badge-safe { background: #bbf7d0; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .section-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 24px; margin-bottom: 8px; }
          .alert-box { border-left: 4px solid #ef4444; background: #fff1f2; padding: 10px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>JalSuraksha: District Outbreak Early Warning Dossier</h1>
        <div class="header-meta">
          <strong>Ministry of Health & Family Welfare / Ministry of Jal Shakti Surveillance Report</strong><br>
          Generated on: ${new Date().toLocaleString()} | Scope: ${districtName || 'Integrated Multi-Region Grid'}
        </div>

        <div class="section-title">1. High-Risk Outbreak Clusters & Early Warning Summary</div>
        <table>
          <thead>
            <tr>
              <th>Village</th>
              <th>District/State</th>
              <th>Population</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th>Key Water Risk</th>
              <th>ASHA Assigned</th>
            </tr>
          </thead>
          <tbody>
            ${villages.map(v => `
              <tr>
                <td><strong>${v.name}</strong></td>
                <td>${v.district}, ${v.state}</td>
                <td>${v.population.toLocaleString()}</td>
                <td>
                  <span class="${v.riskScore >= 80 ? 'badge-critical' : v.riskScore >= 65 ? 'badge-high' : 'badge-safe'}">
                    ${v.riskScore}/100 (${v.riskLevel})
                  </span>
                </td>
                <td>${v.status}</td>
                <td>${v.primarySource}</td>
                <td>${v.ashaWorker}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">2. Active Outbreak Alerts & Rapid Response Status</div>
        ${criticalAlerts.length === 0 ? '<p>No active critical alerts recorded.</p>' : criticalAlerts.map(a => `
          <div class="alert-box">
            <strong>${a.title}</strong> [${a.villageName}] - Risk: ${a.riskScore}/100<br>
            <em>${a.message}</em><br>
            <small>Dispatched Actions: ${a.actionsTaken?.map(act => `${act.type} (${act.status})`).join(', ') || 'None'}</small>
          </div>
        `).join('')}

        <div class="section-title">3. Critical IoT Sensor Anomaly Readings</div>
        <table>
          <thead>
            <tr>
              <th>Water Source / Sensor</th>
              <th>Source Type</th>
              <th>pH (6.5-8.5)</th>
              <th>Turbidity (&lt;5 NTU)</th>
              <th>E.coli CFU (&lt;0)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${sensors.map(s => `
              <tr>
                <td>${s.name}</td>
                <td>${s.sourceType}</td>
                <td>${s.currentReadings?.ph}</td>
                <td style="${s.currentReadings?.turbidity > 10 ? 'color: red; font-weight: bold;' : ''}">${s.currentReadings?.turbidity} NTU</td>
                <td style="${s.currentReadings?.bacterialCfu > 50 ? 'color: red; font-weight: bold;' : ''}">${s.currentReadings?.bacterialCfu} CFU/100ml</td>
                <td><span class="${s.status === 'CRITICAL' ? 'badge-critical' : s.status === 'WARNING' || s.status === 'ALERT' ? 'badge-high' : 'badge-safe'}">${s.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
};
