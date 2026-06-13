import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ArrowRight, Zap } from 'lucide-react';
import { BRANDS } from '../constants/categories';

const SearchEngine = () => {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const brandData = BRANDS.find(b => b.id === selectedBrand);
  const isActive = selectedBrand !== '';

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

  const selectBase = `w-full appearance-none bg-[#0a0a0a] border text-white text-sm font-medium rounded-xl py-3.5 pl-4 pr-9 transition-all duration-200 cursor-pointer outline-none [&>option]:bg-[#111]`;

  return (
    <div className={`relative rounded-2xl transition-all duration-500 ${isActive ? 'neon-search-active' : 'neon-search-idle'}`}>
      <div className={`bg-[#0d0d0d] rounded-2xl overflow-hidden border transition-all duration-500 ${isActive ? 'border-orange-500/60' : 'border-orange-500/25'}`}>

        {/* Top accent line */}
        <div className={`h-[2px] transition-all duration-500 ${isActive
          ? 'bg-gradient-to-r from-transparent via-orange-500 to-transparent'
          : 'bg-gradient-to-r from-transparent via-orange-500/40 to-transparent'}`}
        />

        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className={`p-1 rounded-md transition-all duration-300 ${isActive ? 'bg-orange-500/20' : 'bg-orange-500/10'}`}>
              <Zap size={13} className="text-orange-400" fill="currentColor" />
            </div>
            <h2 className="text-white font-black text-base sm:text-lg tracking-tight">
              Motosikletinize Uygun Parçayı Bulun
            </h2>
          </div>
          <p className="text-neutral-500 text-xs ml-[30px]">
            Marka ve model seçin — uyumlu tüm parçaları anında listeleyelim
          </p>
        </div>

        {/* Divider */}
        <div className={`h-px transition-all duration-500 ${isActive
          ? 'bg-gradient-to-r from-[#1e1e1e] via-orange-500/30 to-[#1e1e1e]'
          : 'bg-gradient-to-r from-[#1e1e1e] via-[#2a2a2a] to-[#1e1e1e]'}`}
        />

        <div className="p-5 sm:p-6">
          {/* Brand / Model / Button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Brand */}
            <div>
              <label className={`block text-[10px] font-black mb-2 uppercase tracking-widest transition-colors ${isActive ? 'text-orange-400' : 'text-neutral-500'}`}>
                Marka
              </label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  data-testid="search-brand-select"
                  className={`${selectBase} ${isActive
                    ? 'border-orange-500/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25'
                    : 'border-[#2a2a2a] hover:border-orange-500/20 focus:border-orange-500/40'}`}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">Marka Seçin...</option>
                  {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <ChevronDown size={13} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isActive ? 'text-orange-400' : 'text-neutral-600'}`} />
              </div>
            </div>

            {/* Model */}
            <div>
              <label className={`block text-[10px] font-black mb-2 uppercase tracking-widest transition-colors ${selectedModel ? 'text-orange-400' : 'text-neutral-500'}`}>
                Model
                {isActive && !selectedModel && (
                  <span className="ml-1.5 text-orange-500/60 normal-case font-medium">({brandData?.models.length} model)</span>
                )}
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  disabled={!selectedBrand}
                  data-testid="search-model-select"
                  className={`${selectBase} disabled:opacity-30 disabled:cursor-not-allowed ${selectedModel
                    ? 'border-orange-500/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25'
                    : 'border-[#2a2a2a] hover:border-orange-500/20 focus:border-orange-500/40'}`}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">{selectedBrand ? 'Model Seçin...' : 'Önce marka seçin'}</option>
                  {brandData?.models.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
                <ChevronDown size={13} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${selectedModel ? 'text-orange-400' : 'text-neutral-600'}`} />
              </div>
            </div>

            {/* Search button */}
            <div>
              <label className="hidden sm:block text-[10px] font-bold text-transparent mb-2 uppercase tracking-widest select-none">Ara</label>
              <button
                onClick={handleSearch}
                disabled={!selectedBrand}
                data-testid="search-submit-btn"
                className={`w-full flex items-center justify-center gap-2 h-[50px] rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.97]
                  ${isActive
                    ? 'btn-neon-orange text-white cursor-pointer'
                    : 'bg-[#141414] text-neutral-600 cursor-not-allowed border border-[#252525]'}`}
              >
                <Search size={14} />
                Parça Ara
              </button>
            </div>
          </div>

          {/* Quick access */}
          <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-[#1a1a1a]">
            <span className="text-[10px] text-neutral-700 font-black uppercase tracking-widest">Hızlı:</span>
            {BRANDS.map(b => (
              <button
                key={b.id}
                onClick={() => navigate(`/urunler/${b.slug}`)}
                data-testid={`quick-brand-${b.id}`}
                className="group inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 hover:text-white bg-[#141414] hover:bg-orange-500 px-3 py-1.5 rounded-lg border border-[#252525] hover:border-orange-500 transition-all duration-200"
              >
                {b.name}
                <ArrowRight size={10} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchEngine;
