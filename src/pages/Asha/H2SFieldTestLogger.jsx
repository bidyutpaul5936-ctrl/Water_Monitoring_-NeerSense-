import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useAuthRole } from '../../contexts/AuthRoleContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { api } from '../../services/api';

export default function H2SFieldTestLogger() {
  const { currentUser } = useAuthRole();
  const { villages, refreshData } = useAlertNotification();

  const [sourceName, setSourceName] = useState('');
  const [villageId, setVillageId] = useState(currentUser.villageId || 'vil-01');
  const [h2sResult, setH2sResult] = useState('YELLOW_NEGATIVE');
  const [phStrip, setPhStrip] = useState('7.0');
  const [freeChlorine, setFreeChlorine] = useState('0.2');
  const [turbidityObs, setTurbidityObs] = useState('CLEAR');
  const [notes, setNotes] = useState('');
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [testSuccessToast, setTestSuccessToast] = useState(false);

  const handleFieldTestSubmit = async (e) => {
    e.preventDefault();
    if (!sourceName) {
      alert('Please enter a source name (e.g. Village Tube Well #3).');
      return;
    }

    setIsSubmittingTest(true);
    const payload = {
      villageId,
      ashaId: currentUser.id || 'ASHA-042',
      ashaName: currentUser.name || 'Anima Saikia (ASHA)',
      sourceName,
      sourceType: 'Community Source',
      h2sVialResult: h2sResult,
      phStripValue: Number(phStrip),
      freeChlorinePpm: Number(freeChlorine),
      turbidityObservation: turbidityObs,
      notes,
      timestamp: new Date().toISOString()
    };

    try {
      await api.submitManualTest(payload);
      setTestSuccessToast(true);
      setSourceName('');
      setNotes('');
      refreshData();
      setTimeout(() => setTestSuccessToast(false), 4000);
    } catch (err) {
      console.error('Test error', err);
    } finally {
      setIsSubmittingTest(false);
    }
  };

  return (
    <form onSubmit={handleFieldTestSubmit} className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div>
          <h2 className="text-sm font-bold text-sky-950">Record Rapid H2S Microbial Water Test</h2>
          <p className="text-2xs text-sky-700">Hydrogen Sulfide (H2S) paper strip vial test detects fecal coliform contamination within 24-48 hours</p>
        </div>
        <span className="badge badge-safe">ICMR / Jal Jeevan Standard</span>
      </div>

      <div className="card-body space-y-5">
        {testSuccessToast && (
          <div className="alert-success">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-semibold">Field water test recorded and synced with District Health grid!</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Water Source Name & Location</label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. Kamalabari Primary School Handpump"
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Village / Sub-Center</label>
            <select
              value={villageId}
              onChange={(e) => setVillageId(e.target.value)}
              className="form-select"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.district})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">H2S Bacterial Vial Result</label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setH2sResult('YELLOW_NEGATIVE')}
              className={`p-3 rounded-lg border text-left transition-all ${
                h2sResult === 'YELLOW_NEGATIVE'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400'
                  : 'bg-white border-sky-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-400 border border-amber-600 flex-shrink-0" />
                <span className="text-xs font-bold text-emerald-950">YELLOW / NO COLOR CHANGE (Negative)</span>
              </div>
              <p className="text-2xs text-slate-500 mt-1">No coliform bacteria detected. Water is bacteriologically safe.</p>
            </button>

            <button
              type="button"
              onClick={() => setH2sResult('BLACK_POSITIVE')}
              className={`p-3 rounded-lg border text-left transition-all ${
                h2sResult === 'BLACK_POSITIVE'
                  ? 'bg-red-50 border-red-500 ring-2 ring-red-400'
                  : 'bg-white border-sky-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-950 border border-black flex-shrink-0" />
                <span className="text-xs font-bold text-red-950">BLACK COLORATION (Positive Contamination)</span>
              </div>
              <p className="text-2xs text-slate-500 mt-1">Fecal coliform detected! Advise villagers to boil and use chlorine.</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5 pt-2 border-t border-sky-100">
          <div>
            <label className="form-label">pH Strip Value</label>
            <input
              type="number"
              step="0.1"
              value={phStrip}
              onChange={(e) => setPhStrip(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div>
            <label className="form-label">Free Chlorine (PPM)</label>
            <input
              type="number"
              step="0.1"
              value={freeChlorine}
              onChange={(e) => setFreeChlorine(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div>
            <label className="form-label">Visual Turbidity</label>
            <select
              value={turbidityObs}
              onChange={(e) => setTurbidityObs(e.target.value)}
              className="form-select"
            >
              <option value="CLEAR">Clear & Transparent</option>
              <option value="SLIGHTLY_HAZY">Slightly Hazy</option>
              <option value="CLOUDY_SILTY">Cloudy / Muddy Silt</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Field Observation Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Water logging observed near well apron; advised boiling."
            className="form-input"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmittingTest}
            className="btn-primary px-6 py-2.5 text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmittingTest ? 'Saving...' : 'Submit Field Water Test'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
