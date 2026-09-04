import React from 'react';
import { HeartPulse, AlertTriangle, ShieldCheck, Stethoscope } from 'lucide-react';

const treatmentData = {
  diarrhea: {
    label: 'Diarrhea / Loose Motion',
    icon: '💧',
    instructions: [
      'Prepare ORS: Dissolve 1 WHO ORS packet in 1 liter of boiled & cooled water. Sip frequently after every loose stool.',
      'Drink plenty of clean boiled water, coconut water, or rice water to prevent dehydration.',
      'Eat light food — khichdi, curd rice, bananas. Avoid oily or spicy food.',
      'Continue breastfeeding infants. Give ORS between feeds.',
    ],
    instructionsHi: [
      'ORS बनाएं: 1 लीटर उबले ठंडे पानी में 1 ORS पैकेट घोलें। हर दस्त के बाद थोड़ा-थोड़ा पिएं।',
      'खूब साफ उबला पानी, नारियल पानी या चावल का पानी पिएं।',
      'हल्का भोजन करें — खिचड़ी, दही-भात, केला। तला-भुना न खाएं।',
      'शिशुओं को स्तनपान जारी रखें। बीच में ORS दें।',
    ],
    severity: 'moderate',
  },
  vomiting: {
    label: 'Vomiting / Nausea',
    icon: '🤢',
    instructions: [
      'Take small, frequent sips of ORS or clean water — do NOT gulp large amounts.',
      'Avoid solid food for 2-4 hours. Then start with dry toast, crackers, or plain rice.',
      'Rest in a sitting or slightly elevated position to reduce nausea.',
      'If vomiting persists beyond 24 hours or contains blood, seek medical help immediately.',
    ],
    instructionsHi: [
      'ORS या साफ पानी थोड़ा-थोड़ा करके पिएं — एक साथ ज्यादा न पिएं।',
      '2-4 घंटे ठोस भोजन न करें। फिर टोस्ट, बिस्किट या सादा चावल खाएं।',
      'बैठकर या हल्का ऊँचा सिर करके आराम करें।',
      'अगर 24 घंटे से ज्यादा उल्टी हो या खून आए तो तुरंत डॉक्टर के पास जाएं।',
    ],
    severity: 'moderate',
  },
  fever: {
    label: 'Fever / High Temperature',
    icon: '🌡️',
    instructions: [
      'Apply a cool, damp cloth on the forehead and armpits to bring down temperature.',
      'Drink plenty of fluids — water, ORS, lemon water, or soup.',
      'Take Paracetamol (500mg for adults, weight-based dose for children) if temperature exceeds 101°F.',
      'Wear loose, light clothing. Do NOT wrap in heavy blankets.',
    ],
    instructionsHi: [
      'माथे और बगल में ठंडा गीला कपड़ा रखें।',
      'खूब पानी, ORS, नींबू पानी या सूप पिएं।',
      'तापमान 101°F से ज्यादा होने पर पैरासिटामोल लें (बड़ों को 500mg)।',
      'हल्के ढीले कपड़े पहनें। भारी कंबल न ओढ़ें।',
    ],
    severity: 'moderate',
  },
  stomachPain: {
    label: 'Stomach / Abdomen Pain',
    icon: '⚡',
    instructions: [
      'Drink warm water or ginger tea slowly to ease cramps.',
      'Apply a warm compress (hot water bottle wrapped in cloth) on the abdomen.',
      'Avoid tea, coffee, and carbonated drinks. Eat small, bland meals.',
      'If pain is severe, persistent, or with swelling — seek medical help.',
    ],
    instructionsHi: [
      'गुनगुना पानी या अदरक की चाय धीरे-धीरे पिएं।',
      'पेट पर गर्म सेंक (कपड़े में लपेटी गर्म पानी की बोतल) रखें।',
      'चाय, कॉफी, कोल्ड ड्रिंक न लें। थोड़ा-थोड़ा सादा भोजन करें।',
      'अगर दर्द तेज हो, लगातार हो या सूजन हो तो डॉक्टर से मिलें।',
    ],
    severity: 'mild',
  },
  jaundice: {
    label: 'Yellow Skin / Jaundice',
    icon: '👁️',
    instructions: [
      '⚠️ SEEK IMMEDIATE MEDICAL ATTENTION — Jaundice requires professional diagnosis and treatment.',
      'Rest completely. Avoid all physical exertion.',
      'Drink sugarcane juice, glucose water, and fresh fruit juices. Avoid fatty and fried food.',
      'Do NOT take any medication without doctor\'s advice. Liver is affected.',
    ],
    instructionsHi: [
      '⚠️ तुरंत डॉक्टर से मिलें — पीलिया में चिकित्सकीय जांच जरूरी है।',
      'पूरा आराम करें। शारीरिक मेहनत बिल्कुल न करें।',
      'गन्ने का रस, ग्लूकोज़ का पानी, ताजे फलों का रस पिएं। तला-भुना न खाएं।',
      'बिना डॉक्टर की सलाह कोई दवाई न लें। लिवर प्रभावित है।',
    ],
    severity: 'critical',
  },
  bloodStool: {
    label: 'Blood in Stool / Urine',
    icon: '🔴',
    instructions: [
      '🚨 EMERGENCY — Blood in stool or urine requires IMMEDIATE medical attention.',
      'Do NOT delay. Visit the nearest Primary Health Center or call 108 ambulance.',
      'Keep the patient hydrated with ORS while waiting for help.',
      'Do NOT give any antibiotics or pain medication on your own.',
    ],
    instructionsHi: [
      '🚨 आपातकालीन — खून आने पर तुरंत चिकित्सकीय सहायता लें।',
      'देर न करें। नजदीकी स्वास्थ्य केंद्र जाएं या 108 एम्बुलेंस बुलाएं।',
      'मदद आने तक रोगी को ORS पिलाते रहें।',
      'अपने आप कोई एंटीबायोटिक या दर्द की दवा न दें।',
    ],
    severity: 'critical',
  },
  weakness: {
    label: 'Weakness / Dehydration',
    icon: '🛌',
    instructions: [
      'Start ORS immediately — dehydration is a life-threatening condition especially for children and elderly.',
      'Check for sunken eyes, dry mouth, and reduced urination — signs of severe dehydration.',
      'Give small sips of ORS every 5 minutes. Do not force-feed.',
      'If the person cannot drink or is unconscious, rush to the nearest hospital.',
    ],
    instructionsHi: [
      'तुरंत ORS शुरू करें — निर्जलीकरण बच्चों और बुजुर्गों के लिए जानलेवा है।',
      'आंखें धंसी, मुंह सूखा, पेशाब कम — गंभीर निर्जलीकरण के लक्षण।',
      'हर 5 मिनट में ORS का घूंट दें। जबरदस्ती न पिलाएं।',
      'अगर व्यक्ति पी नहीं पा रहा या बेहोश है तो तुरंत अस्पताल ले जाएं।',
    ],
    severity: 'critical',
  },
};

function getSeverityLevel(symptoms) {
  if (symptoms.length === 0) return null;
  const hasCritical = symptoms.some(s => ['jaundice', 'bloodStool'].includes(s));
  const hasDangerousCombo = symptoms.includes('fever') && symptoms.includes('diarrhea') && symptoms.includes('vomiting');
  if (hasCritical || hasDangerousCombo || symptoms.length >= 4) return 'critical';
  if (symptoms.length >= 2) return 'severe';
  return 'moderate';
}

function getSeverityConfig(level) {
  switch (level) {
    case 'critical':
      return {
        label: 'CRITICAL — Seek Immediate Medical Help',
        labelHi: 'गंभीर — तुरंत चिकित्सकीय सहायता लें',
        color: 'bg-red-100 border-red-300 text-red-900',
        badgeClass: 'badge-critical',
        icon: '🚨',
      };
    case 'severe':
      return {
        label: 'SEVERE — Monitor Closely & Prepare to Visit Doctor',
        labelHi: 'गंभीर — ध्यान रखें और डॉक्टर जाने की तैयारी करें',
        color: 'bg-amber-100 border-amber-300 text-amber-900',
        badgeClass: 'badge-high',
        icon: '⚠️',
      };
    default:
      return {
        label: 'MODERATE — Follow Home Treatment',
        labelHi: 'सामान्य — घरेलू उपचार करें',
        color: 'bg-emerald-100 border-emerald-300 text-emerald-900',
        badgeClass: 'badge-safe',
        icon: '✅',
      };
  }
}

export default function InstantTreatmentGuide({ selectedSymptoms = [] }) {
  if (selectedSymptoms.length === 0) {
    return (
      <div className="card">
        <div className="card-header bg-sky-100/70 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-sky-700" />
            <div>
              <h2 className="text-sm font-bold text-sky-950">Instant Treatment Guide</h2>
              <p className="text-2xs text-sky-700">तत्काल उपचार निर्देश</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="p-6 text-center rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
            <span className="text-3xl">🩺</span>
            <h3 className="text-sm font-bold text-sky-950">Select Your Symptoms Above</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Tap your symptoms in the form above and instant basic treatment instructions will appear here in English & Hindi.
            </p>
            <p className="text-xs font-semibold text-sky-700">
              ऊपर अपने लक्षण चुनें — यहां तुरंत उपचार दिखाई देगा
            </p>
          </div>
        </div>
      </div>
    );
  }

  const severity = getSeverityLevel(selectedSymptoms);
  const severityConfig = getSeverityConfig(severity);

  return (
    <div className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-sky-700" />
          <div>
            <h2 className="text-sm font-bold text-sky-950">Instant Treatment Instructions</h2>
            <p className="text-2xs text-sky-700">चयनित लक्षणों के आधार पर तत्काल उपचार</p>
          </div>
        </div>
        <span className={`badge ${severityConfig.badgeClass}`}>
          {severityConfig.icon} {severity === 'critical' ? 'Critical' : severity === 'severe' ? 'Severe' : 'Moderate'}
        </span>
      </div>

      <div className="card-body space-y-4">
        {/* Severity Alert Banner */}
        <div className={`rounded-xl border p-3.5 flex items-start gap-3 ${severityConfig.color}`}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">{severityConfig.label}</div>
            <div className="font-semibold text-xs mt-0.5">{severityConfig.labelHi}</div>
          </div>
        </div>

        {/* Treatment Cards for each selected symptom */}
        <div className="space-y-3">
          {selectedSymptoms.map((symptomId) => {
            const data = treatmentData[symptomId];
            if (!data) return null;
            return (
              <div key={symptomId} className="bg-sky-50/50 border border-sky-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{data.icon}</span>
                  <h3 className="font-bold text-sm text-sky-950">{data.label}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* English Instructions */}
                  <div>
                    <div className="text-2xs font-bold text-sky-700 uppercase tracking-wide mb-1.5">Treatment (English)</div>
                    <ul className="space-y-1.5">
                      {data.instructions.map((inst, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hindi Instructions */}
                  <div>
                    <div className="text-2xs font-bold text-sky-700 uppercase tracking-wide mb-1.5">उपचार (हिन्दी)</div>
                    <ul className="space-y-1.5">
                      {data.instructionsHi.map((inst, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* When to Visit Doctor */}
        {(severity === 'critical' || severity === 'severe') && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏥</span>
              <h3 className="font-bold text-sm text-red-900">When to Rush to the Doctor</h3>
            </div>
            <ul className="space-y-1.5">
              {[
                'Blood in stool or vomit',
                'Unable to drink any fluids / persistent vomiting',
                'High fever (>103°F) lasting more than 2 days',
                'Sunken eyes, no tears, very dry mouth — severe dehydration',
                'Jaundice (yellow eyes/skin)',
                'Infant under 6 months with any diarrhea or vomiting',
                'Patient becomes unconscious or confused',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-800 leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
