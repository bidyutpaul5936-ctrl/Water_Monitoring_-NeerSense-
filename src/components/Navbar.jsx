import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Droplets,
  Wifi,
  WifiOff,
  Globe,
  ChevronDown,
  Menu,
  X,
  RefreshCw,
  Home,
  Users,
  Activity,
  Building2,
  BookOpen,
  Lock,
  ShieldCheck,
  LogOut,
  TestTube2
} from 'lucide-react';
import { useAuthRole, ROLES } from '../contexts/AuthRoleContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useOfflineSync } from '../contexts/OfflineSyncContext';
import { useAlertNotification } from '../contexts/AlertNotificationContext';
import USSDSimulatorModal from './USSDSimulatorModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeRole, currentUser, isGovernment, isAsha, isHygiene, isVillager, logout, setRole } = useAuthRole();
  const handleLogout = () => { logout(); navigate('/'); };
  const { lang, setLang, languages } = useLanguage();
  const { isOnline, totalPending, isSyncing, syncNow } = useOfflineSync();
  const { waterReports } = useAlertNotification();

  const [showUssdModal, setShowUssdModal] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const approvedReports = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);
  const contaminatedCount = approvedReports.filter(r => r.safetyStatus === 'CONTAMINATED').length;

  const allNavItems = [
    { path: '/',           label: 'Home',                  icon: Home,      show: true },
    { path: '/villagers',  label: 'Villagers Portal',       icon: Users,     show: isVillager || isGovernment },
    { path: '/asha',       label: 'ASHA Workers',           icon: Activity,  show: activeRole === ROLES.ASHA || isGovernment },
    { path: '/hygiene',    label: 'Hygiene & Water Safety', icon: BookOpen,  show: activeRole === ROLES.HYGIENE || isGovernment },
    { path: '/admin',      label: 'Government Admin',       icon: Building2, show: isGovernment },
  ];

  const navItems = allNavItems.filter(item => item.show);

  return (
    <>
      {/* National Government Top Header Bar */}
      <div className="bg-sky-900 text-sky-50 text-xs px-4 py-1.5 flex items-center justify-between border-b border-sky-950">
        <div className="flex items-center gap-2">
          <span className="font-semibold">जल शक्ति मंत्रालय &bull; Ministry of Health & Family Welfare &bull; SIH 2025</span>
          {isGovernment && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-3xs shadow-sm">
              <ShieldCheck className="w-3 h-3" />
              <span>SUPER-USER ACCESS: All Pages Unlocked</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Dedicated Portal Session Info */}
          {activeRole !== ROLES.VILLAGER ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-800 text-sky-100 border border-sky-700 text-xs">
                <span>{currentUser.avatar}</span>
                <span className="font-semibold text-2xs sm:text-xs">
                  {currentUser.name || currentUser.title || 'Authorized Staff'}
                </span>
                {currentUser.name && currentUser.title && (
                  <span className="text-3xs text-sky-300">({currentUser.department || currentUser.title})</span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-2xs text-amber-200 hover:text-white bg-sky-800/80 px-2 py-0.5 rounded border border-sky-700 transition cursor-pointer"
                title="Log out of this dedicated department portal"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <span className="text-2xs text-sky-300 font-medium hidden sm:inline">
              Public Portal
            </span>
          )}

          <button
            onClick={() => setShowUssdModal(true)}
            className="hidden sm:inline-flex items-center gap-1 text-sky-200 hover:text-white transition text-xs"
          >
            <span>Feature Phone (*999#)</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-sky-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-sky-950 leading-tight">NeerSense</div>
                <div className="text-2xs text-sky-700 hidden sm:block font-medium">Drinking Water & Health Surveillance</div>
              </div>
            </Link>

            {/* Primary Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-sky-900 hover:bg-sky-100/70 hover:text-sky-950'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Status Controls */}
            <div className="flex items-center gap-2">

              {/* Contamination Alert Indicator */}
              {contaminatedCount > 0 && (
                <Link
                  to={activeRole === ROLES.ASHA ? '/asha' : activeRole === ROLES.HYGIENE ? '/hygiene' : '/villagers'}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-800 text-2xs font-bold border border-red-200"
                  title="Contaminated water source alert"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>{contaminatedCount} Alert</span>
                </Link>
              )}

              {/* Online / Offline Sync Indicator */}
              <button
                onClick={syncNow}
                title={isOnline ? (totalPending > 0 ? `${totalPending} pending sync` : 'Synced') : 'Offline'}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border transition ${
                  !isOnline
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : totalPending > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-sky-50 border-sky-200 text-sky-700'
                }`}
              >
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{!isOnline ? 'Offline' : totalPending > 0 ? `${totalPending} queued` : 'Online'}</span>
                {isSyncing && <RefreshCw className="w-3 h-3 animate-spin" />}
              </button>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100 rounded-md border border-sky-200 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-700" />
                  <span className="uppercase">{lang}</span>
                  <ChevronDown className="w-3 h-3 text-sky-600" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-sky-200 rounded-lg shadow-panel py-1 z-50">
                    {languages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-sky-50 transition ${
                          lang === l.code ? 'text-sky-700 font-bold bg-sky-50' : 'text-slate-700'
                        }`}
                      >
                        <span>{l.native}</span>
                        <span className="text-2xs text-slate-400">{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-sky-800 hover:bg-sky-100 rounded transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-sky-100 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 text-xs font-bold rounded transition ${
                      isActive ? 'bg-sky-600 text-white' : 'text-sky-900 hover:bg-sky-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-sky-100">
                <button
                  onClick={() => { setShowUssdModal(true); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-sky-800 bg-sky-50 rounded"
                >
                  Feature Phone Reporting (*999#)
                </button>
              </div>
            </div>
          )}

        </div>
      </header>

      {showUssdModal && <USSDSimulatorModal isOpen={showUssdModal} onClose={() => setShowUssdModal(false)} />}
    </>
  );
}
