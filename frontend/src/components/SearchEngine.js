import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { BRANDS } from '../constants/categories';

const STEPS = [
  { num: '01', label: 'Marka' },
  { num: '02', label: 'Model' },
  { num: '03', label: 'Ara' },
];

const SearchEngine = () => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const navigate = useNavigate();

  const brandData = BRANDS.find(b => b.id === selectedBrand);

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
    setSelectedModel('');
  };

  const handleSearch = () => {
    if (!selectedBrand) return;
    let url = `/urunler/${selectedBrand}`;
    if (selectedModel && brandData) {
      const model = brandData.models.find(m => m.id === selectedModel);
      if (model) url += `/${model.slug}`;
    }
    navigate(url);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden glow-orange">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-500/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              {i > 0 && <div className="w-6 h-px bg-orange-500/20" />}
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                (i === 0 && selectedBrand) || (i === 1 && selectedModel) || (i === 2 && selectedBrand)
                  ? 'text-orange-400' : 'text-neutral-600'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                  (i === 0 && selectedBrand) || (i === 1 && selectedModel)
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-neutral-700 text-neutral-600'
                }`}>{s.num.slice(1)}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
        <span className="text-xs text-neutral-500 hidden md:block">Uyumlu parçaları anında bulun</span>
      </div>

      {/* Selects */}
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Brand */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">Marka Seçin</label>
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={handleBrandChange}
                data-testid="search-brand-select"
                className="w-full appearance-none bg-[#0d0d0d] border border-[#2a2a2a] hover:border-[#3f3f46] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 text-white rounded-xl py-3 pl-4 pr-10 text-sm transition-all cursor-pointer outline-none"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">Tüm Markalar</option>
                {BRANDS.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {/* Model */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">Model Seçin</label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand}
                data-testid="search-model-select"
                className="w-full appearance-none bg-[#0d0d0d] border border-[#2a2a2a] hover:border-[#3f3f46] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 text-white rounded-xl py-3 pl-4 pr-10 text-sm transition-all cursor-pointer outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">Tüm Modeller</option>
                {brandData?.models.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2 sm:invisible">Ara</label>
            <button
              onClick={handleSearch}
              disabled={!selectedBrand}
              data-testid="search-submit-btn"
              className="w-full group flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-[#1a1a1a] disabled:text-neutral-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 text-sm uppercase tracking-widest glow-orange-sm active:scale-[0.98] shimmer"
            >
              <Search size={15} />
              Parça Ara
            </button>
          </div>
        </div>

        {/* Quick brand links */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Hızlı Seçim:</span>
          {BRANDS.map(b => (
            <button
              key={b.id}
              onClick={() => navigate(`/urunler/${b.slug}`)}
              data-testid={`quick-brand-${b.id}`}
              className="text-[10px] font-semibold text-neutral-500 hover:text-orange-400 px-2.5 py-1 rounded-lg border border-[#2a2a2a] hover:border-orange-500/30 transition-all uppercase tracking-wider"
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchEngine;
