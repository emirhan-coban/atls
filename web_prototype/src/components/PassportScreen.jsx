import React, { useState } from 'react';
import { 
  QrCode, 
  Share2, 
  MapPin, 
  Edit3, 
  Award, 
  Globe2, 
  Check, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  PlaneTakeoff,
  Trash2
} from 'lucide-react';
import { passportStamps } from '../data/travelData';

export default function PassportScreen({ 
  profile, 
  countries, 
  onRemoveCountry,
  onOpenAddModal 
}) {
  const [activeTab, setActiveTab] = useState('visited');
  const [copiedToast, setCopiedToast] = useState(false);

  // Dynamic statistics
  const visitedCountries = countries.filter(c => c.status === 'visited');
  const livedCountries = countries.filter(c => c.status === 'lived');
  const wantCountries = countries.filter(c => c.status === 'want');

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const getFilteredList = () => {
    switch (activeTab) {
      case 'lived': return livedCountries;
      case 'want': return wantCountries;
      case 'stamps': return [];
      default: return visitedCountries;
    }
  };

  return (
    <div className="flex flex-col pb-32">
      {/* Header Bar */}
      <header className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 font-['Plus_Jakarta_Sans']">
            Your passport<span className="text-[#5b4dff]">.</span>
          </h1>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
            Verified Digital Citizen Credential
          </p>
        </div>

        <button 
          className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Edit3 size={13} />
          <span>Edit</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="px-5 space-y-6">
        {/* PREMIUM TRAVEL PASSPORT CARD (Fremd-inspired luxury card) */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#f8fafc] to-[#ffffff] border border-slate-200/90 p-6 fremd-card-shadow">
          {/* Subtle Security Guilloche / Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] passport-card-pattern pointer-events-none" />

          {/* Top Card Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-[#5b4dff]">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                Official Travel Passport
              </span>
            </div>
            {/* Hologram / Biometric chip graphic */}
            <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-200 via-yellow-300 to-amber-400 shadow-inner border border-amber-300 flex items-center justify-center">
              <div className="w-5 h-3 border border-amber-500/40 rounded-sm flex items-center justify-center">
                <div className="w-2.5 h-1.5 border-t border-b border-amber-600/50" />
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Monogram Box (Like MC in Atlas, enhanced with Fremd depth) */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-[#EBF7EE] text-[#1D5E2D] font-black text-2xl flex items-center justify-center shadow-sm border border-[#D1EBD6]">
                {profile.avatarInitials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#5b4dff] rounded-full border-2 border-white flex items-center justify-center text-white">
                <Check size={11} strokeWidth={3} />
              </span>
            </div>

            {/* Name, Handle, Location */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 truncate">
                {profile.name}
              </h2>
              <div className="text-xs text-slate-500 font-medium">{profile.handle}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2 font-semibold">
                <MapPin size={14} className="text-[#5b4dff]" />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>

          {/* Passport Metadata Strip */}
          <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-50 border border-slate-100 font-mono text-[10px] mb-6">
            <div>
              <div className="text-slate-400 uppercase tracking-wider text-[8px]">Doc No.</div>
              <div className="font-bold text-slate-800">{profile.passportNo}</div>
            </div>
            <div>
              <div className="text-slate-400 uppercase tracking-wider text-[8px]">Borders</div>
              <div className="font-bold text-[#5b4dff]">{countries.length} Recorded</div>
            </div>
            <div>
              <div className="text-slate-400 uppercase tracking-wider text-[8px]">Status</div>
              <div className="font-bold text-emerald-600">VALID / ACTIVE</div>
            </div>
          </div>

          {/* Security Barcode / Machine Readable Zone simulation */}
          <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between">
            <div className="font-mono text-[9px] text-slate-400 tracking-widest uppercase truncate max-w-[200px]">
              P&lt;PRTCHEN&lt;&lt;MAYA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;892410
            </div>
            <QrCode size={24} className="text-slate-700" />
          </div>
        </div>

        {/* STATS TILES (Interactive Filter) */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setActiveTab('visited')}
            className={`py-3.5 px-3 rounded-2xl border text-center transition-all ${
              activeTab === 'visited'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                : 'bg-white border-slate-100 text-slate-900 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className="text-2xl font-black font-mono">
              {visitedCountries.length < 10 ? `0${visitedCountries.length}` : visitedCountries.length}
            </div>
            <div className={`text-[11px] font-bold mt-0.5 flex items-center justify-center gap-1.5 ${
              activeTab === 'visited' ? 'text-white/90' : 'text-slate-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'visited' ? 'bg-white' : 'bg-blue-500'}`} />
              <span>Visited</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('lived')}
            className={`py-3.5 px-3 rounded-2xl border text-center transition-all ${
              activeTab === 'lived'
                ? 'bg-[#5b4dff] text-white border-[#5b4dff] shadow-lg shadow-[#5b4dff]/20'
                : 'bg-white border-slate-100 text-slate-900 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className="text-2xl font-black font-mono">
              {livedCountries.length < 10 ? `0${livedCountries.length}` : livedCountries.length}
            </div>
            <div className={`text-[11px] font-bold mt-0.5 flex items-center justify-center gap-1.5 ${
              activeTab === 'lived' ? 'text-white/90' : 'text-slate-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'lived' ? 'bg-white' : 'bg-[#5b4dff]'}`} />
              <span>Lived in</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('want')}
            className={`py-3.5 px-3 rounded-2xl border text-center transition-all ${
              activeTab === 'want'
                ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20'
                : 'bg-white border-slate-100 text-slate-900 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className="text-2xl font-black font-mono">
              {wantCountries.length < 10 ? `0${wantCountries.length}` : wantCountries.length}
            </div>
            <div className={`text-[11px] font-bold mt-0.5 flex items-center justify-center gap-1.5 ${
              activeTab === 'want' ? 'text-white/90' : 'text-slate-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'want' ? 'bg-white' : 'bg-purple-500'}`} />
              <span>Wishlist</span>
            </div>
          </button>
        </div>

        {/* COUNTRY LIST FOR SELECTED TAB */}
        <section className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              {activeTab === 'visited' && `Visited Countries (${visitedCountries.length})`}
              {activeTab === 'lived' && `Places Lived In (${livedCountries.length})`}
              {activeTab === 'want' && `Dream Destinations (${wantCountries.length})`}
            </h3>
            <button 
              onClick={onOpenAddModal}
              className="text-xs font-bold text-[#5b4dff] hover:underline"
            >
              + Add
            </button>
          </div>

          <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto no-scrollbar">
            {getFilteredList().map((country) => (
              <div 
                key={country.id} 
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {country.name}
                      <span className="text-[10px] font-mono font-medium text-slate-400">
                        {country.year}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1">{country.notes}</div>
                  </div>
                </div>

                <button 
                  onClick={() => onRemoveCountry(country.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-opacity"
                  title="Remove country"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* DIGITAL STAMP COLLECTION (Visual visas) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Official Border Stamps
            </h3>
            <span className="text-[11px] font-bold text-slate-500">{passportStamps.length} Stamps</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {passportStamps.map((stamp) => (
              <div 
                key={stamp.id}
                className="relative bg-white rounded-2xl p-3.5 border-2 border-dashed border-slate-200 flex flex-col justify-between hover:border-[#5b4dff] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-slate-900">{stamp.code}</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {stamp.type}
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-xs font-bold text-slate-800">{stamp.city}</div>
                  <div className="text-[11px] text-slate-400">{stamp.country}</div>
                </div>
                <div className="text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-1.5">
                  {stamp.date}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRIMARY CTA: SHARE YOUR PASSPORT (Fremd deep dark rounded button) */}
        <div className="pt-2">
          <button
            onClick={handleShare}
            className="w-full py-4 px-6 bg-[#1a2e26] hover:bg-[#15251f] text-white rounded-[24px] font-bold text-sm shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            <Share2 size={18} />
            <span>Share your passport</span>
          </button>

          {copiedToast && (
            <div className="mt-2 py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold text-center animate-in fade-in duration-200">
              ✓ Passport profile link copied to clipboard!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
