import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight, AlertTriangle, Building2, UserCheck, ArrowLeft } from 'lucide-react';
import { useAuthRole } from '../contexts/AuthRoleContext';

export default function GovernmentAuthGate({ title = 'Government Official Access Required', requiredRole = 'Government', onAuthorized }) {
  const navigate = useNavigate();
  const { loginAsGovernment, loginAsAsha, loginAsHygiene, isGovernment, isAsha, currentUser } = useAuthRole();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleVerify = (e) => {
    e?.preventDefault();
    setError('');

    if (requiredRole === 'ASHA') {
      const res = loginAsAsha(pin);
      if (res.success) {
        onAuthorized && onAuthorized();
      } else {
        setError(res.message);
      }
    } else if (requiredRole === 'HYGIENE') {
      const res = loginAsHygiene(pin);
      if (res.success) {
        onAuthorized && onAuthorized();
      } else {
        setError(res.message);
      }
    } else {
      const res = loginAsGovernment(pin);
      if (res.success) {
        onAuthorized && onAuthorized();
      } else {
        setError(res.message);
      }
    }
  };

  const handleQuickDemoAuth = () => {
    if (requiredRole === 'ASHA') {
      loginAsAsha('1234');
    } else if (requiredRole === 'HYGIENE') {
      loginAsHygiene('1234');
    } else {
      loginAsGovernment('GOV-2025');
    }
    onAuthorized && onAuthorized();
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
            ? 'Access restricted to registered ASHA / ANM field healthcare workers for water testing and patient case triage.' 
            : requiredRole === 'HYGIENE'
            ? 'Access restricted to the District Hygiene & Sanitation Department for water safety classification.'
            : 'Access restricted to District Health Administration & Jal Shakti Officials. Only authorized Government officials have the authority to verify, approve, and publish reports to the villagers website.'}
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-3 text-left">
        <div>
          <label className="block text-xs font-bold text-sky-900 mb-1">
            {requiredRole === 'ASHA' ? 'ASHA Worker ID / Passcode' : requiredRole === 'HYGIENE' ? 'Hygiene Dept PIN / Passcode' : 'Government Officer PIN / ID'}
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={requiredRole === 'ASHA' ? 'Enter ASHA ID (e.g. 1234)' : requiredRole === 'HYGIENE' ? 'Enter Hygiene PIN (e.g. 1234)' : 'Enter PIN (e.g. 1234 or GOV-2025)'}
            className="w-full px-3.5 py-2.5 rounded-lg border border-sky-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition shadow flex items-center justify-center gap-2 text-xs"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Authenticate & Unlock Access</span>
        </button>
      </form>

      <div className="pt-3 border-t border-sky-100">
        <p className="text-2xs text-slate-500 mb-2 font-medium">Evaluation / Demo Fast Access:</p>
        <button
          type="button"
          onClick={handleQuickDemoAuth}
          className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold rounded-lg border border-sky-200 text-xs transition flex items-center justify-center gap-1.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Quick Login as {requiredRole === 'ASHA' ? 'Kuni Majhi (ASHA-071)' : requiredRole === 'HYGIENE' ? 'Dr. Meena Kumari' : 'Dr. Suresh Mishra (CDMO)'}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/villagers')}
          className="mt-3 text-xs text-sky-700 hover:text-sky-950 font-medium transition flex items-center justify-center gap-1 w-full"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Return to Public Villagers Portal</span>
        </button>
      </div>
    </div>
  );
}
