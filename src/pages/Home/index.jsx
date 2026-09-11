import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, ArrowRight, ShieldCheck, Lock, LogIn, Sparkles, Droplets } from 'lucide-react';
import WaterSafetySlideshow from '../../components/WaterSafetySlideshow';
import SystemStatusBar from './SystemStatusBar';
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
    ? 'Government CDMO Command Portal'
    : activeRole === ROLES.ASHA
    ? 'ASHA Workers Portal'
    : activeRole === ROLES.HYGIENE
    ? 'Hygiene & Sanitation Portal'
    : 'Villagers Portal';

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* 1. Basic Water Safety Measures Slideshow */}
      <WaterSafetySlideshow />

      {/* 2. Authentication Status Banner */}
      {isLoggedIn ? (
        /* Active session banner */
        <div className="rounded-2xl border border-sky-300 bg-gradient-to-r from-sky-50 via-white to-sky-50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ring-4 ring-sky-100">
                {currentUser?.avatar || '👤'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-sky-950">Active Authorized Session</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AUTHENTICATED
                  </span>
                </div>
                <div className="text-xs text-sky-900 mt-0.5">
                  Logged in as <strong>{currentUser?.name || currentUser?.title || 'Staff User'}</strong>
                  {currentUser?.department && <> &bull; <span className="text-slate-600">{currentUser.department}</span></>}
                </div>
                <div className="text-2xs text-sky-700 mt-0.5 font-medium">
                  Your secure department workspace is active. Navigate below.
                </div>
              </div>
            </div>

            <Link
              to={portalPath}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm flex-shrink-0 hover:shadow-md"
            >
              <span>Go to {portalLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Unauthenticated visitor banner */
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-50/60 via-white to-blue-50/50 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm ring-4 ring-sky-100/50">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">National Jal Jeevan & Health Mission Portal</h3>
                  <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    West Bengal State Hub
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Public water safety advisories are freely accessible. Department officers (ASHA, Hygiene, CDMO Admin) must authenticate to access data entry desks.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/villagers"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:border-sky-400 text-slate-800 font-bold rounded-xl text-xs transition shadow-xs"
              >
                <span>Citizen Portal</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Department Staff Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Live Surveillance & Sensor Status Bar */}
      <SystemStatusBar />

      {/* 4. National Emergency Contacts Card */}
      <div className="rounded-2xl bg-gradient-to-r from-red-50/70 via-white to-amber-50/50 border border-red-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0 shadow-xs">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                National Health & Drinking Water Emergency Helplines
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Health Advisory: <strong className="text-slate-900">104</strong> &bull; Medical Emergency Ambulance: <strong className="text-slate-900">108</strong> &bull; Feature Phone Self-Reporting: <strong className="text-slate-900">*999#</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <a 
              href="tel:104"
              className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
            >
              Call 104 Helpline
            </a>
            <Link
              to="/villagers"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs transition"
            >
              Public Water Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
