import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Send, 
  Droplets, 
  FileCheck, 
  UserCheck, 
  ChevronRight,
  Eye,
  Trash2
} from 'lucide-react';
import { useAuthRole } from '../../contexts/AuthRoleContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { api } from '../../services/api';

export default function GovtReportVerificationDesk() {
  const { currentUser = {} } = useAuthRole() || {};
  const { waterReports = [] } = useAlertNotification() || {};

  const [verifyingId, setVerifyingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [customRemarks, setCustomRemarks] = useState({});
  const [customAdvisory, setCustomAdvisory] = useState({});
  const [customStatus, setCustomStatus] = useState({});
  const [rejectReason, setRejectReason] = useState({});
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const safeWaterReports = Array.isArray(waterReports) ? waterReports : [];

  const pendingReports = safeWaterReports.filter(r => r && (r.status === 'PENDING_APPROVAL' || r.status === 'PENDING_VERIFICATION'));
  const awaitingHygiene = safeWaterReports.filter(r => r && (r.status === 'PENDING_CLASSIFICATION' || (!r.status && !r.isApproved)));
  const approvedReports = safeWaterReports.filter(r => r && (r.status === 'APPROVED' || r.isApproved === true));

  const handleApprove = async (report) => {
    setProcessing(true);
    setActionError('');
    try {
      const payload = {
        verifiedBy: currentUser.name || 'Dr. Suresh Mishra, CDMO & District Surveillance Officer',
        safetyStatus: customStatus[report.id] || report.safetyStatus,
        advisory: customAdvisory[report.id] || report.advisory,
        remarks: customRemarks[report.id] || 'Verified and approved by District Health & Water Authority. Published to Public Villagers Portal.'
      };

      await api.verifyWaterReport(report.id, payload);
      setVerifyingId(null);
    } catch (err) {
      console.error('Failed to verify water report', err);
      setActionError('Error verifying report. Please check your connection and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (report) => {
    setProcessing(true);
    setActionError('');
    try {
      const reason = rejectReason[report.id] || 'Field readings inconsistent with baseline. Resampling required.';
      await api.rejectWaterReport(report.id, { reason });
      setRejectingId(null);
    } catch (err) {
      console.error('Failed to reject water report', err);
      setActionError('Error sending re-test request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDeleteId(null);
    try {
      await api.deleteWaterReport(id);
    } catch (err) {
      console.error('Failed to delete report', err);
      setActionError('Error deleting report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card bg-white border-sky-300 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-sky-950">
                Government Verification & Report Approval Desk
              </h2>
              <p className="text-xs text-sky-800">
                Official review portal for District Administration, CDMO & Jal Shakti Lab Officers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{pendingReports.length} Awaiting Your Verification</span>
            </span>
          </div>
        </div>
      </div>

      {/* Inline Action Error Banner */}
      {actionError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-red-800 flex-1">{actionError}</p>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600 transition">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4-Stage Workflow Stepper */}
      <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl space-y-2">
        <div className="text-3xs font-bold text-sky-900 uppercase tracking-wider">Official 4-Stage Report Publishing Pipeline:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-3xs font-semibold">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-3xs shrink-0">✓</span>
            <div>
              <div className="font-bold leading-tight">ASHA Field Entry</div>
              <div className="text-emerald-700 text-4xs">Completed</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-teal-50 border border-teal-300 text-teal-950 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-3xs shrink-0">✓</span>
            <div>
              <div className="font-bold leading-tight">Health / Hygiene Dept</div>
              <div className="text-teal-700 text-4xs">Classified &amp; Forwarded</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-sky-700 text-white flex items-center gap-1.5 shadow-sm">
            <span className="w-4 h-4 rounded-full bg-white text-sky-900 flex items-center justify-center font-bold text-3xs shrink-0">3</span>
            <div>
              <div className="font-bold leading-tight">Government Admin</div>
              <div className="text-sky-100 text-4xs">Active Verification Desk</div>
            </div>
          </div>

          {/* Step 4 — lights up green when there are approved/published reports */}
          {approvedReports.length > 0 ? (
            <div className="p-2 rounded-lg bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm">
              <span className="w-4 h-4 rounded-full bg-white text-emerald-900 flex items-center justify-center font-bold text-3xs shrink-0">✓</span>
              <div>
                <div className="font-bold leading-tight">Citizens Portal</div>
                <div className="text-emerald-100 text-4xs">{approvedReports.length} Report(s) Live &amp; Published</div>
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-white border border-sky-200 text-sky-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-3xs shrink-0">4</span>
              <div>
                <div className="font-bold leading-tight">Citizens Portal</div>
                <div className="text-slate-500 text-4xs">Awaiting Approval</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Queue Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-sky-950 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Pending ASHA Field Reports Awaiting Official Approval ({pendingReports.length})</span>
          </h3>
          <span className="text-2xs text-slate-500 font-medium">
            Reports will NOT be visible to villagers until approved here
          </span>
        </div>

        {pendingReports.length === 0 ? (
          <div className="card bg-white border border-sky-200 p-8 text-center rounded-xl space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-sky-950">Verification Queue is Clear</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              There are currently no pending field reports submitted by ASHA workers awaiting review. All received data has been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReports.map((report) => {
              const isVerifying = verifyingId === report.id;
              const isRejecting = rejectingId === report.id;

              return (
                <div 
                  key={report.id}
                  className="card bg-white border-2 border-amber-300 rounded-xl p-5 shadow-sm space-y-4 transition"
                >
                  {/* Top report header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-sky-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-sky-950">
                          {report.villageName}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-sky-100 text-sky-900 font-bold border border-sky-200">
                          {report.sourceName} &bull; {report.sourceType}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-3xs font-extrabold border border-amber-300">
                          🟡 PENDING VERIFICATION
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        Submitted by: <strong className="text-sky-900">{report.submittedBy || 'ASHA Worker'}</strong> &bull; {new Date(report.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        report.safetyStatus === 'CONTAMINATED' ? 'badge-danger' :
                        report.safetyStatus === 'WARNING' ? 'badge-warning' : 'badge-safe'
                      } text-xs font-extrabold px-3 py-1`}>
                        {report.safetyStatus}
                      </span>
                    </div>
                  </div>

                  {/* Physical & Chemical Readings Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                    <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-200">
                      <div className="text-3xs text-slate-500 font-medium">pH Level</div>
                      <div className="font-extrabold text-sky-950 font-mono text-sm">{report.ph}</div>
                      <div className="text-3xs text-slate-400">Normal: 6.5 - 8.5</div>
                    </div>

                    <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-200">
                      <div className="text-3xs text-slate-500 font-medium">Turbidity</div>
                      <div className="font-extrabold text-sky-950 font-mono text-sm">{report.turbidity} NTU</div>
                      <div className="text-3xs text-slate-400">Limit: &lt; 5 NTU</div>
                    </div>

                    <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-200">
                      <div className="text-3xs text-slate-500 font-medium">TDS</div>
                      <div className="font-extrabold text-sky-950 font-mono text-sm">{report.tds} mg/L</div>
                      <div className="text-3xs text-slate-400">Limit: &lt; 500</div>
                    </div>

                    <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-200">
                      <div className="text-3xs text-slate-500 font-medium">Coliform CFU</div>
                      <div className="font-extrabold text-sky-950 font-mono text-sm">{report.bacterialCfu}</div>
                      <div className="text-3xs text-slate-400">Ideal: 0 CFU</div>
                    </div>

                    <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-200">
                      <div className="text-3xs text-slate-500 font-medium">H2S Bacterial Test</div>
                      <div className={`font-extrabold text-xs mt-0.5 ${
                        report.h2sVialResult === 'BLACK_CONTAMINATED' ? 'text-red-700' : 'text-emerald-700'
                      }`}>
                        {report.h2sVialResult === 'BLACK_CONTAMINATED' ? '⚫ Positive (Black)' : '🟡 Negative (Yellow)'}
                      </div>
                      <div className="text-3xs text-slate-400">H2S rapid field kit</div>
                    </div>
                  </div>

                  {/* ASHA Field Observation Notes */}
                  {report.ashaFieldNotes && (
                    <div className="p-3 bg-sky-50/70 rounded-lg border border-sky-200 text-xs text-sky-950">
                      <span className="font-bold text-sky-900">ASHA Field Observations:</span> {report.ashaFieldNotes}
                    </div>
                  )}

                  {/* Proposed Public Advisory */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800">
                    <span className="font-bold text-slate-900">Proposed Advisory for Villagers:</span> {report.advisory}
                  </div>

                  {/* Government Action Controls */}
                  <div className="pt-2 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-2xs text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                      <span>Reviewing Officer: <strong>{currentUser.name || 'Dr. Suresh Mishra, CDMO'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => { setRejectingId(report.id); setVerifyingId(null); }}
                        className="flex-1 sm:flex-initial py-2 px-3.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs border border-red-200 transition flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Request Re-test</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(report)}
                        disabled={processing}
                        className="flex-1 sm:flex-initial py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ Verify & Approve (Publish to Villagers Website)</span>
                      </button>
                    </div>
                  </div>

                  {/* Rejection Prompt */}
                  {isRejecting && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2 text-xs animate-fadeIn">
                      <div className="font-bold text-red-950">Specify Reason for Re-testing / Rejection:</div>
                      <input
                        type="text"
                        placeholder="e.g. Discrepancy in turbidity reading, duplicate sample, or laboratory calibration needed."
                        value={rejectReason[report.id] || ''}
                        onChange={(e) => setRejectReason({ ...rejectReason, [report.id]: e.target.value })}
                        className="w-full p-2 border border-red-300 rounded bg-white text-xs"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(report)}
                          disabled={processing}
                          className="px-4 py-1 bg-red-600 text-white font-bold rounded text-xs hover:bg-red-700"
                        >
                          Confirm Re-test Request
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approved Reports Registry */}
      <div className="space-y-3 pt-4 border-t border-sky-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-sky-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Currently Published on Villagers Website ({approvedReports.length})</span>
          </h3>
          <span className="text-2xs text-emerald-700 font-semibold">
            ● Live and visible to the public
          </span>
        </div>

        {approvedReports.length === 0 ? (
          <div className="card bg-white border border-sky-200 p-6 text-center text-xs text-slate-500 rounded-xl">
            No reports are currently live on the public website. Approve pending ASHA submissions above to publish.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {approvedReports.map((report) => (
              <div 
                key={report.id}
                className="card bg-white border border-emerald-200 rounded-xl p-4 shadow-sm space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-sky-950">{report.villageName}</span>
                    <span className="text-2xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold border border-sky-200">
                      {report.sourceName} &bull; {report.sourceType}
                    </span>
                    <span className={`badge ${
                      report.safetyStatus === 'CONTAMINATED' ? 'badge-danger' :
                      report.safetyStatus === 'WARNING' ? 'badge-warning' : 'badge-safe'
                    }`}>
                      {report.safetyStatus}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(report.id)}
                    className="self-end sm:self-auto text-2xs text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition flex items-center gap-1"
                    title="Revoke / Delete from Website"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                </div>

                {/* Inline delete confirmation */}
                {confirmDeleteId === report.id && (
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs">
                    <span className="text-red-800 font-semibold">Remove this report from the public website?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-semibold rounded text-2xs"
                      >Cancel</button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="px-2.5 py-1 bg-red-600 text-white font-bold rounded text-2xs hover:bg-red-700"
                      >Yes, Remove</button>
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-700 bg-sky-50/50 p-2.5 rounded border border-sky-100">
                  <strong>Public Advisory:</strong> {report.advisory}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-2xs text-slate-500 pt-1">
                  <div>
                    Entered by ASHA: <strong>{report.submittedBy || 'Field Worker'}</strong> &bull; Verified by: <strong className="text-emerald-800">{report.verifiedBy || 'Dr. Suresh Mishra, CDMO'}</strong>
                  </div>
                  <div className="text-3xs text-slate-400">
                    Verified: {new Date(report.verifiedAt || report.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
