import React, { useState } from 'react';
import { 
  Fingerprint, 
  Search, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  MapPin, 
  ArrowUpRight, 
  Share2, 
  Compass, 
  Plane,
  ChevronLeft
} from 'lucide-react';
import WorldMap from './WorldMap';
import { cultureSectors, passportStamps } from '../data/travelData';

export default function HomeScreen({ 
  countries, 
  profile, 
  onOpenAddModal, 
  onSelectCountry,
  onNavigateToPassport
}) {
  const [sectorIndex, setSectorIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const currentSector = cultureSectors[sectorIndex];

  // Calculate dynamic statistics
  const visitedCount = countries.filter(c => c.status === 'visited').length;
  const livedCount = countries.filter(c => c.status === 'lived').length;
  const wantCount = countries.filter(c => c.status === 'want').length;
  const totalMarked = visitedCount + livedCount;
  const earthPercentage = ((totalMarked / 195) * 100).toFixed(1);

  const nextSector = () => {
    setSectorIndex((prev) => (prev + 1) % cultureSectors.length);
  };

  const prevSector = () => {
    setSectorIndex((prev) => (prev - 1 + cultureSectors.length) % cultureSectors.length);
  };

  return (
    <div className="flex flex-col pb-28">
      {/* Top Header Section (Fremd style branding) */}
      <header className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 font-['Plus_Jakarta_Sans']">
              atlas<span className="text-[#5b4dff]">.</span>
            </h1>
          </div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
            {totalMarked} Countries. A World of Stories.
          </p>
        </div>

        {/* Biometric / Profile Pill (Right top, like Fremd) */}
        <button 
          onClick={onNavigateToPassport}
          className="relative w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#5b4dff] hover:shadow-md transition-all active:scale-95 group"
          title="Open Passport"
        >
          <Fingerprint size={24} className="group-hover:scale-110 transition-transform" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400/50" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="px-5 space-y-5">
        {/* HERO CARD: "Saudade Spirit" Culture Highlight Card */}
        <div className={`relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br ${currentSector.accent} text-white shadow-xl fremd-hero-shadow transition-all duration-500`}>
          {/* Subtle Globe Latitude Background Watermark */}
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -right-4 -bottom-4 w-44 h-44 rounded-full border border-white/15 pointer-events-none" />
          <div className="absolute right-6 bottom-6 w-32 h-32 rounded-full border border-white/20 pointer-events-none" />

          {/* Sector Pill Tag + Flag */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold tracking-wider uppercase text-white/95">
              <span>{currentSector.sector}</span>
            </div>
            <span className="text-2xl drop-shadow-sm">{currentSector.flag}</span>
          </div>

          {/* Title & Narrative */}
          <div className="relative z-10 space-y-1.5 pr-4">
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              {currentSector.title}
            </h2>
            <p className="text-xs text-white/85 leading-relaxed font-normal">
              {currentSector.description}
            </p>
          </div>

          {/* Footer of Hero Card */}
          <div className="mt-5 pt-3.5 border-t border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-white/80 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{currentSector.country} • {currentSector.visitedYear}</span>
            </div>

            {/* Slider Dots & Next Button */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={prevSector}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex gap-1">
                {cultureSectors.map((_, i) => (
                  <span 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${
                      i === sectorIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                    }`} 
                  />
                ))}
              </div>
              <button 
                onClick={nextSector}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: Planetary Reach (World Map Card) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
              Planetary Reach
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5b4dff]/10 text-[#5b4dff] text-[11px] font-bold">
              <Plane size={12} className="rotate-45" />
              <span>{earthPercentage}% OF EARTH</span>
            </div>
          </div>

          {/* Map Card Container (Fremd style white elevated card) */}
          <div className="bg-white rounded-[28px] p-4 border border-slate-100/90 fremd-card-shadow space-y-4">
            {/* World Map SVG */}
            <WorldMap 
              countries={countries} 
              activeFilter={activeFilter} 
              onSelectCountry={onSelectCountry} 
            />

            {/* Statistics Row (Atlas stats styled in Fremd high-contrast design) */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              {/* Visited */}
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === 'visited' ? 'all' : 'visited')}
                className={`flex flex-col items-center py-2.5 px-2 rounded-2xl transition-all ${
                  activeFilter === 'visited' 
                    ? 'bg-blue-50/80 ring-2 ring-blue-500' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="text-2xl font-black text-slate-950 font-mono tracking-tight">
                  {visitedCount < 10 ? `0${visitedCount}` : visitedCount}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Visited</span>
                </div>
              </button>

              {/* Lived In */}
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === 'lived' ? 'all' : 'lived')}
                className={`flex flex-col items-center py-2.5 px-2 rounded-2xl transition-all ${
                  activeFilter === 'lived' 
                    ? 'bg-indigo-50/80 ring-2 ring-[#5b4dff]' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="text-2xl font-black text-slate-950 font-mono tracking-tight">
                  {livedCount < 10 ? `0${livedCount}` : livedCount}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#5b4dff]" />
                  <span>Lived in</span>
                </div>
              </button>

              {/* Want to visit */}
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === 'want' ? 'all' : 'want')}
                className={`flex flex-col items-center py-2.5 px-2 rounded-2xl transition-all ${
                  activeFilter === 'want' 
                    ? 'bg-purple-50/80 ring-2 ring-purple-500' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="text-2xl font-black text-slate-950 font-mono tracking-tight">
                  {wantCount < 10 ? `0${wantCount}` : wantCount}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Want to visit</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* SEARCH & QUICK MARK BAR */}
        <div 
          onClick={onOpenAddModal}
          className="group cursor-pointer bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#5b4dff]/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3 text-slate-400">
            <Search size={18} className="group-hover:text-[#5b4dff] transition-colors" />
            <span className="text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
              Find a country to mark...
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#5b4dff] text-slate-600 group-hover:text-white flex items-center justify-center transition-all">
            <Plus size={16} />
          </div>
        </div>

        {/* SECTION: Recent Arrivals (Bottom teaser from Fremd) */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
              Recent Arrivals & Stamps
            </h3>
            <span className="text-xs text-[#5b4dff] font-bold cursor-pointer hover:underline" onClick={onNavigateToPassport}>
              View All
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {passportStamps.map((stamp) => (
              <div 
                key={stamp.id}
                className="flex-shrink-0 w-44 bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {stamp.code}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${stamp.color}`}>
                    {stamp.type}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-bold text-slate-900">{stamp.city}</div>
                  <div className="text-xs text-slate-400">{stamp.country}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{stamp.date}</span>
                  <ArrowUpRight size={12} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
