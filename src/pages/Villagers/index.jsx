import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Home as HomeIcon, 
  FileSpreadsheet, 
  HeartPulse, 
  ArrowRight, 
  Droplets
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOfflineSync } from '../../contexts/OfflineSyncContext';
import { speechService } from '../../services/speechService';
import WaterReportsTable from './WaterReportsTable';
import HealthConditionForm from './HealthConditionForm';
import EmergencyHelplineBanner from './EmergencyHelplineBanner';
import HygieneSlideshow from './HygieneSlideshow';
import InstantTreatmentGuide from './InstantTreatmentGuide';
import OrsPreparationSteps from '../Hygiene/OrsPreparationSteps';

export default function VillagersPage() {
  const { lang } = useLanguage();
  const { isOnline } = useOfflineSync();
  const [activeTab, setActiveTab] = useState('home'); // 'home' (default), 'reports', 'treatment'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const handlePlayAudioGuide = () => {
    if (isPlayingAudio) {
      speechService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      let text = '';
      if (activeTab === 'home') {
        text = lang === 'hi'
          ? 'नमस्ते। नीरसेंस स्वच्छ पेयजल और स्वास्थ्य पोर्टल पर आपका स्वागत है। नीचे स्वच्छता और शुद्ध पानी बनाए रखने के महत्वपूर्ण नियम देखें।'
          : 'Namaste. Welcome to NeerSense. Learn essential steps for maintaining hygiene, clean water, and health in your village.';
      } else if (activeTab === 'reports') {
        text = lang === 'hi'
          ? 'यहाँ आप अपने गाँव का नाम डालकर पानी की शुद्धता और सरकारी रिपोर्ट देख सकते हैं।'
          : 'Enter your village name to view verified drinking water quality reports and safety classifications.';
      } else {
        text = lang === 'hi'
          ? 'यदि आपको कोई बीमारी के लक्षण हैं तो यहाँ दर्ज करें और तुरंत प्राथमिक उपचार की सलाह प्राप्त करें।'
          : 'Select any symptoms you or your family are experiencing to receive immediate first-aid instructions and notify your ASHA worker.';
      }

      const u = speechService.speak(text, lang);
      if (u) u.onend = () => setIsPlayingAudio(false);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-6">
      {/* Page Header Banner */}
      <div className="card bg-gradient-to-r from-sky-100 via-sky-50 to-white border-sky-300 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="badge badge-safe">
                <ShieldCheck className="w-3.5 h-3.5" /> Villagers Community Portal
              </span>
              <span className="badge badge-blue">
                <Droplets className="w-3.5 h-3.5" /> NeerSense Platform
              </span>
              {!isOnline && <span className="badge badge-high">Offline Mode Active</span>}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-sky-950">
              Community Health & Clean Water Portal
            </h1>
            <p className="text-xs text-sky-800 mt-0.5">
              {lang === 'hi'
                ? 'स्वच्छ पेयजल दिशा-निर्देश, आधिकारिक गाँव रिपोर्ट और तत्काल स्वास्थ्य उपचार पोर्टल'
                : 'Hygiene guidance, village water reports, and instant treatment support for rural families'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handlePlayAudioGuide}
              className={`btn text-xs ${isPlayingAudio ? 'btn-danger' : 'btn-secondary'}`}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isPlayingAudio ? 'Stop Voice' : 'Voice Guide'}</span>
            </button>
          </div>
        </div>

        {/* 3-Tab Navigation Bar */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-sky-200/70 overflow-x-auto">
          {/* Tab 1: Home (Default) */}
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'home'
                ? 'bg-sky-700 text-white shadow-sky-200 ring-2 ring-sky-600'
                : 'bg-white text-sky-900 hover:bg-sky-50 border border-sky-200'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home & Hygiene Guide</span>
            {activeTab === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>}
          </button>

          {/* Tab 2: Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'reports'
                ? 'bg-sky-700 text-white shadow-sky-200 ring-2 ring-sky-600'
                : 'bg-white text-sky-900 hover:bg-sky-50 border border-sky-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Village Reports</span>
          </button>

          {/* Tab 3: Health Input & Instant Treatment */}
          <button
            onClick={() => setActiveTab('treatment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'treatment'
                ? 'bg-sky-700 text-white shadow-sky-200 ring-2 ring-sky-600'
                : 'bg-white text-sky-900 hover:bg-sky-50 border border-sky-200'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Health Input & Instant Treatment</span>
            {selectedSymptoms.length > 0 && (
              <span className="badge badge-high text-3xs px-1.5 py-0.5 ml-1">
                {selectedSymptoms.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: HOME (Default Tab) */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Quick Action Navigation Prompts */}
          <div className="grid sm:grid-cols-2 gap-3.5">
            <button
              onClick={() => setActiveTab('reports')}
              className="card p-4 hover:border-sky-400 transition text-left group bg-gradient-to-r from-sky-50/80 to-white flex items-center justify-between"
            >
              <div>
                <div className="text-2xs font-bold text-sky-700 uppercase tracking-wide flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Check Village Water
                </div>
                <div className="text-sm font-bold text-sky-950 mt-1">
                  Search Water Quality Reports
                </div>
                <div className="text-2xs text-slate-500 mt-0.5">
                  Type your village name to see official laboratory test results
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-sky-600 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => setActiveTab('treatment')}
              className="card p-4 hover:border-sky-400 transition text-left group bg-gradient-to-r from-amber-50/50 via-sky-50/40 to-white flex items-center justify-between"
            >
              <div>
                <div className="text-2xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-amber-600" /> Medical First-Aid
                </div>
                <div className="text-sm font-bold text-sky-950 mt-1">
                  Symptom Checker & Treatment
                </div>
                <div className="text-2xs text-slate-500 mt-0.5">
                  Report symptoms and receive instant first-aid care instructions
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-sky-600 group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* 1. Slideshow showing basic steps for maintaining hygiene and clean water */}
          <HygieneSlideshow />

          {/* 2. WHO ORS Preparation Protocol */}
          <OrsPreparationSteps />
        </div>
      )}

      {/* TAB 2: REPORTS (Filter by Village Name) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <WaterReportsTable />
        </div>
      )}

      {/* TAB 3: HEALTH INPUT & INSTANT TREATMENT */}
      {activeTab === 'treatment' && (
        <div className="space-y-6">
          {/* Form taking input from the villagers */}
          <HealthConditionForm onSymptomsChange={setSelectedSymptoms} />

          {/* Instant basic treatment instructions according to selected symptoms */}
          <InstantTreatmentGuide 
            selectedSymptoms={selectedSymptoms} 
            onBack={() => setSelectedSymptoms([])}
          />
        </div>
      )}

      {/* Emergency Helpline Banner (Always Visible across all tabs) */}
      <EmergencyHelplineBanner />
    </div>
  );
}
