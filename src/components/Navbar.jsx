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
  LogIn,
  KeyRound,
  Sparkles,
  Bell,
  HeartPulse,
  FileSpreadsheet
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
  
  // Custom logout handler redirecting to the portal's dedicated login page
  const handleLogout = () => {
    logout();
    if (isGovernment || activeRole === ROLES.ADMIN) {
      navigate('/admin/login');
    } else {
      navigate('/health/login');
    }
  };

  const { lang, setLang, languages } = useLanguage();
  const { isOnline, totalPending, isSyncing, syncNow } = useOfflineSync();
  const { waterReports } = useAlertNotification();

  const [showUssdModal, setShowUssdModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const approvedReports = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);
  const contaminatedCount = approvedReports.filter(r => r.safetyStatus === 'CONTAMINATED').length;

  // Strict page context checks: covers root '/', '/village', and '/villagers'
  const isVillagerPortal =
    location.pathname === '/' ||
    location.pathname.startsWith('/village') ||
    location.pathname.startsWith('/villagers');
  const isHealthAuth = location.pathname.startsWith('/health');
  const isAdminAuth =
    location.pathname.startsWith('/admin/login') ||
    location.pathname.startsWith('/admin/register') ||
    location.pathname.startsWith('/admin/signup');

  // =========================================================================
  // 1. ISOLATED VILLAGERS NAVBAR (ZERO LOGIN, ZERO LOGOUT, ZERO STAFF ACCESS)
  // =========================================================================
  if (isVillagerPortal) {
    const villagerNavItems = [
      { id: 'v-home', path: '/villagers', label: 'Home & Hygiene Guide', icon: Home },
      { id: 'v-reports', path: '/villagers?tab=reports', label: 'Village Reports', icon: FileSpreadsheet },
      { id: 'v-treatment', path: '/villagers?tab=treatment', label: 'Health & Treatment', icon: HeartPulse },
      { id: 'v-alerts', path: '/villagers/signup', label: 'Citizen Water Alerts', icon: Bell },
    ];

    return (
      <>
        {/* National Villager Water Safety Banner */}
        <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-1.5 flex items-center justify-between border-b border-emerald-950">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              जल शक्ति मंत्रालय &bull; National Jal Jeevan Mission &bull; Gramin Suraksha
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUssdModal(true)}
              className="hidden sm:inline-flex items-center gap-1 text-emerald-200 hover:text-white transition text-xs font-semibold cursor-pointer"
            >
              <span>Feature Phone Reporting (*999#)</span>
            </button>
            <span className="text-emerald-400 text-3xs font-bold uppercase tracking-wider hidden sm:inline">
              Citizen Public Portal
            </span>
          </div>
        </div>

        {/* Villagers Dedicated Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-200/80 shadow-xs">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">

              {/* Logo: Always points to /villagers only */}
              <Link
                to="/villagers"
                className="flex items-center gap-2.5 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 leading-tight">NeerSense</div>
                  <div className="text-2xs text-emerald-700 font-medium">Gramin Jal & Swasthya Suraksha</div>
                </div>
              </Link>

              {/* Isolated Citizen Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                {villagerNavItems.map((item) => {
                  const Icon = item.icon;
                  const isReports = item.id === 'v-reports' && location.search.includes('tab=reports');
                  const isTreatment = item.id === 'v-treatment' && location.search.includes('tab=treatment');
                  const isAlerts = item.id === 'v-alerts' && location.pathname === '/villagers/signup';
                  const isHome = item.id === 'v-home' && location.pathname === '/villagers' && !location.search.includes('tab=');

                  const isActive = isReports || isTreatment || isAlerts || isHome;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-emerald-950 hover:bg-emerald-50 hover:text-emerald-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Status Controls */}
              <div className="flex items-center gap-2">
                {/* Contamination Alert Indicator */}
                {contaminatedCount > 0 && (
                  <Link
                    to="/villagers?tab=reports"
                    className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-800 text-2xs font-bold border border-red-200"
                    title="Contaminated water alert in state"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    <span>{contaminatedCount} Alert(s)</span>
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
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
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
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 rounded-md border border-emerald-200 transition cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="uppercase">{lang}</span>
                    <ChevronDown className="w-3 h-3 text-emerald-600" />
                  </button>
                  {langOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-emerald-200 rounded-lg shadow-panel py-1 z-50">
                      {languages.map(l => (
                        <button
                          key={l.code}
                          onClick={() => { setLang(l.code); setLangOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${
                            lang === l.code ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-700'
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
                  className="md:hidden p-1.5 text-emerald-800 hover:bg-emerald-100 rounded transition"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

            </div>

            {/* Mobile Dropdown for Villagers (Zero staff links, zero login/logout) */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-emerald-100 py-2 space-y-1">
                {villagerNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-xs font-bold rounded text-emerald-950 hover:bg-emerald-50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-emerald-700" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-emerald-100">
                  <button
                    onClick={() => { setShowUssdModal(true); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded"
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

  // =========================================================================
  // 2. HEALTH AUTH NAVBAR (/health/login, /health/signup)
  // =========================================================================
  if (isHealthAuth) {
    return (
      <>
        <div className="bg-sky-950 text-sky-100 text-xs px-4 py-1.5 flex items-center justify-between border-b border-sky-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold">स्वास्थ्य एवं परिवार कल्याण &bull; Health & Sanitation Department Portal</span>
          </div>
          <div className="text-3xs font-bold uppercase tracking-wider text-sky-300">
            Field Worker Desk
          </div>
        </div>

        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-200/80 shadow-xs">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <Link to="/health/login" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-sky-950 leading-tight">NeerSense Health</div>
                  <div className="text-2xs text-sky-700 font-medium">ASHA & Hygiene Department Portal</div>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  to="/health/login"
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    location.pathname === '/health/login' ? 'bg-sky-600 text-white' : 'text-sky-900 hover:bg-sky-50'
                  }`}
                >
                  Staff Login
                </Link>
                <Link
                  to="/health/signup"
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    location.pathname === '/health/signup' ? 'bg-teal-600 text-white' : 'text-teal-900 hover:bg-teal-50'
                  }`}
                >
                  First-Timer Sign Up
                </Link>
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }

  // =========================================================================
  // 3. ADMIN AUTH NAVBAR (/admin/login)
  // =========================================================================
  if (isAdminAuth) {
    return (
      <>
        <div className="bg-slate-950 text-indigo-100 text-xs px-4 py-1.5 flex items-center justify-between border-b border-indigo-950">
          <div className="flex items-center gap-2">
            <span className="font-semibold">राष्ट्रीय स्वास्थ्य मिशन &bull; District CDMO Administrative Command Desk</span>
          </div>
          <div className="text-3xs font-bold uppercase tracking-wider text-amber-400">
            Single Admin Authority
          </div>
        </div>

        <header className="sticky top-0 z-40 bg-slate-900 border-b border-indigo-500/30 shadow-md">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <Link to="/admin/login" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white leading-tight">NeerSense Admin</div>
                  <div className="text-2xs text-indigo-300 font-medium">CDMO Administrative Desk</div>
                </div>
              </Link>
              <div className="text-xs text-indigo-200 font-semibold">
                Official Administrative Entry
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }

  // =========================================================================
  // 4. STANDARD STAFF & SUPER-USER NAVBAR
  // =========================================================================
  const homeNavPath = isGovernment
    ? '/admin'
    : activeRole === ROLES.ASHA
    ? '/asha'
    : activeRole === ROLES.HYGIENE
    ? '/hygiene'
    : '/';

  const allNavItems = [
    { id: 'home', path: homeNavPath, label: 'Home', icon: Home, show: true },
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
                title="Log out and return to dedicated portal login"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/health/signup"
                className="inline-flex items-center gap-1 text-2xs text-cyan-200 hover:text-white bg-sky-950/80 hover:bg-sky-800 px-2.5 py-0.5 rounded border border-cyan-400/40 font-semibold transition shadow-xs"
                title="Health Staff First-Time Sign Up"
              >
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>Health Staff Sign Up</span>
              </Link>
              <Link
                to="/health/login"
                className="inline-flex items-center gap-1 text-2xs text-white bg-sky-800 hover:bg-sky-700 px-2.5 py-0.5 rounded border border-sky-600 font-semibold transition shadow-xs"
                title="Health Staff Login"
              >
                <LogIn className="w-3 h-3" />
                <span>Health Staff Login</span>
              </Link>
            </div>
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
                    to="/health/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 rounded-lg shadow-xs border border-sky-300"
                  >
                    <Sparkles className="w-4 h-4 text-sky-700" />
                    <span>Health Staff Sign Up</span>
                  </Link>
                  <Link
                    to="/health/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Health Staff Login</span>
                  </Link>
                </div>
              ) : (
                <div className="pt-2 border-t border-sky-100">
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out ({currentUser?.name || 'Staff'})</span>
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
