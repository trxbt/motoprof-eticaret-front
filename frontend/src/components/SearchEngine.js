import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bike } from 'lucide-react';
import { BRANDS } from '../constants/categories';

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="bg-[#171717]/95 backdrop-blur-md border border-[#3f3f46] rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/50">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Bike size={20} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base">Motosikletinize Uygun Parçayı Bulun</h2>
          <p className="text-neutral-400 text-xs">Marka ve model seçin, uyumlu tüm ürünleri görün</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Brand */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Marka</label>
          <select
            value={selectedBrand}
            onChange={handleBrandChange}
            onKeyDown={handleKeyDown}
            data-testid="search-brand-select"
            className="bg-[#0a0a0a] border border-[#3f3f46] text-white rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Marka Seçin</option>
            {BRANDS.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand}
            data-testid="search-model-select"
            className="bg-[#0a0a0a] border border-[#3f3f46] text-white rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">Model Seçin</option>
            {brandData?.models.map(m => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 opacity-0 hidden sm:block">Ara</label>
          <button
            onClick={handleSearch}
            disabled={!selectedBrand}
            data-testid="search-submit-btn"
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-lg transition-all duration-200 text-sm uppercase tracking-wider active:scale-95"
          >
            <Search size={16} />
            Parça Ara
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchEngine;
