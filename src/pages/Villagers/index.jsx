import React, { useState } from 'react';
import { ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOfflineSync } from '../../contexts/OfflineSyncContext';
import { speechService } from '../../services/speechService';
import WaterReportsTable from './WaterReportsTable';
import HealthConditionForm from './HealthConditionForm';
import EmergencyHelplineBanner from './EmergencyHelplineBanner';

export default function VillagersPage() {
  const { lang } = useLanguage();
  const { isOnline } = useOfflineSync();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayAudioGuide = () => {
    if (isPlayingAudio) {
      speechService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const text = lang === 'hi'
        ? 'नमस्ते। जल सुरक्षा पोर्टल पर आपका स्वागत है। नीचे दिए गए पानी की रिपोर्ट देखें। यदि आपको या परिवार में किसी को उल्टी या दस्त है, तो लक्षण चुनकर अपनी रिपोर्ट दर्ज करें।'
        : 'Namaste. Welcome to JalSuraksha. Review official water reports below. If you or family members have symptoms, select them and submit your health report.';
      const u = speechService.speak(text, lang);
      if (u) u.onend = () => setIsPlayingAudio(false);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-7">
      {/* Page Header */}
      <div className="card bg-gradient-to-r from-sky-100 via-sky-50 to-white border-sky-300 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-safe">
                <ShieldCheck className="w-3 h-3" /> Villagers Portal
              </span>
              {!isOnline && <span className="badge badge-high">Offline Mode Active</span>}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-sky-950">
              Community Health & Drinking Water Portal
            </h1>
            <p className="text-xs text-sky-800 mt-0.5">
              Check official drinking water quality reports and report health symptoms for immediate ASHA assistance.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handlePlayAudioGuide}
              className={`btn text-xs ${isPlayingAudio ? 'btn-danger' : 'btn-secondary'}`}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {isPlayingAudio ? 'Stop Voice' : 'Audio Instructions'}
            </button>
          </div>
        </div>
      </div>

      {/* 1. Official Water Quality Reports Table */}
      <WaterReportsTable />

      {/* 2. Enter Health Condition / Symptoms Form */}
      <HealthConditionForm />

      {/* 3. Emergency Helpline Banner */}
      <EmergencyHelplineBanner />
    </div>
  );
}
