import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Droplets, 
  ShieldCheck, 
  Phone, 
  Lock, 
  User, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  EyeOff,
  Waves,
  Shield, 
  ArrowLeft,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { useAuthRole, ROLES, FIXED_CREDENTIALS } from '../../contexts/AuthRoleContext';
import { WEST_BENGAL_VILLAGES } from '../../utils/westBengalVillages';
import ChangePinModal from '../../components/ChangePinModal';

const ROLES_LIST = [
  {
    id: ROLES.VILLAGER,
    label: 'Villager / Citizen',
    labelHi: 'ग्रामीण / नागरिक',
    icon: '👨‍🌾',
    badge: 'Public Access',
    color: 'emerald',
    desc: 'Check local water safety, report symptoms, and access boiling guidelines.',
    requiresPin: false,
  },
  {
    id: ROLES.ASHA,
    label: 'ASHA Field Worker',
    labelHi: 'आशा कार्यकर्ता',
    icon: '👩‍⚕️',
    badge: 'Field Inspection',
    color: 'sky',
    desc: 'Enter water testing field data, record H2S vial tests, and log patient cases.',
    requiresPin: true,
  },
  {
    id: ROLES.HYGIENE,
    label: 'Hygiene & Sanitation Dept',
    labelHi: 'स्वच्छता विभाग',
    icon: '👩‍🔬',
    badge: 'Lab & Verification',
    color: 'teal',
    desc: 'Review microbiological readings, classify water safety, and issue advisories.',
    requiresPin: true,
  },
  {
    id: ROLES.ADMIN,
    label: 'District Admin / CDMO',
    labelHi: 'जिला स्वास्थ्य अधिकारी',
    icon: '🏛️',
    badge: 'Official Authority',
    color: 'indigo',
    desc: 'Review classifications, verify official water reports, and publish to public portal.',
    requiresPin: true,
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');

  const { loginWithPhone, forceReleaseAdminLock, checkPhoneRegistration } = useAuthRole();

  const [selectedRole, setSelectedRole] = useState(
    requestedRole && Object.values(ROLES).includes(requestedRole) ? requestedRole : ROLES.VILLAGER
  );
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [villageId, setVillageId] = useState('vil-01');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [isAdminLocked, setIsAdminLocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnregistered, setIsUnregistered] = useState(false);
  const [lookupStatus, setLookupStatus] = useState(null); // 'checking' | 'registered' | 'unregistered'
  const [registeredUserInfo, setRegisteredUserInfo] = useState(null);

  // Auto initialize when role is chosen or query param changes
  useEffect(() => {
    const roleId = requestedRole && Object.values(ROLES).includes(requestedRole) ? requestedRole : selectedRole;
    const fixedCred = FIXED_CREDENTIALS[roleId];
    if (fixedCred && fixedCred.requiresPin) {
      setPhone(fixedCred.phone);
      setName(fixedCred.name);
    }
  }, [requestedRole]);

  // Real-time phone number registration check when typing 10 digits
  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setLookupStatus(null);
      setRegisteredUserInfo(null);
      setIsUnregistered(false);
      return;
    }

    let active = true;
    const runLookup = async () => {
      setLookupStatus('checking');
      try {
        if (checkPhoneRegistration) {
          const res = await checkPhoneRegistration(cleanPhone, selectedRole);
          if (!active) return;
          if (res.isRegistered) {
            setLookupStatus('registered');
            setRegisteredUserInfo(res.user);
            setIsUnregistered(false);
            setErrorMessage('');
            if (res.user?.name && !name) {
              setName(res.user.name);
            }
          } else {
            setLookupStatus('unregistered');
            setRegisteredUserInfo(null);
            setIsUnregistered(true);
          }
        }
      } catch {
        if (active) setLookupStatus(null);
      }
    };

    const timer = setTimeout(runLookup, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [phone, selectedRole, checkPhoneRegistration]);

  const selectedRoleObj = ROLES_LIST.find(r => r.id === selectedRole) || ROLES_LIST[0];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    setIsAdminLocked(false);
    setIsUnregistered(false);
    setLookupStatus(null);
    setRegisteredUserInfo(null);
    setPin('');
    // Prefill phone for restricted roles
    const fixedCred = FIXED_CREDENTIALS[roleId];
    if (fixedCred && fixedCred.requiresPin) {
      setPhone(fixedCred.phone);
      setName(fixedCred.name);
    } else {
      setPhone('');
      setName('');
    }
  };

  const handleForceReleaseAndLogin = async () => {
    if (!pin) {
      setErrorMessage('Please enter the Admin Security PIN to verify your identity and reclaim the session.');
      return;
    }
    setIsUnlocking(true);
    setErrorMessage('');
    try {
      const releaseRes = await forceReleaseAdminLock({ pin });
      if (!releaseRes.success) {
        setErrorMessage(releaseRes.message || 'Failed to release admin session lock.');
      } else {
        setIsAdminLocked(false);
        const selectedVillage = WEST_BENGAL_VILLAGES.find(v => v.id === villageId) || { name: 'Gosaba Island (Rangabelia)' };
        const res = await loginWithPhone({
          phone: phone.replace(/\D/g, ''),
          pin,
          role: selectedRole,
          name: name.trim() || selectedRoleObj.label,
          villageId,
          villageName: selectedVillage.name,
        });
        if (res.success) {
          navigate('/admin');
        } else {
          setErrorMessage(res.message || 'Login failed after session release.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error releasing session.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsAdminLocked(false);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setIsSubmitting(true);

    const selectedVillage = WEST_BENGAL_VILLAGES.find(v => v.id === villageId) || { name: 'Gosaba Island (Rangabelia)' };

    try {
      const res = await loginWithPhone({
        phone: cleanPhone,
        pin: pin || '',
        role: selectedRole,
        name: name.trim() || selectedRoleObj.label,
        villageId,
        villageName: selectedVillage.name
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please check your credentials.');
        if (res.isUnregistered) {
          setIsUnregistered(true);
        }
        if (res.isAdminLocked) {
          setIsAdminLocked(true);
        }
      } else {
        // Direct navigation to authenticated portal
        if (selectedRole === ROLES.ADMIN || selectedRole === ROLES.OFFICIAL) {
          navigate('/admin');
        } else if (selectedRole === ROLES.ASHA) {
          navigate('/asha');
        } else if (selectedRole === ROLES.HYGIENE) {
          navigate('/hygiene');
        } else {
          navigate('/villagers');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error connecting to database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-cyan-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-3xl animate-float-slow-reverse" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-teal-500/5 blur-3xl animate-pulse-slow" />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative max-w-xl w-full mx-auto space-y-6">
        {/* National Portal Brand Header */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 transition backdrop-blur-sm shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] text-sky-200 text-3xs font-semibold shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ministry of Jal Shakti • SIH 2026</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/30 ring-2 ring-white/10">
              <Droplets className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">NeerSense</h1>
              <p className="text-xs text-cyan-300/80 font-medium -mt-0.5">नीरसेंस</p>
            </div>
          </div>
          <p className="text-sm text-sky-200/80 font-medium max-w-md mx-auto">
            Unified Water-Borne Disease Surveillance & Early Warning Portal
          </p>
        </div>

        {/* Switcher: Registered Login vs First-Timer Sign In */}
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 flex items-center gap-2">
          <div className="flex-1 py-2 text-center text-xs font-extrabold text-white bg-sky-600 rounded-xl shadow-md">
            🔑 Registered Personnel Login
          </div>
          <Link
            to="/first-time-signin"
            className="flex-1 py-2 text-center text-xs font-bold text-sky-200 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            ✨ First-Timer Sign In / Register →
          </Link>
        </div>

        {/* Main Login Card */}
        <div className="bg-white/[0.95] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 border border-white/50 overflow-hidden animate-slide-up">
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-sky-50 via-cyan-50/50 to-sky-50 px-6 py-4 border-b border-sky-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-sky-950">Signed Personnel Login</h2>
              <p className="text-xs text-sky-700">Enter registered mobile number and security PIN</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-900 text-2xs font-bold uppercase tracking-wider border border-sky-200/60 shadow-sm">
              {selectedRoleObj.badge}
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* 1. Role Selection Grid */}
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES_LIST.map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/90 ring-2 ring-sky-400/30 shadow-md shadow-sky-200/50'
                          : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-sky-300 hover:shadow-sm text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{r.icon}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
                      </div>
                      <div className="mt-2.5">
                        <div className={`text-xs font-bold ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                          {r.label}
                        </div>
                        <div className="text-3xs text-slate-500 mt-0.5 line-clamp-2">{r.desc}</div>
                      </div>
                      {r.requiresPin && (
                        <div className="mt-2 flex items-center gap-1 text-3xs text-amber-700 font-semibold">
                          <Lock className="w-2.5 h-2.5" />
                          <span>PIN Required</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Single Admin Protocol Notice */}
            {selectedRole === ROLES.ADMIN && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2.5 text-2xs text-indigo-950 font-medium">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Strict Single-Admin Protocol:</strong> In NeerSense, strictly <strong>ONE</strong> authorized user can log in as District Admin. Additional logins are blocked while an active session exists.
                </div>
              </div>
            )}

            {/* Admin Session Lock Warning & Reclaim Box */}
            {isAdminLocked && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2.5 animate-shake">
                <div className="flex items-start gap-2 text-xs font-bold text-amber-950">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Admin Session Active on Another Device/Window</span>
                </div>
                <p className="text-2xs text-amber-800 leading-relaxed">
                  Only one concurrent Admin login is permitted. If you are the authorized CDMO Admin on a new device, enter your Security PIN below and reclaim the session:
                </p>
                <button
                  type="button"
                  onClick={handleForceReleaseAndLogin}
                  disabled={isUnlocking || !pin}
                  className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isUnlocking ? 'Reclaiming Admin Access...' : 'Reclaim Admin Access with Security PIN'}</span>
                </button>
              </div>
            )}

            {/* Unregistered Alert Banner */}
            {isUnregistered && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-950 space-y-2.5 shadow-sm animate-shake">
                <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Phone Number Not Registered</span>
                </div>
                <p className="text-2xs text-amber-800 leading-relaxed font-medium">
                  Mobile number <strong className="font-bold text-amber-950">+91 {phone}</strong> is not registered for <strong>{selectedRoleObj.label}</strong>. Please register this phone number first to create your personnel credentials.
                </p>
                <div className="pt-1">
                  <Link
                    to={selectedRole === ROLES.VILLAGER ? `/villagers/signup?phone=${phone}` : `/health/signup?role=${selectedRole}&phone=${phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Register This Phone Number Now &rarr;</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Verified Registered User Banner */}
            {lookupStatus === 'registered' && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-2.5 text-xs animate-fade-in shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="leading-tight">
                  <span className="font-bold text-emerald-900">
                    {registeredUserInfo?.name ? `Account recognized: ${registeredUserInfo.name}` : 'Registered Account Recognized'}
                  </span>
                  <p className="text-3xs text-emerald-700 mt-0.5">
                    {selectedRoleObj.requiresPin ? 'Enter your Security PIN below to log in.' : 'Click Log In to continue.'}
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && !isUnregistered && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1.5 animate-shake shadow-sm">
                <div className="text-xs text-red-700 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
                <div className="text-2xs text-red-800 pl-6">
                  First time accessing NeerSense?{' '}
                  <Link to={`/health/signup?role=${selectedRole}&phone=${phone}`} className="font-bold underline text-sky-800 hover:text-sky-950">
                    Sign in & register your personnel account here →
                  </Link>
                </div>
              </div>
            )}

            {/* 2. Phone Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      setIsUnregistered(false);
                      setErrorMessage('');
                    }}
                    placeholder="Enter 10-digit number"
                    required
                    className={`w-full pl-12 pr-10 py-3 text-sm border-2 rounded-xl focus:ring-2 outline-none font-semibold text-slate-900 transition-all ${
                      isUnregistered
                        ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200 bg-amber-50/20'
                        : lookupStatus === 'registered'
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200 bg-white'
                        : 'border-slate-200 focus:border-sky-500 focus:ring-sky-400/30 bg-white hover:border-sky-300'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    {lookupStatus === 'checking' ? (
                      <span className="text-2xs text-sky-600 font-bold animate-pulse">...</span>
                    ) : lookupStatus === 'registered' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isUnregistered ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Live validation feedback */}
                {lookupStatus === 'checking' && (
                  <p className="text-3xs text-sky-700 flex items-center gap-1 font-medium animate-pulse mt-1">
                    <span>Checking database registration for +91 {phone}...</span>
                  </p>
                )}
                {isUnregistered && (
                  <p className="text-3xs text-amber-700 flex items-center justify-between font-bold mt-1">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Number not registered yet.
                    </span>
                    <Link
                      to={selectedRole === ROLES.VILLAGER ? `/villagers/signup?phone=${phone}` : `/health/signup?role=${selectedRole}&phone=${phone}`}
                      className="underline text-amber-800 hover:text-amber-950 font-extrabold"
                    >
                      Click here to register &rarr;
                    </Link>
                  </p>
                )}
                {lookupStatus === 'registered' && (
                  <p className="text-3xs text-emerald-700 flex items-center gap-1 font-semibold mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified registered phone number</span>
                  </p>
                )}
              </div>

              {/* Name / Identification — shown only for Villager */}
              {selectedRole === ROLES.VILLAGER && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400/30 focus:border-sky-500 outline-none text-slate-900 transition-all hover:border-sky-300"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Security PIN / Password — shown for restricted roles */}
              {selectedRoleObj.requiresPin && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Security PIN <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSetPinModal(true)}
                      className="text-2xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer hover:underline transition"
                      title="Set or reset your personnel security PIN"
                    >
                      <KeyRound className="w-3 h-3 text-sky-500" />
                      <span>Set / Change PIN</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter your security PIN"
                      required
                      className="w-full pl-10 pr-10 py-3 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400/30 focus:border-sky-500 outline-none text-slate-900 font-mono tracking-widest transition-all hover:border-sky-300"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-3xs text-slate-500 px-0.5">
                    <span>Stored securely in NeerSense Database</span>
                    <button
                      type="button"
                      onClick={() => setShowSetPinModal(true)}
                      className="text-sky-600 hover:text-sky-800 font-semibold underline cursor-pointer"
                    >
                      Forgot / Set new PIN?
                    </button>
                  </div>
                </div>
              )}

              {/* Assigned Village (if Villager or ASHA) */}
              {(selectedRole === ROLES.VILLAGER || selectedRole === ROLES.ASHA) && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Assigned Village / Gram Panchayat
                  </label>
                  <div className="relative">
                    <select
                      value={villageId}
                      onChange={(e) => setVillageId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400/30 focus:border-sky-500 outline-none text-slate-900 bg-white transition-all hover:border-sky-300"
                    >
                      {WEST_BENGAL_VILLAGES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.district})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2.5 cursor-pointer mt-3 hover:shadow-xl hover:shadow-sky-600/30 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Sign In to {selectedRoleObj.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="bg-gradient-to-r from-slate-50 to-sky-50/50 px-6 py-3 border-t border-slate-200 text-center text-3xs text-slate-500">
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-sky-600" />
              <span>Authenticated sessions & credentials are recorded in the NeerSense Secure Database.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Set / Change PIN Modal */}
      <ChangePinModal
        isOpen={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        initialRole={selectedRole}
        initialPhone={phone}
        initialMode="set"
        onSuccess={(newPin) => {
          setPin(newPin);
          setErrorMessage('');
        }}
      />
    </div>
  );
}
