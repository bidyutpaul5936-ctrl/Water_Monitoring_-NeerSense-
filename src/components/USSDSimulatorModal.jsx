import React, { useState } from 'react';
import { X, Smartphone, MessageSquare, PhoneCall, CornerDownLeft, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAlertNotification } from '../contexts/AlertNotificationContext';

export default function USSDSimulatorModal({ isOpen, onClose }) {
  const { refreshData } = useAlertNotification();
  const [tab, setTab] = useState('ussd'); // 'ussd' or 'sms'
  
  // USSD State
  const [ussdScreen, setUssdScreen] = useState('Press "Dial *999#" or enter code to begin.');
  const [dialInput, setDialInput] = useState('*999#');
  const [inSession, setInSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneNum, setPhoneNum] = useState('+91-98765-43210');

  // SMS State
  const [smsBody, setSmsBody] = useState('REPORT CHOLERA GOSABA 2');
  const [smsReplies, setSmsReplies] = useState([
    { type: 'system', text: 'SMS Gateway Ready (Zero-Internet Zone Fallback)' }
  ]);
  const [smsSending, setSmsSending] = useState(false);

  if (!isOpen) return null;

  // Handle USSD Send
  const handleUssdSubmit = async (customInput) => {
    const inputToSend = customInput !== undefined ? customInput : dialInput;
    if (!inputToSend) return;

    setLoading(true);
    try {
      const res = await api.queryUssd(inputToSend, 'session-live', phoneNum);
      setUssdScreen(res.message);
      setInSession(res.continueSession);
      if (!res.continueSession) {
        setDialInput('');
        refreshData();
      } else {
        setDialInput('');
      }
    } catch (err) {
      setUssdScreen('Error: Unable to connect to Telecom USSD Gateway. Please check network.');
    } finally {
      setLoading(false);
    }
  };

  // Keypad click
  const handleKeypadPress = (val) => {
    setDialInput(prev => prev + val);
  };

  // Handle SMS Send
  const handleSmsSend = async () => {
    if (!smsBody.trim()) return;
    const userMsg = smsBody;
    setSmsReplies(prev => [...prev, { type: 'outbound', text: userMsg, time: new Date().toLocaleTimeString() }]);
    setSmsBody('');
    setSmsSending(true);

    try {
      const res = await api.sendSmsGateway(phoneNum, userMsg);
      setSmsReplies(prev => [...prev, { 
        type: 'inbound', 
        text: res.replySms || 'JalSuraksha: Report received and triaged.', 
        time: new Date().toLocaleTimeString() 
      }]);
      refreshData();
    } catch {
      setSmsReplies(prev => [...prev, { type: 'system', text: 'Failed to send SMS through gateway.', time: new Date().toLocaleTimeString() }]);
    } finally {
      setSmsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Zero-Internet Simulator (Feature Phones)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Simulates USSD numeric shortcodes & SMS reporting on 2G/basic keypad phones in remote areas.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-800/80 p-1 mb-5 border border-slate-700">
          <button
            onClick={() => setTab('ussd')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              tab === 'ussd' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Interactive USSD (*999#)</span>
          </button>
          <button
            onClick={() => setTab('sms')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              tab === 'sms' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>SMS Numeric Code Gateway</span>
          </button>
        </div>

        {/* USSD Mode */}
        {tab === 'ussd' && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            
            {/* Feature Phone Screen */}
            <div className="bg-slate-950 border-4 border-slate-700 rounded-3xl p-4 shadow-inner flex flex-col justify-between min-h-[340px]">
              {/* Phone Speaker & Status bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800 pb-2 mb-2">
                <span className="font-mono">BSNL 2G 📶</span>
                <span>JalSuraksha *999#</span>
                <span>🔋 85%</span>
              </div>

              {/* Monochrome LCD Screen */}
              <div className="bg-[#9bb38b] text-[#14260d] font-mono p-3.5 rounded-lg border-2 border-[#7e9970] shadow-inner text-xs leading-relaxed whitespace-pre-line min-h-[180px] overflow-y-auto">
                {loading ? 'Connecting to Telecom Gateway...' : ussdScreen}
              </div>

              {/* Input bar on phone screen */}
              <div className="mt-3">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm">
                  <span className="text-sky-400">&gt;</span>
                  <input
                    type="text"
                    value={dialInput}
                    onChange={(e) => setDialInput(e.target.value)}
                    placeholder="Enter choice..."
                    className="bg-transparent border-none outline-none w-full text-white font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && handleUssdSubmit()}
                  />
                  <button
                    onClick={() => handleUssdSubmit()}
                    disabled={loading}
                    className="p-1 rounded bg-sky-600 hover:bg-sky-500 text-white"
                  >
                    <CornerDownLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hardware Keypad & Quick Actions */}
            <div>
              <div className="mb-3">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Virtual SIM Phone Number:
                </label>
                <input
                  type="text"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Quick USSD Presets:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setDialInput('*999#');
                      handleUssdSubmit('*999#');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-700/60 text-sky-200 text-xs text-left"
                  >
                    ⚡ Dial Main Menu (*999#)
                  </button>
                  <button
                    onClick={() => {
                      setDialInput('1*1');
                      handleUssdSubmit('1*1');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-xs text-left"
                  >
                    ⚡ Report Diarrhea (Gosaba)
                  </button>
                  <button
                    onClick={() => {
                      setDialInput('1*2');
                      handleUssdSubmit('1*2');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-200 text-xs text-left"
                  >
                    ⚡ Report Diarrhea (Sagar Island)
                  </button>
                  <button
                    onClick={() => {
                      setDialInput('3');
                      handleUssdSubmit('3');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs text-left"
                  >
                    ⚡ Check Safe Water Status
                  </button>
                </div>
              </div>

              {/* Numeric 3x4 Keypad */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeypadPress(key)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-sky-600 active:text-white rounded-xl text-sm font-bold text-slate-200 border border-slate-700 shadow-sm transition"
                  >
                    {key}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setDialInput('*999#');
                    handleUssdSubmit('*999#');
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Dial Code
                </button>
                <button
                  onClick={() => setDialInput('')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Clear
                </button>
              </div>

            </div>

          </div>
        )}

        {/* SMS Mode */}
        {tab === 'sms' && (
          <div className="space-y-4">
            
            {/* SMS Chat Feed */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-[220px] max-h-[280px] overflow-y-auto space-y-3 font-mono text-xs">
              {smsReplies.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl max-w-[85%] ${
                    msg.type === 'outbound' 
                      ? 'ml-auto bg-sky-600 text-white' 
                      : msg.type === 'inbound'
                      ? 'mr-auto bg-slate-800 text-emerald-300 border border-emerald-500/30'
                      : 'mx-auto bg-slate-900 text-slate-400 text-center border border-slate-800 text-[11px]'
                  }`}
                >
                  <div className="font-sans font-medium">{msg.text}</div>
                  {msg.time && <div className="text-[9px] opacity-70 mt-1 text-right">{msg.time}</div>}
                </div>
              ))}
            </div>

            {/* Quick SMS Codes */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 text-xs self-center">Templates:</span>
              <button
                onClick={() => setSmsBody('REPORT CHOLERA GOSABA 2')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
              >
                REPORT CHOLERA GOSABA 2
              </button>
              <button
                onClick={() => setSmsBody('REPORT DIARRHEA SAGAR 3')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
              >
                REPORT DIARRHEA SAGAR 3
              </button>
              <button
                onClick={() => setSmsBody('STATUS WATER GOSABA')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
              >
                STATUS WATER GOSABA
              </button>
            </div>

            {/* SMS Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                placeholder="Type SMS (e.g. REPORT CHOLERA GOSABA)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-sky-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSmsSend()}
              />
              <button
                onClick={handleSmsSend}
                disabled={smsSending || !smsBody.trim()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition"
              >
                <Send className="w-4 h-4" /> Send SMS
              </button>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Toll-Free Government Gateway Service &bull; Zero Data Pack Required</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
