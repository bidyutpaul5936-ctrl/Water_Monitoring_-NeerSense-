import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, ShieldAlert, ArrowRight, LogIn } from 'lucide-react';
import WaterSafetySlideshow from '../../components/WaterSafetySlideshow';
import RoleLoginSelector from './RoleLoginSelector';
import SystemStatusBar from './SystemStatusBar';
import PortalLaunchCards from './PortalLaunchCards';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';

export default function HomePage() {
  const { activeRole, isGovernment, currentUser } = useAuthRole();

  const isLoggedIn = isGovernment || (activeRole && activeRole !== ROLES.VILLAGER);

  const portalPath = isGovernment
    ? '/admin'
    : activeRole === ROLES.ASHA
    ? '/asha'
    : activeRole === ROLES.HYGIENE
    ? '/hygiene'
    : '/villagers';

  const portalLabel = isGovernment
    ? 'Government Admin Portal'
    : activeRole === ROLES.ASHA
    ? 'ASHA Workers Portal'
    : activeRole === ROLES.HYGIENE
    ? 'Hygiene & Sanitation Portal'
    : 'Villagers Portal';

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-8">
      {/* 1. Basic Water Safety Measures Slideshow */}
      <WaterSafetySlideshow />

      {/* 2. Conditional: show login selector only if NOT logged in */}
      {isLoggedIn ? (
        /* Already Logged-In Banner — hides role selector & portal cards */
        <div className="card border-sky-300 bg-gradient-to-r from-sky-50 via-white to-sky-50 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                {currentUser?.avatar || '👤'}
              </div>
              <div>
                <div className="text-sm font-extrabold text-sky-950">
                  You're already logged in
                </div>
                <div className="text-xs text-sky-800 mt-0.5">
                  Active session as <strong>{currentUser?.name || currentUser?.title || 'Authorized Staff'}</strong>
                  {currentUser?.department && <> &bull; {currentUser.department}</>}
                </div>
                <div className="text-2xs text-sky-600 mt-0.5 font-medium">
                  Your dedicated portal is ready. Click below to continue.
                </div>
              </div>
            </div>

            <Link
              to={portalPath}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex-shrink-0"
            >
              <span>Go to {portalLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Show full Role Login Selector only for guests / villagers */
        <RoleLoginSelector />
      )}

      {/* 3. Live Surveillance & Sensor Status Bar */}
      <SystemStatusBar />

      {/* 4. Dedicated Department Portals Overview — hidden when logged in */}
      {!isLoggedIn && <PortalLaunchCards />}

      {/* 5. National Emergency Contacts Card */}
      <div className="card bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-sky-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                National Health & Drinking Water Emergency Helplines
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Health Advisory: <strong>104</strong> &bull; Ambulance Service: <strong>108</strong> &bull; Feature Phone Self-Reporting: <strong>*999#</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a 
              href="tel:104"
              className="btn-danger text-xs px-4 py-2"
            >
              Call 104 Helpline
            </a>
            <Link
              to={portalPath}
              className="btn-secondary text-xs px-3.5 py-2"
            >
              {portalLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
