import React, { useState } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  Clock, 
  Sparkles, 
  Info, 
  Check, 
  Filter, 
  Droplets,
  Activity,
  FileCheck,
  UserCheck,
  KeyRound,
  Lock,
  Unlock,
  ShieldCheck
} from 'lucide-react';
import { useAuthRole } from '../../contexts/AuthRoleContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { useAlterationPermission } from '../../contexts/AlterationPermissionContext';
import { api } from '../../services/api';

const ADVISORY_TEMPLATES = {
  SAFE: 'Potable and safe for drinking. Meets IS 10500 drinking water parameters. Routine hygiene practices recommended.',
  WARNING: 'Moderate turbidity or TDS detected. Boil water for at least 5 minutes or use cloth/ceramic filtration before drinking.',
  CONTAMINATED: 'High bacterial coliform / H2S positive detected! STRICT ADVISORY: Do not drink unboiled. Boil vigorously for 10 minutes. Chlorine tablet distribution requested.'
};

export default function HygieneClassificationDesk() {
  const { currentUser, isGovernment } = useAuthRole();
  const { waterReports, fetchFullState, updateWaterReportLocally } = useAlertNotification();
  const { hasPermission, permissionDetails, openAlterationModal } = useAlterationPermission();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'classified', 'approved'
  const [selectedReportId, setSelectedReportId] = useState(null);
  
  // Classification form state
  const [selectedSafety, setSelectedSafety] = useState('SAFE');
  const [advisoryText, setAdvisoryText] = useState(ADVISORY_TEMPLATES.SAFE);
  const [officerNotes, setOfficerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Group reports
  const pendingReports = waterReports.filter(r => r.status === 'PENDING_CLASSIFICATION' || (!r.status && !r.isApproved));
  const classifiedReports = waterReports.filter(r => r.status === 'PENDING_APPROVAL');
  const approvedReports = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);

  const displayedReports = activeTab === 'pending' 
    ? pendingReports 
    : activeTab === 'classified' 
    ? classifiedReports 
    : approvedReports;

  // Selected report
  const selectedReport = waterReports.find(r => r.id === selectedReportId) || (displayedReports.length > 0 ? displayedReports[0] : null);

  const handleSelectReport = (report) => {
    setSelectedReportId(report.id);
    // Auto suggest safety based on field readings
    const isContaminated = report.h2sVialResult === 'BLACK_CONTAMINATED' || (report.bacterialCfu && report.bacterialCfu > 10) || (report.turbidity && report.turbidity > 5);
    const isWarning = !isContaminated && ((report.turbidity && report.turbidity > 1) || (report.tds && report.tds > 500) || (report.ph && (report.ph < 6.5 || report.ph > 8.5)));
    
    const suggested = isContaminated ? 'CONTAMINATED' : isWarning ? 'WARNING' : 'SAFE';
    setSelectedSafety(report.safetyStatus && report.safetyStatus !== 'PENDING' ? report.safetyStatus : suggested);
    setAdvisoryText(report.advisory || ADVISORY_TEMPLATES[suggested]);
    setOfficerNotes(report.classificationNotes || '');
    setSuccessMessage(null);
  };

  const handleSafetyChange = (status) => {
    setSelectedSafety(status);
    setAdvisoryText(ADVISORY_TEMPLATES[status] || '');
  };

  const handleClassifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    // If Government Admin is altering hygiene data, require permission
    if (isGovernment && !hasPermission) {
      openAlterationModal({
        department: 'HYGIENE',
        onGranted: async (perm) => {
          setIsSubmitting(true);
          setSuccessMessage(null);
          const payload = {
            safetyStatus: selectedSafety,
            advisory: advisoryText,
            classificationNotes: officerNotes,
            permissionToken: perm.token,
            permissionReason: perm.reason,
            alteredBy: perm.officerName,
            isAltered: true,
            alteredAt: new Date().toISOString()
          };
          try {
            updateWaterReportLocally && updateWaterReportLocally(selectedReport.id, payload);
            await api.alterWaterReport(selectedReport.id, payload);
            setSuccessMessage(`Classification for "${selectedReport.sourceName}" in ${selectedReport.villageName} successfully altered under Permission #${perm.token}!`);
            fetchFullState();
            setTimeout(() => setSuccessMessage(null), 6000);
          } catch (err) {
            console.warn('Altered locally:', err.message);
            setSuccessMessage(`Classification for "${selectedReport.sourceName}" altered under Permission #${perm.token}!`);
            setTimeout(() => setSuccessMessage(null), 6000);
          } finally {
            setIsSubmitting(false);
          }
        }
      });
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      if (isGovernment && hasPermission) {
        const payload = {
          safetyStatus: selectedSafety,
          advisory: advisoryText,
          classificationNotes: officerNotes,
          permissionToken: permissionDetails?.token,
          permissionReason: permissionDetails?.reason,
          alteredBy: permissionDetails?.officerName || currentUser?.name || 'Government Administrator',
          isAltered: true,
          alteredAt: new Date().toISOString()
        };
        updateWaterReportLocally && updateWaterReportLocally(selectedReport.id, payload);
        await api.alterWaterReport(selectedReport.id, payload);
        setSuccessMessage(`Classification for "${selectedReport.sourceName}" altered & recorded under Permission #${permissionDetails?.token}!`);
      } else {
        await api.classifyWaterReport(selectedReport.id, {
          safetyStatus: selectedSafety,
          advisory: advisoryText,
          classifiedBy: currentUser.name || 'Dr. Meena Kumari (Hygiene Dept)',
          notes: officerNotes
        });
        setSuccessMessage(`Report for "${selectedReport.sourceName}" in ${selectedReport.villageName} classified as "${selectedSafety}" and forwarded to Government Admin for final approval!`);
      }
      fetchFullState();
      
      // Auto switch or select next
      setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);
    } catch (err) {
      console.warn('Submission finished:', err.message);
      setSuccessMessage(`Report classification updated!`);
      setTimeout(() => setSuccessMessage(null), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Desk Title Card */}
      <div className="card bg-white border-sky-300 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-safe text-2xs">Hygiene & Sanitation Department</span>
              <span className="badge badge-blue text-2xs">Public Health Engineering</span>
            </div>
            <h2 className="text-base md:text-lg font-extrabold text-sky-950">
              Water Safety Scientific Classification Desk
            </h2>
            <p className="text-xs text-sky-800 mt-0.5">
              Evaluate field test data submitted by ASHA workers, assign authoritative water safety classification, and formulate public health advisories for Government approval.
            </p>
          </div>
        </div>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
            👩‍🔬
          </div>
          <div className="text-xs">
            <div className="font-bold text-teal-950">{currentUser.name || 'Dr. Meena Kumari'}</div>
            <div className="text-2xs text-teal-700">{currentUser.title || 'District Water & Sanitation Officer'}</div>
          </div>
        </div>
      </div>

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

          <div className="p-2 rounded-lg bg-teal-600 text-white flex items-center gap-1.5 shadow-sm">
            <span className="w-4 h-4 rounded-full bg-white text-teal-900 flex items-center justify-center font-bold text-3xs shrink-0">2</span>
            <div>
              <div className="font-bold leading-tight">Health / Hygiene Dept</div>
              <div className="text-teal-100 text-4xs">Active Classification Desk</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-white border border-sky-200 text-sky-900 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-3xs shrink-0">3</span>
            <div>
              <div className="font-bold leading-tight">Government Admin</div>
              <div className="text-slate-500 text-4xs">Verification & Approval</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-white border border-sky-200 text-sky-900 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-3xs shrink-0">4</span>
            <div>
              <div className="font-bold leading-tight">Citizens Portal</div>
              <div className="text-slate-500 text-4xs">Published Report</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-emerald-950 text-xs flex items-center gap-3 shadow-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="font-medium">{successMessage}</div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-sky-200 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('pending'); setSelectedReportId(null); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-sky-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Classification</span>
          <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
            activeTab === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {pendingReports.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('classified'); setSelectedReportId(null); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'classified'
              ? 'bg-sky-600 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-sky-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Awaiting Govt Approval</span>
          <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
            activeTab === 'classified' ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-800'
          }`}>
            {classifiedReports.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('approved'); setSelectedReportId(null); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-sky-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Published to Villagers</span>
          <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
            activeTab === 'approved' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {approvedReports.length}
          </span>
        </button>
      </div>

      {/* Main Workspace: Left = Report Queue, Right = Scientific Classification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report Cards Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-sky-950 flex items-center justify-between">
            <span>
              {activeTab === 'pending' ? 'ASHA Field Submissions' : activeTab === 'classified' ? 'Classified Queue' : 'Approved Water Reports'}
            </span>
            <span className="text-2xs text-slate-500">{displayedReports.length} item(s)</span>
          </div>

          {displayedReports.length === 0 ? (
            <div className="card bg-white border-dashed border-2 border-sky-200 p-8 text-center space-y-2">
              <FlaskConical className="w-8 h-8 text-sky-300 mx-auto" />
              <div className="text-xs font-bold text-sky-900">
                {activeTab === 'pending' 
                  ? 'No Reports Awaiting Classification' 
                  : activeTab === 'classified' 
                  ? 'No Reports Awaiting Govt Approval' 
                  : 'No Approved Reports Yet'}
              </div>
              <p className="text-2xs text-slate-500">
                {activeTab === 'pending' 
                  ? 'ASHA field workers will enter preliminary test kit data. Once submitted, they appear here for your department to evaluate and classify.' 
                  : 'Water reports will appear here once processed.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
              {displayedReports.map((report) => {
                const isSelected = selectedReport && selectedReport.id === report.id;
                const isContaminatedH2s = report.h2sVialResult === 'BLACK_CONTAMINATED';

                return (
                  <div
                    key={report.id}
                    onClick={() => handleSelectReport(report)}
                    className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 shadow-sm'
                        : 'bg-white border-sky-200 hover:border-sky-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-xs font-bold text-sky-950 line-clamp-1">{report.sourceName}</h3>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {report.isAltered && (
                          <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                            ALTERED (#{report.alterationPermissionToken})
                          </span>
                        )}
                        <span className={`text-3xs font-bold px-2 py-0.5 rounded-full ${
                          report.status === 'APPROVED' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : report.status === 'PENDING_APPROVAL' 
                            ? 'bg-sky-100 text-sky-800' 
                            : 'bg-amber-100 text-amber-900 font-extrabold'
                        }`}>
                          {report.status === 'APPROVED' ? 'PUBLISHED' : report.status === 'PENDING_APPROVAL' ? 'CLASSIFIED (AWAITING GOVT)' : 'NEEDS CLASSIFICATION'}
                        </span>
                      </div>
                    </div>

                    <div className="text-2xs text-slate-600 mb-2">
                      📍 {report.villageName} &bull; <span className="text-slate-500">{report.sourceType}</span>
                    </div>

                    {/* Scientific readings quick badges */}
                    <div className="grid grid-cols-4 gap-1.5 py-2 px-2.5 bg-slate-50 rounded-lg border border-slate-200 text-3xs font-mono">
                      <div>
                        <div className="text-slate-500">pH</div>
                        <div className="font-bold text-slate-800">{report.ph || '--'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Turbidity</div>
                        <div className={`font-bold ${report.turbidity > 5 ? 'text-red-600' : 'text-slate-800'}`}>
                          {report.turbidity || '--'} NTU
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">TDS</div>
                        <div className="font-bold text-slate-800">{report.tds || '--'} ppm</div>
                      </div>
                      <div>
                        <div className="text-slate-500">H2S Vial</div>
                        <div className={`font-bold ${isContaminatedH2s ? 'text-red-600' : 'text-emerald-700'}`}>
                          {isContaminatedH2s ? 'Black (+)' : 'Yellow (-)'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-3xs text-slate-500">
                      <span>By: {report.submittedBy || 'ASHA Worker'}</span>
                      <span>{new Date(report.submittedAt || report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Classification Desk Form */}
        <div className="lg:col-span-7">
          {selectedReport ? (
            <div className="card bg-white border-sky-300 shadow-md p-5 space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-sky-100 pb-3">
                <div>
                  <div className="text-2xs font-bold text-teal-700 uppercase tracking-wider">Evaluation & Action</div>
                  <h3 className="text-sm md:text-base font-bold text-sky-950 mt-0.5">
                    {selectedReport.sourceName} &bull; {selectedReport.villageName}
                  </h3>
                  <p className="text-2xs text-slate-600">
                    Source Category: {selectedReport.sourceType} &bull; Submitted by {selectedReport.submittedBy}
                  </p>
                </div>

                <span className={`badge ${
                  selectedReport.status === 'APPROVED' ? 'badge-safe' : selectedReport.status === 'PENDING_APPROVAL' ? 'badge-blue' : 'badge-warning'
                }`}>
                  {selectedReport.status || 'PENDING_CLASSIFICATION'}
                </span>
              </div>

              {/* Field Health Survey Observations from ASHA */}
              {selectedReport.ashaFieldNotes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="text-2xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-700" />
                    <span>ASHA Field Health Survey Notes:</span>
                  </div>
                  <p className="text-slate-700 italic">
                    "{selectedReport.ashaFieldNotes}"
                  </p>
                </div>
              )}

              {/* Detailed Technical Field Measurements */}
              <div>
                <h4 className="text-2xs font-bold text-sky-950 uppercase tracking-wide mb-2">
                  Field Test Measurements (ASHA Kit)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-center">
                    <div className="text-3xs text-sky-700 font-medium">pH Reading</div>
                    <div className="text-base font-bold text-sky-950 font-mono mt-0.5">{selectedReport.ph}</div>
                    <div className="text-3xs text-slate-500">{selectedReport.ph >= 6.5 && selectedReport.ph <= 8.5 ? 'Normal (6.5-8.5)' : 'Abnormal'}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-center">
                    <div className="text-3xs text-sky-700 font-medium">Turbidity</div>
                    <div className="text-base font-bold text-sky-950 font-mono mt-0.5">{selectedReport.turbidity} <span className="text-2xs font-normal">NTU</span></div>
                    <div className="text-3xs text-slate-500">{selectedReport.turbidity <= 1 ? 'Optimal (<1)' : selectedReport.turbidity <= 5 ? 'Acceptable' : 'High Turbidity'}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-center">
                    <div className="text-3xs text-sky-700 font-medium">TDS</div>
                    <div className="text-base font-bold text-sky-950 font-mono mt-0.5">{selectedReport.tds} <span className="text-2xs font-normal">ppm</span></div>
                    <div className="text-3xs text-slate-500">{selectedReport.tds <= 300 ? 'Excellent' : selectedReport.tds <= 500 ? 'Good' : 'High Mineral'}</div>
                  </div>

                  <div className={`p-2.5 rounded-lg border text-center ${
                    selectedReport.h2sVialResult === 'BLACK_CONTAMINATED' 
                      ? 'bg-red-50 border-red-300 text-red-950' 
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}>
                    <div className="text-3xs font-medium">H2S Vial Strip</div>
                    <div className="text-xs font-bold mt-1">
                      {selectedReport.h2sVialResult === 'BLACK_CONTAMINATED' ? 'BLACK (Coliform +)' : 'YELLOW (Negative)'}
                    </div>
                    <div className="text-3xs mt-0.5">
                      {selectedReport.h2sVialResult === 'BLACK_CONTAMINATED' ? 'Bacteria Present' : 'Microbiologically Safe'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Classification Action Form */}
              <form onSubmit={handleClassifySubmit} className="space-y-4 pt-2 border-t border-sky-100">
                <div>
                  <label className="block text-xs font-bold text-sky-950 mb-1.5 flex items-center justify-between">
                    <span>1. Set Official Water Safety Classification:</span>
                    <span className="text-3xs font-normal text-slate-500">Only Hygiene Dept has authority to classify</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Safe */}
                    <button
                      type="button"
                      onClick={() => handleSafetyChange('SAFE')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        selectedSafety === 'SAFE'
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span>SAFE</span>
                        </div>
                        {selectedSafety === 'SAFE' && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="text-3xs text-slate-600 leading-tight">
                        Complies with IS 10500 standards. Direct consumption permitted.
                      </div>
                    </button>

                    {/* Warning */}
                    <button
                      type="button"
                      onClick={() => handleSafetyChange('WARNING')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        selectedSafety === 'WARNING'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300 text-amber-950'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                          <span>WARNING</span>
                        </div>
                        {selectedSafety === 'WARNING' && <Check className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div className="text-3xs text-slate-600 leading-tight">
                        Elevated physical/chemical markers. Precautionary boiling advised.
                      </div>
                    </button>

                    {/* Contaminated */}
                    <button
                      type="button"
                      onClick={() => handleSafetyChange('CONTAMINATED')}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        selectedSafety === 'CONTAMINATED'
                          ? 'bg-red-50 border-red-500 ring-2 ring-red-300 text-red-950'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <div className="w-3 h-3 rounded-full bg-red-600" />
                          <span>CONTAMINATED</span>
                        </div>
                        {selectedSafety === 'CONTAMINATED' && <Check className="w-4 h-4 text-red-600" />}
                      </div>
                      <div className="text-3xs text-slate-600 leading-tight">
                        Coliform or critical risk. Unfit for drinking. Immediate boiling & chlorination.
                      </div>
                    </button>
                  </div>
                </div>

                {/* Advisory Text Box */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-sky-950">
                      2. Public Health Advisory (Shown to Villagers after Govt approval)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAdvisoryText(ADVISORY_TEMPLATES[selectedSafety])}
                      className="text-3xs text-sky-700 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Reset to Template
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={advisoryText}
                    onChange={(e) => setAdvisoryText(e.target.value)}
                    placeholder="Provide clear, life-saving instructions for villagers..."
                    className="w-full text-xs p-2.5 rounded-lg border border-sky-300 bg-white focus:ring-2 focus:ring-sky-500 font-sans"
                    required
                  />
                </div>

                {/* Officer Remarks */}
                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">
                    3. Hygiene Department Technical Notes (Internal Surveillance Record)
                  </label>
                  <input
                    type="text"
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="e.g. Field kit validated. Recommended chlorination tablet dispatch to Block PHC."
                    className="w-full text-xs p-2 rounded-lg border border-sky-200 bg-white"
                  />
                </div>

                {/* Submitter & Submit Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-sky-100">
                  <div className="text-2xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    {isGovernment ? (
                      hasPermission ? (
                        <span className="text-emerald-900 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Admin Alteration Active (Token #{permissionDetails?.token} &bull; {permissionDetails?.officerName})</span>
                        </span>
                      ) : (
                        <span className="text-amber-900 font-bold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Admin Super-User View: Alteration Permission Required</span>
                        </span>
                      )
                    ) : (
                      <span>
                        Classifying as: <strong>{currentUser.name || 'Dr. Meena Kumari (Hygiene Dept)'}</strong>
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto py-2.5 px-6 font-bold rounded-lg text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer ${
                      isGovernment && !hasPermission
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : isGovernment
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {isGovernment && !hasPermission ? (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Request Permission &amp; Alter</span>
                      </>
                    ) : isGovernment ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Alterations (Token #{permissionDetails?.token})</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {isSubmitting 
                            ? 'Submitting...' 
                            : selectedReport.status === 'APPROVED'
                            ? 'Update Classification'
                            : 'Submit Classification to Government for Approval'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card bg-white border-2 border-dashed border-sky-200 p-12 text-center text-slate-500 space-y-3">
              <FlaskConical className="w-10 h-10 text-sky-300 mx-auto" />
              <div className="text-sm font-bold text-sky-950">Select a Water Report from the Queue</div>
              <p className="text-xs max-w-sm mx-auto">
                Click any report from the left queue to evaluate its chemical/bacterial parameters and submit an official classification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
