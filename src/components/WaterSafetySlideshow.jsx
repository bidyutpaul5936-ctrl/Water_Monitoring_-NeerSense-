import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Flame, 
  ShieldCheck, 
  Droplets, 
  Sparkles, 
  AlertTriangle, 
  HeartPulse, 
  CheckCircle2, 
  ArrowRight,
  Baby,
  Clock,
  Waves
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuthRole } from '../contexts/AuthRoleContext';

const safetySlides = [
  {
    id: 'boil-water',
    icon: Flame,
    iconColor: 'text-orange-600 bg-orange-100 border-orange-300',
    tag: 'Fundamental Safety Rule #1 · WHO Guideline',
    title: 'Always Boil Drinking Water for at least 10 Minutes',
    titleHi: 'पीने का पानी हमेशा कम से कम 10 मिनट तक उबालें',
    desc: 'Boiling water vigorously at a rolling boil for 10 minutes destroys bacteria, cholera vibrio, amoebas, and viruses. Allow the boiled water to cool naturally in a clean covered container.',
    descHi: 'पानी को तेज आंच पर 10 मिनट तक उबालने से हैजा, दस्त और टाइफाइड पैदा करने वाले 99.9% कीटाणु नष्ट हो जाते हैं। ठंडा होने के बाद इसे ढककर रखें।',
    badge: '99.9% Germ Destruction',
    badgeClass: 'badge-safe',
    metrics: [
      { label: 'Boiling Time', val: '≥ 10 Mins', sub: 'Rolling boil' },
      { label: 'E. Coli Kill', val: '100%', sub: 'Pathogen-free' },
      { label: 'Cooling', val: 'Covered', sub: 'Prevent re-infection' },
    ],
    primaryAction: { label: 'Check Village Water Reports', path: '/villagers' },
    secondaryAction: { label: 'Health Advisory', path: '/villagers' },
    gradient: 'from-orange-600 via-amber-600 to-yellow-600'
  },
  {
    id: 'safe-storage',
    icon: Droplets,
    iconColor: 'text-sky-600 bg-sky-100 border-sky-300',
    tag: 'Storage Hygiene · BIS IS 10500',
    title: 'Store Water in Clean Covered Vessels with a Tap or Ladle',
    titleHi: 'पानी को हमेशा साफ ढके बर्तन में रखें और करछुल का इस्तेमाल करें',
    desc: 'Never dip fingers or dirty tumblers directly into drinking water vessels. Stored water should have a tight lid, be kept off the floor, and be renewed every 24 hours.',
    descHi: 'पीने के पानी के बर्तन में कभी सीधे हाथ या गंदा गिलास न डालें। हमेशा लंबी डंडी वाली करछुल या नल लगे घड़े का ही इस्तेमाल करें।',
    badge: 'Contamination Prevention',
    badgeClass: 'badge-blue',
    metrics: [
      { label: 'Vessel Lid', val: 'Mandatory', sub: 'Air-tight cover' },
      { label: 'Ladle / Tap', val: 'Long handle', sub: 'Zero hand contact' },
      { label: 'Max Storage', val: '24 Hours', sub: 'Fresh daily refill' },
    ],
    primaryAction: { label: 'Explore Villagers Guide', path: '/villagers' },
    secondaryAction: { label: 'Hygiene Standards', path: '/hygiene' },
    gradient: 'from-sky-600 via-cyan-600 to-teal-600'
  },
  {
    id: 'handwashing',
    icon: Sparkles,
    iconColor: 'text-emerald-600 bg-emerald-100 border-emerald-300',
    tag: 'Personal Hygiene · UNICEF Protocol',
    title: 'Wash Hands with Soap for 20 Seconds at Critical Times',
    titleHi: 'साबुन से 20 सेकंड तक हाथ धोएं — 50% बीमारियां रुकेंगी',
    desc: 'Handwashing with soap before preparing food, before eating, and after using the latrine reduces diarrheal disease by nearly 50% and respiratory infections by 25%.',
    descHi: 'शौच के बाद, खाना बनाने से पहले और भोजन करने से पहले साबुन से हाथ धोना जलजनित बीमारियों से बचाव का सबसे सरल और असरदार उपाय है।',
    badge: 'Halves Diarrhea Risk',
    badgeClass: 'badge-safe',
    metrics: [
      { label: 'Duration', val: '20 Seconds', sub: 'With soap foam' },
      { label: 'Diarrhea Cut', val: 'Up to 50%', sub: 'Evidence-based' },
      { label: 'Critical Times', val: '5 Moments', sub: 'Before food / latrine' },
    ],
    primaryAction: { label: 'Hygiene & Clean Water', path: '/villagers' },
    secondaryAction: { label: 'ASHA Support', path: '/asha' },
    gradient: 'from-emerald-600 via-teal-600 to-green-600'
  },
  {
    id: 'open-water-risk',
    icon: Waves,
    iconColor: 'text-red-600 bg-red-100 border-red-300',
    tag: 'Disease Prevention · Jal Jeevan Mission',
    title: 'Never Consume Untreated Water from Rivers, Ponds or Springs',
    titleHi: 'नदी, तालाब या खुले कुएं का पानी बिना उपचार कभी न पिएं',
    desc: 'Open water bodies carry agricultural runoff, cattle waste, and high bacterial loads. Rely solely on tested deep tube-wells, government piped tap supply, or thoroughly boiled water.',
    descHi: 'नदी या तालाब का पानी देखने में साफ लगे तो भी उसमें खतरनाक जीवाणु हो सकते हैं। केवल नल-जल योजना या परीक्षित गहरे हैंडपंप का ही पानी पिएं।',
    badge: 'High Pathogen Alert',
    badgeClass: 'badge-critical',
    metrics: [
      { label: 'Open Source', val: 'Unsafe', sub: 'High coliform' },
      { label: 'Piped Water', val: 'Recommended', sub: 'Jal Jeevan Mission' },
      { label: 'H2S Testing', val: 'Field Kit', sub: 'By ASHA worker' },
    ],
    primaryAction: { label: 'Search Village Water Safety', path: '/villagers' },
    secondaryAction: { label: 'Report Bad Water', path: '/villagers' },
    gradient: 'from-red-600 via-rose-600 to-pink-600'
  },
  {
    id: 'emergency-ors',
    icon: HeartPulse,
    iconColor: 'text-indigo-600 bg-indigo-100 border-indigo-300',
    tag: 'Emergency Medical Care · WHO Protocol',
    title: 'Start ORS Immediately at the First Sign of Diarrhea',
    titleHi: 'दस्त या उल्टी होते ही तुरंत ओआरएस (ORS) का घोल शुरू करें',
    desc: 'Dehydration can become life-threatening in hours. Dissolve 1 WHO ORS packet in 1 liter clean boiled and cooled water. Give frequent sips after every loose stool.',
    descHi: 'ओआरएस निर्जलीकरण से जीवन बचाता है। 1 पैकेट को 1 लीटर उबले ठंडे पानी में घोलें। हर दस्त के बाद थोड़ा-थोड़ा पिएं और 24 घंटे बाद नया बनाएं।',
    badge: 'Life Saving Formula',
    badgeClass: 'badge-safe',
    metrics: [
      { label: 'Dosage Ratio', val: '1 Pkt / 1 Liter', sub: 'Boiled & cooled' },
      { label: 'Discard After', val: '24 Hours', sub: 'Make fresh daily' },
      { label: 'Mortality Drop', val: '93%', sub: 'WHO clinical trial' },
    ],
    primaryAction: { label: 'Prepare ORS Guide', path: '/villagers' },
    secondaryAction: { label: 'Get Instant Treatment', path: '/villagers' },
    gradient: 'from-blue-600 via-indigo-600 to-purple-600'
  },
  {
    id: 'chlorination',
    icon: ShieldCheck,
    iconColor: 'text-teal-600 bg-teal-100 border-teal-300',
    tag: 'Community Sanitation · Public Health Engineering',
    title: 'Disinfect Community Wells with Bleaching Powder Regularly',
    titleHi: 'सामुदायिक कुओं और टंकियों में नियमित ब्लीचिंग पाउडर डालें',
    desc: 'Gram Panchayats and Jal Shakti committees must dose drinking wells with 2.5 to 5 grams of bleaching powder per 1000 liters, especially before and during monsoon seasons.',
    descHi: 'वर्षा ऋतु में जलस्रोतों के दूषित होने का खतरा अधिक होता है। कुओं और ओवरहेड टंकियों में नियमित क्लोरीनेशन सुनिश्चित करें।',
    badge: 'Residual Chlorine Check',
    badgeClass: 'badge-blue',
    metrics: [
      { label: 'Free Chlorine', val: '0.2 – 0.5 mg/L', sub: 'BIS standard' },
      { label: 'Bleaching Dose', val: '2.5 - 5 g / kL', sub: 'Per 1000 liters' },
      { label: 'Turbidity Target', val: '< 5.0 NTU', sub: 'Clear water' },
    ],
    primaryAction: { label: 'Official Water Desk', path: '/hygiene' },
    secondaryAction: { label: 'Admin Command', path: '/admin' },
    gradient: 'from-teal-600 via-emerald-600 to-cyan-600'
  }
];

export default function WaterSafetySlideshow() {
  const { lang } = useLanguage();
  const { isGovernment, isVillager } = useAuthRole();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % safetySlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + safetySlides.length) % safetySlides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const slide = safetySlides[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <div className="card overflow-hidden border-sky-300 shadow-md bg-white">
      {/* Top Banner Bar */}
      <div className="bg-sky-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-sky-800">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-300 animate-pulse" />
          <span className="font-bold tracking-wide">
            {lang === 'hi' ? 'बुनियादी जल सुरक्षा एवं स्वच्छता नियम' : 'Basic Water Safety & Health Measures'}
          </span>
          <span className="badge badge-safe text-3xs font-extrabold hidden sm:inline-flex">
            National Health Protocol
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xs text-sky-200 font-mono">
            {currentSlide + 1} / {safetySlides.length}
          </span>
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="w-6 h-6 rounded bg-sky-800 hover:bg-sky-700 flex items-center justify-center text-sky-200 hover:text-white transition"
            title={isAutoPlaying ? 'Pause Slideshow' : 'Resume Slideshow'}
          >
            {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Slide Card Body */}
      <div className="p-5 sm:p-7 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left Column: Icon & Narrative */}
          <div className="flex-1 space-y-3.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xs font-extrabold text-sky-700 uppercase tracking-wider bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                {slide.tag}
              </span>
              <span className={`badge ${slide.badgeClass} text-2xs`}>
                {slide.badge}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-sm ${slide.iconColor}`}>
                <SlideIcon className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-sky-950 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-sm font-bold text-sky-700 mt-1">
                  {slide.titleHi}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
              {lang === 'hi' ? slide.descHi : slide.desc}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                to={slide.primaryAction.path}
                className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
              >
                <span>{slide.primaryAction.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to={slide.secondaryAction.path}
                className="btn btn-secondary text-xs px-3.5 py-2"
              >
                {slide.secondaryAction.label}
              </Link>
            </div>
          </div>

          {/* Right Column: Key Parameter Cards */}
          <div className="w-full lg:w-72 grid grid-cols-3 lg:grid-cols-1 gap-2.5 flex-shrink-0">
            {slide.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-sky-50 to-white border border-sky-200/80 rounded-xl p-3 shadow-2xs"
              >
                <div className="text-3xs text-slate-500 font-medium uppercase tracking-wide">
                  {metric.label}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-sky-950 mt-0.5 font-mono">
                  {metric.val}
                </div>
                <div className="text-3xs text-sky-700 font-semibold mt-0.5">
                  {metric.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        <button
          onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-sky-300 shadow-md flex items-center justify-center text-sky-700 hover:bg-sky-50 transition"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-sky-300 shadow-md flex items-center justify-center text-sky-700 hover:bg-sky-50 transition"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Slide Navigation Dots */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-sky-50/70 border-t border-sky-100">
        <span className="text-3xs text-slate-500">
          Slide {currentSlide + 1} of {safetySlides.length} &bull; Click dots to navigate
        </span>
        <div className="flex items-center gap-1.5">
          {safetySlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentSlide(idx); setIsAutoPlaying(false); }}
              className={`rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-7 h-2 bg-sky-600'
                  : 'w-2 h-2 bg-sky-200 hover:bg-sky-300'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
