import React from 'react';
import { PhoneCall } from 'lucide-react';

export default function EmergencyHelplineBanner() {
  return (
    <div className="card bg-sky-100/50 border border-sky-300 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center flex-shrink-0 text-red-600">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              24x7 Government Health Emergency Assistance
            </div>
            <p className="text-xs text-slate-600">
              National Health Helpline: <strong>104</strong> &bull; Emergency Ambulance: <strong>108</strong> &bull; Toll-Free
            </p>
          </div>
        </div>

        <a href="tel:104" className="btn-danger text-xs px-4 py-2 flex-shrink-0">
          Call 104 Helpline
        </a>
      </div>
    </div>
  );
}
