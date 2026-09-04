import React, { useState } from 'react';
import { FileText, Check, Info, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthRole } from '../../contexts/AuthRoleContext';
import { useOfflineSync } from '../../contexts/OfflineSyncContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { speechService } from '../../services/speechService';
import VoiceSymptomRecorder from './VoiceSymptomRecorder';
import { WEST_BENGAL_VILLAGES } from '../../utils/westBengalVillages';

const SYMPTOMS = [
  { id: 'diarrhea',    label: 'Diarrhea / Loose Motion', icon: '💧', labelKey: 'symptoms.diarrhea' },
  { id: 'vomiting',   label: 'Vomiting / Nausea',        icon: '🤢', labelKey: 'symptoms.vomiting' },
  { id: 'fever',      label: 'Fever / High Temperature', icon: '🌡️', labelKey: 'symptoms.fever' },
  { id: 'stomachPain',label: 'Stomach / Abdomen Pain',   icon: '⚡', labelKey: 'symptoms.stomachPain' },
  { id: 'jaundice',   label: 'Yellow Skin / Jaundice',   icon: '👁️', labelKey: 'symptoms.jaundice' },
  { id: 'bloodStool', label: 'Blood in Stool / Urine',   icon: '🔴', labelKey: 'symptoms.bloodStool' },
  { id: 'weakness',   label: 'Weakness / Dehydration',   icon: '🛌', labelKey: 'symptoms.weakness' },
];

export default function HealthConditionForm({ onSymptomsChange }) {
  const { t, lang } = useLanguage();
  const { currentUser } = useAuthRole();
  const { queueSymptomReport } = useOfflineSync();
  const { villages } = useAlertNotification();

  const [selectedVillageId, setSelectedVillageId] = useState(currentUser.villageId || 'vil-wb-01');
  const [patientName, setPatientName]             = useState('');
  const [age, setAge]                             = useState('');
  const [gender, setGender]                       = useState('Male');
  const [selectedSymptoms, setSelectedSymptoms]   = useState([]);
  const [waterSource, setWaterSource]             = useState('Community Handpump #1');
  const [isRecording, setIsRecording]             = useState(false);
  const [voiceTranscript, setVoiceTranscript]     = useState('');
  const [submitting, setSubmitting]               = useState(false);
  const [submitSuccess, setSubmitSuccess]         = useState(null);

  React.useEffect(() => {
    if (onSymptomsChange) {
      onSymptomsChange(selectedSymptoms);
    }
  }, [selectedSymptoms, onSymptomsChange]);

  const activeVillage = villages.find(v => v.id === selectedVillageId) 
    || WEST_BENGAL_VILLAGES.find(v => v.id === selectedVillageId) 
    || villages[0] 
    || {};

  const handleAutofillWbVillage = (wbVillage) => {
    setSelectedVillageId(wbVillage.id);
    if (wbVillage.defaultSource) {
      setWaterSource(wbVillage.defaultSource);
    }
  };

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      speechService.stopSpeaking();
      setIsRecording(false);
    } else {
      if (!speechService.isRecognitionSupported()) {
        alert('Voice recognition is not supported on this browser. Please select symptoms by tapping the icons below.');
        return;
      }
      setIsRecording(true);
      const recognizer = speechService.createRecognizer(
        lang,
        (text) => {
          setVoiceTranscript(text);
          const lower = text.toLowerCase();
          if (lower.includes('दस्त') || lower.includes('diarrhea') || lower.includes('পাতলা')) {
            setSelectedSymptoms(prev => prev.includes('diarrhea') ? prev : [...prev, 'diarrhea']);
          }
          if (lower.includes('उल्टी') || lower.includes('vomit') || lower.includes('বমি')) {
            setSelectedSymptoms(prev => prev.includes('vomiting') ? prev : [...prev, 'vomiting']);
          }
          if (lower.includes('बुखार') || lower.includes('fever') || lower.includes('জ্বর')) {
            setSelectedSymptoms(prev => prev.includes('fever') ? prev : [...prev, 'fever']);
          }
          if (lower.includes('पेट') || lower.includes('stomach') || lower.includes('পেট')) {
            setSelectedSymptoms(prev => prev.includes('stomachPain') ? prev : [...prev, 'stomachPain']);
          }
        },
        () => setIsRecording(false),
        () => setIsRecording(false)
      );
      if (recognizer) recognizer.start();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0 && !voiceTranscript) {
      alert('Please select at least one symptom or speak your condition.');
      return;
    }
    setSubmitting(true);
    const symptomLabels = selectedSymptoms.map(s => t(`symptoms.${s}`));
    if (voiceTranscript) symptomLabels.push(`Voice: "${voiceTranscript}"`);

    const payload = {
      villageId:        selectedVillageId,
      villageName:      activeVillage.name || 'Gosaba Island (Rangabelia)',
      patientName:      patientName || 'Villager Report',
      age:              age ? Number(age) : 30,
      gender,
      symptoms:         symptomLabels,
      suspectedDisease: selectedSymptoms.includes('diarrhea') && selectedSymptoms.includes('vomiting')
                          ? 'Suspected Acute Gastroenteritis' : 'Water-Borne Illness',
      severity:         selectedSymptoms.length >= 3 || selectedSymptoms.includes('bloodStool')
                          ? 'CRITICAL' : selectedSymptoms.length >= 2 ? 'SEVERE' : 'MODERATE',
      waterSourceUsed:  waterSource,
      reportedVia:      isRecording || voiceTranscript ? 'VOICE_APP' : 'WEB_APP',
      reportedBy:       currentUser.name || 'Villager Direct',
      timestamp:        new Date().toISOString(),
    };

    const result = await queueSymptomReport(payload);
    setSubmitting(false);
    setSubmitSuccess(result.mode);
    const confirmText = lang === 'hi'
      ? 'आपकी स्वास्थ्य रिपोर्ट दर्ज कर ली गई है। आशा कार्यकर्ता को सूचित कर दिया गया है। पानी उबालकर पिएं।'
      : 'Health report recorded. The local ASHA worker has been notified. Drink clean boiled water with ORS.';
    speechService.speak(confirmText, lang);

    setTimeout(() => {
      setSelectedSymptoms([]);
      setVoiceTranscript('');
      setPatientName('');
      setAge('');
      setSubmitSuccess(null);
    }, 4500);
  };

  return (
    <div className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-700" />
          <div>
            <h2 className="text-sm font-bold text-sky-950">Enter Your Health Condition / Symptoms</h2>
            <p className="text-2xs text-sky-700">Self-report symptoms for yourself or family members to alert your local ASHA worker</p>
          </div>
        </div>
        {selectedSymptoms.length > 0 && (
          <span className="badge badge-blue">{selectedSymptoms.length} Symptoms Selected</span>
        )}
      </div>

      <div className="card-body space-y-6">
        
        {/* Voice Input Section */}
        <VoiceSymptomRecorder
          isRecording={isRecording}
          voiceTranscript={voiceTranscript}
          onVoiceToggle={handleVoiceToggle}
          onClearTranscript={() => setVoiceTranscript('')}
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Symptom Touch Buttons */}
          <div>
            <label className="form-label">
              Tap all symptoms that apply to you or your family member:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1.5">
              {SYMPTOMS.map((sym) => {
                const sel = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      sel
                        ? 'bg-sky-100 border-sky-500 ring-2 ring-sky-400'
                        : 'bg-white border-sky-200 hover:border-sky-300 hover:bg-sky-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{sym.icon}</span>
                      {sel && <Check className="w-4 h-4 text-sky-700 font-bold" />}
                    </div>
                    <div className="text-xs font-bold text-sky-950 mt-1.5 leading-tight">
                      {t(sym.labelKey) || sym.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Details & West Bengal Village Autofill */}
          <div className="pt-4 border-t border-sky-100 space-y-3">
            {/* Quick West Bengal Village Autofill Toolbar */}
            <div className="bg-sky-50/70 p-2.5 rounded-xl border border-sky-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <div className="text-2xs font-bold text-sky-950 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Autofill West Bengal Village (পশ্চিমবঙ্গের গ্রাম নির্বাচন):</span>
                </div>
                <span className="text-3xs text-sky-700 font-medium">Tap any village below to instantly autofill</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {WEST_BENGAL_VILLAGES.slice(0, 8).map((v) => {
                  const isSelected = selectedVillageId === v.id;
                  const shortName = v.name.split('(')[0].trim();
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleAutofillWbVillage(v)}
                      className={`text-3xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                          : 'bg-white text-sky-800 border-sky-200 hover:bg-sky-100 hover:border-sky-300'
                      }`}
                    >
                      📍 {shortName} ({v.district})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3.5">
              <div>
                <label className="form-label">Select Your Village / Gram Panchayat</label>
                <select
                  value={selectedVillageId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedVillageId(val);
                    const wb = WEST_BENGAL_VILLAGES.find(w => w.id === val);
                    if (wb && wb.defaultSource) setWaterSource(wb.defaultSource);
                  }}
                  className="form-select"
                >
                  <optgroup label="West Bengal Gram Panchayats (পশ্চিমবঙ্গ)">
                    {WEST_BENGAL_VILLAGES.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.district}) — {v.nameBn}
                      </option>
                    ))}
                  </optgroup>
                  {villages.filter(v => !v.id.startsWith('vil-wb')).length > 0 && (
                    <optgroup label="Other Monitored National Villages">
                      {villages.filter(v => !v.id.startsWith('vil-wb')).map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.district})</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

            <div>
              <label className="form-label">Patient Name (Optional)</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Age & Gender</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age (e.g. 28)"
                  className="form-input w-1/2"
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="form-select w-1/2"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Child">Child</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
          </div>

          <div>
            <label className="form-label">Primary Water Source Used For Drinking</label>
            <select
              value={waterSource}
              onChange={(e) => setWaterSource(e.target.value)}
              className="form-select"
            >
              <option value="Community Handpump #1">Community Handpump / Tube Well</option>
              <option value="Kamalabari River Intake Point">River Intake / Open Water</option>
              <option value="Village Ring Well / Dug Well">Village Ring Well / Dug Well</option>
              <option value="Pond Sand Filter Unit">Pond Sand Filter Unit</option>
              <option value="Natural Spring / Hilly Stream">Natural Spring / Stream</option>
              <option value="Piped Water Tap Supply">Piped Water Tap Supply (Jal Jeevan Mission)</option>
            </select>
          </div>

          {/* Submission Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-sky-100">
            <p className="text-2xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              Works 100% offline. Saved locally if you are away from mobile coverage.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto btn-primary px-7 py-2.5 text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Transmitting...' : 'Submit Health Condition'}</span>
            </button>
          </div>

          {/* Success Notification */}
          {submitSuccess && (
            <div className="alert-success animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-emerald-950">
                  Health Report Registered Successfully!
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Your condition report has been routed to ASHA health worker <strong>{activeVillage.ashaWorker || 'Assigned ASHA'}</strong>.
                  Start taking boiled water with ORS immediately.
                </p>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
