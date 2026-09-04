import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';
import Slideshow from '../../components/Slideshow';
import SystemStatusBar from './SystemStatusBar';
import PortalLaunchCards from './PortalLaunchCards';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';

export default function HomePage() {
  const { activeRole, isGovernment } = useAuthRole();

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-8">
      {/* 1. Interactive Hero Slideshow */}
      <Slideshow />

      {/* 2. Live Surveillance Status Bar */}
      <SystemStatusBar />

      {/* 3. Dedicated Portals with separate URLs */}
      <PortalLaunchCards />

      {/* 4. Emergency Contacts Card */}
      <div className="card bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-sky-200 p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                National Health & Water Emergency Helplines
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Health Advisory: <strong>104</strong> &bull; Ambulance Service: <strong>108</strong> &bull; Feature Phone Self-Reporting: <strong>*999#</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href="tel:104"
              className="btn-danger text-xs px-4 py-2"
            >
              Call 104 Helpline
            </a>
            {isGovernment || activeRole === ROLES.HYGIENE ? (
              <Link
                to="/hygiene"
                className="btn-secondary text-xs px-3.5 py-2"
              >
                ORS & Hygiene Guide
              </Link>
            ) : (
              <Link
                to="/villagers"
                className="btn-secondary text-xs px-3.5 py-2"
              >
                Villagers Portal
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
