import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';

const ROLE_OPTIONS = [
  { value: ROLES.VILLAGER, label: 'Villager / Citizen', icon: '👨‍🌾', desc: 'Report water issues & view advisories' },
  { value: ROLES.ASHA, label: 'ASHA Field Worker', icon: '👩‍⚕️', desc: 'Conduct field surveys & log health data' },
  { value: ROLES.HYGIENE, label: 'Water & Sanitation Officer', icon: '👩‍🔬', desc: 'Monitor water quality & hygiene reports' },
  { value: ROLES.OFFICIAL, label: 'Health Officer (CDMO)', icon: '🏛️', desc: 'District-level health surveillance' },
  { value: ROLES.PANCHAYAT, label: 'Gram Panchayat Rep.', icon: '🏢', desc: 'Village-level administration' },
  { value: ROLES.ADMIN, label: 'System Administrator', icon: '⚙️', desc: 'Full system access & configuration' },
];

export default function LoginPage() {
  const { loginWithEmail, registerWithEmail, authError } = useAuthRole();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState(1);        // step 1: credentials, step 2: profile (register only)
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.VILLAGER);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [villageId, setVillageId] = useState('');
  const [villageName, setVillageName] = useState('');
  const [district, setDistrict] = useState('');
  const [ashaId, setAshaId] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPassword('');
    setName(''); setPhone(''); setVillageId(''); setVillageName('');
    setDistrict(''); setAshaId(''); setDepartment('');
    setLocalError(''); setStep(1);
    setSelectedRole(ROLES.VILLAGER);
  };

  const switchMode = (m) => { setMode(m); resetForm(); };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    const result = await loginWithEmail(email, password);
    setLoading(false);
    if (result.success) navigate('/');
    else setLocalError(result.message);
  };

  const handleRegisterStep1 = (e) => {
    e.preventDefault();
    setLocalError('');
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!name.trim()) { setLocalError('Full name is required.'); return; }
    setLoading(true);
    const extraData = { name, phone, villageId, villageName, district, ashaId, department };
    const result = await registerWithEmail(email, password, selectedRole, extraData);
    setLoading(false);
    if (result.success) navigate('/');
    else setLocalError(result.message);
  };

  const error = localError || authError;
  const selectedRoleInfo = ROLE_OPTIONS.find(r => r.value === selectedRole);

  return (
    <div className="neersense-login-root">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-blob login-blob-3" />
        <div className="login-grid-overlay" />
      </div>

      <div className="login-container">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo-ring">
            <span className="login-logo-drop">💧</span>
          </div>
          <div>
            <h1 className="login-brand-name">NeerSense</h1>
            <p className="login-brand-tagline">Smart Water-Borne Disease Early Warning</p>
          </div>
        </div>

        {/* Card */}
        <div className="login-card">
          {/* Tab switcher */}
          <div className="login-tabs">
            <button
              id="tab-login"
              className={`login-tab ${mode === 'login' ? 'login-tab-active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              className={`login-tab ${mode === 'register' ? 'login-tab-active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Create Account
            </button>
            <div className={`login-tab-indicator ${mode === 'register' ? 'login-tab-indicator-right' : ''}`} />
          </div>

          {/* ─── LOGIN FORM ─────────────────────────────────────────────── */}
          {mode === 'login' && (
            <form id="login-form" onSubmit={handleLoginSubmit} className="login-form">
              <h2 className="login-form-title">Welcome back</h2>
              <p className="login-form-sub">Sign in to your NeerSense account</p>

              <div className="login-field">
                <label htmlFor="login-email">Email Address</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">✉️</span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Password</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">🔒</span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                id="login-submit-btn"
                type="submit"
                className="login-cta-btn"
                disabled={loading}
              >
                {loading ? <span className="login-spinner" /> : null}
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>

              <p className="login-switch-text">
                Don't have an account?{' '}
                <button type="button" className="login-link-btn" onClick={() => switchMode('register')}>
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ─── REGISTER FORM ──────────────────────────────────────────── */}
          {mode === 'register' && (
            <>
              {/* Step indicator */}
              <div className="login-steps">
                <div className={`login-step ${step >= 1 ? 'login-step-active' : ''}`}>
                  <div className="login-step-num">1</div>
                  <span>Credentials</span>
                </div>
                <div className="login-step-line" />
                <div className={`login-step ${step >= 2 ? 'login-step-active' : ''}`}>
                  <div className="login-step-num">2</div>
                  <span>Profile</span>
                </div>
              </div>

              {step === 1 && (
                <form id="register-form-step1" onSubmit={handleRegisterStep1} className="login-form">
                  <h2 className="login-form-title">Create your account</h2>
                  <p className="login-form-sub">Step 1 of 2 — Account credentials</p>

                  <div className="login-field">
                    <label htmlFor="reg-email">Email Address</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon">✉️</span>
                      <input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="login-field">
                    <label htmlFor="reg-password">Password</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon">🔒</span>
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="login-eye-btn"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="login-field">
                    <label htmlFor="reg-confirm-password">Confirm Password</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon">🔑</span>
                      <input
                        id="reg-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  {error && <div className="login-error">{error}</div>}

                  <button id="reg-next-btn" type="submit" className="login-cta-btn">
                    Next: Set Up Profile →
                  </button>

                  <p className="login-switch-text">
                    Already have an account?{' '}
                    <button type="button" className="login-link-btn" onClick={() => switchMode('login')}>
                      Sign in
                    </button>
                  </p>
                </form>
              )}

              {step === 2 && (
                <form id="register-form-step2" onSubmit={handleRegisterSubmit} className="login-form">
                  <h2 className="login-form-title">Your Profile</h2>
                  <p className="login-form-sub">Step 2 of 2 — Select your role & details</p>

                  <div className="login-field">
                    <label htmlFor="reg-name">Full Name *</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon">👤</span>
                      <input
                        id="reg-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Role selector */}
                  <div className="login-field">
                    <label>Select Your Role *</label>
                    <div className="login-role-grid">
                      {ROLE_OPTIONS.map(r => (
                        <button
                          key={r.value}
                          type="button"
                          id={`role-option-${r.value}`}
                          className={`login-role-card ${selectedRole === r.value ? 'login-role-card-active' : ''}`}
                          onClick={() => setSelectedRole(r.value)}
                        >
                          <span className="login-role-icon">{r.icon}</span>
                          <span className="login-role-label">{r.label}</span>
                        </button>
                      ))}
                    </div>
                    {selectedRoleInfo && (
                      <p className="login-role-desc">{selectedRoleInfo.icon} {selectedRoleInfo.desc}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="login-field">
                    <label htmlFor="reg-phone">Phone Number</label>
                    <div className="login-input-wrap">
                      <span className="login-input-icon">📱</span>
                      <input
                        id="reg-phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  {/* Role-specific fields */}
                  {(selectedRole === ROLES.VILLAGER || selectedRole === ROLES.PANCHAYAT) && (
                    <div className="login-field-row">
                      <div className="login-field">
                        <label htmlFor="reg-village-name">Village Name</label>
                        <div className="login-input-wrap">
                          <span className="login-input-icon">🏘️</span>
                          <input
                            id="reg-village-name"
                            type="text"
                            value={villageName}
                            onChange={e => setVillageName(e.target.value)}
                            placeholder="e.g. Gosaba"
                          />
                        </div>
                      </div>
                      <div className="login-field">
                        <label htmlFor="reg-district">District</label>
                        <div className="login-input-wrap">
                          <span className="login-input-icon">📍</span>
                          <input
                            id="reg-district"
                            type="text"
                            value={district}
                            onChange={e => setDistrict(e.target.value)}
                            placeholder="e.g. South 24 Parganas"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRole === ROLES.ASHA && (
                    <div className="login-field-row">
                      <div className="login-field">
                        <label htmlFor="reg-asha-id">ASHA Worker ID</label>
                        <div className="login-input-wrap">
                          <span className="login-input-icon">🪪</span>
                          <input
                            id="reg-asha-id"
                            type="text"
                            value={ashaId}
                            onChange={e => setAshaId(e.target.value)}
                            placeholder="e.g. ASHA-071"
                          />
                        </div>
                      </div>
                      <div className="login-field">
                        <label htmlFor="reg-village-name-asha">Village</label>
                        <div className="login-input-wrap">
                          <span className="login-input-icon">🏘️</span>
                          <input
                            id="reg-village-name-asha"
                            type="text"
                            value={villageName}
                            onChange={e => setVillageName(e.target.value)}
                            placeholder="e.g. Sagar Island"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedRole === ROLES.HYGIENE || selectedRole === ROLES.OFFICIAL || selectedRole === ROLES.ADMIN) && (
                    <div className="login-field">
                      <label htmlFor="reg-department">Department</label>
                      <div className="login-input-wrap">
                        <span className="login-input-icon">🏥</span>
                        <input
                          id="reg-department"
                          type="text"
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                          placeholder="e.g. Public Health & Hygiene Dept"
                        />
                      </div>
                    </div>
                  )}

                  {error && <div className="login-error">{error}</div>}

                  <div className="login-btn-row">
                    <button
                      type="button"
                      className="login-back-btn"
                      onClick={() => { setStep(1); setLocalError(''); }}
                    >
                      ← Back
                    </button>
                    <button
                      id="reg-submit-btn"
                      type="submit"
                      className="login-cta-btn login-cta-flex"
                      disabled={loading}
                    >
                      {loading ? <span className="login-spinner" /> : null}
                      {loading ? 'Creating account…' : 'Create Account ✓'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="login-footer-note">
          Ministry of Jal Shakti · Ministry of Health & Family Welfare · SIH 2025
        </p>
      </div>

      <style>{`
        /* ── Root & Background ── */
        .neersense-login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020b18;
          font-family: 'Inter', 'Outfit', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }
        .login-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: blobPulse 8s ease-in-out infinite alternate;
        }
        .login-blob-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #0ea5e9, #2563eb);
          top: -200px; left: -150px;
          animation-delay: 0s;
        }
        .login-blob-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #06b6d4, #0369a1);
          bottom: -200px; right: -100px;
          animation-delay: 3s;
        }
        .login-blob-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #38bdf8, #7c3aed40);
          top: 50%; left: 60%;
          animation-delay: 5s;
        }
        .login-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(14, 165, 233, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        @keyframes blobPulse {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.15) translate(30px, -20px); }
        }

        /* ── Layout ── */
        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        /* ── Brand ── */
        .login-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: fadeSlideDown 0.6s ease both;
        }
        .login-logo-ring {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 30px rgba(14, 165, 233, 0.5);
          animation: logoPulse 3s ease-in-out infinite;
        }
        .login-logo-drop { font-size: 1.6rem; }
        .login-brand-name {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }
        .login-brand-tagline {
          color: #64748b;
          font-size: 0.75rem;
          margin: 0.1rem 0 0;
          letter-spacing: 0.02em;
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(14,165,233,0.4); }
          50% { box-shadow: 0 0 40px rgba(14,165,233,0.7); }
        }

        /* ── Card ── */
        .login-card {
          width: 100%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(14, 165, 233, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(14,165,233,0.05),
            0 25px 60px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.05);
          overflow: hidden;
          animation: fadeSlideUp 0.6s ease both 0.15s;
        }

        /* ── Tabs ── */
        .login-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          border-bottom: 1px solid rgba(14,165,233,0.15);
        }
        .login-tab {
          padding: 1rem;
          font-weight: 600;
          font-size: 0.9rem;
          color: #64748b;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.25s;
          position: relative;
          z-index: 1;
        }
        .login-tab-active { color: #38bdf8; }
        .login-tab-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, #0ea5e9, #38bdf8);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px 2px 0 0;
        }
        .login-tab-indicator-right { transform: translateX(100%); }

        /* ── Form ── */
        .login-form {
          padding: 1.75rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .login-form-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }
        .login-form-sub {
          font-size: 0.8rem;
          color: #64748b;
          margin: -0.5rem 0 0;
        }

        /* ── Fields ── */
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }
        .login-field label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .login-input-icon {
          position: absolute;
          left: 0.8rem;
          font-size: 1rem;
          pointer-events: none;
          z-index: 1;
        }
        .login-input-wrap input {
          width: 100%;
          padding: 0.65rem 0.75rem 0.65rem 2.5rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(51, 65, 85, 0.8);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .login-input-wrap input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.15);
        }
        .login-input-wrap input::placeholder { color: #475569; }
        .login-eye-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          line-height: 1;
        }
        .login-field-row {
          display: flex;
          gap: 0.75rem;
        }

        /* ── Role grid ── */
        .login-role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .login-role-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.6rem 0.4rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(51, 65, 85, 0.7);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .login-role-card:hover {
          border-color: rgba(14,165,233,0.5);
          background: rgba(14,165,233,0.08);
        }
        .login-role-card-active {
          border-color: #0ea5e9 !important;
          background: rgba(14,165,233,0.15) !important;
          box-shadow: 0 0 0 2px rgba(14,165,233,0.25);
        }
        .login-role-icon { font-size: 1.4rem; }
        .login-role-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: #94a3b8;
          text-align: center;
          line-height: 1.2;
        }
        .login-role-card-active .login-role-label { color: #38bdf8; }
        .login-role-desc {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0.25rem 0 0;
          font-style: italic;
        }

        /* ── Buttons ── */
        .login-cta-btn {
          width: 100%;
          padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(14,165,233,0.3);
          font-family: inherit;
        }
        .login-cta-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 25px rgba(14,165,233,0.45);
        }
        .login-cta-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-cta-flex { flex: 1; width: auto; }
        .login-back-btn {
          padding: 0.8rem 1.2rem;
          background: rgba(30,41,59,0.8);
          border: 1px solid rgba(51,65,85,0.8);
          border-radius: 10px;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .login-back-btn:hover {
          background: rgba(51,65,85,0.8);
          color: #f1f5f9;
        }
        .login-btn-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        /* ── Error ── */
        .login-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 0.65rem 0.9rem;
          color: #fca5a5;
          font-size: 0.82rem;
          font-weight: 500;
        }

        /* ── Misc ── */
        .login-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .login-switch-text {
          font-size: 0.82rem;
          color: #64748b;
          text-align: center;
          margin: 0;
        }
        .login-link-btn {
          background: none;
          border: none;
          color: #38bdf8;
          font-weight: 600;
          cursor: pointer;
          font-size: inherit;
          padding: 0;
          font-family: inherit;
          text-decoration: underline;
        }

        /* ── Step indicator ── */
        .login-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 1.75rem 0;
        }
        .login-step {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 600;
          transition: color 0.3s;
        }
        .login-step-active { color: #38bdf8; }
        .login-step-num {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(51,65,85,0.8);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          transition: background 0.3s, box-shadow 0.3s;
        }
        .login-step-active .login-step-num {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          box-shadow: 0 0 10px rgba(14,165,233,0.4);
        }
        .login-step-line {
          flex: 1;
          max-width: 60px;
          height: 2px;
          background: rgba(51,65,85,0.8);
          border-radius: 2px;
        }

        /* ── Footer ── */
        .login-footer-note {
          font-size: 0.7rem;
          color: #334155;
          text-align: center;
          margin: 0;
          animation: fadeSlideUp 0.6s ease both 0.4s;
        }

        /* ── Animations ── */
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Responsive ── */
        @media (max-width: 520px) {
          .login-role-grid { grid-template-columns: repeat(2, 1fr); }
          .login-field-row { flex-direction: column; }
          .login-brand-name { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
