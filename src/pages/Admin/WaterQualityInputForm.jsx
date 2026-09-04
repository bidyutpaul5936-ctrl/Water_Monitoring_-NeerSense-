import React, { useState } from 'react';
import { Droplets, CheckCircle2, AlertTriangle, AlertOctagon, Send, Info } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { api } from '../../services/api';

export default function WaterQualityInputForm({ onSuccess }) {
  const { villages, refreshData } = useAlertNotification();

  const [villageId, setVillageId] = useState('vil-01');
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState('Tube Well / Handpump');
  const [ph, setPh] = useState('7.2');
  const [turbidity, setTurbidity] = useState('1.8');
  const [tds, setTds] = useState('220');
  const [bacterialCfu, setBacterialCfu] = useState('0');
  const [safetyStatus, setSafetyStatus] = useState('SAFE');
  const [advisory, setAdvisory] = useState('');
  const [testedBy, setTestedBy] = useState('District Water Quality Testing Lab (Admin)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVillage = villages.find(v => v.id === villageId) || villages[0] || {};

  const handleStatusChange = (newStatus) => {
    setSafetyStatus(newStatus);
    if (newStatus === 'SAFE') {
      setBacterialCfu('0');
      setTurbidity('1.5');
      setAdvisory('Water quality is within permissible limits (BIS IS 10500:2012). Safe for direct drinking.');
    } else if (newStatus === 'WARNING') {
      setBacterialCfu('25');
      setTurbidity('6.5');
      setAdvisory('Moderate silt and bacterial traces detected. Disinfect with chlorine tablets or boil before drinking.');
    } else if (newStatus === 'CONTAMINATED') {
      setBacterialCfu('180');
      setTurbidity('24.0');
      setAdvisory('CRITICAL CONTAMINATION: High fecal coliform bacteria detected. Boil for 10 min. Emergency chlorination dispatched.');
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!sourceName) {
      alert('Please enter a water source name (e.g. "Primary School Handpump #2").');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        villageId,
        villageName: selectedVillage.name || 'Majuli Char',
        sourceName,
        sourceType,
        ph: Number(ph),
        turbidity: Number(turbidity),
        tds: Number(tds),
        bacterialCfu: Number(bacterialCfu),
        safetyStatus,
        advisory: advisory || (safetyStatus === 'SAFE' ? 'Safe to drink.' : 'Boil before drinking.'),
        testedBy: testedBy || 'District Water Lab',
        submittedBy: testedBy || 'District Water Quality Testing Lab (Central)',
        submissionRole: 'GOVERNMENT_DIRECT',
        directApprove: true, // Directly approved — Government Central Lab entry bypasses verification queue
      };

      await api.createWaterReport(payload);
      onSuccess && onSuccess(`Official water report for "${sourceName}" published successfully!`);

      // Reset form
      setSourceName('');
      setPh('7.2');
      setTurbidity('1.8');
      setTds('220');
      setBacterialCfu('0');
      setSafetyStatus('SAFE');
      setAdvisory('');
      refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitReport} className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-sky-700" />
          <div>
            <h2 className="text-sm font-bold text-sky-950">Publish New Official Water Quality Test Report</h2>
            <p className="text-2xs text-sky-700">Test data entered here will immediately appear on the Villagers Portal and ASHA Portal</p>
          </div>
        </div>
        <span className="text-2xs text-sky-800 font-semibold bg-white border border-sky-200 px-2 py-1 rounded">
          Jal Shakti Testing Protocol
        </span>
      </div>

      <div className="card-body space-y-5">
        {/* Row 1: Village & Source Name */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Target Village / Region</label>
            <select
              value={villageId}
              onChange={(e) => setVillageId(e.target.value)}
              className="form-select"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.district}, {v.state})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Water Source Name</label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. Kamalabari Community Handpump #2"
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Source Infrastructure Type</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="form-select"
            >
              <option value="Tube Well / Handpump">Tube Well / Mark-II Handpump</option>
              <option value="River Intake">River Intake / Canal Water</option>
              <option value="Ring Well">Ring Well / Dug Well</option>
              <option value="Pond Sand Filter">Pond Sand Filter Unit</option>
              <option value="Natural Spring">Natural Spring / Mountain Stream</option>
              <option value="Piped Water Supply">Piped Water Tap (Jal Jeevan Mission)</option>
              <option value="Community Overhead Tank">Community Overhead Storage Tank</option>
            </select>
          </div>
        </div>

        {/* Row 2: Safety Classification Selection */}
        <div>
          <label className="form-label">Overall Safety Classification</label>
          <div className="grid grid-cols-3 gap-3 mt-1">
            <button
              type="button"
              onClick={() => handleStatusChange('SAFE')}
              className={`p-3 rounded-lg border text-left transition-all ${
                safetyStatus === 'SAFE'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400'
                  : 'bg-white border-sky-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">SAFE FOR DRINKING</span>
              </div>
              <p className="text-2xs text-slate-500 mt-1">Parameters within BIS IS 10500 standards. 0 Coliform.</p>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('WARNING')}
              className={`p-3 rounded-lg border text-left transition-all ${
                safetyStatus === 'WARNING'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400'
                  : 'bg-white border-sky-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">MODERATE WARNING</span>
              </div>
              <p className="text-2xs text-slate-500 mt-1">Elevated turbidity or mild bacterial traces. Filter & boil.</p>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('CONTAMINATED')}
              className={`p-3 rounded-lg border text-left transition-all ${
                safetyStatus === 'CONTAMINATED'
                  ? 'bg-red-50 border-red-500 ring-2 ring-red-400'
                  : 'bg-white border-sky-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-red-900">SEVERE CONTAMINATION</span>
              </div>
              <p className="text-2xs text-slate-500 mt-1">High pathogen surge. Immediate chlorination response required.</p>
            </button>
          </div>
        </div>

        {/* Row 3: Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-3 border-t border-sky-100">
          <div>
            <label className="form-label">pH Level (6.5 – 8.5 Safe)</label>
            <input
              type="number"
              step="0.1"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              className="form-input font-mono"
              required
            />
          </div>

          <div>
            <label className="form-label">Turbidity (&lt; 5 NTU Safe)</label>
            <input
              type="number"
              step="0.1"
              value={turbidity}
              onChange={(e) => setTurbidity(e.target.value)}
              className="form-input font-mono"
              required
            />
          </div>

          <div>
            <label className="form-label">TDS (mg/L / ppm)</label>
            <input
              type="number"
              value={tds}
              onChange={(e) => setTds(e.target.value)}
              className="form-input font-mono"
              required
            />
          </div>

          <div>
            <label className="form-label">Coliform CFU (0 CFU Safe)</label>
            <input
              type="number"
              value={bacterialCfu}
              onChange={(e) => setBacterialCfu(e.target.value)}
              className="form-input font-mono"
              required
            />
          </div>
        </div>

        {/* Row 4: Advisory & Tested By */}
        <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-sky-100">
          <div>
            <label className="form-label">Official Public Health Advisory</label>
            <input
              type="text"
              value={advisory}
              onChange={(e) => setAdvisory(e.target.value)}
              placeholder="e.g. Boil water for 10 minutes. Chlorination tablets distributed by ASHA."
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Testing Lab / Officer Name</label>
            <input
              type="text"
              value={testedBy}
              onChange={(e) => setTestedBy(e.target.value)}
              placeholder="District Water Quality Lab"
              className="form-input"
            />
          </div>
        </div>

        {/* Submission */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-sky-100">
          <p className="text-2xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            This report will be instantly broadcasted to the Villagers Portal & ASHA network.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto btn-primary px-8 py-2.5 text-sm"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Official Water Quality Report'}</span>
          </button>
        </div>

      </div>
    </form>
  );
}
