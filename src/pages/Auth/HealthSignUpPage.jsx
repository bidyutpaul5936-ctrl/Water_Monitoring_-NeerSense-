import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Droplets,
  Activity,
  BookOpen,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';
import { WEST_BENGAL_VILLAGES } from '../../utils/westBengalVillages';

const HEALTH_ROLES = [
  {
    id: ROLES.ASHA,
    label: 'ASHA Field Worker',
    labelHi: 'आशा कार्यकर्ता',
    icon: '👩‍⚕️',
    badge: 'Field Surveillance',
    desc: 'Conduct field water testing, log H2S vial test results, and monitor village disease symptoms.',
  },
  {
    id: ROLES.HYGIENE,
    label: 'Hygiene & Sanitation Dept',
    labelHi: 'स्वच्छता विभाग',
    icon: '👩‍🔬',
    badge: 'Lab & Verification',
    desc: 'Verify lab microbiological reports, issue water safety advisories, and inspect water points.',
  },
];

export default function HealthSignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const requestedPhone = (searchParams.get('phone') || '').replace(/\D/g, '').slice(0, 10);

  const { registerPersonnel } = useAuthRole();

  const [selectedRole, setSelectedRole] = useState(
    requestedRole === ROLES.HYGIENE ? ROLES.HYGIENE : ROLES.ASHA
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(requestedPhone);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [villageId, setVillageId] = useState('vil-wb-01');

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const selectedRoleObj = HEALTH_ROLES.find(r => r.id === selectedRole) || HEALTH_ROLES[0];
  const selectedVillageObj = WEST_BENGAL_VILLAGES.find(v => v.id === villageId) || WEST_BENGAL_VILLAGES[0];

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

    if (!pin || pin.length < 4) {
      setErrorMessage('Security PIN must be at least 4 digits long.');
      return;
    }

    if (pin !== confirmPin) {
      setErrorMessage('Security PIN and confirmation PIN do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerPersonnel({
        phone: cleanPhone,
        pin: pin.trim(),
        role: selectedRole,
        name: name.trim(),
        villageId: selectedVillageObj.id,
        villageName: selectedVillageObj.name,
      });

      if (result.success) {
        setSuccessMessage(`Personnel account created successfully for ${name.trim()}! Redirecting to login...`);
        setTimeout(() => {
          navigate(`/health/login?role=${selectedRole}`);
        }, 1500);
      } else {
        setErrorMessage(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 flex items-center justify-center bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50">
      <div className="w-full max-w-lg">
        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-teal-200 shadow-2xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-700 via-sky-800 to-blue-800 text-white p-6 sm:p-7 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              <Sparkles className="w-7 h-7 text-teal-200" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-2xs font-extrabold uppercase tracking-wider border border-white/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>Healthcare & Sanitation Onboarding</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Health Staff First-Time Sign Up
            </h1>
            <p className="text-xs text-teal-100/80 mt-1">
              आशा एवं स्वच्छता विभाग पंजीकरण (Set Security PIN & Activate Desk)
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* 1. ROLE CHOOSER: STRICTLY ASHA & HYGIENE ONLY */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Choose Your Role for Registration:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {HEALTH_ROLES.map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r.id);
                        setErrorMessage('');
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-400 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{r.icon}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 leading-snug">
                          {r.label}
                        </div>
                        <div className="text-3xs font-semibold text-slate-500 mt-0.5">
                          {r.labelHi}
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 text-3xs font-bold text-teal-700">
                        {r.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Officer / Personnel Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === ROLES.ASHA ? 'e.g. Kuni Majhi' : 'e.g. Dr. Meena Kumari'}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  10-Digit Official Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543211"
                    maxLength={10}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-wider bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                  />
                </div>
              </div>

              {/* Assigned Village / Sub-Center */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Sub-Center / Gram Panchayat <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={villageId}
                    onChange={(e) => setVillageId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                  >
                    {WEST_BENGAL_VILLAGES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} - {v.district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Set PIN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Set Security PIN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="4-6 digits"
                      maxLength={6}
                      required
                      className="w-full px-3 py-2.5 text-sm font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm PIN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Confirm PIN"
                      maxLength={6}
                      required
                      className="w-full px-3 py-2.5 text-sm font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : `Complete Registration & Set PIN`}</span>
              </button>
            </form>

            {/* Unlinked: Links ONLY to /health/login */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already registered with your department?
              </p>
              <Link
                to={`/health/login?role=${selectedRole}`}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-teal-700 hover:text-teal-900 mt-1 hover:underline cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                <span>Health Staff Portal Login →</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
