import React, { useState } from 'react';
import { X, Search, Check, Plus, Globe, MapPin, Heart, Home } from 'lucide-react';
import { availableCatalog } from '../data/travelData';

export default function AddCountryModal({ isOpen, onClose, onAddCountry, existingCountryIds }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('visited');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const filteredCatalog = availableCatalog.filter(
    (c) =>
      !existingCountryIds.includes(c.id) &&
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCountry) return;

    onAddCountry({
      id: selectedCountry.id,
      name: selectedCountry.name,
      flag: selectedCountry.flag,
      status: selectedStatus,
      year: new Date().getFullYear().toString(),
      notes: notes || `Marked in ${new Date().getFullYear()}`,
      visits: selectedStatus === 'want' ? 0 : 1,
    });

    setSelectedCountry(null);
    setSearchTerm('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300"
      >
        {/* Modal Handlebar (Mobile feel) */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              Mark Country<span className="text-[#5b4dff]">.</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Add a new destination to your world passport</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search country (e.g. Argentina, Greece)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl text-sm border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-[#5b4dff]/30 focus:border-[#5b4dff] transition-all"
          />
        </div>

        {/* Quick select list */}
        <div className="overflow-y-auto no-scrollbar max-h-40 mb-4 border border-slate-100 rounded-2xl p-1 divide-y divide-slate-50">
          {filteredCatalog.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No matching countries found or already added.
            </div>
          ) : (
            filteredCatalog.map((c) => {
              const isSelected = selectedCountry?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCountry(c)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected ? 'bg-[#5b4dff]/10 text-[#5b4dff] font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{c.flag}</span>
                    <span className="text-sm">{c.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{c.continent}</span>
                  </div>
                  {isSelected && <Check size={16} className="text-[#5b4dff]" />}
                </button>
              );
            })
          )}
        </div>

        {/* Status Category Selection */}
        {selectedCountry && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Travel Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('visited')}
                  className={`py-2 px-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    selectedStatus === 'visited'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <MapPin size={16} />
                  <span>Visited</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('lived')}
                  className={`py-2 px-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    selectedStatus === 'lived'
                      ? 'bg-[#5b4dff] text-white border-[#5b4dff] shadow-md shadow-[#5b4dff]/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <Home size={16} />
                  <span>Lived in</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('want')}
                  className={`py-2 px-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    selectedStatus === 'want'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <Heart size={16} />
                  <span>Want to visit</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Note or Story (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Summer holiday with friends"
                className="w-full px-3.5 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-[#5b4dff]/30 focus:border-[#5b4dff]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#5b4dff] hover:bg-[#4d3ef5] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#5b4dff]/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Plus size={16} />
              Confirm & Stamp Passport
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
