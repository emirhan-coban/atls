import React, { useState } from 'react';

/**
 * High-fidelity stylised vector world map inspired by Fremd's sleek blue/indigo aesthetic.
 */
export default function WorldMap({ countries, activeFilter, onSelectCountry }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Quick lookup for highlighted countries
  const countryStatusMap = {};
  countries.forEach(c => {
    countryStatusMap[c.id] = c;
  });

  const getFillColor = (id) => {
    const country = countryStatusMap[id];
    if (!country) return '#e2e8f0'; // Base landmass color (light grey)

    if (activeFilter && activeFilter !== 'all' && country.status !== activeFilter) {
      return '#cbd5e1'; // Dimmed if filtered out
    }

    switch (country.status) {
      case 'lived':
        return '#4f46e5'; // Deep Indigo (Fremd brand color)
      case 'visited':
        return '#3b82f6'; // Bright electric blue
      case 'want':
        return '#a855f7'; // Vibrant purple
      default:
        return '#e2e8f0';
    }
  };

  return (
    <div className="relative w-full aspect-[16/9] select-none overflow-hidden rounded-2xl bg-[#f8fafc]/80 p-2 border border-slate-100">
      {/* Subtle coordinate grid lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} 
      />

      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full drop-shadow-sm transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.2" />
          </linearGradient>
          <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Global landmass base paths (simplified high-style geometry) */}
        <g stroke="#ffffff" strokeWidth="1" strokeLinejoin="round">
          {/* North America - Canada */}
          <path
            id="CA"
            d="M 120 70 L 260 40 L 320 60 L 340 100 L 270 140 L 190 145 L 140 130 Z"
            fill={getFillColor('CA')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Canada (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('CA')}
          />
          {/* North America - USA */}
          <path
            id="US"
            d="M 130 135 L 290 140 L 310 190 L 250 220 L 180 215 L 140 170 Z"
            fill={getFillColor('US')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('United States (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('US')}
          />
          {/* Alaska (US) */}
          <path
            d="M 80 50 L 125 55 L 115 90 L 75 75 Z"
            fill={getFillColor('US')}
            className="transition-colors duration-200"
          />
          {/* Mexico & Central America */}
          <path
            id="MX"
            d="M 160 215 L 230 220 L 250 260 L 220 280 L 190 250 Z"
            fill={getFillColor('MX')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Mexico')}
            onMouseLeave={() => setHoveredRegion(null)}
          />

          {/* South America - Brazil */}
          <path
            id="BR"
            d="M 270 290 L 360 300 L 390 350 L 340 420 L 280 370 L 260 310 Z"
            fill={getFillColor('BR')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Brazil (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('BR')}
          />
          {/* South America - Peru/West coast */}
          <path
            id="PE"
            d="M 240 310 L 275 315 L 280 370 L 250 400 L 230 340 Z"
            fill={getFillColor('PE')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Peru (Want to visit)')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* South America - Argentina & South */}
          <path
            d="M 270 380 L 330 380 L 310 470 L 280 470 Z"
            fill="#e2e8f0"
            className="transition-colors duration-200"
          />

          {/* Europe - United Kingdom */}
          <path
            id="GB"
            d="M 450 110 L 465 105 L 470 135 L 455 140 Z"
            fill={getFillColor('GB')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('United Kingdom (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('GB')}
          />
          {/* Europe - Iceland */}
          <path
            id="IS"
            d="M 410 70 L 435 65 L 440 85 L 415 85 Z"
            fill={getFillColor('IS')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Iceland (Want to visit)')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Europe - Scandinavia / Norway */}
          <path
            id="NO"
            d="M 500 60 L 530 50 L 540 110 L 505 115 Z"
            fill={getFillColor('NO')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Norway (Want to visit)')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Europe - Western (France, Spain, Portugal, Italy, Germany) */}
          {/* Portugal */}
          <path
            id="PT"
            d="M 440 180 L 452 178 L 450 205 L 442 205 Z"
            fill={getFillColor('PT')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            filter="url(#mapGlow)"
            onMouseEnter={() => setHoveredRegion('Portugal (Lived In / Home)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('PT')}
          />
          {/* Spain */}
          <path
            id="ES"
            d="M 453 178 L 490 178 L 485 215 L 451 210 Z"
            fill={getFillColor('ES')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Spain (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('ES')}
          />
          {/* France */}
          <path
            id="FR"
            d="M 470 140 L 510 135 L 515 175 L 475 175 Z"
            fill={getFillColor('FR')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('France (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('FR')}
          />
          {/* Germany & Central EU */}
          <path
            id="DE"
            d="M 510 120 L 550 115 L 555 155 L 515 155 Z"
            fill={getFillColor('DE')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Germany (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('DE')}
          />
          {/* Italy */}
          <path
            id="IT"
            d="M 515 175 L 535 170 L 545 215 L 530 220 Z"
            fill={getFillColor('IT')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Italy (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('IT')}
          />
          {/* Eastern Europe / Russia */}
          <path
            d="M 550 60 L 850 50 L 830 140 L 680 145 L 555 120 Z"
            fill="#3b82f6" /* Featured blue highlight from Fremd screen */
            className="transition-colors duration-200 opacity-90 cursor-pointer"
            onMouseEnter={() => setHoveredRegion('Eurasia Region')}
            onMouseLeave={() => setHoveredRegion(null)}
          />

          {/* Turkey & Middle East */}
          <path
            id="TR"
            d="M 570 170 L 630 165 L 635 195 L 575 195 Z"
            fill={getFillColor('TR')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Turkey (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('TR')}
          />

          {/* Africa */}
          <path
            id="MA"
            d="M 440 215 L 490 215 L 480 255 L 430 245 Z"
            fill={getFillColor('MA')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Morocco (Want to visit)')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Rest of Africa */}
          <path
            d="M 480 220 L 590 220 L 580 320 L 530 420 L 460 330 L 440 250 Z"
            fill="#e2e8f0"
            className="transition-colors duration-200"
          />

          {/* Asia - China & Central Asia */}
          <path
            id="CN"
            d="M 680 145 L 820 140 L 810 230 L 710 240 L 660 190 Z"
            fill="#3b82f6" /* Blue sector highlight from Fremd screen */
            className="transition-colors duration-200 opacity-90 cursor-pointer"
            onMouseEnter={() => setHoveredRegion('East Asia Sector')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          {/* Asia - Japan */}
          <path
            id="JP"
            d="M 850 165 L 870 160 L 865 210 L 845 200 Z"
            fill={getFillColor('JP')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Japan (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('JP')}
          />
          {/* Asia - Taiwan */}
          <path
            id="TW"
            d="M 810 240 L 825 240 L 820 265 L 810 260 Z"
            fill={getFillColor('TW')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            filter="url(#mapGlow)"
            onMouseEnter={() => setHoveredRegion('Taiwan (Lived In)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('TW')}
          />
          {/* Asia - Vietnam / SE Asia */}
          <path
            id="VN"
            d="M 740 250 L 780 250 L 775 300 L 745 290 Z"
            fill={getFillColor('VN')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('Vietnam (Visited)')}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => onSelectCountry && onSelectCountry('VN')}
          />

          {/* Australia */}
          <path
            id="AU"
            d="M 790 350 L 900 340 L 880 430 L 800 420 Z"
            fill="#e2e8f0"
            className="transition-colors duration-200"
          />
          {/* New Zealand */}
          <path
            id="NZ"
            d="M 915 420 L 935 415 L 925 460 L 910 455 Z"
            fill={getFillColor('NZ')}
            className="transition-colors duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredRegion('New Zealand (Want to visit)')}
            onMouseLeave={() => setHoveredRegion(null)}
          />
        </g>

        {/* Home Beacon / Pulse at Lisbon */}
        <circle cx="445" cy="192" r="4" fill="#4f46e5" className="animate-ping opacity-75" />
        <circle cx="445" cy="192" r="3.5" fill="#4f46e5" />
        <circle cx="445" cy="192" r="1.5" fill="#ffffff" />

        {/* Taiwan Beacon */}
        <circle cx="818" cy="252" r="3" fill="#4f46e5" />
        <circle cx="818" cy="252" r="1.2" fill="#ffffff" />
      </svg>

      {/* Floating active pill tag on map (like "VERIFIED" in Fremd) */}
      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 shadow-sm border border-slate-200/60 backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">
          {hoveredRegion || '14 Marked Borders'}
        </span>
      </div>

      {/* Live Coordinate tag top right */}
      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/5 text-[9px] font-mono font-medium text-slate-500">
        38.7223° N, 9.1393° W
      </div>
    </div>
  );
}
