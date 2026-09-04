import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const slides = [
  {
    icon: '🔥',
    title: 'Always Boil Drinking Water',
    titleHi: 'पीने का पानी हमेशा उबालें',
    desc: 'Boil water vigorously for at least 10 minutes before drinking. Let it cool naturally in a clean, covered vessel. This kills 99.9% of harmful bacteria and viruses.',
    gradient: 'from-orange-500 to-amber-400',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    icon: '🧼',
    title: 'Wash Hands with Soap',
    titleHi: 'साबुन से हाथ धोएं',
    desc: 'Wash hands thoroughly with soap for 20 seconds before eating, cooking, and after using the toilet. This single habit can prevent up to 50% of waterborne illnesses.',
    gradient: 'from-sky-500 to-cyan-400',
    bgLight: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    icon: '🫙',
    title: 'Store Water in Clean, Covered Containers',
    titleHi: 'पानी को साफ ढके बर्तन में रखें',
    desc: 'Always use clean, covered containers to store drinking water. Never dip hands or dirty utensils directly into stored water — use a ladle or tap.',
    gradient: 'from-teal-500 to-emerald-400',
    bgLight: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  {
    icon: '🚫',
    title: 'Never Drink Directly from River or Pond',
    titleHi: 'नदी या तालाब का पानी सीधे न पिएं',
    desc: 'Open water sources like rivers, ponds, and streams may contain dangerous bacteria, parasites, and chemical contaminants. Always filter and boil before use.',
    gradient: 'from-red-500 to-rose-400',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    icon: '💧',
    title: 'Use ORS Immediately for Diarrhea',
    titleHi: 'दस्त होने पर तुरंत ORS लें',
    desc: 'Oral Rehydration Solution (ORS) is the #1 life-saving treatment for dehydration caused by diarrhea. Dissolve 1 packet in 1 liter boiled & cooled water. Sip frequently.',
    gradient: 'from-blue-500 to-indigo-400',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    icon: '🧹',
    title: 'Keep Surroundings & Drains Clean',
    titleHi: 'आस-पास और नालियाँ साफ रखें',
    desc: 'Stagnant dirty water around homes breeds mosquitoes and spreads diseases like Malaria and Dengue. Regularly clean drains and don\'t let water accumulate.',
    gradient: 'from-lime-500 to-green-400',
    bgLight: 'bg-lime-50',
    borderColor: 'border-lime-200',
  },
  {
    icon: '📢',
    title: 'Report Unusual Water Color or Smell',
    titleHi: 'पानी का रंग या गंध बदले तो ASHA को बताएं',
    desc: 'If your drinking water looks cloudy, has an unusual color, or smells different — stop using it immediately and report to your local ASHA health worker or Gram Panchayat.',
    gradient: 'from-violet-500 to-purple-400',
    bgLight: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  {
    icon: '💉',
    title: 'Get Children Vaccinated',
    titleHi: 'बच्चों को टीका जरूर लगवाएं',
    desc: 'Ensure children receive all recommended vaccinations against waterborne diseases like Typhoid and Hepatitis A. Visit your nearest PHC or ASHA worker for the schedule.',
    gradient: 'from-pink-500 to-fuchsia-400',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
];

export default function HygieneSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="card overflow-hidden">
      {/* Slide Header */}
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌿</span>
          <div>
            <h2 className="text-sm font-bold text-sky-950">Hygiene & Clean Water Tips</h2>
            <p className="text-2xs text-sky-700">स्वच्छता और स्वस्थ पानी की जानकारी</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-blue text-2xs">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-sky-700 hover:bg-sky-50 transition"
            title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="card-body p-0">
        <div className={`relative ${slide.bgLight} transition-colors duration-500`}>
          {/* Gradient Banner */}
          <div className={`h-2 bg-gradient-to-r ${slide.gradient}`} />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Icon */}
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center text-4xl sm:text-5xl shadow-lg flex-shrink-0`}>
                {slide.icon}
              </div>

              {/* Text */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-extrabold text-sky-950 leading-snug">
                  {slide.title}
                </h3>
                <p className="text-sm font-bold text-sky-700 mt-0.5">
                  {slide.titleHi}
                </p>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed max-w-xl">
                  {slide.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => { prevSlide(); setIsPlaying(false); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-sky-200 shadow-sm flex items-center justify-center text-sky-700 hover:bg-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => { nextSlide(); setIsPlaying(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-sky-200 shadow-sm flex items-center justify-center text-sky-700 hover:bg-white transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 py-3 bg-white border-t border-sky-100">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentSlide(idx); setIsPlaying(false); }}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-6 h-2.5 bg-sky-600'
                  : 'w-2.5 h-2.5 bg-sky-200 hover:bg-sky-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
