import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';
import { WEST_BENGAL_VILLAGES } from '../../utils/westBengalVillages';

const ROLES_LIST = [
  {
    id: ROLES.VILLAGER,
    label: 'Villager / Citizen',
    labelHi: 'ग्रामीण / नागरिक',
    icon: '👨‍🌾',
    badge: 'Public Access',
    color: 'emerald',
    desc: 'Check local water safety, report symptoms, and access boiling guidelines.'
  },
  {
    id: ROLES.ASHA,
    label: 'ASHA Field Worker',
    labelHi: 'आशा कार्यकर्ता',
    icon: '👩‍⚕️',
    badge: 'Field Inspection',
    color: 'sky',
    desc: 'Enter water testing field data, record H2S vial tests, and log patient cases.'
  },
  {
    id: ROLES.HYGIENE,
    label: 'Hygiene & Sanitation Dept',
    labelHi: 'स्वच्छता विभाग',
    icon: '👩‍🔬',
    badge: 'Lab & Verification',
    color: 'teal',
    desc: 'Review microbiological readings, classify water safety, and issue advisories.'
  },
  {
    id: ROLES.ADMIN,
    label: 'District Admin / CDMO',
    labelHi: 'जिला स्वास्थ्य अधिकारी',
    icon: '🏛️',
    badge: 'Official Authority',
    color: 'indigo',
    desc: 'Review classifications, verify official water reports, and publish to public portal.'
  }
];

export default function LoginPage() {
  const { loginWithPhone } = useAuthRole();

  const [selectedRole, setSelectedRole] = useState(ROLES.VILLAGER);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [villageId, setVillageId] = useState('vil-01');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedRoleObj = ROLES_LIST.find(r => r.id === selectedRole) || ROLES_LIST[0];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    // Prefill representative name based on role if blank
    if (!name) {
      if (roleId === ROLES.ASHA) setName('Kuni Majhi (ASHA-071)');
      else if (roleId === ROLES.HYGIENE) setName('Dr. Meena Kumari (Hygiene Dept)');
      else if (roleId === ROLES.ADMIN) setName('Dr. Suresh Mishra (CDMO)');
      else setName('Citizen User');
    }
  };

  const handleQuickDemo = (roleId, demoPhone, demoPin, demoName) => {
    setSelectedRole(roleId);
    setPhone(demoPhone);
    setPin(demoPin);
    setName(demoName);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

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
        pin: pin || '1234',
        role: selectedRole,
        name: name.trim() || selectedRoleObj.label,
        villageId,
        villageName: selectedVillage.name
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error connecting to database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sky-400 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-400 blur-3xl" />
      </div>

      <div className="relative max-w-xl w-full mx-auto space-y-6">
        {/* National Portal Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sky-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ministry of Jal Shakti &bull; Ministry of Health &bull; SIH 2026</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/40">
              <Droplets className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">NeerSense</h1>
          </div>
          <p className="text-sm text-sky-200 font-medium">
            Unified Water-Borne Disease Surveillance & Early Warning Portal
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-sky-100 overflow-hidden">
          {/* Header Strip */}
          <div className="bg-sky-50 px-6 py-4 border-b border-sky-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-sky-950">Role & Phone Authentication</h2>
              <p className="text-xs text-sky-700">Select your role and sign in with your phone number</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-200/80 text-sky-900 text-2xs font-bold uppercase tracking-wider">
              {selectedRoleObj.badge}
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* 1. Role Selection Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES_LIST.map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500 shadow-sm'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{r.icon}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                      </div>
                      <div className="mt-2">
                        <div className={`text-xs font-bold ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                          {r.label}
                        </div>
                        <div className="text-3xs text-slate-500 mt-0.5">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Demo Credentials Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="text-3xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick Demo Fill (One-Tap Test):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-3xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo(ROLES.VILLAGER, '9876543210', '1234', 'Ramesh Haldar (Citizen)')}
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-emerald-400 rounded text-slate-700 font-semibold text-left truncate"
                >
                  👨‍🌾 Villager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo(ROLES.ASHA, '9876543211', '5678', 'Kuni Majhi (ASHA-071)')}
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-sky-400 rounded text-slate-700 font-semibold text-left truncate"
                >
                  👩‍⚕️ ASHA Field
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo(ROLES.HYGIENE, '9876543212', '4321', 'Dr. Meena Kumari (Hygiene)')}
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-teal-400 rounded text-slate-700 font-semibold text-left truncate"
                >
                  👩‍🔬 Hygiene Dept
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo(ROLES.ADMIN, '9876543213', '1234', 'Dr. Suresh Mishra (CDMO)')}
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-400 rounded text-slate-700 font-semibold text-left truncate"
                >
                  🏛️ Govt Admin
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 2. Phone Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    required
                    className="w-full pl-12 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-semibold text-slate-900"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Name / Identification */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name / Worker Identification
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRoleObj.label}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-900"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Security PIN / Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Security PIN / Passcode
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-900"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Assigned Village (if Villager or ASHA) */}
              {(selectedRole === ROLES.VILLAGER || selectedRole === ROLES.ASHA) && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Assigned Village / Gram Panchayat
                  </label>
                  <div className="relative">
                    <select
                      value={villageId}
                      onChange={(e) => setVillageId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-900 bg-white"
                    >
                      {WEST_BENGAL_VILLAGES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.district})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span>Saving &amp; Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to {selectedRoleObj.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-3xs text-slate-500">
            Accounts are registered and stored directly into the NeerSense Realtime Database.
          </div>
        </div>
      </div>
    </div>
  );
}
