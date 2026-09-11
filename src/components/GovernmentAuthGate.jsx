import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { useAuthRole } from '../contexts/AuthRoleContext';

/**
 * GovernmentAuthGate
 *
 * Route guard for restricted portals.
 * - If the user is authenticated with the correct role, renders children.
 * - Otherwise immediately redirects to the dedicated isolated login page for that role.
 *
 * Props:
 *   title        – heading text (used briefly while redirecting)
 *   requiredRole – 'ASHA' | 'HYGIENE' | 'Government'
 *   children     – content to render when access is granted
 */
export default function GovernmentAuthGate({
  title = 'Restricted Access',
  requiredRole = 'Government',
  children,
  onAuthorized,
}) {
  const { isGovernment, isAsha, isHygiene } = useAuthRole();
  const navigate = useNavigate();

  // Determine if the current user has the correct role
  const isAllowed =
    requiredRole === 'ASHA'
      ? isAsha
      : requiredRole === 'HYGIENE'
      ? isHygiene
      : isGovernment;

  // Redirect to the correct isolated login page if not authenticated
  useEffect(() => {
    if (!isAllowed) {
      if (requiredRole === 'Government') {
        navigate('/admin/login', { replace: true });
      } else {
        const roleParam = requiredRole === 'ASHA' ? 'asha' : 'hygiene';
        navigate(`/health/login?role=${roleParam}`, { replace: true });
      }
    }
  }, [isAllowed, requiredRole, navigate]);

  // If allowed, render children (or call onAuthorized for legacy API)
  if (isAllowed) {
    if (onAuthorized) { onAuthorized(); return null; }
    return children ?? null;
  }

  // Brief loading state while redirect fires
  const roleLabel =
    requiredRole === 'ASHA'
      ? 'ASHA / ANM Field Worker'
      : requiredRole === 'HYGIENE'
      ? 'Water & Sanitation Officer'
      : 'District Admin / CDMO';

  const loginPageLabel =
    requiredRole === 'Government'
      ? '/admin/login'
      : `/health/login?role=${requiredRole === 'ASHA' ? 'asha' : 'hygiene'}`;

  return (
    <div className="max-w-sm mx-auto my-16 p-8 bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-sky-200 shadow-2xl shadow-sky-200/30 text-center space-y-5">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
        <Lock className="w-7 h-7" />
      </div>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold bg-sky-100 text-sky-900 border border-sky-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
          Restricted Portal
        </div>
        <h2 className="text-lg font-extrabold text-sky-950">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">
          This portal requires <strong className="text-sky-800">{roleLabel}</strong> credentials.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
        <span>Redirecting to login page…</span>
      </div>

      <div className="pt-2 border-t border-sky-100 text-2xs text-slate-400">
        → <code className="font-mono text-sky-700">{loginPageLabel}</code>
      </div>
    </div>
  );
}

