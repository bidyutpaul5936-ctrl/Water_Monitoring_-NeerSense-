import React, { useState } from 'react';
import { BookOpen, Volume2, VolumeX, FlaskConical } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { speechService } from '../../services/speechService';
import GovernmentAuthGate from '../../components/GovernmentAuthGate';
import HygieneClassificationDesk from './HygieneClassificationDesk';
import WaterBorneDiseaseTable from './WaterBorneDiseaseTable';

function HygieneDashboardContent() {
  const { lang } = useLanguage();
  const [playingAudioKey, setPlayingAudioKey] = useState(null);
  const [activeTab, setActiveTab] = useState('desk'); // 'desk', 'diseases'

  const toggleAudio = (key, text) => {
    if (playingAudioKey === key) {
      speechService.stopSpeaking();
      setPlayingAudioKey(null);
    } else {
      setPlayingAudioKey(key);
      const utterance = speechService.speak(text, lang);
      if (utterance) {
        utterance.onend = () => setPlayingAudioKey(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card bg-gradient-to-r from-sky-100 via-sky-50 to-white border-sky-300 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-safe">
                <FlaskConical className="w-3 h-3" /> Hygiene & Public Health Department
              </span>
              <span className="badge badge-blue">National Jal Jeevan Mission</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-sky-950">
              Water Safety Classification & Public Hygiene Portal
            </h1>
            <p className="text-xs text-sky-800 mt-0.5">
              Evaluate ASHA field test data, determine water drinkability status, and formulate public health advisories for Government verification.
            </p>
          </div>

          <button
            onClick={() => toggleAudio('header', "Welcome to the Hygiene and Sanitation Department Portal. Review ASHA test kit submissions and set official water safety classifications.")}
            className={`btn text-xs ${playingAudioKey === 'header' ? 'btn-danger' : 'btn-secondary'}`}
          >
            {playingAudioKey === 'header' ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{playingAudioKey === 'header' ? 'Stop Audio' : 'Audio Guide'}</span>
          </button>
        </div>

        {/* Hygiene Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-sky-200/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('desk')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'desk'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-white/80 text-sky-900 hover:bg-white border border-sky-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Water Safety Classification Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('diseases')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'diseases'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-white/80 text-sky-900 hover:bg-white border border-sky-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Water-Borne Disease Reference</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'desk' && <HygieneClassificationDesk />}
      {activeTab === 'diseases' && <WaterBorneDiseaseTable />}
    </div>
  );
}

export default function HygienePage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <GovernmentAuthGate 
        requiredRole="HYGIENE" 
        title="District Hygiene & Sanitation Department Portal"
      >
        <HygieneDashboardContent />
      </GovernmentAuthGate>
    </div>
  );
}
