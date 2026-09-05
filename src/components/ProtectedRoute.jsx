import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { KeyRound, Unlock, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuthRole, ROLES } from '../contexts/AuthRoleContext';

/**
 * ProtectedRoute — wraps a portal page and requires PIN authentication
 * when the user navigates directly to the URL without being logged in.
 *
 * Props:
 *  - requiredRoles: array of ROLES values that can access this page
 *  - loginFn: the context login function (loginAsAsha, loginAsHygiene, loginAsGovernment)
 *  - roleLabel: display name for the login modal header
 *  - demoPin: hint shown to user (e.g., '5678')
 *  - redirectIfWrongRole: path to redirect if user has a different valid role
 *  - children: the protected page component
 */
export default function ProtectedRoute({
  requiredRoles = [],
  loginFn,
  roleLabel,
  demoPin,
  redirectIfWrongRole,
  children,
}) {
  const { activeRole, ROLES } = useAuthRole();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // Already has access — render children directly
  const hasAccess = requiredRoles.includes(activeRole);
  if (hasAccess || authenticated) {
    return children;
  }

  // Has a valid session for a DIFFERENT portal — redirect rather than show login
  if (redirectIfWrongRole && activeRole !== ROLES.VILLAGER) {
    return <Navigate to={redirectIfWrongRole} replace />;
  }

  // ── PIN Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = loginFn(pin);
    if (result?.success) {
      setAuthenticated(true);
    } else {
      setError(result?.message || 'Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  // ── Blocked UI — full-page PIN prompt ───────────────────────────────────────
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-sky-300 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-sky-900 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-700 border border-sky-600 flex items-center justify-center text-white flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white">Restricted Access</h2>
            <p className="text-2xs text-sky-300 mt-0.5">
              {roleLabel} · Authentication Required
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Info Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              This portal requires authorization. Please enter your assigned
              department PIN to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Icon + Role display */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50 border border-sky-200">
              <KeyRound className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <div>
                <div className="text-3xs text-sky-500 font-bold uppercase tracking-wider">
                  Required Role
                </div>
                <div className="text-xs font-bold text-sky-950">{roleLabel}</div>
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-2xs font-semibold text-slate-600 mb-1.5">
                Authorization PIN / Access Code
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(''); }}
                placeholder={`Enter PIN (Demo: ${demoPin})`}
                className="w-full border border-sky-300 rounded-lg px-3 py-2.5 text-center text-base tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                autoFocus
                maxLength={8}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-3xs text-sky-700">
                  Demo PIN: <strong>{demoPin}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setPin(demoPin)}
                  className="text-3xs text-sky-600 underline hover:text-sky-800 transition"
                >
                  Quick Autofill
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!pin.trim()}
              className="w-full flex items-center justify-center gap-2 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-xl transition shadow-sm"
            >
              <Unlock className="w-4 h-4" />
              <span>Verify & Access Portal</span>
            </button>

            {/* Back link */}
            <p className="text-center text-2xs text-slate-500">
              Not your portal?{' '}
              <a href="/" className="text-sky-600 hover:text-sky-800 font-semibold underline">
                Return to Home
              </a>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-sky-50 border-t border-sky-100 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-3xs text-sky-700 font-semibold">
            NeerSense · Secure Government Health Surveillance Platform
          </span>
        </div>
      </div>
    </div>
  );
}
