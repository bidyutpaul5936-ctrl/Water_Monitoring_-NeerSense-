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
  TestTube2,
  LogIn,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { useAuthRole, ROLES } from '../contexts/AuthRoleContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useOfflineSync } from '../contexts/OfflineSyncContext';
import { useAlertNotification } from '../contexts/AlertNotificationContext';
import USSDSimulatorModal from './USSDSimulatorModal';
import ChangePinModal from './ChangePinModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeRole, currentUser, isGovernment, isAsha, isHygiene, isVillager, logout, adminActivePage = 'admin', setAdminActivePage } = useAuthRole();
  const handleLogout = () => { logout(); navigate('/login'); };
  const { lang, setLang, languages } = useLanguage();
  const { isOnline, totalPending, isSyncing, syncNow } = useOfflineSync();
  const { waterReports } = useAlertNotification();

  const [showUssdModal, setShowUssdModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const approvedReports = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);
  const contaminatedCount = approvedReports.filter(r => r.safetyStatus === 'CONTAMINATED').length;

  const isVillagersPage = location.pathname.startsWith('/villagers') || (location.pathname === '/admin' && adminActivePage === 'villagers');

  // When logged in as a specific role, Home nav link points to the user's portal
  const homeNavPath = isGovernment
    ? '/admin'
    : activeRole === ROLES.ASHA
    ? '/asha'
    : activeRole === ROLES.HYGIENE
    ? '/hygiene'
    : '/';

  const allNavItems = [
    { id: 'home', path: homeNavPath, label: 'Home', icon: Home, show: true },
    { id: 'villagers', path: '/villagers', label: 'Villagers Portal', icon: Users, show: isVillager || isGovernment },
    { id: 'asha', path: '/asha', label: 'ASHA Workers', icon: Activity, show: activeRole === ROLES.ASHA || isGovernment },
    { id: 'hygiene', path: '/hygiene', label: 'Hygiene & Water Safety', icon: BookOpen, show: activeRole === ROLES.HYGIENE || isGovernment },
    { id: 'admin', path: '/admin', label: 'Government Admin', icon: Building2, show: isGovernment },
  ];

  const navItems = allNavItems.filter(item => item.show);

  const handleNavClick = (e, item) => {
    if (isGovernment) {
      e.preventDefault();
      setAdminActivePage && setAdminActivePage(item.id);
      if (location.pathname !== '/admin') {
        navigate('/admin');
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* National Government Top Header Bar */}
      <div className="bg-sky-900 text-sky-50 text-xs px-4 py-1.5 flex items-center justify-between border-b border-sky-950">
        <div className="flex items-center gap-2">
          <span className="font-semibold">जल शक्ति मंत्रालय &bull; Ministry of Health & Family Welfare &bull; SIH 2026</span>
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
                onClick={() => setShowChangePinModal(true)}
                className="inline-flex items-center gap-1 text-2xs text-sky-200 hover:text-white bg-sky-800/80 hover:bg-sky-700 px-2 py-0.5 rounded border border-sky-700 transition cursor-pointer"
                title="Change your login security PIN"
              >
                <KeyRound className="w-3 h-3 text-sky-300" />
                <span>Change PIN</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-2xs text-amber-200 hover:text-white bg-sky-800/80 hover:bg-sky-700 px-2 py-0.5 rounded border border-sky-700 transition cursor-pointer"
                title="Log out of this dedicated department portal"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/first-time-signin"
                className="inline-flex items-center gap-1 text-2xs text-cyan-200 hover:text-white bg-sky-950/80 hover:bg-sky-800 px-2.5 py-0.5 rounded border border-cyan-400/40 font-semibold transition shadow-xs"
                title="First-Time Personnel Onboarding & Sign In"
              >
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>First-Timer Sign In</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-2xs text-white bg-sky-800 hover:bg-sky-700 px-2.5 py-0.5 rounded border border-sky-600 font-semibold transition shadow-xs"
                title="Signed Personnel Login"
              >
                <LogIn className="w-3 h-3" />
                <span>Personnel Login</span>
              </Link>
            </div>
          )}

          {isVillagersPage && (
            <button
              onClick={() => setShowUssdModal(true)}
              className="hidden sm:inline-flex items-center gap-1 text-sky-200 hover:text-white transition text-xs"
            >
              <span>Feature Phone (*999#)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-200/80 shadow-xs">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link
              to={isGovernment ? '/admin' : '/'}
              onClick={(e) => {
                if (isGovernment) {
                  e.preventDefault();
                  setAdminActivePage && setAdminActivePage('admin');
                  if (location.pathname !== '/admin') navigate('/admin');
                }
              }}
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
                const isActive = isGovernment
                  ? location.pathname === '/admin' && adminActivePage === item.id
                  : (item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.id}
                    to={isGovernment ? '/admin' : item.path}
                    onClick={(e) => handleNavClick(e, item)}
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
                  to={isGovernment ? '/admin' : (activeRole === ROLES.ASHA ? '/asha' : activeRole === ROLES.HYGIENE ? '/hygiene' : '/villagers')}
                  onClick={(e) => {
                    if (isGovernment) {
                      e.preventDefault();
                      setAdminActivePage && setAdminActivePage('admin');
                      if (location.pathname !== '/admin') navigate('/admin');
                    }
                  }}
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
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border transition ${!isOnline
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
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-sky-50 transition ${lang === l.code ? 'text-sky-700 font-bold bg-sky-50' : 'text-slate-700'
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
                const isActive = isGovernment
                  ? location.pathname === '/admin' && adminActivePage === item.id
                  : (item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.id}
                    to={isGovernment ? '/admin' : item.path}
                    onClick={(e) => handleNavClick(e, item)}
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
              {activeRole === ROLES.VILLAGER && !isGovernment ? (
                <div className="pt-2 border-t border-sky-100 space-y-2">
                  <Link
                    to="/first-time-signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 rounded-lg shadow-xs border border-sky-300"
                  >
                    <Sparkles className="w-4 h-4 text-sky-700" />
                    <span>First-Timer Sign In / Register</span>
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Signed Personnel Login</span>
                  </Link>
                </div>
              ) : (
                <div className="pt-2 border-t border-sky-100">
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out ({currentUser?.name || 'Staff'})</span>
                  </button>
                </div>
              )}
              {isVillagersPage && (
                <div className="pt-2 border-t border-sky-100">
                  <button
                    onClick={() => { setShowUssdModal(true); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-sky-800 bg-sky-50 rounded"
                  >
                    Feature Phone Reporting (*999#)
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </header>

      {showUssdModal && <USSDSimulatorModal isOpen={showUssdModal} onClose={() => setShowUssdModal(false)} />}
      <ChangePinModal isOpen={showChangePinModal} onClose={() => setShowChangePinModal(false)} />
    </>
  );
}
