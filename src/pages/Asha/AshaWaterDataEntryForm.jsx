import React, { useState, useEffect } from 'react';
import { 
  Send, 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  ShieldAlert, 
  Clock,
  Sparkles,
  Info,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useAuthRole } from '../../contexts/AuthRoleContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { api } from '../../services/api';

const VILLAGE_OPTIONS = [
  { id: 'vil-01', name: 'Gosaba Island (Rangabelia)', district: 'South 24 Parganas, West Bengal', defaultSource: 'Pond Sand Filter & Deep Tube Wells' },
  { id: 'vil-02', name: 'Sagar Island (Gangasagar)', district: 'South 24 Parganas, West Bengal', defaultSource: 'Deep Tube Well & Pond Sand Filter' },
  { id: 'vil-03', name: 'Kakdwip (Harwood Point)', district: 'South 24 Parganas, West Bengal', defaultSource: 'Piped Water Supply & Mark-II Tube Wells' },
  { id: 'vil-04', name: 'Basanti (Sonakhali Char)', district: 'South 24 Parganas, West Bengal', defaultSource: 'Pond Sand Filter & Handpumps' },
  { id: 'vil-05', name: 'Khatra (Mukutmanipur Dam)', district: 'Bankura, West Bengal', defaultSource: 'Dam Intake & Deep Bore Wells' },
  { id: 'vil-06', name: 'Jhargram (Belpahari Forest)', district: 'Jhargram, West Bengal', defaultSource: 'Hilly Natural Spring & Ring Wells' },
  { id: 'vil-07', name: 'Digha (Shankarpur Coastal)', district: 'Purba Medinipur, West Bengal', defaultSource: 'Deep Tube Well (Reverse Osmosis Unit)' },
  { id: 'vil-08', name: 'Kaliachak (Sujapur GP)', district: 'Malda, West Bengal', defaultSource: 'Deep Aquifer Tube Wells & Standposts' }
];

export default function AshaWaterDataEntryForm({ onReportSubmitted, prefillData }) {
  const { currentUser } = useAuthRole();
  const { refreshData, setWaterReports } = useAlertNotification() || {};

  const [selectedVillageId, setSelectedVillageId] = useState('vil-01');
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState('Tube Well / Handpump');
  
  // Chemical & Microbiological Parameters
  const [ph, setPh] = useState('');
  const [turbidity, setTurbidity] = useState('');
  const [tds, setTds] = useState('');
  const [bacterialCfu, setBacterialCfu] = useState('');
  const [h2sVialResult, setH2sVialResult] = useState('YELLOW_SAFE'); // 'YELLOW_SAFE' or 'BLACK_CONTAMINATED'
  
  // Health observations from the community
  const [ashaFieldNotes, setAshaFieldNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState(null);
  const [formError, setFormError] = useState('');

  const selectedVillage = VILLAGE_OPTIONS.find(v => v.id === selectedVillageId) || VILLAGE_OPTIONS[0];

  // When government requests a re-test, pre-fill the form with the rejected report's data
  useEffect(() => {
    if (!prefillData) return;
    const matchedVillage = VILLAGE_OPTIONS.find(v => v.name === prefillData.villageName);
    if (matchedVillage) setSelectedVillageId(matchedVillage.id);
    setSourceName(prefillData.sourceName || '');
    setSourceType(prefillData.sourceType || 'Tube Well / Handpump');
    setPh(prefillData.ph ?? '');
    setTurbidity(prefillData.turbidity ?? '');
    setTds(prefillData.tds ?? '');
    setBacterialCfu(prefillData.bacterialCfu ?? '');
    setH2sVialResult(prefillData.h2sVialResult || 'YELLOW_SAFE');
    setAshaFieldNotes(prefillData.ashaFieldNotes || '');
    setSubmitSuccess(false);
    setFormError('');
  }, [prefillData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!sourceName.trim()) {
      setFormError('Please enter the name of the water source tested.');
      return;
    }
    if (!ph || !turbidity) {
      setFormError('Please enter measured pH and Turbidity values before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const payload = {
        villageId: selectedVillage.id,
        villageName: selectedVillage.name,
        sourceName: sourceName.trim(),
        sourceType,
        ph: parseFloat(ph),
        turbidity: parseFloat(turbidity),
        tds: parseFloat(tds) || 0,
        bacterialCfu: parseInt(bacterialCfu) || 0,
        h2sVialResult,
        ashaId: currentUser.id || 'ASHA-071',
        ashaName: currentUser.name || 'Kuni Majhi (ASHA-071)',
        submittedBy: currentUser.name || 'Kuni Majhi (ASHA-071)',
        submissionRole: 'ASHA',
        ashaFieldNotes: ashaFieldNotes || 'Field inspection completed by ASHA worker.',
        status: 'PENDING_CLASSIFICATION', // Awaiting Hygiene Dept classification
        isApproved: false
      };

      const res = await api.createWaterReport(payload);
      if (res?.report) {
        if (setWaterReports) {
          setWaterReports(prev => [res.report, ...prev.filter(r => r.id !== res.report.id)]);
        }
        refreshData && refreshData();
      }

      setSubmittedReportId(res.report?.id || 'new');
      setSubmitSuccess(true);
      
      // Reset form fields after successful submission
      setSourceName('');
      setPh('');
      setTurbidity('');
      setTds('');
      setBacterialCfu('');
      setAshaFieldNotes('');
      onReportSubmitted && onReportSubmitted(res.report);
    } catch (err) {
      console.error('Failed to submit ASHA water test report', err);
      setFormError('Submission failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-white border-sky-300 shadow-sm p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-sky-950">ASHA Water Quality Field Test Entry</h2>
            <p className="text-2xs text-sky-700">Enter field measurements for Government Verification & Public Approval</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-2xs text-amber-800 font-medium">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Stage 1 of 4: ASHA Field Data Entry</span>
        </div>
      </div>

      {/* Re-Test Mode Banner */}
      {prefillData && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border-2 border-orange-300 animate-in fade-in">
          <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-orange-900">🔁 Re-Test Requested by Government (CDMO)</p>
            <p className="text-2xs text-orange-800 mt-0.5 leading-relaxed">
              The previous report for <strong>{prefillData.sourceName}</strong> was rejected. The form has been pre-filled with the original data.
              Please conduct a fresh field test, update the readings accordingly, and resubmit.
            </p>
            {prefillData.rejectionReason && (
              <p className="text-2xs text-red-800 mt-1 font-semibold">
                Rejection reason: &quot;{prefillData.rejectionReason}&quot;
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4-Stage Workflow Stepper */}
      <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl space-y-2">
        <div className="text-3xs font-bold text-sky-900 uppercase tracking-wider">Official 4-Stage Report Publishing Pipeline:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-3xs font-semibold">
          <div className="p-2 rounded-lg bg-sky-600 text-white flex items-center gap-1.5 shadow-sm">
            <span className="w-4 h-4 rounded-full bg-white text-sky-900 flex items-center justify-center font-bold text-3xs shrink-0">1</span>
            <div>
              <div className="font-bold leading-tight">ASHA Field Entry</div>
              <div className="text-sky-100 text-4xs">Active Stage</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-white border border-sky-200 text-sky-900 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-3xs shrink-0">2</span>
            <div>
              <div className="font-bold leading-tight">Health / Hygiene Dept</div>
              <div className="text-slate-500 text-4xs">Safety Classification</div>
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

      {/* Inline Form Error Banner */}
      {formError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 animate-in fade-in">
          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-800">{formError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFormError('')}
            className="text-red-400 hover:text-red-600 transition flex-shrink-0"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success Banner */}
      {submitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Water Test Report Successfully Submitted to Hygiene Dept!</span>
          </div>
          <p className="text-2xs text-emerald-800 leading-relaxed">
            Report Reference: <strong>#{submittedReportId}</strong> &bull; Status: <span className="font-bold text-amber-700">🟡 PENDING CLASSIFICATION</span>.
            The Hygiene Department will review these readings, classify safety, and forward it to the District Health Authority for final approval.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Village and Source selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-2xs font-bold text-sky-900 mb-1">Monitored Village</label>
            <select
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-sky-300 bg-white font-medium focus:ring-2 focus:ring-sky-500"
            >
              {VILLAGE_OPTIONS.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.district})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-2xs font-bold text-sky-900 mb-1">Water Source Name</label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              required
              placeholder="e.g. Community Handpump #1"
              className="w-full text-xs p-2 rounded-lg border border-sky-300 bg-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-sky-900 mb-1">Source Type</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-sky-300 bg-white font-medium focus:ring-2 focus:ring-sky-500"
            >
              <option value="Tube Well / Handpump">Tube Well / Handpump (Mark-II)</option>
              <option value="River / Stream Intake">River / Stream Intake</option>
              <option value="Ring Well / Dug Well">Ring Well / Dug Well</option>
              <option value="Pond Sand Filter (PSF)">Pond Sand Filter (PSF)</option>
              <option value="Piped Standpost">Piped Jal Jeevan Standpost</option>
            </select>
          </div>
        </div>

        {/* Physical & Chemical Testing Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-sky-50/60 rounded-xl border border-sky-200">
          <div>
            <label className="block text-2xs font-bold text-sky-950 mb-0.5">
              pH Level <span className="text-slate-400 font-normal">(6.5 - 8.5)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              required
              placeholder="e.g. 7.2"
              className="w-full text-xs p-2 rounded border border-sky-300 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-sky-950 mb-0.5">
              Turbidity <span className="text-slate-400 font-normal">(NTU &lt; 5.0)</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={turbidity}
              onChange={(e) => setTurbidity(e.target.value)}
              required
              placeholder="e.g. 2.1"
              className="w-full text-xs p-2 rounded border border-sky-300 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-sky-950 mb-0.5">
              TDS <span className="text-slate-400 font-normal">(mg/L &lt; 500)</span>
            </label>
            <input
              type="number"
              value={tds}
              onChange={(e) => setTds(e.target.value)}
              placeholder="e.g. 220"
              className="w-full text-xs p-2 rounded border border-sky-300 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-sky-950 mb-0.5">
              Bacterial Count <span className="text-slate-400 font-normal">(CFU/100ml)</span>
            </label>
            <input
              type="number"
              value={bacterialCfu}
              onChange={(e) => setBacterialCfu(e.target.value)}
              placeholder="e.g. 0"
              className="w-full text-xs p-2 rounded border border-sky-300 bg-white font-mono"
            />
          </div>
        </div>

        {/* H2S Rapid Bacterial Vial Test + Calculated Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-xl border border-sky-200">
            <label className="block text-2xs font-bold text-sky-950 mb-1 flex items-center justify-between">
              <span>H2S Strip / Vial Color (Rapid Bacterial Test)</span>
              <span className={`badge ${h2sVialResult === 'BLACK_CONTAMINATED' ? 'badge-danger' : 'badge-safe'} text-3xs`}>
                {h2sVialResult === 'BLACK_CONTAMINATED' ? 'Coliform / H2S Positive' : 'Negative (Safe)'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setH2sVialResult('YELLOW_SAFE')}
                className={`p-2 rounded-lg border text-left text-xs transition flex items-center gap-2 ${
                  h2sVialResult === 'YELLOW_SAFE'
                    ? 'bg-amber-100/70 border-amber-400 font-bold text-amber-950 ring-2 ring-amber-300'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-amber-300 border border-amber-500 flex-shrink-0" />
                <div>
                  <div className="text-2xs font-bold">Yellow (Safe)</div>
                  <div className="text-3xs text-slate-500">No H2S bacteria</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setH2sVialResult('BLACK_CONTAMINATED')}
                className={`p-2 rounded-lg border text-left text-xs transition flex items-center gap-2 ${
                  h2sVialResult === 'BLACK_CONTAMINATED'
                    ? 'bg-slate-900 border-slate-950 font-bold text-white ring-2 ring-red-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex-shrink-0" />
                <div>
                  <div className="text-2xs font-bold">Black (Contaminated)</div>
                  <div className="text-3xs text-slate-300">Fecal coliform present</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Field Notes */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-2xs font-bold text-sky-900 mb-1">
              Field Health Survey Observations
            </label>
            <textarea
              rows={2}
              value={ashaFieldNotes}
              onChange={(e) => setAshaFieldNotes(e.target.value)}
              placeholder="e.g. 4 children reported acute watery diarrhea. Water source has brownish color after rain."
              className="w-full text-xs p-2 rounded-lg border border-sky-300 bg-white focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Submitter & Government Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-sky-100">
          <div className="text-2xs text-slate-600 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
            <span>Submitting as: <strong>{currentUser.name || 'Kuni Majhi (ASHA-071)'}</strong> &bull; Community Health Center</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto py-2 px-5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition shadow flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit to Hygiene Dept for Classification'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
