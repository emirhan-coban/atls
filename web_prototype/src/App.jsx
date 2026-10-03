import React, { useState } from 'react';
import { initialCountries, initialProfile } from './data/travelData';
import HomeScreen from './components/HomeScreen';
import PassportScreen from './components/PassportScreen';
import BottomNav from './components/BottomNav';
import AddCountryModal from './components/AddCountryModal';
import PhoneFrame from './components/PhoneFrame';
import { Wifi, Battery, Signal } from 'lucide-react';

export default function App() {
  const [countries, setCountries] = useState(initialCountries);
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState('device'); // 'device' | 'side-by-side' | 'full'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddCountry = (newCountry) => {
    setCountries((prev) => [newCountry, ...prev]);
  };

  const handleRemoveCountry = (countryId) => {
    setCountries((prev) => prev.filter((c) => c.id !== countryId));
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'passport' || tabId === 'profile') {
      setActiveTab('passport');
    } else {
      setActiveTab('home');
    }
  };

  // Reusable Single Device Screen Component
  const renderDeviceScreen = (currentTab, isStandAlone = false) => {
    return (
      <div className="relative w-full max-w-[390px] h-[844px] bg-[#fbfbfd] rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border-[9px] border-[#1e1e24] overflow-hidden flex flex-col select-none ring-1 ring-white/10">
        {/* Dynamic Island & Speaker cutout */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-3 h-7 w-28 bg-black rounded-full shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111116] border border-white/10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#1e293b]" />
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#111116] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
        </div>

        {/* iPhone Status Bar (Matching Fremd screen: 11:50) */}
        <div className="pt-3 px-7 pb-1 flex items-center justify-between text-slate-900 text-xs font-bold z-40">
          <span className="font-mono tracking-tight text-[13px]">11:50</span>
          <div className="flex items-center gap-1.5 text-slate-900">
            <Signal size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-mono font-black">5G</span>
            <Battery size={15} strokeWidth={2.5} className="fill-slate-900" />
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {currentTab === 'home' ? (
            <HomeScreen
              countries={countries}
              profile={profile}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onNavigateToPassport={() => setActiveTab('passport')}
              onSelectCountry={(id) => {
                const c = countries.find((item) => item.id === id);
                if (c) alert(`${c.name} (${c.status.toUpperCase()}): ${c.notes}`);
              }}
            />
          ) : (
            <PassportScreen
              profile={profile}
              countries={countries}
              onRemoveCountry={handleRemoveCountry}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}
        </div>

        {/* Floating Capsule Bottom Dock (Inside phone) */}
        <BottomNav activeTab={currentTab} onTabChange={handleTabChange} />

        {/* Home Indicator Bar at the bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-950/80 rounded-full z-50 pointer-events-none" />
      </div>
    );
  };

  return (
    <PhoneFrame viewMode={viewMode} onToggleViewMode={setViewMode}>
      {/* View Mode 1: Single Phone Frame */}
      {viewMode === 'device' && (
        <div className="flex flex-col items-center">
          {renderDeviceScreen(activeTab)}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Home (Explore)
            </button>
            <button
              onClick={() => setActiveTab('passport')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'passport'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Profile (Passport)
            </button>
          </div>
        </div>
      )}

      {/* View Mode 2: Side-by-Side (Both Home & Profile Pages visible at once) */}
      {viewMode === 'side-by-side' && (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-2">
          {/* Left Screen: Home */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5b4dff]" />
              Screen 1: Home / World Reach
            </div>
            {renderDeviceScreen('home')}
          </div>

          {/* Right Screen: Passport */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Screen 2: Digital Passport / Profile
            </div>
            {renderDeviceScreen('passport')}
          </div>
        </div>
      )}

      {/* View Mode 3: Full Screen Responsive */}
      {viewMode === 'full' && (
        <div className="w-full max-w-md bg-[#fbfbfd] rounded-[36px] shadow-2xl overflow-hidden border border-slate-200 min-h-[750px] relative text-slate-900">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs">
            <span className="font-bold">atlas. Responsive View</span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeTab === 'home' ? 'bg-[#5b4dff] text-white' : 'text-slate-400'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('passport')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  activeTab === 'passport' ? 'bg-[#5b4dff] text-white' : 'text-slate-400'
                }`}
              >
                Passport
              </button>
            </div>
          </div>

          <div className="p-2">
            {activeTab === 'home' ? (
              <HomeScreen
                countries={countries}
                profile={profile}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onNavigateToPassport={() => setActiveTab('passport')}
                onSelectCountry={(id) => {}}
              />
            ) : (
              <PassportScreen
                profile={profile}
                countries={countries}
                onRemoveCountry={handleRemoveCountry}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}
          </div>
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      )}

      {/* Modal for adding new destination */}
      <AddCountryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCountry={handleAddCountry}
        existingCountryIds={countries.map((c) => c.id)}
      />
    </PhoneFrame>
  );
}
