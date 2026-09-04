import React from 'react';
import { AlertCircle, X, Volume2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAlertNotification } from '../contexts/AlertNotificationContext';
import { speechService } from '../services/speechService';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotificationToast() {
  const { recentNotification, clearNotification } = useAlertNotification();
  const { lang } = useLanguage();

  if (!recentNotification) return null;

  const playVoiceAlert = () => {
    speechService.speak(recentNotification.message, lang);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-4 rounded-xl bg-white border-2 border-red-400 shadow-modal text-slate-800 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-100 border border-red-200 text-red-600 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="badge badge-critical text-2xs">
              Emergency Water Alert
            </span>
            <span className="text-2xs text-slate-500 font-mono">{recentNotification.time}</span>
          </div>

          <h4 className="text-xs font-bold text-slate-900 mt-1 mb-0.5 truncate">
            {recentNotification.title}
          </h4>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {recentNotification.message}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={playVoiceAlert}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 transition"
            >
              <Volume2 className="w-3.5 h-3.5" /> Listen
            </button>
            <Link
              to="/villagers"
              onClick={clearNotification}
              className="btn-primary text-xs px-3 py-1 ml-auto flex items-center gap-1.5"
            >
              <span>View Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <button 
          onClick={clearNotification}
          className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
