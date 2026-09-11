import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, X, KeyRound, ShieldCheck, Phone, RefreshCw } from 'lucide-react';
import { useAuthRole, ROLES, FIXED_CREDENTIALS } from '../contexts/AuthRoleContext';

/**
 * ChangePinModal
 *
 * Allows login personnel (ASHA, Hygiene, Admin/Official) to independently
 * set, reset, or change their security PIN.
 *
 * The new PIN is written directly to Firebase Realtime Database under:
 *   /system/credentials/{role}/pin
 * and synchronized with the backend Express server.
 *
 * Props:
 *   isOpen        {boolean}   – controls visibility
 *   onClose       {function}  – callback to dismiss the modal
 *   initialRole   {string}    – optional role when launched from login page
 *   initialPhone  {string}    – optional phone when launched from login page
 *   onSuccess     {function}  – callback with (newPin) on successful save
 *   initialMode   {'change'|'set'} – defaults to 'change' if logged in, 'set' if from login page
 */
export default function ChangePinModal({
  isOpen,
  onClose,
  initialRole,
  initialPhone,
  onSuccess,
  initialMode
}) {
  const { currentUser, activeRole, changePin, setSecurityPin } = useAuthRole();

  // Determine effective role
  const effectiveRole = initialRole || currentUser?.role || activeRole || ROLES.ASHA;
  const [selectedRole, setSelectedRole] = useState(effectiveRole);

  // 'change' = verify current PIN; 'set' = verify registered phone number
  const [mode, setMode] = useState(initialMode || (currentUser ? 'change' : 'set'));

  const [currentPin, setCurrentPin]   = useState('');
  const [phone, setPhone]             = useState(initialPhone || FIXED_CREDENTIALS[effectiveRole]?.phone || '');
  const [newPin, setNewPin]           = useState('');
  const [confirmPin, setConfirmPin]   = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    if (isOpen) {
      const role = initialRole || currentUser?.role || activeRole || ROLES.ASHA;
      setSelectedRole(role);
      setPhone(initialPhone || FIXED_CREDENTIALS[role]?.phone || '');
      setMode(initialMode || (currentUser ? 'change' : 'set'));
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen, initialRole, initialPhone, initialMode, currentUser, activeRole]);

  if (!isOpen) return null;

  const reset = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    setPhone(FIXED_CREDENTIALS[newRole]?.phone || '');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanNewPin = newPin.trim();
    if (!cleanNewPin || cleanNewPin.length < 4) {
      setError('New PIN must be at least 4 digits or characters long.');
      return;
    }
    if (cleanNewPin !== confirmPin.trim()) {
      setError('New PIN and Confirm PIN do not match.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (mode === 'change') {
        if (cleanNewPin === currentPin) {
          setError('New PIN must be different from your current PIN.');
          setLoading(false);
          return;
        }
        result = await changePin({ currentPin, newPin: cleanNewPin });
      } else {
        // Independence to set PIN with registered mobile number verification
        const cleanPhone = (phone || '').replace(/\D/g, '');
        result = await setSecurityPin({
          role: selectedRole,
          phone: cleanPhone,
          newPin: cleanNewPin,
        });
      }

      if (!result.success) {
        setError(result.message || 'Failed to update PIN. Please verify your details.');
      } else {
        setSuccess(true);
        if (onSuccess) {
          try { onSuccess(cleanNewPin); } catch {}
        }
        setTimeout(() => {
          handleClose();
        }, 2200);
      }
    } catch (err) {
      setError(err.message || 'Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabelMap = {
    [ROLES.ADMIN]: 'District Admin / CDMO',
    [ROLES.OFFICIAL]: 'District Admin / CDMO',
    [ROLES.ASHA]: 'ASHA Field Worker',
    [ROLES.HYGIENE]: 'Hygiene & Sanitation Dept',
  };

  const roleLabel = roleLabelMap[selectedRole] || selectedRole;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-cyan-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {mode === 'set' ? 'Set Personnel Security PIN' : 'Change Security PIN'}
              </h2>
              <p className="text-2xs text-sky-200 mt-0.5">
                {roleLabel} {currentUser?.name ? `• ${currentUser.name}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">Security PIN Saved Successfully!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  Your new PIN has been securely stored in the NeerSense database. You can use it to log in immediately.
                </p>
              </div>
              <div className="flex items-center gap-2 text-2xs text-emerald-800 bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-full font-semibold mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Persisted in Firebase Realtime Database</span>
              </div>
            </div>
          ) : (
            <>
              {/* Informational banner */}
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2.5 text-2xs text-sky-900 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <span>
                  Login personnel have complete independence to set or update their security PIN. All updates are encrypted and stored in the NeerSense Realtime Database.
                </span>
              </div>

              {/* Role Selector (if not logged in) */}
              {!currentUser && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Personnel Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-semibold border-2 border-slate-200 rounded-xl bg-slate-50 focus:border-sky-500 outline-none text-slate-800"
                  >
                    <option value={ROLES.ASHA}>👩‍⚕️ ASHA Field Worker</option>
                    <option value={ROLES.HYGIENE}>👩‍🔬 Hygiene & Sanitation Dept</option>
                    <option value={ROLES.ADMIN}>🏛️ District Admin / CDMO</option>
                  </select>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Mode toggle when logged in */}
                {currentUser && (
                  <div className="flex items-center justify-between text-2xs border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">
                      {mode === 'change' ? 'Using current PIN' : 'Resetting with registered mobile'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'change' ? 'set' : 'change');
                        setError('');
                      }}
                      className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                    >
                      {mode === 'change' ? 'Forgot current PIN? Reset via mobile' : 'Switch to Current PIN verification'}
                    </button>
                  </div>
                )}

                {/* Conditional Input: Current PIN vs Registered Mobile */}
                {mode === 'change' ? (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Current Security PIN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value)}
                        placeholder="Enter current PIN"
                        required
                        className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400/30 focus:border-sky-500 outline-none font-mono tracking-widest text-slate-900 transition-all hover:border-sky-300"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Registered Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit registered mobile number"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400/30 focus:border-sky-500 outline-none text-slate-900 font-mono transition-all hover:border-sky-300"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <p className="text-3xs text-slate-500">
                      Confirming your identity via the registered mobile number for this personnel account.
                    </p>
                  </div>
                )}

                {/* New PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    New Security PIN <span className="text-red-500">*</span>
                    <span className="ml-2 text-slate-400 font-normal text-3xs">(min. 4 characters)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Enter your new PIN"
                      minLength={4}
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400/30 focus:border-sky-500 outline-none font-mono tracking-widest text-slate-900 transition-all hover:border-sky-300"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPin.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            newPin.length >= (i + 1) * 2
                              ? newPin.length >= 8
                                ? 'bg-emerald-500'
                                : newPin.length >= 6
                                ? 'bg-amber-400'
                                : 'bg-sky-400'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-3xs font-semibold text-slate-500 ml-1 whitespace-nowrap">
                        {newPin.length >= 8 ? 'Strong' : newPin.length >= 6 ? 'Medium' : newPin.length >= 4 ? 'Minimum' : 'Too short'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Confirm New PIN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Re-enter your new PIN"
                      required
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border-2 rounded-xl focus:ring-2 focus:ring-sky-400/30 focus:border-sky-500 outline-none font-mono tracking-widest text-slate-900 transition-all ${
                        confirmPin && newPin !== confirmPin
                          ? 'border-red-300 bg-red-50/30'
                          : confirmPin && newPin === confirmPin
                          ? 'border-emerald-400 bg-emerald-50/20'
                          : 'border-slate-200 hover:border-sky-300'
                      }`}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPin && newPin !== confirmPin && (
                    <p className="text-2xs text-red-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> PINs do not match
                    </p>
                  )}
                  {confirmPin && newPin === confirmPin && (
                    <p className="text-2xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PINs match
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newPin || !confirmPin || newPin !== confirmPin || (mode === 'change' && !currentPin)}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving to DB...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{mode === 'set' ? 'Set & Save PIN' : 'Update PIN'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
