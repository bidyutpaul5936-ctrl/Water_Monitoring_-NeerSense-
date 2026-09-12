import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Droplets,
  ShieldCheck,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';
import { WEST_BENGAL_VILLAGES } from '../../utils/westBengalVillages';

const ONBOARDING_ROLES = [
  {
    id: ROLES.ASHA,
    label: 'ASHA Field Worker',
    labelHi: 'आशा कार्यकर्ता',
    icon: '👩‍⚕️',
    badge: 'Healthcare Surveillance',
    color: 'sky',
    desc: 'Conduct field water testing, log H2S vial test results, and monitor village disease symptoms.',
    requiresPin: true,
  },
  {
    id: ROLES.HYGIENE,
    label: 'Hygiene & Sanitation Dept',
    labelHi: 'स्वच्छता विभाग',
    icon: '👩‍🔬',
    badge: 'Lab & Quality Control',
    color: 'teal',
    desc: 'Verify lab microbial reports, issue water safety advisories, and inspect water points.',
    requiresPin: true,
  },
  {
    id: ROLES.VILLAGER,
    label: 'Villager / Citizen',
    labelHi: 'ग्रामीण / नागरिक',
    icon: '👨‍🌾',
    badge: 'Citizen Access',
    color: 'emerald',
    desc: 'Check local drinking water safety, report water contamination, and receive alerts.',
    requiresPin: false,
  },
  {
    id: ROLES.ADMIN,
    label: 'District Admin / CDMO',
    labelHi: 'जिला स्वास्थ्य अधिकारी',
    icon: '🏛️',
    badge: 'District Authority',
    color: 'indigo',
    desc: 'Unified health command, water report approval & publishing, and sensor supervision.',
    requiresPin: true,
    requiresAdminKey: true,
  },
];

export default function FirstTimeSignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const requestedPhone = (searchParams.get('phone') || '').replace(/\D/g, '').slice(0, 10);

  const { registerPersonnel } = useAuthRole();

  const [selectedRole, setSelectedRole] = useState(
    requestedRole && Object.values(ROLES).includes(requestedRole) ? requestedRole : ROLES.ASHA
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(requestedPhone);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [villageId, setVillageId] = useState('vil-01');

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const selectedRoleObj = ONBOARDING_ROLES.find(r => r.id === selectedRole) || ONBOARDING_ROLES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (selectedRoleObj.requiresPin) {
      if (!pin || pin.length < 4) {
        setErrorMessage('Security PIN must be at least 4 digits or characters long.');
        return;
      }
      if (pin !== confirmPin) {
        setErrorMessage('Security PIN and Confirm PIN do not match.');
        return;
      }
    }

    if (selectedRoleObj.requiresAdminKey) {
      if (adminKey !== 'NEER-ADMIN-2026' && adminKey !== '1234') {
        setErrorMessage('Invalid Admin Authorization Code. CDMO Admin registration requires valid government clearance.');
        return;
      }
    }

    setIsSubmitting(true);

    const selectedVillage = WEST_BENGAL_VILLAGES.find(v => v.id === villageId) || { name: 'Gosaba Island (Rangabelia)' };

    try {
      const res = await registerPersonnel({
        name: name.trim(),
        phone: cleanPhone,
        role: selectedRole,
        pin: selectedRoleObj.requiresPin ? pin : '1234',
        villageId,
        villageName: selectedVillage.name,
        adminKey,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed. Please check your information.');
      } else {
        setSuccessMessage('🎉 First-time sign in successful! Credentials registered in database. Redirecting to your portal...');
        setTimeout(() => {
          if (selectedRole === ROLES.ADMIN || selectedRole === ROLES.OFFICIAL) {
            navigate('/admin');
          } else if (selectedRole === ROLES.ASHA) {
            navigate('/asha');
          } else if (selectedRole === ROLES.HYGIENE) {
            navigate('/hygiene');
          } else {
            navigate('/villagers');
          }
        }, 1500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-3xl animate-float-slow-reverse" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative max-w-2xl w-full mx-auto space-y-6">
        {/* Navigation & Government Header */}
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 transition backdrop-blur-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] text-sky-200 text-3xs font-semibold shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ministry of Jal Shakti • SIH 2026</span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                First-Time Personnel Sign In
              </h1>
              <p className="text-xs text-cyan-300/80 font-medium">
                Create & store your personnel credentials directly in the NeerSense Database
              </p>
            </div>
          </div>
        </div>

        {/* Switcher Card: Login vs First-Timer */}
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 flex items-center gap-2">
          <Link
            to="/login"
            className="flex-1 py-2 text-center text-xs font-bold text-sky-200 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            🔑 Registered Personnel Login
          </Link>
          <div className="flex-1 py-2 text-center text-xs font-extrabold text-white bg-sky-600 rounded-xl shadow-md">
            ✨ First-Timer Sign In / Register
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-950/40 border-2 border-white/30 overflow-hidden">
          {/* Top Role Selector */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/70">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Step 1: Select Your Department Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ONBOARDING_ROLES.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.id);
                      setErrorMessage('');
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/80 shadow-md ring-2 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <span className="text-2xl mb-1.5 block">{r.icon}</span>
                      <div className="text-xs font-extrabold text-slate-900 leading-tight">
                        {r.label}
                      </div>
                      <div className="text-3xs text-slate-400 font-medium mt-0.5">
                        {r.labelHi}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-2 text-3xs font-bold text-sky-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-sky-600" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-2xs text-slate-600 mt-3 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>{selectedRoleObj.desc}</span>
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Alert Messages */}
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {selectedRole === ROLES.ADMIN ? (
                <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl space-y-3 text-center animate-fade-in">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-extrabold text-indigo-950">
                    Sole District Admin Account Already Claimed
                  </div>
                  <p className="text-xs text-indigo-800 leading-relaxed max-w-md mx-auto">
                    In NeerSense, there is strictly only <strong>ONE</strong> authorized District Admin / CDMO user. Once an Admin is registered, any additional admin registration or login by other users is blocked.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/login?role=admin"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Proceed to Authorized Admin Login →</span>
                    </Link>
                  </div>
                </div>
              ) : (
              <div className="space-y-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Step 2: Enter Personnel Details
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Full Name / Designation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        selectedRole === ROLES.ASHA
                          ? 'e.g. Smt. Kuni Majhi (ASHA)'
                          : selectedRole === ROLES.HYGIENE
                          ? 'e.g. Dr. Meena Kumari (Hygiene Inspector)'
                          : selectedRole === ROLES.ADMIN
                          ? 'e.g. Dr. Suresh Mishra (CDMO)'
                          : 'e.g. Ramesh Chandra Mondal'
                      }
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-sky-500 outline-none text-slate-900 transition hover:border-sky-300"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Registered Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-sky-500 outline-none text-slate-900 font-mono transition hover:border-sky-300"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-3xs text-slate-500">
                    This number will serve as your unique personnel login identifier in the database.
                  </p>
                </div>

                {/* Village / Gram Panchayat (for ASHA or Villagers) */}
                {(selectedRole === ROLES.ASHA || selectedRole === ROLES.VILLAGER) && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Assigned Village / Gram Panchayat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={villageId}
                        onChange={(e) => setVillageId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border-2 border-slate-200 rounded-xl focus:border-sky-500 outline-none text-slate-900 bg-white transition hover:border-sky-300"
                      >
                        {WEST_BENGAL_VILLAGES.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.district})
                          </option>
                        ))}
                      </select>
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Admin Clearance Code */}
                {selectedRoleObj.requiresAdminKey && (
                  <div className="p-3.5 bg-amber-50 border-2 border-amber-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>District Health Admin Clearance Required</span>
                    </div>
                    <p className="text-2xs text-amber-800">
                      Only one administrative super-user account is authorized for District CDMO command.
                    </p>
                    <input
                      type="password"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      placeholder="Enter Admin Authorization Key (e.g. NEER-ADMIN-2026)"
                      required
                      className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl bg-white focus:border-amber-500 outline-none text-slate-900"
                    />
                  </div>
                )}

                {/* Security PIN Setup */}
                {selectedRoleObj.requiresPin && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        Create Your Security PIN <span className="text-red-500">*</span>
                      </label>
                      <span className="text-3xs text-slate-400">(minimum 4 characters)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* PIN Input */}
                      <div className="relative">
                        <input
                          type={showPin ? 'text' : 'password'}
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="Create 4+ digit PIN"
                          minLength={4}
                          required
                          className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-sky-500 outline-none text-slate-900 font-mono tracking-widest transition hover:border-sky-300"
                        />
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Confirm PIN Input */}
                      <div className="relative">
                        <input
                          type={showConfirmPin ? 'text' : 'password'}
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                          placeholder="Confirm your PIN"
                          required
                          className={`w-full pl-10 pr-10 py-2.5 text-sm border-2 rounded-xl focus:border-sky-500 outline-none text-slate-900 font-mono tracking-widest transition ${
                            confirmPin && pin !== confirmPin
                              ? 'border-red-300 bg-red-50/30'
                              : confirmPin && pin === confirmPin
                              ? 'border-emerald-400 bg-emerald-50/20'
                              : 'border-slate-200 hover:border-sky-300'
                          }`}
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPin(!showConfirmPin)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* PIN Confirmation feedback */}
                    {confirmPin && pin !== confirmPin && (
                      <p className="text-2xs text-red-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> PINs do not match
                      </p>
                    )}
                    {confirmPin && pin === confirmPin && (
                      <p className="text-2xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> PIN confirmed
                      </p>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Submit CTA */}
              {selectedRole !== ROLES.ADMIN && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Registering in Database...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Complete First-Time Sign In & Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              Credentials are saved in the Realtime Database for all future sessions.
            </span>
            <Link
              to="/login"
              className="text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer"
            >
              Already registered? Log in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
