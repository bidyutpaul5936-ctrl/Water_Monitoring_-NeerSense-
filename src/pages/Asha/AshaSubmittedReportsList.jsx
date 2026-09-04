import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Droplets, 
  ShieldCheck, 
  FlaskConical,
  Eye,
  FileText
} from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';

export default function AshaSubmittedReportsList() {
  const { waterReports } = useAlertNotification();

  if (!waterReports || waterReports.length === 0) {
    return (
      <div className="card bg-sky-50/50 border-dashed border-2 border-sky-300 p-8 text-center rounded-2xl">
        <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mb-3">
          <FlaskConical className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-sky-950">No Field Reports Submitted Yet</h3>
        <p className="text-xs text-sky-800 max-w-md mx-auto mt-1">
          Use the <strong>"Enter Water Test Data"</strong> form above to submit your field testing observations. Once submitted, they will appear here and in the Government verification queue.
        </p>
      </div>
    );
  }

  const pendingCount = waterReports.filter(r => r.status === 'PENDING_APPROVAL' || (!r.isApproved && r.status !== 'REJECTED')).length;
  const approvedCount = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-sky-950 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Field Test Reports Status Tracker</span>
          </h2>
          <p className="text-2xs text-sky-700">Track verification and approval by the District Health Authority</p>
        </div>

        <div className="flex items-center gap-2 text-2xs">
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>{pendingCount} Pending Govt Approval</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>{approvedCount} Live on Villagers Website</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {waterReports.map((report) => {
          const isApproved = report.status === 'APPROVED' || report.isApproved === true;
          const isRejected = report.status === 'REJECTED';
          const isPending = !isApproved && !isRejected;

          return (
            <div 
              key={report.id}
              className={`card p-4 transition border ${
                isApproved 
                  ? 'bg-white border-emerald-200 hover:border-emerald-300 shadow-sm' 
                  : isRejected 
                  ? 'bg-red-50/50 border-red-200' 
                  : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-sky-950">
                      {report.villageName}
                    </span>
                    <span className="text-2xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold border border-sky-200">
                      {report.sourceName} &bull; {report.sourceType}
                    </span>

                    {/* Verification Status Badge */}
                    {isApproved ? (
                      <span className="badge badge-safe text-3xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>LIVE ON VILLAGERS WEBSITE</span>
                      </span>
                    ) : isRejected ? (
                      <span className="badge badge-danger text-3xs font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        <span>RE-TEST REQUESTED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-3xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                        <span>UNDER GOVT REVIEW (CDMO)</span>
                      </span>
                    )}
                  </div>

                  <p className="text-2xs text-slate-600">
                    Submitted by: <strong>{report.submittedBy || 'ASHA Worker'}</strong> &bull; {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Potability badge */}
                <div className="flex items-center gap-2">
                  <span className={`badge ${
                    report.safetyStatus === 'CONTAMINATED' ? 'badge-danger' :
                    report.safetyStatus === 'WARNING' ? 'badge-warning' : 'badge-safe'
                  }`}>
                    {report.safetyStatus}
                  </span>
                </div>
              </div>

              {/* Parameter Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-3 text-2xs">
                <div className="p-2 bg-white rounded border border-sky-200">
                  <div className="text-3xs text-slate-500 font-medium">pH Level</div>
                  <div className="font-bold text-sky-950 font-mono text-xs">{report.ph}</div>
                </div>
                <div className="p-2 bg-white rounded border border-sky-200">
                  <div className="text-3xs text-slate-500 font-medium">Turbidity</div>
                  <div className="font-bold text-sky-950 font-mono text-xs">{report.turbidity} NTU</div>
                </div>
                <div className="p-2 bg-white rounded border border-sky-200">
                  <div className="text-3xs text-slate-500 font-medium">TDS</div>
                  <div className="font-bold text-sky-950 font-mono text-xs">{report.tds} mg/L</div>
                </div>
                <div className="p-2 bg-white rounded border border-sky-200">
                  <div className="text-3xs text-slate-500 font-medium">Coliform CFU</div>
                  <div className="font-bold text-sky-950 font-mono text-xs">{report.bacterialCfu}</div>
                </div>
                <div className="p-2 bg-white rounded border border-sky-200">
                  <div className="text-3xs text-slate-500 font-medium">H2S Vial Test</div>
                  <div className="font-bold text-sky-950 text-3xs truncate">
                    {report.h2sVialResult === 'BLACK_CONTAMINATED' ? '⚫ Positive (Black)' : '🟡 Negative (Yellow)'}
                  </div>
                </div>
              </div>

              {/* Field observations */}
              {report.ashaFieldNotes && (
                <div className="text-2xs bg-sky-50/70 p-2 rounded border border-sky-200 text-sky-900 mb-2">
                  <span className="font-bold">ASHA Field Note:</span> {report.ashaFieldNotes}
                </div>
              )}

              {/* Government Verification Stamp */}
              {isApproved ? (
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Verified & Approved by: <strong>{report.verifiedBy || 'Dr. Suresh Mishra, CDMO'}</strong></span>
                  </div>
                  <div className="text-3xs text-emerald-700">
                    Approved at: {new Date(report.verifiedAt || report.timestamp).toLocaleTimeString()} &bull; Live for Villagers
                  </div>
                </div>
              ) : isRejected ? (
                <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-2xs text-red-900">
                  <span className="font-bold">Government Rejection / Re-test Remark:</span> {report.rejectionReason}
                </div>
              ) : (
                <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 flex items-center justify-between gap-2 text-2xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Awaiting review & signature by Government Medical Officer</span>
                  </div>
                  <span className="text-3xs text-amber-800 font-semibold">Not yet shown to villagers</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
