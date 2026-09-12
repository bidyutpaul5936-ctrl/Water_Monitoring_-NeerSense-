import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Phone,
  LogIn,
  ArrowLeft,
  Bell,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  UserCheck,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';
import { ref, get } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { rtdb, db } from '../../services/firebase';

export default function VillagerLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryPhone = (searchParams.get('phone') || '').replace(/\D/g, '').slice(0, 10);
  const { loginWithPhone } = useAuthRole();

  const [phone, setPhone] = useState(queryPhone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUnregistered, setIsUnregistered] = useState(false);
  const [lookupStatus, setLookupStatus] = useState(null); // null | 'checking' | 'registered' | 'unregistered'
  const [registeredCitizen, setRegisteredCitizen] = useState(null);

  // Helper to fetch citizen record from RTDB / Firestore / local storage
  const findCitizenRecord = async (cleanPhone) => {
    // 1. RTDB
    if (rtdb) {
      try {
        const snap = await Promise.race([
          get(ref(rtdb, `citizens/${cleanPhone}`)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
        ]).catch(() => null);
        if (snap && snap.exists()) return snap.val();

        const vSnap = await Promise.race([
          get(ref(rtdb, `villagers/${cleanPhone}`)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
        ]).catch(() => null);
        if (vSnap && vSnap.exists()) return vSnap.val();
      } catch {}
    }
    // 2. Firestore
    if (db) {
      try {
        const snap = await Promise.race([
          getDoc(doc(db, 'citizens', cleanPhone)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
        ]).catch(() => null);
        if (snap && snap.exists()) return snap.data();
      } catch {}
    }
    // 3. LocalStorage
    try {
      const raw = localStorage.getItem(`citizen_${cleanPhone}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };

  // Live lookup when 10 digits are typed
  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setLookupStatus(null);
      setRegisteredCitizen(null);
      setIsUnregistered(false);
      return;
    }

    let active = true;
    const runCheck = async () => {
      setLookupStatus('checking');
      try {
        const record = await findCitizenRecord(cleanPhone);
        if (!active) return;
        if (record) {
          setLookupStatus('registered');
          setRegisteredCitizen(record);
          setIsUnregistered(false);
          setErrorMessage('');
        } else {
          setLookupStatus('unregistered');
          setRegisteredCitizen(null);
          setIsUnregistered(true);
        }
      } catch {
        if (active) setLookupStatus(null);
      }
    };

    const timer = setTimeout(runCheck, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [phone]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      let citizenRecord = null;

      // 1. Try to fetch from Firebase Realtime Database (neersense-1)
      if (rtdb) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('RTDB lookup timeout')), 3000)
          );
          const snap = await Promise.race([
            get(ref(rtdb, `citizens/${cleanPhone}`)),
            timeoutPromise
          ]);
          if (snap && snap.exists()) {
            citizenRecord = snap.val();
          } else {
            const vSnap = await Promise.race([
              get(ref(rtdb, `villagers/${cleanPhone}`)),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
            ]).catch(() => null);
            if (vSnap && vSnap.exists()) citizenRecord = vSnap.val();
          }
        } catch (rtdbErr) {
          console.warn('[NeerSense RTDB] Login lookup note:', rtdbErr.message);
        }
      }

      // 2. Fallback to Firestore (neersense-1)
      if (!citizenRecord && db) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore lookup timeout')), 3000)
          );
          const snap = await Promise.race([
            getDoc(doc(db, 'citizens', cleanPhone)),
            timeoutPromise
          ]);
          if (snap && snap.exists()) {
            citizenRecord = snap.data();
          } else {
            const vSnap = await Promise.race([
              getDoc(doc(db, 'villagers', cleanPhone)),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
            ]).catch(() => null);
            if (vSnap && vSnap.exists()) citizenRecord = vSnap.data();
          }
        } catch {}
      }

      // 3. Fallback to localStorage
      if (!citizenRecord) {
        try {
          const raw = localStorage.getItem(`citizen_${cleanPhone}`);
          if (raw) citizenRecord = JSON.parse(raw);
        } catch {}
      }

      if (!citizenRecord) {
        setErrorMessage(
          'No registration found for this phone number. Please sign up first.'
        );
        setIsSubmitting(false);
        return;
      }

      // Log in using the existing villager session
      if (loginWithPhone) {
        await loginWithPhone({
          phone: cleanPhone,
          name: citizenRecord.name || 'Citizen User',
          villageId: citizenRecord.villageId || 'vil-wb-01',
          villageName: citizenRecord.villageName || 'Gosaba Island',
          role: ROLES.VILLAGER,
        });
      }

      navigate('/villagers/alerts');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-sky-50 to-teal-50">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/villagers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs hover:shadow-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Villagers Home</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-emerald-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700 text-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner flex-shrink-0">
                <LogIn className="w-6 h-6 text-emerald-100" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-3xs font-extrabold uppercase tracking-wider border border-emerald-400/40 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Returning Citizen</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  Login to View Alerts
                </h1>
                <p className="text-xs text-emerald-100/90 mt-1">
                  Enter your registered phone number to access your water alert notifications
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
            {/* Unregistered Alert Card */}
            {isUnregistered && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-950 space-y-2.5 animate-shake shadow-sm">
                <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Phone Number Not Registered</span>
                </div>
                <p className="text-2xs text-amber-800 leading-relaxed font-medium">
                  Mobile number <strong className="font-bold text-amber-950">{phone}</strong> is not registered for Village Water Alerts yet. Please sign up your number to receive emergency drinking water advisories.
                </p>
                <div className="pt-1">
                  <Link
                    to={`/villagers/signup?phone=${phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sign Up This Phone Number Now &rarr;</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Recognized Citizen Banner */}
            {lookupStatus === 'registered' && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-2.5 text-xs animate-fade-in shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="leading-tight">
                  <span className="font-bold text-emerald-900">
                    Registered: {registeredCitizen?.name || 'Citizen User'}
                  </span>
                  <p className="text-3xs text-emerald-700 mt-0.5">
                    Village: {registeredCitizen?.villageName || 'Registered Village'}
                  </p>
                </div>
              </div>
            )}

            {errorMessage && !isUnregistered && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Mobile Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="villager-login-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  required
                  className={`w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-wider bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 transition ${
                    isUnregistered
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200 bg-amber-50/20'
                      : lookupStatus === 'registered'
                      ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
              </div>
              {/* Live validation caption */}
              {lookupStatus === 'checking' && (
                <p className="text-3xs text-sky-600 mt-1 animate-pulse">
                  Checking registration status...
                </p>
              )}
              {lookupStatus === 'unregistered' && (
                <div className="mt-1.5 flex items-center justify-between text-2xs text-amber-700 font-semibold">
                  <span>⚠️ Number not registered</span>
                  <Link
                    to={`/villagers/signup?phone=${phone}`}
                    className="underline font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    Click to sign up &rarr;
                  </Link>
                </div>
              )}
              {lookupStatus === 'registered' && (
                <p className="text-3xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Found: {registeredCitizen?.name} ({registeredCitizen?.villageName})</span>
                </p>
              )}
              {!lookupStatus && (
                <p className="text-3xs text-slate-500 mt-1">
                  Use the same 10-digit number you registered with during Sign Up.
                </p>
              )}
            </div>

            {/* Hint */}
            <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200 flex items-start gap-2 text-xs text-sky-800">
              <MapPin className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
              <span>
                Your village and alert preferences will be loaded automatically from your registration record.
              </span>
            </div>

            {/* Submit */}
            <button
              id="villager-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer active:scale-[0.99]"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging In...' : 'Login & View My Alerts'}</span>
            </button>

            {/* Switch to Sign Up */}
            <div className="text-center pt-1 border-t border-slate-100 space-y-1.5">
              <p className="text-2xs text-slate-500">New to NeerSense?</p>
              <Link
                to="/villagers/signup"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
              >
                <Bell className="w-3.5 h-3.5" />
                Sign Up for Free Water Alerts
              </Link>
            </div>
          </form>
        </div>

        {/* Info note */}
        <div className="mt-4 text-center text-2xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
          No password needed — your phone number is your identity. Free service.
        </div>
      </div>
    </div>
  );
}
