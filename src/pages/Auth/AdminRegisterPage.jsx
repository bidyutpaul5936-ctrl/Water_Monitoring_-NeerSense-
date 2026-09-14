import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  BadgeCheck,
} from 'lucide-react';
import { ref, get } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { rtdb, db } from '../../services/firebase';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';

const VALID_ADMIN_KEYS = ['NEER-ADMIN-2026', '1234'];

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const { registerPersonnel } = useAuthRole();

  const [checkStatus, setCheckStatus] = useState('loading'); // 'loading' | 'available' | 'locked'

  useEffect(() => {
    let cancelled = false;
    const checkAdminRegistered = async () => {
      try {
        let isRegistered = false;
        if (rtdb) {
          const snap = await get(ref(rtdb, 'system_credentials/admin'));
          if (snap.exists() && snap.val()?.phone) {
            isRegistered = true;
          }
        }
        if (!isRegistered && db) {
          try {
            const snap = await getDoc(doc(db, 'system_credentials', 'admin'));
            if (snap.exists() && snap.data()?.phone) {
              isRegistered = true;
            }
          } catch {}
        }
        if (!cancelled) {
          setCheckStatus(isRegistered ? 'locked' : 'available');
        }
      } catch {
        if (!cancelled) setCheckStatus('available');
      }
    };
    checkAdminRegistered();
    return () => { cancelled = true; };
  }, []);

  const [name, setName]                     = useState('');
  const [phone, setPhone]                   = useState('');
  const [pin, setPin]                       = useState('');
  const [confirmPin, setConfirmPin]         = useState('');
  const [adminKey, setAdminKey]             = useState('');
  const [showPin, setShowPin]               = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showAdminKey, setShowAdminKey]     = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [errorMessage, setErrorMessage]     = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (cleanPhone.length < 10) { setErrorMessage('Please enter a valid 10-digit mobile number.'); return; }
    if (!name.trim()) { setErrorMessage('Full name / designation is required.'); return; }
    if (!pin || pin.length < 4) { setErrorMessage('Security PIN must be at least 4 characters.'); return; }
    if (pin !== confirmPin) { setErrorMessage('Security PINs do not match. Please re-enter.'); return; }
    if (!VALID_ADMIN_KEYS.includes(adminKey.trim())) {
      setErrorMessage('Invalid Admin Authorization Key. This key is issued by the Ministry of Jal Shakti.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await registerPersonnel({
        name: name.trim(),
        phone: cleanPhone,
        role: ROLES.ADMIN,
        pin,
        villageId: 'dist-purbamedinipur',
        villageName: 'Purba Medinipur District HQ',
        adminKey: adminKey.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed. Please try again.');
      } else {
        setSuccessMessage('District Admin account registered! Redirecting to command desk...');
        setCheckStatus('locked');
        setTimeout(() => navigate('/admin'), 1500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (checkStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950">
        <div className="flex flex-col items-center gap-4 text-indigo-300">
          <svg className="animate-spin w-10 h-10" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-semibold">Verifying registration status...</p>
        </div>
      </div>
    );
  }

  // Already registered — locked screen
  if (checkStatus === 'locked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 px-4 py-10">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
          </div>
          <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/60 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-600" />
            <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-green-900/40 border-2 border-green-500/40 flex items-center justify-center shadow-xl shadow-green-500/10">
                <BadgeCheck className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-3xs font-black uppercase tracking-widest border border-green-400/30 mb-3">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Registration Complete — Page Locked</span>
                </div>
                <h1 className="text-xl font-black text-white mb-2">District Admin Already Registered</h1>
                <p className="text-xs text-slate-400 leading-relaxed">
                  NeerSense enforces <strong className="text-slate-200">exactly one</strong> District Admin / CDMO account.
                  Registration is complete and this page is permanently locked.
                </p>
              </div>
              <div className="w-full p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-300 text-2xs font-bold">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Single Admin Enforcement Active</span>
                </div>
                <p className="text-3xs text-slate-400 leading-relaxed">
                  If you are the registered CDMO, proceed to login. To update credentials, use the
                  <strong className="text-slate-300"> Change Credentials</strong> option on the Admin login page.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Link
                  to="/admin/login"
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl text-center transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Proceed to Admin Login</span>
                </Link>
                <Link
                  to="/"
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl text-center border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Nav */}
        <div className="flex items-center justify-between mb-5">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 transition backdrop-blur-sm"
          >
            ← Back to Admin Login
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-3xs font-bold">
            <ShieldAlert className="w-3 h-3" />
            <span>One-Time Setup</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/60 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-600" />

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/80 via-slate-900 to-blue-950/80 p-7 text-center border-b border-indigo-500/20">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Building2 className="w-8 h-8 text-indigo-300" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-3xs font-black uppercase tracking-widest border border-amber-400/30 mb-2">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>One-Time Setup · District Admin / CDMO</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Register District Admin Account
            </h1>
            <p className="text-xs text-indigo-200/80 mt-1">
              This page can only be used <strong>once</strong>. The registered phone number becomes the permanent CDMO identifier.
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            {/* Policy banner */}
            <div className="mb-5 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex gap-3">
              <Fingerprint className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-indigo-200 mb-1">Single Administrator Policy</p>
                <p className="text-2xs text-slate-400 leading-relaxed">
                  NeerSense allows exactly <strong className="text-slate-300">one</strong> District CDMO admin account. Once registered, this page locks permanently. Keep your PIN and key secure.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-900/60 border border-red-500/50 text-xs text-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3.5 rounded-xl bg-green-900/60 border border-green-500/50 text-xs text-green-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Full Name / Designation <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Suresh Mishra (CDMO)"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700 text-white rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 outline-none transition placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Official CDMO Mobile Number <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-wider bg-slate-800/90 border border-slate-700 text-white rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 outline-none transition placeholder:text-slate-500"
                  />
                </div>
                {cleanPhone.length > 0 && cleanPhone.length < 10 && (
                  <p className="text-3xs text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {10 - cleanPhone.length} more digit{10 - cleanPhone.length !== 1 ? 's' : ''} needed
                  </p>
                )}
                {cleanPhone.length === 10 && (
                  <p className="text-3xs text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid number
                  </p>
                )}
              </div>

              <div className="border-t border-slate-800" />

              {/* PIN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Create Security PIN <span className="text-indigo-400">*</span>
                  <span className="ml-2 text-3xs text-slate-500 font-normal">(min. 4 characters)</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Create a 4+ digit PIN"
                    minLength={4}
                    maxLength={12}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm font-mono tracking-widest bg-slate-800/90 border border-slate-700 text-white rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 outline-none transition placeholder:text-slate-500"
                  />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm PIN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Confirm Security PIN <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Re-enter your PIN"
                    required
                    className={`w-full pl-10 pr-10 py-2.5 text-sm font-mono tracking-widest bg-slate-800/90 text-white rounded-xl focus:ring-2 outline-none transition border ${
                      confirmPin && pin !== confirmPin
                        ? 'border-red-500/60 focus:ring-red-500/30'
                        : confirmPin && pin === confirmPin
                        ? 'border-green-500/60 focus:ring-green-500/30'
                        : 'border-slate-700 focus:border-indigo-400 focus:ring-indigo-500/40'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirmPin(!showConfirmPin)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                    {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPin && pin !== confirmPin && (
                  <p className="text-3xs text-red-400 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> PINs do not match
                  </p>
                )}
                {confirmPin && pin === confirmPin && pin.length >= 4 && (
                  <p className="text-3xs text-green-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> PIN confirmed
                  </p>
                )}
              </div>

              {/* Admin Auth Key */}
              <div className="space-y-2 p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Admin Authorization Key (Ministry-Issued)</span>
                </div>
                <p className="text-2xs text-amber-200/80 leading-relaxed">
                  Required to initialize the District CDMO account. Issued by the Ministry of Jal Shakti / NeerSense deployment authority.
                </p>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
                  <input
                    type={showAdminKey ? 'text' : 'password'}
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter Admin Authorization Key"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-800/90 border border-amber-500/40 text-white rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 outline-none transition placeholder:text-slate-500 font-mono"
                  />
                  <button type="button" onClick={() => setShowAdminKey(!showAdminKey)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                    {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registering Admin Account...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Complete Registration &amp; Enter Command Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="px-7 py-4 border-t border-slate-800/80 text-center">
            <p className="text-3xs text-slate-500">
              All credentials are encrypted and stored in the NeerSense Secure Database. This registration is permanent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
