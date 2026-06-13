import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ArrowRight, Zap } from 'lucide-react';
import { BRANDS } from '../constants/categories';

const SearchEngine = () => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const navigate = useNavigate();

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

  const selectBase = `
    w-full appearance-none bg-[#0d0d0d] border
    text-white text-sm font-medium rounded-xl py-3.5 pl-4 pr-10
    transition-all duration-200 cursor-pointer outline-none
    [&>option]:bg-[#111]
  `.replace(/\s+/g, ' ');

  return (
    <div
      className={`relative rounded-2xl transition-all duration-500 ${isActive ? 'neon-search-active' : 'neon-search-idle'}`}
    >
      {/* Main card */}
      <div className={`bg-[#0d0d0d] rounded-2xl overflow-hidden border transition-all duration-500 ${isActive ? 'border-orange-500/60' : 'border-orange-500/25'}`}>

        {/* Top accent line */}
        <div className={`h-[2px] transition-all duration-500 ${isActive
          ? 'bg-gradient-to-r from-transparent via-orange-500 to-transparent'
          : 'bg-gradient-to-r from-transparent via-orange-500/40 to-transparent'
        }`} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className={`p-1 rounded-md transition-all duration-300 ${isActive ? 'bg-orange-500/20' : 'bg-orange-500/10'}`}>
              <Zap size={14} className="text-orange-400" fill="currentColor" />
            </div>
            <h2 className="text-white font-black text-lg sm:text-xl tracking-tight">
              Motosikletinize Uygun Parçayı Bulun
            </h2>
          </div>
          <p className="text-neutral-500 text-sm ml-[30px]">
            Marka ve model seçin — uyumlu tüm parçaları anında listeleyelim
          </p>
        </div>

        {/* Divider */}
        <div className={`h-px transition-all duration-500 ${isActive
          ? 'bg-gradient-to-r from-[#1e1e1e] via-orange-500/30 to-[#1e1e1e]'
          : 'bg-gradient-to-r from-[#1e1e1e] via-[#2a2a2a] to-[#1e1e1e]'
        }`} />

        {/* Selects */}
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

            {/* Brand */}
            <div className="group">
              <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors duration-200 ${isActive ? 'text-orange-400' : 'text-neutral-500'}`}>
                Marka
              </label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  data-testid="search-brand-select"
                  className={`${selectBase} ${isActive
                    ? 'border-orange-500/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.08)]'
                    : 'border-[#2a2a2a] hover:border-orange-500/30 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15'
                  }`}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">Marka Seçin...</option>
                  {BRANDS.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${isActive ? 'text-orange-400' : 'text-neutral-500'}`}
                />
              </div>
            </div>

            {/* Model */}
            <div className="group">
              <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors duration-200 ${selectedModel ? 'text-orange-400' : 'text-neutral-500'}`}>
                Model
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!selectedBrand}
                  data-testid="search-model-select"
                  className={`${selectBase} disabled:opacity-30 disabled:cursor-not-allowed ${selectedModel
                    ? 'border-orange-500/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.08)]'
                    : 'border-[#2a2a2a] hover:border-orange-500/30 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15'
                  }`}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">
                    {selectedBrand ? 'Model Seçin...' : 'Önce marka seçin'}
                  </option>
                  {brandData?.models.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${selectedModel ? 'text-orange-400' : 'text-neutral-500'}`}
                />
              </div>

              {/* Model count hint */}
              {isActive && !selectedModel && (
                <p className="text-[11px] text-orange-500/70 mt-1.5 ml-0.5 font-medium">
                  {brandData?.models.length} model mevcut
                </p>
              )}
            </div>

            {/* Search Button */}
            <div>
              <label className="hidden sm:block text-xs font-bold text-transparent mb-2 uppercase tracking-wider select-none">
                Ara
              </label>
              <button
                onClick={handleSearch}
                disabled={!selectedBrand}
                data-testid="search-submit-btn"
                className={`w-full flex items-center justify-center gap-2.5 h-[50px] rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300
                  ${isActive
                    ? 'btn-neon-orange text-white cursor-pointer'
                    : 'bg-[#1a1a1a] text-neutral-600 cursor-not-allowed border border-[#2a2a2a]'
                  }`}
              >
                <Search size={16} />
                Parça Ara
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-2 mt-5 flex-wrap">
            <span className="text-[11px] text-neutral-600 font-semibold uppercase tracking-widest mr-1">Hızlı Erişim:</span>
            {BRANDS.map(b => (
              <button
                key={b.id}
                onClick={() => navigate(`/urunler/${b.slug}`)}
                data-testid={`quick-brand-${b.id}`}
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white bg-[#141414] hover:bg-orange-500 px-3 py-1.5 rounded-lg border border-[#2a2a2a] hover:border-orange-500 transition-all duration-200"
              >
                {b.name}
                <ArrowRight
                  size={11}
                  className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchEngine;
