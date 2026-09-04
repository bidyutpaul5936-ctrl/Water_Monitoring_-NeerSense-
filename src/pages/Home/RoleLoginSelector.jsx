import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  FlaskConical, 
  Building2, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  ArrowRight, 
  CheckCircle2, 
  LogOut, 
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function RoleLoginSelector() {
  const navigate = useNavigate();
  const { 
    activeRole, 
    setRole, 
    currentUser, 
    loginAsGovernment, 
    loginAsAsha, 
    loginAsHygiene, 
    logoutToVillager 
  } = useAuthRole();
  const { lang } = useLanguage();

  const [selectedRoleKey, setSelectedRoleKey] = useState(activeRole);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  const roleDefinitions = [
    {
      role: ROLES.VILLAGER,
      title: 'Villager / Citizen',
      titleHi: 'ग्रामीण / आम नागरिक',
      icon: Users,
      avatar: '👨‍🌾',
      badge: 'Public Access',
      badgeClass: 'badge-safe',
      desc: 'View approved water test reports, submit health symptoms, and access instant treatment and boiling guides.',
      portalPath: '/villagers',
      portalLabel: 'Villagers Portal',
      requiresPin: false,
      userSample: 'Open Citizen Access',
    },
    {
      role: ROLES.ASHA,
      title: 'ASHA Health Worker',
      titleHi: 'आशा स्वास्थ्य कार्यकर्ता',
      icon: Activity,
      avatar: '👩‍⚕️',
      badge: 'Field Surveillance',
      badgeClass: 'badge-blue',
      desc: 'Conduct field water kit tests (H2S, pH, turbidity), log patient symptoms, and distribute ORS kits.',
      portalPath: '/asha',
      portalLabel: 'ASHA Workers Portal',
      requiresPin: true,
      defaultPin: '1234',
      userSample: 'ASHA Field Worker',
    },
    {
      role: ROLES.HYGIENE,
      title: 'Hygiene & Sanitation Dept',
      titleHi: 'स्वच्छता एवं जनस्वास्थ्य विभाग',
      icon: FlaskConical,
      avatar: '👩‍🔬',
      badge: 'Departmental Desk',
      badgeClass: 'badge-blue',
      desc: 'Analyze ASHA field data, set water safety classifications (Safe / Warning / Contaminated), and draft advisories.',
      portalPath: '/hygiene',
      portalLabel: 'Hygiene Portal',
      requiresPin: true,
      defaultPin: '1234',
      userSample: 'Sanitation Officer',
    },
    {
      role: ROLES.OFFICIAL,
      title: 'Government Health Officer (CDMO)',
      titleHi: 'सरकारी स्वास्थ्य अधिकारी / मुख्य चिकित्सा अधिकारी',
      icon: Building2,
      avatar: '🏛️',
      badge: 'Master Authority',
      badgeClass: 'badge-high',
      desc: 'Verify classifications, approve & publish water reports to the public, issue epidemic containment alerts.',
      portalPath: '/admin',
      portalLabel: 'Government Admin Portal',
      requiresPin: true,
      defaultPin: '1234',
      userSample: 'Surveillance Officer (IDSP)',
    },
  ];

  const handleSelectRole = (targetRole) => {
    setSelectedRoleKey(targetRole);
    setErrorMessage('');
    
    if (targetRole === ROLES.VILLAGER) {
      logoutToVillager();
      return;
    }

    // If already logged into this role, no PIN prompt needed
    if (activeRole === targetRole) {
      return;
    }

    setPinInput('1234'); // convenient pre-fill demo PIN
    setShowPinModal(true);
  };

  const handlePerformLogin = (e) => {
    e?.preventDefault();
    setErrorMessage('');

    let res = { success: false, message: 'Invalid role' };
    if (selectedRoleKey === ROLES.ASHA) {
      res = loginAsAsha(pinInput);
    } else if (selectedRoleKey === ROLES.HYGIENE) {
      res = loginAsHygiene(pinInput);
    } else if (selectedRoleKey === ROLES.OFFICIAL || selectedRoleKey === ROLES.ADMIN) {
      res = loginAsGovernment(pinInput);
    }

    if (res.success) {
      setShowPinModal(false);
      setPinInput('');
      const matched = roleDefinitions.find(r => r.role === selectedRoleKey);
      if (matched) {
        navigate(matched.portalPath);
      }
    } else {
      setErrorMessage(res.message || 'Login failed. Please check PIN.');
    }
  };

  const activeRoleObj = roleDefinitions.find(r => r.role === activeRole) || roleDefinitions[0];

  return (
    <div className="card border-sky-300 shadow-sm bg-white overflow-hidden">
      {/* Header */}
      <div className="card-header bg-gradient-to-r from-sky-100 via-sky-50 to-white border-b border-sky-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-sky-950">
                {lang === 'hi' ? 'भूमिका चयन एवं लॉगिन' : 'Select Role for Login'}
              </h2>
              <span className="badge badge-safe text-3xs font-bold">Secure Access</span>
            </div>
            <p className="text-2xs text-sky-800 mt-0.5">
              {lang === 'hi'
                ? 'अपने अधिकृत विभाग या पोर्टल में प्रवेश के लिए अपनी भूमिका चुनें'
                : 'Choose your user role to sign in and access your dedicated department portal'}
            </p>
          </div>
        </div>

        {/* Current Active User Status */}
        <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg flex-shrink-0">
          <span className="text-lg">{currentUser.avatar}</span>
          <div className="text-left">
            <div className="text-3xs text-sky-600 font-bold uppercase tracking-wider">Active Role:</div>
            <div className="text-xs font-bold text-sky-950">{currentUser.name || currentUser.title || 'Villager / Citizen'}</div>
          </div>
          {activeRole !== ROLES.VILLAGER && (
            <button
              onClick={logoutToVillager}
              className="ml-2 p-1 text-slate-400 hover:text-red-600 transition"
              title="Logout to Villager role"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleDefinitions.map((item) => {
            const Icon = item.icon;
            const isCurrentActive = activeRole === item.role;

            return (
              <div
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrentActive
                    ? 'border-sky-600 bg-sky-50/70 shadow-md ring-2 ring-sky-300'
                    : 'border-sky-100 bg-white hover:border-sky-300 hover:bg-sky-50/30'
                }`}
              >
                {/* Active Role Ribbon */}
                {isCurrentActive && (
                  <div className="absolute -top-2.5 right-3 bg-sky-600 text-white text-3xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Active Session</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 text-xl">
                      {item.avatar}
                    </div>
                    <span className={`badge ${item.badgeClass} text-3xs`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-sky-950 leading-snug">
                    {item.title}
                  </h3>
                  <div className="text-3xs font-semibold text-sky-700 mt-0.5">
                    {item.titleHi}
                  </div>

                  <p className="text-2xs text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between">
                  <div className="text-3xs text-slate-500 font-medium truncate max-w-[140px]">
                    {item.userSample}
                  </div>

                  {isCurrentActive ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(item.portalPath);
                      }}
                      className="btn-primary text-3xs px-2.5 py-1 flex items-center gap-1 font-bold"
                    >
                      <span>Open Portal</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRole(item.role);
                      }}
                      className="btn-secondary text-3xs px-2 py-1 flex items-center gap-1 font-semibold"
                    >
                      {item.requiresPin ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                      <span>{item.requiresPin ? 'Login with PIN' : 'Select Role'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PIN Authentication Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-sky-300 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-sky-950">
                  Enter Security PIN
                </h3>
                <p className="text-xs text-slate-500">
                  Authenticating as: <strong>{roleDefinitions.find(r => r.role === selectedRoleKey)?.title}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handlePerformLogin} className="space-y-3.5">
              <div>
                <label className="form-label text-3xs">
                  Authorization PIN or Access Code
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Demo: 1234)"
                  className="form-input text-center text-base tracking-widest font-mono"
                  autoFocus
                />
                <div className="text-3xs text-sky-700 mt-1 flex items-center justify-between">
                  <span>Demo PIN: <strong>1234</strong></span>
                  <button
                    type="button"
                    onClick={() => setPinInput('1234')}
                    className="underline text-sky-600 hover:text-sky-800"
                  >
                    Quick Autofill
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="btn btn-secondary text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Verify & Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
