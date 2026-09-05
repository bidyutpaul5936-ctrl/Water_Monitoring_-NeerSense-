import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Droplets, 
  ShieldCheck, 
  FlaskConical,
  Eye,
  FileText,
  Edit3,
  Save,
  X,
  KeyRound,
  AlertTriangle,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { useAuthRole } from '../../contexts/AuthRoleContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { useAlterationPermission } from '../../contexts/AlterationPermissionContext';
import { api } from '../../services/api';

export default function AshaSubmittedReportsList() {
  const { waterReports, refreshData, updateWaterReportLocally } = useAlertNotification();
  const { isGovernment, currentUser } = useAuthRole();
  const { hasPermission, permissionDetails, openAlterationModal } = useAlterationPermission();

  const [editingReportId, setEditingReportId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [alterSuccessMsg, setAlterSuccessMsg] = useState(null);

  const startEditing = (report) => {
    if (!isGovernment) return;
    if (!hasPermission) {
      openAlterationModal({
        department: 'ASHA',
        onGranted: (details) => {
          setEditingReportId(report.id);
          setEditFormData({
            sourceName: report.sourceName || '',
            sourceType: report.sourceType || 'Tube Well / Handpump',
            ph: report.ph ?? '',
            turbidity: report.turbidity ?? '',
            tds: report.tds ?? '',
            bacterialCfu: report.bacterialCfu ?? '',
            h2sVialResult: report.h2sVialResult || 'YELLOW_SAFE',
            ashaFieldNotes: report.ashaFieldNotes || '',
            adminRemarks: report.adminRemarks || ''
          });
        }
      });
      return;
    }

    setEditingReportId(report.id);
    setEditFormData({
      sourceName: report.sourceName || '',
      sourceType: report.sourceType || 'Tube Well / Handpump',
      ph: report.ph ?? '',
      turbidity: report.turbidity ?? '',
      tds: report.tds ?? '',
      bacterialCfu: report.bacterialCfu ?? '',
      h2sVialResult: report.h2sVialResult || 'YELLOW_SAFE',
      ashaFieldNotes: report.ashaFieldNotes || '',
      adminRemarks: report.adminRemarks || ''
    });
  };

  const handleSaveAlteration = async (reportId) => {
    setSavingId(reportId);
    const alterationPayload = {
      ...editFormData,
      permissionToken: permissionDetails?.token,
      permissionReason: permissionDetails?.reason,
      alteredBy: permissionDetails?.officerName || currentUser?.name || 'Government Admin',
      alteredAt: new Date().toISOString(),
      isAltered: true
    };
    try {
      updateWaterReportLocally && updateWaterReportLocally(reportId, alterationPayload);
      await api.alterWaterReport(reportId, alterationPayload);
      refreshData && refreshData();
      setEditingReportId(null);
      setAlterSuccessMsg(`Report for "${editFormData.sourceName}" successfully altered and logged under Permission #${permissionDetails?.token}!`);
      setTimeout(() => setAlterSuccessMsg(null), 6000);
    } catch (err) {
      console.warn('API sync warning:', err.message);
      setEditingReportId(null);
      setAlterSuccessMsg(`Report for "${editFormData.sourceName}" altered under Permission #${permissionDetails?.token}!`);
      setTimeout(() => setAlterSuccessMsg(null), 6000);
    } finally {
      setSavingId(null);
    }
  };

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

      {/* Alteration Success Toast */}
      {alterSuccessMsg && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{alterSuccessMsg}</span>
        </div>
      )}

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

                    {/* Altered Record Audit Pill */}
                    {report.isAltered && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-3xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-purple-700" />
                        <span>ALTERED BY ADMIN (#{report.alterationPermissionToken})</span>
                      </span>
                    )}
                  </div>

                  <p className="text-2xs text-slate-600">
                    Submitted by: <strong>{report.submittedBy || 'ASHA Worker'}</strong> &bull; {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Potability badge & Admin Alter Button */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${
                    report.safetyStatus === 'CONTAMINATED' ? 'badge-danger' :
                    report.safetyStatus === 'WARNING' ? 'badge-warning' : 'badge-safe'
                  }`}>
                    {report.safetyStatus}
                  </span>

                  {isGovernment && (
                    <button
                      type="button"
                      onClick={() => startEditing(report)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-bold rounded-lg transition shadow-2xs ${
                        hasPermission 
                          ? 'bg-sky-600 text-white hover:bg-sky-700' 
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                      }`}
                      title={hasPermission ? "Alter Report Data" : "Request Permission to Alter Data"}
                    >
                      {hasPermission ? <Edit3 className="w-3 h-3" /> : <Lock className="w-3 h-3 text-amber-700" />}
                      <span>{hasPermission ? '✏️ Alter Data' : '🔒 Alter (Perm Req)'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Alteration Form (Admin Only) */}
              {editingReportId === report.id && (
                <div className="mt-3 p-4 bg-sky-50/80 border-2 border-sky-300 rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-sky-600 text-white flex items-center justify-center font-bold text-2xs">
                        <Edit3 className="w-3 h-3" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-sky-950">Administrative Alteration Mode</div>
                        <div className="text-3xs text-sky-800">
                          Authorized under Token: <strong className="font-mono text-sky-900">#{permissionDetails?.token}</strong> &bull; Officer: <strong>{permissionDetails?.officerName}</strong>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingReportId(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-2xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Source Name</label>
                      <input
                        type="text"
                        value={editFormData.sourceName}
                        onChange={(e) => setEditFormData({ ...editFormData, sourceName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded text-xs text-sky-950 font-semibold focus:border-sky-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Source Type</label>
                      <select
                        value={editFormData.sourceType}
                        onChange={(e) => setEditFormData({ ...editFormData, sourceType: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded text-xs text-sky-950 font-semibold focus:border-sky-500 outline-none"
                      >
                        <option value="Tube Well / Handpump">Tube Well / Handpump</option>
                        <option value="Pond Sand Filter">Pond Sand Filter</option>
                        <option value="Piped Water Tap">Piped Water Tap</option>
                        <option value="Natural Spring">Natural Spring</option>
                        <option value="River / Stream">River / Stream</option>
                        <option value="Open Well">Open Well</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">pH Level (6.5 - 8.5 safe)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editFormData.ph}
                        onChange={(e) => setEditFormData({ ...editFormData, ph: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded text-xs text-sky-950 font-semibold focus:border-sky-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Turbidity (NTU, &lt; 1 safe)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editFormData.turbidity}
                        onChange={(e) => setEditFormData({ ...editFormData, turbidity: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded text-xs text-sky-950 font-semibold focus:border-sky-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">TDS (mg/L, &lt; 500 safe)</label>
                      <input
                        type="number"
                        value={editFormData.tds}
                        onChange={(e) => setEditFormData({ ...editFormData, tds: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded text-xs text-sky-950 font-semibold focus:border-sky-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Coliform CFU (0 safe)</label>
                      <input
                        type="number"
                        value={editFormData.bacterialCfu}
                        onChange={(e) => setEditFormData({ ...editFormData, bacterialCfu: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded text-xs text-sky-950 font-semibold focus:border-sky-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="font-bold text-slate-700 block mb-1">H2S Rapid Field Vial Test</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name={`h2s-${report.id}`}
                            value="YELLOW_SAFE"
                            checked={editFormData.h2sVialResult === 'YELLOW_SAFE'}
                            onChange={() => setEditFormData({ ...editFormData, h2sVialResult: 'YELLOW_SAFE' })}
                          />
                          <span className="font-semibold text-emerald-800">🟡 Yellow (Negative / Safe)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name={`h2s-${report.id}`}
                            value="BLACK_CONTAMINATED"
                            checked={editFormData.h2sVialResult === 'BLACK_CONTAMINATED'}
                            onChange={() => setEditFormData({ ...editFormData, h2sVialResult: 'BLACK_CONTAMINATED' })}
                          />
                          <span className="font-semibold text-red-800">⚫ Black (Positive / Contaminated)</span>
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="font-bold text-slate-700 block mb-1">Administrative Remarks & Correction Justification</label>
                      <input
                        type="text"
                        value={editFormData.adminRemarks}
                        onChange={(e) => setEditFormData({ ...editFormData, adminRemarks: e.target.value })}
                        placeholder={`e.g. Recalibrated measurement per central lab protocol (Authorized: ${permissionDetails?.reason})`}
                        className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded text-xs text-sky-950 focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-200">
                    <button
                      type="button"
                      onClick={() => setEditingReportId(null)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded text-2xs hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingId === report.id}
                      onClick={() => handleSaveAlteration(report.id)}
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded text-2xs shadow flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingId === report.id ? 'Saving Alterations...' : 'Save & Publish Alteration'}</span>
                    </button>
                  </div>
                </div>
              )}

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

              {/* Admin Alteration Audit Stamp if altered */}
              {report.isAltered && (
                <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-2xs text-purple-950 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-purple-700 flex-shrink-0" />
                    <span>
                      <strong>Admin Alteration Audit:</strong> Modified by <strong>{report.alteredBy}</strong> (Token <span className="font-mono font-bold">#{report.alterationPermissionToken}</span>) &bull; <em>{report.alterationReason}</em>
                    </span>
                  </div>
                  {report.alteredAt && (
                    <div className="text-3xs text-purple-700">
                      Altered: {new Date(report.alteredAt).toLocaleString()}
                    </div>
                  )}
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
