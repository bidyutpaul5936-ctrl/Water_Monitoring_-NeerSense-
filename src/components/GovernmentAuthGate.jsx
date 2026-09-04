import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, Unlock } from 'lucide-react';
import { useAuthRole } from '../contexts/AuthRoleContext';

/**
 * GovernmentAuthGate
 *
 * PIN-based access gate for restricted portals.
 * Users enter a PIN to switch into the required role.
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
  const { isGovernment, isAsha, isHygiene, loginAsGovernment, loginAsAsha, loginAsHygiene } = useAuthRole();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    let result;
    if (requiredRole === 'ASHA') {
      result = loginAsAsha(pin);
    } else if (requiredRole === 'HYGIENE') {
      result = loginAsHygiene(pin);
    } else {
      result = loginAsGovernment(pin);
    }
    if (!result.success) {
      setError(result.message || 'Incorrect PIN. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border-2 border-sky-300 shadow-xl text-center space-y-5">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center text-white shadow-md">
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
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder={`Enter Access PIN (${requiredRole === 'ASHA' ? '5678' : requiredRole === 'HYGIENE' ? '4321' : '1234'})`}
          className="w-full px-4 py-2.5 border-2 border-sky-200 rounded-lg text-center text-sm font-mono tracking-widest focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
          autoFocus
        />
        {error && (
          <p className="text-xs text-red-600 font-semibold">{error}</p>
        )}
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition shadow flex items-center justify-center gap-2 text-xs"
        >
          <Unlock className="w-4 h-4" />
          <span>Verify & Access Portal</span>
        </button>

        {/* Quick Demo Access Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              const defaultPin = requiredRole === 'ASHA' ? '5678' : requiredRole === 'HYGIENE' ? '4321' : '1234';
              setPin(defaultPin);
              if (requiredRole === 'ASHA') loginAsAsha(defaultPin);
              else if (requiredRole === 'HYGIENE') loginAsHygiene(defaultPin);
              else loginAsGovernment(defaultPin);
            }}
            className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-semibold rounded-lg text-xs transition"
          >
            ⚡ Quick Demo Access (PIN: {requiredRole === 'ASHA' ? '5678' : requiredRole === 'HYGIENE' ? '4321' : '1234'})
          </button>
        </div>
      </form>
    </div>
  );
}
