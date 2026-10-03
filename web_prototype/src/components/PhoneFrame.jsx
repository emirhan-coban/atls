import React, { useState } from 'react';
import { Smartphone, Monitor, Columns, Wifi, Battery, Signal } from 'lucide-react';

export default function PhoneFrame({ 
  children, 
  viewMode, 
  onToggleViewMode,
  title,
  subtitle
}) {
  return (
    <div className="min-h-screen bg-[#090b10] py-6 sm:py-10 px-2 sm:px-6 flex flex-col items-center justify-center text-slate-100">
      {/* Top Controls & Branding */}
      <header className="w-full max-w-4xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-300 mb-1 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#5b4dff] animate-ping" />
            <span>Fremd. Design System Adaptation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center sm:justify-start gap-1">
            atlas<span className="text-[#5b4dff]">.</span>
            <span className="text-sm font-normal text-slate-400 ml-2">Travel Passport App</span>
          </h1>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => onToggleViewMode('device')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'device' 
                ? 'bg-[#5b4dff] text-white shadow-lg shadow-[#5b4dff]/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span>iPhone Frame</span>
          </button>

          <button
            onClick={() => onToggleViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'side-by-side' 
                ? 'bg-[#5b4dff] text-white shadow-lg shadow-[#5b4dff]/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns size={14} />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => onToggleViewMode('full')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'full' 
                ? 'bg-[#5b4dff] text-white shadow-lg shadow-[#5b4dff]/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor size={14} />
            <span>Full Responsive</span>
          </button>
        </div>
      </header>

      {/* Main Presentation Container */}
      <div className="w-full flex items-center justify-center">
        {children}
      </div>

      {/* Footer credits */}
      <footer className="mt-8 text-center text-xs text-slate-500 font-medium">
        Designed inspired by <strong className="text-slate-400">Fremd.</strong> by ZERO IQ • Adapted for <strong className="text-slate-400">atlas.</strong>
      </footer>
    </div>
  );
}
