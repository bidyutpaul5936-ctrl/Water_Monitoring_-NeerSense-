import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Droplets, 
  ShieldCheck, 
  Activity, 
  Users, 
  Building2, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuthRole, ROLES } from '../contexts/AuthRoleContext';

export default function Slideshow() {
  const { activeRole, isGovernment, isAsha, isHygiene, isVillager } = useAuthRole();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const getSafeLink = (targetPath) => {
    if (isGovernment) return targetPath;
    if (targetPath === '/villagers' && (isVillager || isGovernment)) return targetPath;
    if (targetPath === '/asha' && (activeRole === ROLES.ASHA || isGovernment)) return targetPath;
    if (targetPath === '/hygiene' && (activeRole === ROLES.HYGIENE || isGovernment)) return targetPath;
    if (targetPath === '/admin' && isGovernment) return targetPath;

    // Fallback to role's designated primary portal
    if (activeRole === ROLES.ASHA) return '/asha';
    if (activeRole === ROLES.HYGIENE) return '/hygiene';
    return '/villagers';
  };

  const allSlides = [
    {
      id: 'water-surveillance',
      tag: 'Jal Jeevan Mission · SIH 2025',
      title: 'Real-Time Water Safety Surveillance',
      subtitle: 'Monitoring microbial contamination, turbidity, and chemical hazards in rural drinking water sources to prevent epidemics before they begin.',
      icon: Droplets,
      iconColor: 'text-sky-600 bg-sky-100 border-sky-300',
      badge: 'Early Warning Grid',
      badgeClass: 'badge-blue',
      metrics: [
        { label: 'Target pH', val: '6.5 – 8.5', sub: 'BIS IS 10500' },
        { label: 'Turbidity', val: '< 5.0 NTU', sub: 'Safe drinking' },
        { label: 'E. Coli Limit', val: '0 CFU/100ml', sub: 'Pathogen-free' },
      ],
      primaryAction: { label: 'Check Water Reports', path: '/villagers' },
      secondaryAction: { label: 'Government Admin', path: '/admin' },
    },
    {
      id: 'villager-reporting',
      tag: 'Community Health Voice',
      title: 'Villager Health Self-Reporting',
      subtitle: 'Report symptoms in under 30 seconds using simple touch icons or multilingual voice input in Hindi, Bengali, Assamese, and Odia.',
      icon: Users,
      iconColor: 'text-emerald-600 bg-emerald-100 border-emerald-300',
      badge: 'Multilingual & Offline',
      badgeClass: 'badge-safe',
      metrics: [
        { label: 'Voice Input', val: '6 Languages', sub: 'Speech enabled' },
        { label: 'Offline Ready', val: '100% Cached', sub: 'Syncs on signal' },
        { label: 'ASHA Alert', val: 'Instant SMS', sub: 'Zero-delay triage' },
      ],
      primaryAction: { label: 'Report Health Condition', path: '/villagers' },
      secondaryAction: { label: 'View Safe Water', path: '/villagers' },
    },
    {
      id: 'asha-network',
      tag: 'Frontline Surveillance',
      title: 'ASHA Worker Outreach & Field Testing',
      subtitle: 'Field diagnostics with rapid H2S bacterial test vials, door-to-door household tracking, and prompt distribution of ORS and Zinc kits.',
      icon: Activity,
      iconColor: 'text-sky-700 bg-sky-100 border-sky-300',
      badge: 'Field Surveillance',
      badgeClass: 'badge-blue',
      metrics: [
        { label: 'H2S Vial Test', val: 'Field Kit', sub: '24-48 hr result' },
        { label: 'Triage Queue', val: 'Real-Time', sub: 'Priority patient feed' },
        { label: 'ORS Kits', val: 'Dispatched', sub: 'Immediate treatment' },
      ],
      primaryAction: { label: 'ASHA Worker Portal', path: '/asha' },
      secondaryAction: { label: 'Government Admin', path: '/admin' },
    },
    {
      id: 'government-lab',
      tag: 'District Administration',
      title: 'Government Lab Reports & Response',
      subtitle: 'District health officials and Jal Shakti engineers verify ASHA field data, approve reports, publish advisories, and deploy emergency chlorination.',
      icon: Building2,
      iconColor: 'text-blue-700 bg-blue-100 border-blue-300',
      badge: 'District Health Command',
      badgeClass: 'badge-blue',
      metrics: [
        { label: 'ASHA Data', val: 'Verified', sub: 'Govt approved' },
        { label: 'Advisories', val: 'Broadcast', sub: 'Village-wide alerts' },
        { label: 'Chlorination', val: 'On-Demand', sub: 'Response teams' },
      ],
      primaryAction: { label: 'Open Government Admin', path: '/admin' },
      secondaryAction: { label: 'View Villager Reports', path: '/villagers' },
    }
  ];

  const slides = allSlides.filter(s => {
    if (isGovernment) return true;
    if (activeRole === ROLES.VILLAGER) {
      return s.id === 'water-surveillance' || s.id === 'villager-reporting';
    }
    if (activeRole === ROLES.ASHA) {
      return s.id === 'water-surveillance' || s.id === 'asha-network';
    }
    if (activeRole === ROLES.HYGIENE) {
      return s.id === 'water-surveillance';
    }
    return true;
  });

  // Auto-play interval (5 seconds)
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const active = slides[currentSlide] || slides[0] || allSlides[0];
  const IconComp = active.icon;

  return (
    <div 
      className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-sky-100 shadow-panel transition-all"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slide Content */}
      <div className="px-6 py-8 md:px-10 md:py-10">
        <div className="grid md:grid-cols-12 gap-6 items-center">
          
          {/* Text Column */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`badge ${active.badgeClass}`}>
                <Sparkles className="w-3 h-3" />
                {active.badge}
              </span>
              <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                {active.tag}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-sky-950 tracking-tight leading-tight">
              {active.title}
            </h1>

            <p className="text-sm md:text-base text-slate-700 leading-relaxed max-w-2xl">
              {active.subtitle}
            </p>

            {/* Metric Chips */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              {active.metrics.map((m, idx) => (
                <div key={idx} className="bg-white/90 border border-sky-200 rounded-lg p-2.5 shadow-sm">
                  <div className="text-2xs font-bold text-sky-700 uppercase">{m.label}</div>
                  <div className="text-base font-extrabold text-sky-950 mt-0.5">{m.val}</div>
                  <div className="text-2xs text-slate-500">{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={getSafeLink(active.primaryAction.path)}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
              >
                <span>{active.primaryAction.label}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {isGovernment ? (
                <Link
                  to={active.secondaryAction.path}
                  className="btn-secondary px-4 py-2.5 text-sm"
                >
                  {active.secondaryAction.label}
                </Link>
              ) : null}
            </div>
          </div>

          {/* Graphic / Icon Column */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-2xl border flex items-center justify-center shadow-panel ${active.iconColor}`}>
              <IconComp className="w-16 h-16 md:w-20 md:h-20" />
            </div>
            <div className="mt-4 text-xs font-semibold text-sky-800 text-center">
              Slide {currentSlide + 1} of {slides.length}
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="px-6 py-3 bg-sky-100/70 border-t border-sky-200 flex items-center justify-between">
        
        {/* Indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === idx 
                  ? 'w-8 bg-sky-600' 
                  : 'w-2.5 bg-sky-300 hover:bg-sky-400'
              }`}
            />
          ))}
        </div>

        {/* Play/Pause & Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-1.5 rounded-md text-sky-700 hover:bg-sky-200 transition text-xs flex items-center gap-1 font-medium"
            title={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAutoPlaying ? 'Pause' : 'Auto'}</span>
          </button>

          <button
            onClick={prevSlide}
            className="p-1.5 rounded-md bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 transition shadow-sm"
            title="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={nextSlide}
            className="p-1.5 rounded-md bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 transition shadow-sm"
            title="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
