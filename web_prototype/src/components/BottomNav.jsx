import React from 'react';
import { Home, Map, Compass, BarChart2, User } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'map', icon: Map, label: 'Explore' },
    { id: 'passport', icon: Compass, label: 'Passport' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto">
      {/* Floating Pill Dock inspired directly by Fremd */}
      <nav className="flex items-center gap-1.5 p-2 bg-white/90 backdrop-blur-xl border border-white/60 rounded-full shadow-2xl fremd-dock-shadow ring-1 ring-black/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = 
            activeTab === tab.id || 
            (tab.id === 'passport' && activeTab === 'profile') ||
            (tab.id === 'home' && activeTab === 'map' && activeTab !== 'passport');

          const isCurrentActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isCurrentActive
                  ? 'bg-[#5b4dff]/12 text-[#5b4dff] scale-105'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
              title={tab.label}
            >
              <Icon size={20} strokeWidth={isCurrentActive ? 2.5 : 1.8} />

              {/* Tiny indicator dot for active tab */}
              {isCurrentActive && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#5b4dff]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
