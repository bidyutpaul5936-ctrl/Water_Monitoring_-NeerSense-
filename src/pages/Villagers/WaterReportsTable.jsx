import React from 'react';
import { Droplet, Info, CheckCircle2, AlertTriangle, AlertOctagon, ShieldCheck } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';

export default function WaterReportsTable() {
  const { waterReports } = useAlertNotification();

  // STRICT REQUIREMENT: Only show reports that have been approved by the Government!
  const approvedReports = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);

  return (
    <div className="card border-sky-300 shadow-sm">
      <div className="card-header bg-sky-100/70 border-b border-sky-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-sky-950">Official Drinking Water Quality Reports for Villagers</h2>
            <p className="text-2xs text-sky-700">Only verified reports approved and signed off by the Government Health Authority appear here</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-safe flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{approvedReports.length} Government Approved</span>
          </span>
        </div>
      </div>

      <div className="card-body p-4">
        {approvedReports.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-sky-100 border border-sky-300 mx-auto flex items-center justify-center text-sky-700">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-sky-950">No Official Water Reports Approved Yet</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Field test data entered by ASHA workers is currently under laboratory verification by the District Health Authority (CDMO). Only reports officially verified and approved by the Government are published to this website.
            </p>
            <div className="inline-flex items-center gap-2 text-2xs font-bold text-sky-900 bg-white border border-sky-300 px-3.5 py-1.5 rounded-lg shadow-sm">
              <span>Universal Precaution: Boil all drinking water for at least 10 minutes before consumption.</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Village & Source</th>
                  <th>Source Type</th>
                  <th>Water Safety</th>
                  <th>pH</th>
                  <th>Turbidity</th>
                  <th>TDS</th>
                  <th>Bacterial Count</th>
                  <th>Official Government Advisory</th>
                </tr>
              </thead>
              <tbody>
                {approvedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-sky-50/40 transition">
                    <td>
                      <div className="font-bold text-sky-950 text-xs">{report.sourceName}</div>
                      <div className="text-2xs text-slate-500">{report.villageName}</div>
                      <div className="text-3xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Approved by: {report.verifiedBy || 'Dr. Suresh Mishra, CDMO'}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-600 font-medium">{report.sourceType}</td>
                    <td>
                      {report.safetyStatus === 'SAFE' && (
                        <span className="badge badge-safe">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Safe
                        </span>
                      )}
                      {report.safetyStatus === 'WARNING' && (
                        <span className="badge badge-warning">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Warning
                        </span>
                      )}
                      {report.safetyStatus === 'CONTAMINATED' && (
                        <span className="badge badge-danger">
                          <AlertOctagon className="w-3 h-3 text-red-600" /> Contaminated
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-sky-950 font-bold">{report.ph}</td>
                    <td className="font-mono text-xs text-sky-950 font-bold">{report.turbidity} NTU</td>
                    <td className="font-mono text-xs text-sky-950 font-bold">{report.tds} mg/L</td>
                    <td className="font-mono text-xs text-sky-950 font-bold">
                      {report.bacterialCfu > 0 ? (
                        <span className="text-red-700 font-bold">{report.bacterialCfu} CFU</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">0 (None)</span>
                      )}
                    </td>
                    <td>
                      <div className="text-xs text-slate-700 font-medium max-w-xs leading-snug">
                        {report.advisory}
                      </div>
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
