import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { useAuthRole } from '../contexts/AuthRoleContext';

/**
 * GovernmentAuthGate
 *
 * Now that Firebase Auth is in use, this gate checks whether the currently
 * signed-in user has the required role. If not, it shows a friendly "access
 * denied" panel and offers a link to sign in with the right account.
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
  const navigate = useNavigate();
  const { activeRole, isAuthenticated, isGovernment, isAsha, isHygiene, ROLES } = useAuthRole();

  // Determine if the current user is allowed
  const isAllowed =
    requiredRole === 'ASHA'
      ? isAsha
      : requiredRole === 'HYGIENE'
      ? isHygiene
      : isGovernment; // 'Government' or anything else

  // If allowed, render children (or call onAuthorized for the old API)
  if (isAllowed) {
    if (onAuthorized) { onAuthorized(); return null; }
    return children ?? null;
  }

  // Not allowed — show access denied panel
  const roleLabel =
    requiredRole === 'ASHA'
      ? 'ASHA / ANM Field Worker'
      : requiredRole === 'HYGIENE'
      ? 'Water & Sanitation Officer'
      : 'District Health Official / Admin';

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
          Required role: <strong className="text-sky-800">{roleLabel}</strong><br />
          Your current role: <strong className="text-slate-700">{activeRole}</strong>
        </p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate('/auth')}
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition shadow flex items-center justify-center gap-2 text-xs"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign in with the correct account</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/villagers')}
          className="mt-2 text-xs text-sky-700 hover:text-sky-950 font-medium transition flex items-center justify-center gap-1 w-full"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Return to Public Villagers Portal</span>
        </button>
      </div>
    </div>
  );
}
