import React from 'react';
import { Info, Trash2 } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { api } from '../../services/api';

export default function PublishedReportsRegistry({ onSwitchToInput }) {
  const { waterReports, refreshData } = useAlertNotification();

  const handleDeleteReport = async (id) => {
    if (confirm('Are you sure you want to remove this published water report?')) {
      try {
        await api.deleteWaterReport(id);
        refreshData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <h2 className="text-sm font-bold text-sky-950">Published Water Quality Records Registry</h2>
        <span className="badge badge-blue">{waterReports.length} Active Records</span>
      </div>

      <div className="card-body">
        {waterReports.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
            <Info className="w-8 h-8 text-sky-600 mx-auto" />
            <div className="text-sm font-bold text-sky-950">No Water Quality Reports Published Yet</div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              The system is currently empty. Use the "Input Water Quality Data" tab above to publish your first report.
            </p>
            <button
              onClick={onSwitchToInput}
              className="btn-primary text-xs mt-2"
            >
              ➕ Input First Water Report
            </button>
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
                  <th>Official Advisory</th>
                  <th>Tested Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {waterReports.map(report => (
                  <tr key={report.id}>
                    <td>
                      <div className="font-bold text-sky-950 text-xs">{report.sourceName}</div>
                      <div className="text-2xs text-slate-500">{report.villageName} ({report.sourceType})</div>
                    </td>
                    <td>
                      {report.safetyStatus === 'SAFE' && <span className="badge badge-safe">Safe</span>}
                      {report.safetyStatus === 'WARNING' && <span className="badge badge-high">Moderate Warning</span>}
                      {report.safetyStatus === 'CONTAMINATED' && <span className="badge badge-critical">Contaminated</span>}
                    </td>
                    <td className="font-mono text-xs">{report.ph}</td>
                    <td className="font-mono text-xs">{report.turbidity} NTU</td>
                    <td className="font-mono text-xs">{report.tds} ppm</td>
                    <td className="font-mono text-xs font-bold text-red-600">{report.bacterialCfu} CFU</td>
                    <td className="text-xs text-slate-700 max-w-xs truncate">{report.advisory}</td>
                    <td className="text-2xs text-slate-500">{new Date(report.timestamp).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
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
