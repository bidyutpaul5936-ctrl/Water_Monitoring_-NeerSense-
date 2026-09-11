import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Droplets,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Sparkles,
  HeartHandshake,
  Home
} from 'lucide-react';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';
import { WEST_BENGAL_VILLAGES } from '../../utils/westBengalVillages';
import { ref, set } from 'firebase/database';
import { rtdb } from '../../services/firebase';

export default function VillagerSignUpPage() {
  const navigate = useNavigate();
  const { loginWithPhone } = useAuthRole();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [villageId, setVillageId] = useState('vil-wb-01');
  const [landmark, setLandmark] = useState('');
  const [receiveAlerts, setReceiveAlerts] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  const selectedVillageObj = WEST_BENGAL_VILLAGES.find(v => v.id === villageId) || WEST_BENGAL_VILLAGES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const timestamp = Date.now();
      const citizenRecord = {
        name: name.trim(),
        phone: cleanPhone,
        villageId: selectedVillageObj.id,
        villageName: selectedVillageObj.name,
        villageNameBn: selectedVillageObj.nameBn || '',
        district: selectedVillageObj.district || 'West Bengal',
        landmark: landmark.trim() || 'Village Core',
        receiveAlerts,
        registeredAt: new Date().toISOString(),
        role: ROLES.VILLAGER
      };

      // 1. Save to Firebase Realtime Database
      if (rtdb) {
        try {
          await set(ref(rtdb, `citizens/${cleanPhone}`), citizenRecord);
          await set(ref(rtdb, `Villagers/profiles/${cleanPhone}`), citizenRecord);
        } catch (dbErr) {
          console.warn('Firebase RTDB citizen write error:', dbErr);
        }
      }

      // 2. Also register in local storage
      try {
        localStorage.setItem(`citizen_${cleanPhone}`, JSON.stringify(citizenRecord));
      } catch {}

      // 3. Activate villager citizen session without needing any PIN or password
      if (loginWithPhone) {
        await loginWithPhone({
          phone: cleanPhone,
          name: name.trim(),
          villageId: selectedVillageObj.id,
          villageName: selectedVillageObj.name,
          role: ROLES.VILLAGER
        });
      }

      setSuccessData({
        name: name.trim(),
        phone: cleanPhone,
        villageName: selectedVillageObj.name,
        regId: `CITIZEN-WB-${cleanPhone.slice(-4)}`
      });

    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-sky-50 to-teal-50">
      <div className="w-full max-w-xl">
        {/* Isolated Back Link to Villagers Home ONLY */}
        <div className="mb-4">
          <Link
            to="/villagers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs hover:shadow-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Villagers Home</span>
          </Link>
        </div>

        {/* Card Body */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-emerald-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700 text-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner flex-shrink-0">
                <Bell className="w-6 h-6 text-emerald-100" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-3xs font-extrabold uppercase tracking-wider border border-emerald-400/40 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Free Citizen Service</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  Sign Up for Village Water Alerts
                </h1>
                <p className="text-xs text-emerald-100/90 mt-1">
                  ग्रामीण जल सुरक्षा एवं स्वास्थ्य सूचना पंजीकरण (No login password required)
                </p>
              </div>
            </div>
          </div>

          {successData ? (
            /* Success State */
            <div className="p-6 sm:p-8 space-y-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">Registration Completed!</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Your household is now registered to receive instant drinking water safety notifications.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                  <span className="text-slate-500">Citizen Name:</span>
                  <strong className="text-slate-900">{successData.name}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                  <span className="text-slate-500">Registered Phone:</span>
                  <strong className="font-mono text-slate-900">+91 {successData.phone}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                  <span className="text-slate-500">Registered Village:</span>
                  <strong className="text-emerald-900">{successData.villageName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Citizen Alert ID:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {successData.regId}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-2xs text-sky-800 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>You can view your village's verified test reports and medical guides anytime on the home page.</span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/villagers')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <Home className="w-4 h-4" />
                <span>Go to Villagers Home Page</span>
              </button>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Mandal / রমা মণ্ডল"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                    />
                  </div>
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    10-Digit Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-wider bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                    />
                  </div>
                  <p className="text-3xs text-slate-500 mt-1">
                    SMS and contamination warnings will be sent to this number. No password required.
                  </p>
                </div>

                {/* Village Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Your Village / Gram Panchayat <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={villageId}
                      onChange={(e) => setVillageId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                    >
                      {WEST_BENGAL_VILLAGES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} {v.nameBn ? `(${v.nameBn})` : ''} - {v.district}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Habitation / Landmark */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Habitation / Para / Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Primary School / Purba Para Tube Well"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                  />
                </div>

                {/* Alert Subscription Checkbox */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="alerts-chk"
                    checked={receiveAlerts}
                    onChange={(e) => setReceiveAlerts(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="alerts-chk" className="text-xs text-slate-700 cursor-pointer">
                    <strong className="font-semibold text-emerald-950">Receive Instant Drinking Water Alerts:</strong> Automatically receive emergency boil-water advisories whenever water testing detects contamination in your village.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Sign Up for Village Alerts'}</span>
              </button>

              <div className="text-center pt-1 border-t border-slate-100">
                <Link
                  to="/villagers"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
                >
                  ← Return to Villagers Home (No signup needed to view reports)
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
