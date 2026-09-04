import React from 'react';
import { Info } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';

export default function OfficialWaterAdvisories() {
  const { waterReports } = useAlertNotification();
  const approvedReports = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);

  return (
    <div className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <h2 className="text-sm font-bold text-sky-950">Official Water Quality Reports Published by District Admin</h2>
        <span className="badge badge-blue">{approvedReports.length} Reports</span>
      </div>

      <div className="card-body">
        {approvedReports.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
            <Info className="w-8 h-8 text-sky-600 mx-auto" />
            <div className="text-sm font-bold text-sky-950">No Official Water Reports Published Yet</div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              When the District Administration inputs verified test parameters from the lab, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Village & Source Name</th>
                  <th>Status</th>
                  <th>pH</th>
                  <th>Turbidity</th>
                  <th>TDS</th>
                  <th>Bacteria</th>
                  <th>Advisory & Action</th>
                </tr>
              </thead>
              <tbody>
                {approvedReports.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-bold text-sky-950 text-xs">{r.sourceName}</div>
                      <div className="text-2xs text-slate-500">{r.villageName} &bull; {r.sourceType}</div>
                    </td>
                    <td>
                      {r.safetyStatus === 'SAFE' && <span className="badge badge-safe">Safe to Drink</span>}
                      {r.safetyStatus === 'WARNING' && <span className="badge badge-high">Moderate Warning</span>}
                      {r.safetyStatus === 'CONTAMINATED' && <span className="badge badge-critical">Contaminated</span>}
                    </td>
                    <td className="font-mono text-xs">{r.ph}</td>
                    <td className="font-mono text-xs">{r.turbidity} NTU</td>
                    <td className="font-mono text-xs">{r.tds} ppm</td>
                    <td className="font-mono text-xs font-bold">{r.bacterialCfu} CFU</td>
                    <td className="text-xs text-slate-700">{r.advisory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
