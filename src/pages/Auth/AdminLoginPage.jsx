import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  KeyRound,
  RefreshCw,
  Unlock
} from 'lucide-react';
import { useAuthRole, ROLES, FIXED_CREDENTIALS } from '../../contexts/AuthRoleContext';
import ChangePinModal from '../../components/ChangePinModal';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../services/firebase';

// Is Firebase actually reachable? Quick connectivity check
async function checkDbReachable() {
  if (!rtdb) return false;
  try {
    await get(ref(rtdb, 'system/credentials/admin/phone'));
    return true;
  } catch {
    return false;
  }
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginWithPhone, forceReleaseAdminLock } = useAuthRole();

  const [phone, setPhone] = useState(FIXED_CREDENTIALS[ROLES.ADMIN]?.phone || '9876543213');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [isUnregistered, setIsUnregistered] = useState(false);

  // Single admin status tracking
  const [isAdminLocked, setIsAdminLocked] = useState(false);
  const [activeAdminName, setActiveAdminName] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Firebase RTDB connectivity status
  const [dbStatus, setDbStatus] = useState('checking'); // 'checking' | 'connected' | 'offline'

  // Check on load if an admin session is actively running + DB connectivity
  useEffect(() => {
    let isMounted = true;

    const checkAdminSession = async () => {
      if (!rtdb) {
        if (isMounted) setDbStatus('offline');
        return;
      }
      try {
        const snap = await get(ref(rtdb, 'system/adminSession'));
        if (isMounted) {
          setDbStatus('connected');
          if (snap.exists()) {
            const data = snap.val();
            if (data.isLoggedIn) {
              setIsAdminLocked(true);
              setActiveAdminName(data.name || 'Dr. Suresh Mishra');
            } else {
              setIsAdminLocked(false);
            }
          } else {
            setIsAdminLocked(false);
          }
        }
      } catch (err) {
        if (isMounted) setDbStatus('offline');
        console.warn('Error checking admin session:', err);
      }
    };

    checkAdminSession();
    const interval = setInterval(checkAdminSession, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter the 10-digit CDMO admin phone number.');
      return;
    }

    if (!pin) {
      setErrorMessage('Administrative Security PIN is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginWithPhone({
        phone: cleanPhone,
        pin,
        role: ROLES.ADMIN,
        name: FIXED_CREDENTIALS[ROLES.ADMIN]?.name || 'Dr. Suresh Mishra (CDMO)',
      });

      if (result.success) {
        navigate('/admin');
      } else {
        if (result.isUnregistered) {
          setIsUnregistered(true);
        }
        if (result.isAdminLocked) {
          setIsAdminLocked(true);
        }
        setErrorMessage(result.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Administrative login error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceUnlock = async () => {
    if (!pin) {
      setErrorMessage('Please enter your Admin PIN to release the session lock.');
      return;
    }
    setIsUnlocking(true);
    try {
      // Pass the current PIN to validate admin authority before releasing lock
      const result = await forceReleaseAdminLock({ pin });
      if (result.success) {
        setIsAdminLocked(false);
        setErrorMessage('');
      } else {
        setErrorMessage(result.message || 'Failed to release session lock. Incorrect PIN.');
      }
    } catch (err) {
      setErrorMessage('Failed to release session lock: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-slate-100">
      <div className="w-full max-w-md">
        
        {/* Card Container */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/60 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 p-6 sm:p-7 text-center border-b border-indigo-500/20">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building2 className="w-8 h-8 text-indigo-300" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-3xs font-black uppercase tracking-widest border border-indigo-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sole Official Administrative Command</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              District Admin / CDMO Command Login
            </h1>
            <p className="text-xs text-indigo-200/80 mt-1 font-medium">
              मुख्य जिला चिकित्सा अधिकारी (CDMO) & जल शक्ति प्रशासनिक नियंत्रण
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            
            {/* Firebase Database Status Pill */}
            <div className="flex items-center justify-center gap-2 py-1 px-3 rounded-full border text-3xs font-semibold mx-auto w-fit"
              style={{
                borderColor: dbStatus === 'connected' ? '#22c55e44' : dbStatus === 'offline' ? '#ef444444' : '#6366f144',
                background: dbStatus === 'connected' ? 'rgba(34,197,94,0.08)' : dbStatus === 'offline' ? 'rgba(239,68,68,0.10)' : 'rgba(99,102,241,0.08)',
                color: dbStatus === 'connected' ? '#4ade80' : dbStatus === 'offline' ? '#f87171' : '#a5b4fc',
              }}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${dbStatus === 'connected' ? 'bg-green-400 animate-pulse' : dbStatus === 'offline' ? 'bg-red-400' : 'bg-indigo-400 animate-pulse'}`}></span>
              <span>
                {dbStatus === 'connected' ? 'Firebase Realtime Database Connected' : dbStatus === 'offline' ? 'Database Offline (Local fallback)' : 'Connecting to Database...'}
              </span>
            </div>

            {/* Authorized Officer Badge (Single Admin Enforcement) */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-800/80 flex items-center justify-center text-xl shadow-xs">
                🏛️
              </div>
              <div className="flex-1">
                <div className="text-2xs font-bold text-indigo-300 uppercase tracking-wider">
                  Designated State Authority
                </div>
                <div className="text-xs font-black text-white">
                  Dr. Suresh Mishra (CDMO)
                </div>
                <div className="text-3xs text-slate-400">
                  Health & Family Welfare &bull; Purba Medinipur
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded-full text-3xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Single Admin
                </span>
              </div>
            </div>

            {/* Active Lock Warning Banner if already in use */}
            {isAdminLocked && (
              <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500/60 space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" />
                  <span>Admin Session Active Elsewhere</span>
                </div>
                <p className="text-2xs text-red-200/90 leading-relaxed">
                  Only one administrator can log in at any given time. An active session is currently open by <strong>{activeAdminName}</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleForceUnlock}
                  disabled={isUnlocking}
                  className="w-full py-2 px-3 bg-red-800 hover:bg-red-700 text-white rounded-xl text-2xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isUnlocking ? 'Releasing Session...' : 'Emergency Session Unlock'}</span>
                </button>
              </div>
            )}

            {/* Unregistered Admin Number Warning */}
            {isUnregistered && (
              <div className="p-4 rounded-2xl bg-amber-950/90 border-2 border-amber-500/80 text-amber-100 space-y-2.5 shadow-lg animate-shake">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Unregistered Administrator Number</span>
                </div>
                <p className="text-2xs text-amber-200/90 leading-relaxed">
                  Mobile number <strong className="text-white">+91 {phone}</strong> is not registered as the District CDMO. The system strictly authorizes only ONE registered administrator account.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhone(FIXED_CREDENTIALS[ROLES.ADMIN]?.phone || '9876543213');
                      setIsUnregistered(false);
                      setErrorMessage('');
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-2xs font-black transition cursor-pointer shadow-sm"
                  >
                    Restore Official CDMO Number (+91 {FIXED_CREDENTIALS[ROLES.ADMIN]?.phone || '9876543213'})
                  </button>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && !isUnregistered && (
                <div className="p-3.5 rounded-xl bg-red-900/60 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Mobile Phone */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Designated CDMO Mobile Number <span className="text-indigo-400">*</span>
                  </label>
                  {phone.replace(/\D/g, '') !== (FIXED_CREDENTIALS[ROLES.ADMIN]?.phone || '9876543213') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhone(FIXED_CREDENTIALS[ROLES.ADMIN]?.phone || '9876543213');
                        setIsUnregistered(false);
                        setErrorMessage('');
                      }}
                      className="text-3xs text-indigo-300 hover:text-indigo-100 underline cursor-pointer"
                    >
                      Use Official Number
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setIsUnregistered(false);
                      setErrorMessage('');
                    }}
                    placeholder="e.g. 9876543213"
                    maxLength={10}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-wider bg-slate-800/90 border rounded-xl focus:ring-2 transition text-white ${
                      isUnregistered || (phone.replace(/\D/g, '') !== (FIXED_CREDENTIALS[ROLES.ADMIN]?.phone || '9876543213') && phone.replace(/\D/g, '').length === 10)
                        ? 'border-amber-500/80 focus:border-amber-400 focus:ring-amber-500/40'
                        : 'border-slate-700 focus:border-indigo-400 focus:ring-indigo-500/40'
                    }`}
                  />
                </div>
                {phone.replace(/\D/g, '') !== (FIXED_CREDENTIALS[ROLES.ADMIN]?.phone || '9876543213') && phone.replace(/\D/g, '').length === 10 && (
                  <p className="text-3xs text-amber-300/90 mt-1 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Number +91 {phone} is not the designated CDMO phone.</span>
                  </p>
                )}
              </div>

              {/* Security PIN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Administrative Security PIN <span className="text-indigo-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowChangePinModal(true)}
                    className="text-2xs font-semibold text-indigo-300 hover:text-indigo-200 underline flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3 text-indigo-400" />
                    <span>Change PIN</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter Admin PIN"
                    maxLength={8}
                    required
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 text-sm font-mono tracking-widest bg-slate-800/90 border border-slate-700 text-white rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Authenticate Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating CDMO...' : 'Verify & Enter Command Desk'}</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 text-center">
              <p className="text-3xs text-slate-400">
                Official Ministry Surveillance Server &bull; Unauthorized entry attempts are logged and flagged under the IT Act.
              </p>
            </div>

          </div>
        </div>

        {/* Change PIN Modal */}
        <ChangePinModal
          isOpen={showChangePinModal}
          onClose={() => setShowChangePinModal(false)}
        />
      </div>
    </div>
  );
}
