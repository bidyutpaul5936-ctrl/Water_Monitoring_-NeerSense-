import React from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function VoiceSymptomRecorder({ 
  isRecording, 
  voiceTranscript, 
  onVoiceToggle, 
  onClearTranscript 
}) {
  const { lang } = useLanguage();

  return (
    <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row items-center gap-3.5">
        <button
          type="button"
          onClick={onVoiceToggle}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            isRecording 
              ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse' 
              : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
          }`}
          title="Tap to speak in Hindi/Bengali/English"
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="text-sm font-bold text-sky-950">
            {isRecording ? '🔴 Listening... speak your symptoms' : 'Voice Input Available (Tap mic to speak)'}
          </div>
          {voiceTranscript ? (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-sky-700 italic font-medium truncate">"{voiceTranscript}"</p>
              <button onClick={onClearTranscript} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-0.5">
              Say: "Mujhe 2 din se dast aur ulti hai" or "আমার পেটে ব্যথা ও বমি হচ্ছে"
            </p>
          )}
        </div>

        <span className="text-2xs text-sky-800 font-semibold bg-white border border-sky-200 px-2 py-1 rounded">
          Voice Language: <strong className="uppercase">{lang}</strong>
        </span>
      </div>
    </div>
  );
}
