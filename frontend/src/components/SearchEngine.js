import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ArrowRight, Zap, X, Loader2, Package } from 'lucide-react';
import { BRANDS } from '../constants/categories';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ── Debounce hook ── */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const SearchEngine = () => {
  const navigate = useNavigate();

  /* Brand/Model state */
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  /* Live text search */
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debouncedQuery = useDebounce(query, 280);

  const brandData = BRANDS.find(b => b.id === selectedBrand);
  const isActive = selectedBrand !== '' || query.length > 0;

  /* ── Live search fetch ── */
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setTotalResults(0);
      setShowDropdown(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    axios.get(`${API}/products?search=${encodeURIComponent(debouncedQuery)}&limit=6`, {
      signal: controller.signal,
    })
      .then(({ data }) => {
        setResults(data.products || []);
        setTotalResults(data.total || 0);
        setShowDropdown(true);
        setActiveIndex(-1);
      })
      .catch(() => {})
      .finally(() => setSearching(false));
    return () => controller.abort();
  }, [debouncedQuery]);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Keyboard navigation ── */
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) {
      if (e.key === 'Enter' && query.trim().length >= 2) {
        navigate(`/urunler?search=${encodeURIComponent(query.trim())}`);
        setShowDropdown(false);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        navigate(`/urun/${results[activeIndex].slug}`);
        clearSearch();
      } else {
        navigate(`/urunler?search=${encodeURIComponent(query.trim())}`);
        setShowDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  /* ── Brand/Model search ── */
  const handleBrandSearch = () => {
    if (!selectedBrand) return;
    let url = `/urunler/${selectedBrand}`;
    if (selectedModel && brandData) {
      const model = brandData.models.find(m => m.id === selectedModel);
      if (model) url += `/${model.slug}`;
    }
    navigate(url);
  };

  const selectBase = `w-full appearance-none bg-[#0a0a0a] border text-white text-sm font-medium rounded-xl py-3 pl-4 pr-9 transition-all duration-200 cursor-pointer outline-none [&>option]:bg-[#111]`;

  return (
    <div className={`relative rounded-2xl transition-all duration-500 ${isActive ? 'neon-search-active' : 'neon-search-idle'}`}>
      <div className={`bg-[#0d0d0d] rounded-2xl overflow-visible border transition-all duration-500 ${isActive ? 'border-orange-500/60' : 'border-orange-500/25'}`}>

        {/* Top accent line */}
        <div className={`h-[2px] rounded-t-2xl transition-all duration-500 ${isActive
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
            Ürün adı yazın veya marka/model seçin
          </p>
        </div>

        {/* Divider */}
        <div className={`h-px transition-all duration-500 ${isActive
          ? 'bg-gradient-to-r from-[#1e1e1e] via-orange-500/30 to-[#1e1e1e]'
          : 'bg-gradient-to-r from-[#1e1e1e] via-[#2a2a2a] to-[#1e1e1e]'}`}
        />

        <div className="p-5 sm:p-6 space-y-4">

          {/* ── LIVE SEARCH INPUT ── */}
          <div ref={dropdownRef} className="relative">
            <label className={`block text-[10px] font-black mb-2 uppercase tracking-widest transition-colors duration-200 ${query ? 'text-orange-400' : 'text-neutral-500'}`}>
              Ürün / Parça Ara
            </label>
            <div className="relative flex items-center">
              {searching
                ? <Loader2 size={16} className="absolute left-4 text-orange-400 animate-spin pointer-events-none" />
                : <Search size={16} className={`absolute left-4 pointer-events-none transition-colors duration-200 ${query ? 'text-orange-400' : 'text-neutral-600'}`} />
              }
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder='Örn: "yamaha fren", "honda filtre", "yağ"...'
                data-testid="search-text-input"
                className={`w-full bg-[#0a0a0a] border rounded-xl py-3.5 pl-11 pr-10 text-sm text-white placeholder-neutral-700 outline-none transition-all duration-200 ${
                  query
                    ? 'border-orange-500/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 shadow-[0_0_12px_rgba(249,115,22,0.08)]'
                    : 'border-[#2a2a2a] hover:border-orange-500/25 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15'
                }`}
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3.5 text-neutral-600 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* ── LIVE RESULTS DROPDOWN ── */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d0d] border border-orange-500/25 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 z-50"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.12)' }}>

                {/* Results header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e1e1e]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">
                    {results.length > 0 ? `${totalResults} sonuç bulundu` : 'Sonuç bulunamadı'}
                  </span>
                  {totalResults > 6 && (
                    <button
                      onClick={() => { navigate(`/urunler?search=${encodeURIComponent(query)}`); clearSearch(); }}
                      className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
                    >
                      Tümünü gör <ArrowRight size={10} />
                    </button>
                  )}
                </div>

                {results.length === 0 ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <Package size={28} className="text-neutral-700 mb-2" />
                    <p className="text-sm text-neutral-500 font-semibold">"{query}" için ürün bulunamadı</p>
                    <p className="text-xs text-neutral-700 mt-1">Farklı bir arama deneyin</p>
                  </div>
                ) : (
                  /* Product list */
                  <div>
                    {results.map((product, idx) => (
                      <button
                        key={product.id}
                        onClick={() => { navigate(`/urun/${product.slug}`); clearSearch(); }}
                        data-testid={`search-result-${idx}`}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-500/8 border-b border-[#181818] last:border-0 transition-all duration-150 text-left group ${
                          activeIndex === idx ? 'bg-orange-500/10' : ''
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#111] border border-[#222]">
                          {product.image
                            ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-neutral-700" /></div>
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-orange-300 transition-colors leading-tight">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-orange-500/70 uppercase tracking-wider">{product.brand}</span>
                            <span className="text-[10px] text-neutral-700">•</span>
                            <span className="text-[10px] text-neutral-600 truncate">{product.category}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-black text-orange-400 font-chivo whitespace-nowrap">
                            {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </p>
                          {product.stock > 0
                            ? <p className="text-[9px] text-green-500 font-bold mt-0.5">Stokta</p>
                            : <p className="text-[9px] text-red-500 font-bold mt-0.5">Tükendi</p>
                          }
                        </div>
                      </button>
                    ))}

                    {/* Footer CTA */}
                    {totalResults > 0 && (
                      <button
                        onClick={() => { navigate(`/urunler?search=${encodeURIComponent(query)}`); clearSearch(); }}
                        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-orange-400 hover:text-white hover:bg-orange-500/10 transition-all duration-150 border-t border-[#1a1a1a]"
                      >
                        <Search size={12} />
                        "{query}" için tüm {totalResults} sonucu gör
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1e1e1e]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-700">veya markaya göre filtrele</span>
            <div className="flex-1 h-px bg-[#1e1e1e]" />
          </div>

          {/* ── BRAND / MODEL DROPDOWNS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Brand */}
            <div>
              <label className={`block text-[10px] font-black mb-2 uppercase tracking-widest transition-colors duration-200 ${selectedBrand ? 'text-orange-400' : 'text-neutral-500'}`}>
                Marka
              </label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={e => { setSelectedBrand(e.target.value); setSelectedModel(''); }}
                  data-testid="search-brand-select"
                  className={`${selectBase} ${selectedBrand
                    ? 'border-orange-500/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25'
                    : 'border-[#2a2a2a] hover:border-orange-500/20 focus:border-orange-500/40'}`}
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">Marka Seçin...</option>
                  {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <ChevronDown size={13} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${selectedBrand ? 'text-orange-400' : 'text-neutral-600'}`} />
              </div>
            </div>

            {/* Model */}
            <div>
              <label className={`block text-[10px] font-black mb-2 uppercase tracking-widest transition-colors duration-200 ${selectedModel ? 'text-orange-400' : 'text-neutral-500'}`}>
                Model
                {selectedBrand && !selectedModel && (
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
                onClick={handleBrandSearch}
                disabled={!selectedBrand}
                data-testid="search-submit-btn"
                className={`w-full flex items-center justify-center gap-2 h-[46px] rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.97]
                  ${selectedBrand
                    ? 'btn-neon-orange text-white cursor-pointer'
                    : 'bg-[#141414] text-neutral-600 cursor-not-allowed border border-[#252525]'}`}
              >
                <Search size={14} />
                Parça Ara
              </button>
            </div>
          </div>

          {/* Quick access */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
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
