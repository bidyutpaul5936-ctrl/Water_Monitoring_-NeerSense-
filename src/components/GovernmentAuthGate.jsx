import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Unlock } from 'lucide-react';
import { useAuthRole, ROLES, FIXED_CREDENTIALS } from '../contexts/AuthRoleContext';

/**
 * GovernmentAuthGate
 *
 * PIN-based access gate for restricted portals.
 * Validates against FIXED_CREDENTIALS.
 *
 * Props:
 *   title        – heading text
 *   requiredRole – 'ASHA' | 'HYGIENE' | 'Government'
 *   children     – content to render when access is granted
 */
export default function GovernmentAuthGate({
  title = 'Restricted Access',
  requiredRole = 'Government',
  children,
  onAuthorized,
}) {
  const { isGovernment, isAsha, isHygiene, loginWithPhone } = useAuthRole();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if the current user is allowed
  const isAllowed =
    requiredRole === 'ASHA'
      ? isAsha
      : requiredRole === 'HYGIENE'
      ? isHygiene
      : isGovernment;

  // If allowed, render children (or call onAuthorized for the old API)
  if (isAllowed) {
    if (onAuthorized) { onAuthorized(); return null; }
    return children ?? null;
  }

  const roleLabel =
    requiredRole === 'ASHA'
      ? 'ASHA / ANM Field Worker'
      : requiredRole === 'HYGIENE'
      ? 'Water & Sanitation Officer'
      : 'District Health Official / Admin';

  const roleKey =
    requiredRole === 'ASHA'
      ? ROLES.ASHA
      : requiredRole === 'HYGIENE'
      ? ROLES.HYGIENE
      : ROLES.OFFICIAL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await loginWithPhone({
        phone: phone || FIXED_CREDENTIALS[roleKey]?.phone || '',
        pin,
        role: roleKey,
        name: FIXED_CREDENTIALS[roleKey]?.name || roleLabel,
      });
      if (!result.success) {
        setError(result.message || 'Incorrect credentials. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white/95 backdrop-blur-xl rounded-2xl border-2 border-sky-300 shadow-2xl shadow-sky-200/30 text-center space-y-5">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
        <Lock className="w-7 h-7" />
      </div>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-sky-100 text-sky-900 border border-sky-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
          Restricted Administrative Portal
        </div>
        <h2 className="text-xl font-extrabold text-sky-950">{title}</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {requiredRole === 'ASHA'
            ? 'This section is restricted to registered ASHA / ANM field healthcare workers.'
            : requiredRole === 'HYGIENE'
            ? 'This section is restricted to the District Hygiene & Sanitation Department.'
            : 'This section is restricted to District Health Administration & Jal Shakti Officials.'}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Required role: <strong className="text-sky-800">{roleLabel}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter phone number"
          maxLength={10}
          className="w-full px-4 py-2.5 border-2 border-sky-200 rounded-lg text-center text-sm font-mono tracking-widest focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
        />
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter security PIN"
          className="w-full px-4 py-2.5 border-2 border-sky-200 rounded-lg text-center text-sm font-mono tracking-widest focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
          autoFocus
        />
        {error && (
          <p className="text-xs text-red-600 font-semibold bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 text-xs disabled:opacity-50 active:scale-[0.98]"
        >
          <Unlock className="w-4 h-4" />
          <span>{isSubmitting ? 'Verifying...' : 'Verify & Access Portal'}</span>
        </button>

        <div className="pt-2 flex items-center justify-between text-2xs text-slate-500 border-t border-sky-100">
          {requiredRole === 'Government' ? (
            <Link to="/admin/login" className="w-full text-center text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer">
              Go to District Admin / CDMO Command Login →
            </Link>
          ) : (
            <>
              <Link to={`/health/login?role=${requiredRole === 'ASHA' ? 'asha' : 'hygiene'}`} className="text-sky-700 hover:text-sky-900 font-semibold underline cursor-pointer">
                Health Staff Login →
              </Link>
              <Link to={`/health/signup?role=${requiredRole === 'ASHA' ? 'asha' : 'hygiene'}`} className="text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer">
                First-Timer Sign Up →
              </Link>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
