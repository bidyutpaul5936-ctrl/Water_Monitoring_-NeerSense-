import React from 'react';
import { HeartPulse } from 'lucide-react';

const orsSteps = [
  {
    step: 1,
    title: 'Boil & Cool 1 Liter Clean Water',
    titleHindi: '1 लीटर साफ पानी उबालकर ठंडा करें',
    desc: 'Boil drinking water vigorously for at least 5 minutes and allow it to cool down to room temperature.',
    icon: '🫗'
  },
  {
    step: 2,
    title: 'Add Entire WHO ORS Packet',
    titleHindi: 'पूरा ओआरएस पैकेट घोलें',
    desc: 'Empty the whole standard ORS packet into the 1 liter container. Do not use half portions.',
    icon: '📦'
  },
  {
    step: 3,
    title: 'Stir Thoroughly with Clean Spoon',
    titleHindi: 'अच्छी तरह चम्मच से मिलाएं',
    desc: 'Stir until completely dissolved in water. Never boil the solution after mixing.',
    icon: '🥄'
  },
  {
    step: 4,
    title: 'Sip Frequently & Discard after 24h',
    titleHindi: 'लगातार पिएं और 24 घंटे बाद नया बनाएं',
    desc: 'Administer small frequent sips after every loose stool. Discard unused solution after 24 hours.',
    icon: '⏰'
  }
];

export default function OrsPreparationSteps() {
  return (
    <div className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-sky-700" />
          <div>
            <h2 className="text-sm font-bold text-sky-950">How to Prepare WHO Oral Rehydration Solution (ORS)</h2>
            <p className="text-2xs text-sky-700">The #1 life-saving treatment for acute watery diarrhea and dehydration</p>
          </div>
        </div>
        <span className="badge badge-safe">WHO Protocol</span>
      </div>

      <div className="card-body">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {orsSteps.map((step) => (
            <div key={step.step} className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                    {step.step}
                  </span>
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <h3 className="font-bold text-xs text-sky-950 mt-2">{step.title}</h3>
                <div className="text-2xs font-semibold text-sky-700">{step.titleHindi}</div>
                <p className="text-2xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
