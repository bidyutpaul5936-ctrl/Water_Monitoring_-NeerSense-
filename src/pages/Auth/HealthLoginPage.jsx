import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Droplets,
  Activity,
  BookOpen,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuthRole, ROLES, FIXED_CREDENTIALS } from '../../contexts/AuthRoleContext';
import ChangePinModal from '../../components/ChangePinModal';

const HEALTH_ROLES = [
  {
    id: ROLES.ASHA,
    label: 'ASHA Field Worker',
    labelHi: 'आशा कार्यकर्ता',
    icon: '👩‍⚕️',
    badge: 'Field Surveillance',
    color: 'sky',
    desc: 'Enter field water testing data, record H2S vial tests, and triage patient symptom cases.',
  },
  {
    id: ROLES.HYGIENE,
    label: 'Hygiene & Sanitation Dept',
    labelHi: 'स्वच्छता विभाग',
    icon: '👩‍🔬',
    badge: 'Lab & Verification',
    color: 'teal',
    desc: 'Review microbiological readings, verify safety classifications, and issue water advisories.',
  },
];

export default function HealthLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');

  const { loginWithPhone } = useAuthRole();

  const [selectedRole, setSelectedRole] = useState(
    requestedRole === ROLES.HYGIENE ? ROLES.HYGIENE : ROLES.ASHA
  );
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSetPinModal, setShowSetPinModal] = useState(false);

  // Auto-fill role default credentials when toggling roles
  useEffect(() => {
    const fixedCred = FIXED_CREDENTIALS[selectedRole];
    if (fixedCred) {
      setPhone(fixedCred.phone || '');
    }
    setErrorMessage('');
  }, [selectedRole]);

  const selectedRoleObj = HEALTH_ROLES.find(r => r.id === selectedRole) || HEALTH_ROLES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (!pin) {
      setErrorMessage('Please enter your Security PIN.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fixedCred = FIXED_CREDENTIALS[selectedRole];
      const result = await loginWithPhone({
        phone: cleanPhone,
        pin,
        role: selectedRole,
        name: fixedCred?.name || (selectedRole === ROLES.ASHA ? 'ASHA Field Worker' : 'Hygiene Officer'),
      });

      if (result.success) {
        if (selectedRole === ROLES.ASHA) {
          navigate('/asha');
        } else {
          navigate('/hygiene');
        }
      } else {
        setErrorMessage(result.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 flex items-center justify-center bg-gradient-to-br from-sky-50 via-teal-50 to-blue-50">
      <div className="w-full max-w-lg">
        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-sky-200 shadow-2xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-teal-800 text-white p-6 sm:p-7 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              <Activity className="w-7 h-7 text-sky-200" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-100 text-2xs font-extrabold uppercase tracking-wider border border-white/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>National Rural Health & Sanitation Mission</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Health & Field Staff Portal Login
            </h1>
            <p className="text-xs text-sky-100/80 mt-1">
              स्वास्थ्य एवं स्वच्छता विभाग लॉगिन (ASHA & Hygiene Surveillance)
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* 1. ROLE CHOOSER: STRICTLY ASHA & HYGIENE ONLY */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Choose Your Health Department Role:
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
                          ? 'border-sky-600 bg-sky-50/80 ring-2 ring-sky-400 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{r.icon}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
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
                      <div className="mt-2 pt-2 border-t border-slate-100 text-3xs font-bold text-sky-700">
                        {r.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Description Notice */}
            <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-sky-900 leading-relaxed">
              <strong className="font-bold">{selectedRoleObj.label}:</strong> {selectedRoleObj.desc}
            </div>

            {/* 2. LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Mobile Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-wider bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  />
                </div>
              </div>

              {/* Security PIN Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Security PIN <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSetPinModal(true)}
                    className="text-2xs font-semibold text-sky-700 hover:text-sky-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Change PIN</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter Security PIN"
                    maxLength={8}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer active:scale-[0.99]"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying...' : `Log In as ${selectedRoleObj.label}`}</span>
              </button>
            </form>

            {/* Unlinked: Links ONLY to /health/signup, strictly NO Admin or Villager links */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                First time logging in as an ASHA worker or Hygiene officer?
              </p>
              <Link
                to={`/health/signup?role=${selectedRole}`}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-sky-700 hover:text-sky-900 mt-1 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>First-Timer Sign Up / Personnel Registration →</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Change Security PIN Modal */}
        <ChangePinModal
          isOpen={showSetPinModal}
          onClose={() => setShowSetPinModal(false)}
        />
      </div>
    </div>
  );
}
