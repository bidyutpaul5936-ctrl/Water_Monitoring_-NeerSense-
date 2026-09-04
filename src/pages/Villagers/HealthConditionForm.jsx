import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Check, 
  Info, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Navigation, 
  Search, 
  Sparkles, 
  X, 
  ChevronDown, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
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

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function HealthConditionForm({ onSymptomsChange }) {
  const { t, lang } = useLanguage();
  const { currentUser } = useAuthRole();
  const { queueSymptomReport } = useOfflineSync();
  const { villages } = useAlertNotification();

  // Combine West Bengal villages and national state villages into unified master list
  const allVillages = React.useMemo(() => {
    const list = [...WEST_BENGAL_VILLAGES];
    villages.forEach(v => {
      if (!list.some(item => item.id === v.id || item.name.toLowerCase() === v.name.toLowerCase())) {
        list.push({
          id: v.id,
          name: v.name,
          district: v.district,
          state: v.state,
          coordinates: v.coordinates,
          defaultSource: v.primarySource || 'Community Tube Well'
        });
      }
    });
    return list;
  }, [villages]);

  const initialVillage = allVillages.find(v => v.id === currentUser.villageId) || allVillages[0];

  const [selectedVillageId, setSelectedVillageId] = useState(initialVillage?.id || 'vil-wb-01');
  const [villageInput, setVillageInput]           = useState(initialVillage?.name || 'Gosaba Island (Rangabelia)');
  const [showDropdown, setShowDropdown]           = useState(false);
  const [showDirectory, setShowDirectory]         = useState(false);
  const [isLocating, setIsLocating]               = useState(false);
  const [locationFeedback, setLocationFeedback]   = useState(null);

  const [patientName, setPatientName]             = useState('');
  const [age, setAge]                             = useState('');
  const [gender, setGender]                       = useState('Male');
  const [selectedSymptoms, setSelectedSymptoms]   = useState([]);
  const [waterSource, setWaterSource]             = useState(initialVillage?.defaultSource || 'Pond Sand Filter Unit');
  const [isRecording, setIsRecording]             = useState(false);
  const [voiceTranscript, setVoiceTranscript]     = useState('');
  const [submitting, setSubmitting]               = useState(false);
  const [submitSuccess, setSubmitSuccess]         = useState(null);

  const dropdownRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (onSymptomsChange) {
      onSymptomsChange(selectedSymptoms);
    }
  }, [selectedSymptoms, onSymptomsChange]);

  const activeVillage = allVillages.find(v => v.id === selectedVillageId) 
    || allVillages.find(v => v.name.toLowerCase() === villageInput.toLowerCase()) 
    || initialVillage;

  // Filter village options based on typed search
  const filteredSuggestions = villageInput.trim()
    ? allVillages.filter(v =>
        v.name.toLowerCase().includes(villageInput.trim().toLowerCase()) ||
        (v.nameBn && v.nameBn.includes(villageInput.trim())) ||
        (v.district && v.district.toLowerCase().includes(villageInput.trim().toLowerCase()))
      )
    : allVillages;

  // Autofill village selection handler
  const handleAutofillVillage = (villageObj, sourceLabel = 'Autofilled') => {
    setSelectedVillageId(villageObj.id);
    setVillageInput(villageObj.name);
    setShowDropdown(false);
    setShowDirectory(false);
    if (villageObj.defaultSource || villageObj.primarySource) {
      setWaterSource(villageObj.defaultSource || villageObj.primarySource);
    }
    setLocationFeedback({
      type: 'success',
      text: `${sourceLabel}: ${villageObj.name} (${villageObj.district || 'Rural West Bengal'})`
    });
  };

  // GPS Nearest Village Detection Autofill
  const handleDetectNearestVillageGps = () => {
    if (!navigator.geolocation) {
      setLocationFeedback({
        type: 'error',
        text: 'Geolocation is not supported on this browser. You can type or click any village below.'
      });
      return;
    }

    setIsLocating(true);
    setLocationFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let nearestVillage = null;
        let lowestDist = Infinity;

        allVillages.forEach((v) => {
          if (v.coordinates && v.coordinates.length === 2) {
            const dist = getDistanceKm(latitude, longitude, v.coordinates[0], v.coordinates[1]);
            if (dist < lowestDist) {
              lowestDist = dist;
              nearestVillage = v;
            }
          }
        });

        setIsLocating(false);

        if (nearestVillage) {
          handleAutofillVillage(nearestVillage, `GPS Detected Nearest (${lowestDist} km)`);
        } else {
          // Fallback to first village if no coords matched
          handleAutofillVillage(allVillages[0], 'Location Selected');
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationFeedback({
          type: 'error',
          text: 'Location access unavailable. Please select or type your village below.'
        });
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
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
      villageName:      activeVillage.name || villageInput || 'Gosaba Island (Rangabelia)',
      patientName:      patientName.trim() || 'Citizen Self-Report',
      age:              age ? Number(age) : 30,
      gender,
      symptoms:         symptomLabels,
      suspectedDisease: selectedSymptoms.includes('diarrhea') && selectedSymptoms.includes('vomiting')
                          ? 'Suspected Acute Gastroenteritis' : 'Water-Borne Illness',
      severity:         selectedSymptoms.length >= 3 || selectedSymptoms.includes('bloodStool')
                          ? 'CRITICAL' : selectedSymptoms.length >= 2 ? 'SEVERE' : 'MODERATE',
      waterSourceUsed:  waterSource,
      reportedVia:      isRecording || voiceTranscript ? 'VOICE_APP' : 'WEB_APP',
      reportedBy:       currentUser.name || patientName.trim() || 'Citizen Direct Report',
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

          {/* ════════════════════════════════════════════════════════════════════════
              VILLAGE ENTERING & AUTOFILL SECTION
              ════════════════════════════════════════════════════════════════════════ */}
          <div className="pt-4 border-t border-sky-100 space-y-3">
            
            {/* Autofill Controls Banner */}
            <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50/70 p-3 rounded-xl border border-sky-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shadow-xs">
                    ⚡
                  </span>
                  <div>
                    <span className="text-xs font-bold text-sky-950">
                      Village Autofill Options (গ্রাম নির্বাচন ও স্বয়ংক্রিয় পূরণ):
                    </span>
                    <span className="text-3xs text-sky-700 ml-1.5 hidden sm:inline">
                      Use GPS or tap any frequent village to autofill instantly
                    </span>
                  </div>
                </div>

                {/* GPS Location Autofill Button */}
                <button
                  type="button"
                  onClick={handleDetectNearestVillageGps}
                  disabled={isLocating}
                  className="btn btn-secondary text-2xs px-3 py-1.5 flex items-center gap-1.5 bg-white hover:bg-sky-50 border-sky-300 text-sky-900 font-bold shadow-xs flex-shrink-0"
                  title="Detect your nearest village using device GPS"
                >
                  {isLocating ? (
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-sky-600" />
                  )}
                  <span>{isLocating ? 'Detecting GPS...' : '📍 Autofill Nearest Village (GPS)'}</span>
                </button>
              </div>

              {/* Location Status Feedback Banner */}
              {locationFeedback && (
                <div className={`p-2 rounded-lg text-2xs font-semibold flex items-center justify-between ${
                  locationFeedback.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {locationFeedback.type === 'error' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    )}
                    <span>{locationFeedback.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationFeedback(null)}
                    className="text-xs hover:opacity-70 ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Quick-Click 1-Tap Autofill Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-3xs font-bold text-sky-900 uppercase tracking-wider mr-1">
                  Popular:
                </span>
                {allVillages.slice(0, 9).map((v) => {
                  const isSelected = selectedVillageId === v.id;
                  const shortName = v.name.split('(')[0].trim();
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleAutofillVillage(v, 'Quick Autofill')}
                      className={`text-3xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                          : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-100 hover:border-sky-300'
                      }`}
                    >
                      📍 {shortName} ({v.district?.split(' ')[0] || 'WB'})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Village Input with Live Suggestions + Patient Fields */}
            <div className="grid sm:grid-cols-3 gap-3.5">
              
              {/* Village Input with Autocomplete Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label mb-0">
                    Enter or Search Your Village *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDirectory(!showDirectory)}
                    className="text-3xs text-sky-700 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>Browse All</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-sky-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={villageInput}
                    onChange={(e) => {
                      setVillageInput(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Type village name (e.g. Gosaba, Sagar, Canning)..."
                    list="village-autofill-options"
                    className="form-input pl-9 pr-8 text-xs font-semibold text-sky-950 w-full"
                    required
                  />
                  {villageInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setVillageInput('');
                        setShowDropdown(true);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      title="Clear village"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* HTML5 Native Datalist for Browser Autofill */}
                <datalist id="village-autofill-options">
                  {allVillages.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.district} {v.nameBn ? `(${v.nameBn})` : ''}
                    </option>
                  ))}
                </datalist>

                {/* Interactive Filtered Suggestions Popup */}
                {showDropdown && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-sky-300 rounded-xl shadow-xl max-h-56 overflow-y-auto z-30 divide-y divide-sky-100 animate-in fade-in">
                    <div className="px-3 py-1.5 bg-sky-50 text-3xs font-bold text-sky-700 flex items-center justify-between">
                      <span>Matching Villages ({filteredSuggestions.length})</span>
                      <span>Click to autofill</span>
                    </div>
                    {filteredSuggestions.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleAutofillVillage(v, 'Autofilled')}
                        className="w-full text-left px-3 py-2 hover:bg-sky-50/80 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-sky-950">
                            {v.name}
                          </div>
                          <div className="text-3xs text-sky-700">
                            {v.district} &bull; {v.nameBn || 'West Bengal'}
                          </div>
                        </div>
                        <span className="text-3xs font-medium text-slate-500 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                          {v.defaultSource?.split('/')[0]?.trim() || 'Tap Water'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Full Directory Dropdown Selector (Optional View) */}
                {showDirectory && (
                  <div className="mt-2 p-2 rounded-xl bg-white border border-sky-300 shadow-sm space-y-1">
                    <label className="text-3xs font-bold text-sky-900 block">Select from Full Directory:</label>
                    <select
                      value={selectedVillageId}
                      onChange={(e) => {
                        const v = allVillages.find(item => item.id === e.target.value);
                        if (v) handleAutofillVillage(v, 'Directory Selected');
                      }}
                      className="form-select text-xs w-full bg-sky-50/40"
                    >
                      <optgroup label="West Bengal Gram Panchayats (পশ্চিমবঙ্গ)">
                        {WEST_BENGAL_VILLAGES.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} &bull; {v.district} ({v.nameBn})
                          </option>
                        ))}
                      </optgroup>
                      {allVillages.filter(v => !v.id.startsWith('vil-wb')).length > 0 && (
                        <optgroup label="National Surveillance Villages">
                          {allVillages.filter(v => !v.id.startsWith('vil-wb')).map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} &bull; {v.district}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                )}

                {/* Autofill Active Status Pill */}
                <div className="mt-1.5 flex items-center gap-1.5 text-3xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">
                    Selected: <strong>{activeVillage?.name}</strong> ({activeVillage?.district})
                  </span>
                </div>
              </div>

              {/* Patient Name Field (Optional, No Default Fake User) */}
              <div>
                <label className="form-label">
                  Patient Name (Optional)
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra (or leave blank)"
                  className="form-input text-xs"
                />
                <span className="text-3xs text-slate-500 mt-1 block">
                  Self-report or family member name
                </span>
              </div>

              {/* Age and Gender */}
              <div>
                <label className="form-label">Age &amp; Gender</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age (e.g. 28)"
                    className="form-input text-xs w-1/2"
                    min="1"
                    max="120"
                  />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-select text-xs w-1/2"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Child">Child</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <span className="text-3xs text-slate-500 mt-1 block">
                  Required for epidemiological case triage
                </span>
              </div>
            </div>
          </div>

          {/* Primary Water Source (Autofilled with Village) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label mb-0">
                Primary Water Source Used For Drinking
              </label>
              <span className="text-3xs text-sky-700 font-semibold">
                Autofills with village selection
              </span>
            </div>
            <select
              value={waterSource}
              onChange={(e) => setWaterSource(e.target.value)}
              className="form-select text-xs font-medium"
            >
              <option value="Pond Sand Filter Unit">Pond Sand Filter Unit (PSF)</option>
              <option value="Community Deep Tube Well #2">Deep Tube Well / Handpump #2</option>
              <option value="Community Handpump #1">Community Handpump #1 (India Mark-II)</option>
              <option value="Piped Water Tap Supply">Piped Water Tap Supply (Jal Jeevan Mission)</option>
              <option value="Village Ring Well / Dug Well">Village Ring Well / Dug Well</option>
              <option value="Natural Spring / Hilly Stream">Natural Spring / Hilly Stream</option>
              <option value="Kamalabari River Intake Point">River Intake / Open Surface Water</option>
            </select>
          </div>

          {/* Submission Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-sky-100">
            <p className="text-2xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
              Works 100% offline. Saved locally if you are away from mobile coverage.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto btn-primary px-7 py-2.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
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
                  Your condition report has been routed for village <strong>{activeVillage?.name}</strong>.
                  Please boil all drinking water for at least 10 minutes and start taking ORS if experiencing diarrhea or vomiting.
                </p>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
