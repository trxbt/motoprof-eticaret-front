import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, User, Menu, ChevronDown, X, Search,
  ChevronRight, LogIn, UserPlus, Package, Home, Grid3x3,
  Loader2, ArrowRight, TrendingUp, Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useBrands } from '../contexts/BrandsContext';
import { NAVBAR } from '../constants/testIds';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function useDebounce(value, delay) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { brands: BRANDS } = useBrands();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedBrand, setExpandedBrand] = useState(null);
  const searchInputRef = useRef(null);
  const dropdownCloseTimer = useRef(null);
  const debouncedQuery = useDebounce(searchQuery, 260);

  const handleDropdownEnter = (brandId) => {
    if (dropdownCloseTimer.current) {
      clearTimeout(dropdownCloseTimer.current);
      dropdownCloseTimer.current = null;
    }
    setOpenDropdown(brandId);
  };

  const handleDropdownLeave = () => {
    dropdownCloseTimer.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? Math.min((y / maxScroll) * 100, 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cleanup dropdown timer on unmount
  useEffect(() => {
    return () => {
      if (dropdownCloseTimer.current) clearTimeout(dropdownCloseTimer.current);
    };
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchTotal(0);
      setActiveIdx(-1);
      return;
    }
    const ctrl = new AbortController();
    setSearching(true);
    axios.get(`${API}/products?search=${encodeURIComponent(debouncedQuery)}&limit=7`, { signal: ctrl.signal })
      .then(({ data }) => {
        setSearchResults(data.products || []);
        setSearchTotal(data.total || 0);
        setActiveIdx(-1);
      })
      .catch(() => {})
      .finally(() => setSearching(false));
    return () => ctrl.abort();
  }, [debouncedQuery]);

  // Arama açıkken input'a odaklan
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      setSearchQuery('');
      setSearchResults([]);
      document.body.style.overflow = '';
    }
  }, [searchOpen]);

  // Menü açıkken body scroll kilitle
  useEffect(() => {
    if (!searchOpen) {
      document.body.style.overflow = mobileOpen ? 'hidden' : '';
    }
    return () => { if (!searchOpen) document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') { setSearchOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, searchResults.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && searchResults[activeIdx]) {
        navigate(`/urun/${searchResults[activeIdx].slug}`);
        setSearchOpen(false);
      } else if (searchQuery.trim().length >= 2) {
        navigate(`/urunler?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  const closeMenu = () => {
    setMobileOpen(false);
    setExpandedBrand(null);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          scrolled
            ? 'bg-[#030303]/98 backdrop-blur-2xl border-b border-orange-500/15 shadow-[0_4px_30px_rgba(0,0,0,0.6),0_1px_0_rgba(249,115,22,0.12)]'
            : 'bg-[#050505]/95 backdrop-blur-xl border-b border-white/5'
        }`}
        style={{ boxShadow: scrolled ? undefined : '0 1px 0 rgba(249,115,22,0.08)' }}
      >
        {/* Scroll progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-500 transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%`, opacity: scrollProgress > 1 ? 1 : 0 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-12' : 'h-16'}`}>

            {/* Logo */}
            <Link to="/" data-testid={NAVBAR.logo} className="flex items-center gap-3 flex-shrink-0 group">
              <div className={`bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-400 transition-all duration-300 ${scrolled ? 'w-7 h-7' : 'w-8 h-8'}`}>
                <span className={`text-white font-black font-chivo transition-all duration-300 ${scrolled ? 'text-[9px]' : 'text-xs'}`}>MP</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-orange-400 font-black tracking-tighter font-chivo transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`}>MOTO</span>
                <span className={`text-white font-black tracking-tighter font-chivo transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`}>PROF</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {BRANDS.map(brand => (
                <div key={brand.id} className="relative"
                  onMouseEnter={() => handleDropdownEnter(brand.id)}
                  onMouseLeave={handleDropdownLeave}>
                  <Link to={`/urunler/${brand.slug}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/4 uppercase tracking-wider">
                    {brand.name}
                    <ChevronDown size={11} className={`transition-transform duration-200 ${openDropdown === brand.id ? 'rotate-180 text-orange-400' : ''}`} />
                  </Link>
                  {openDropdown === brand.id && (
                    <div
                      className="absolute top-full left-0 z-50 pt-2"
                      onMouseEnter={() => handleDropdownEnter(brand.id)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="bg-[#111111] border border-white/8 rounded-xl p-2 min-w-56 shadow-2xl shadow-black/60 animate-fade-in">
                        <div className="px-3 py-1.5 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">{brand.name} Modelleri</span>
                        </div>
                        {brand.models.map(model => (
                          <Link key={model.id} to={`/urunler/${brand.slug}/${model.slug}`}
                            className="flex items-center justify-between px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group/item">
                            <span>{model.full_name}</span>
                            <ChevronDown size={11} className="rotate-[-90deg] text-neutral-700 group-hover/item:text-orange-500 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Link to="/urunler" className="px-3.5 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/4 uppercase tracking-wider">
                Tüm Ürünler
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} data-testid="navbar-search-btn"
                className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <Search size={17} />
              </button>

              {/* Favoriler */}
              <Link to="/favoriler" data-testid="navbar-wishlist-btn"
                className="relative w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all">
                <Heart size={17} className={wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/sepet" data-testid={NAVBAR.cartBtn}
                className="relative w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <ShoppingCart size={17} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group hidden lg:block">
                  <button data-testid={NAVBAR.profileBtn}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <div className="w-5 h-5 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-black text-orange-400">{(user.name || 'K')[0].toUpperCase()}</span>
                    </div>
                    <span className="hidden sm:inline max-w-16 truncate font-semibold">{(user.name || 'Kullanıcı').split(' ')[0]}</span>
                  </button>
                  <div className="absolute top-full right-0 mt-2 bg-[#111111] border border-white/8 rounded-xl p-2 min-w-44 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs font-semibold text-white">{user.name || 'Kullanıcı'}</p>
                      <p className="text-[10px] text-neutral-600 truncate">{user.email}</p>
                    </div>
                    <Link to="/profil" className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <User size={13} /> Profilim
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors mt-1">
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/giris" data-testid={NAVBAR.loginBtn}
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors uppercase tracking-wider">
                  Giriş Yap
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                data-testid={NAVBAR.mobileMenuBtn}
              >
                <Menu size={18} />
              </button>
            </div>
          </div>

          {/* ── ARAMA OVERLAY ── (nav içindeki eski kısım kaldırıldı) */}
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          ARAMA OVERLAY — nav dışında, fixed
          ═══════════════════════════════════════ */}
      {searchOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[45] bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />

          {/* Panel */}
          <div className="fixed top-12 sm:top-16 left-0 right-0 z-[46] px-4 sm:px-6 lg:px-8 pt-3 pb-4"
            style={{ maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
            <div className="max-w-2xl mx-auto">

              {/* Input */}
              <form onSubmit={(e) => { e.preventDefault(); handleSearchKeyDown({ key: 'Enter', preventDefault: () => {} }); }}
                className="relative mb-3">
                {searching
                  ? <Loader2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 animate-spin pointer-events-none" />
                  : <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                }
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Ürün adı, marka veya parça türü yazın..."
                  data-testid="navbar-search-input"
                  className="w-full bg-[#111] border border-orange-500/40 focus:border-orange-500 text-white placeholder-neutral-600 rounded-2xl py-4 pl-12 pr-12 text-sm transition-all outline-none focus:ring-2 focus:ring-orange-500/20 shadow-2xl"
                />
                <button type="button" onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </form>

              {/* Sonuçlar */}
              {searchQuery.trim().length >= 2 && (
                <div className="bg-[#0d0d0d] border border-[#222] rounded-2xl overflow-hidden shadow-2xl"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.1)' }}>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1a]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      {searching ? 'Aranıyor...' : searchResults.length > 0 ? `${searchTotal} sonuç bulundu` : 'Sonuç bulunamadı'}
                    </span>
                    {searchTotal > 7 && (
                      <button onClick={() => { navigate(`/urunler?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); }}
                        className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
                        Tümünü gör <ArrowRight size={10} />
                      </button>
                    )}
                  </div>

                  {searching && searchResults.length === 0 ? (
                    <div className="py-8 flex items-center justify-center gap-2 text-neutral-600 text-sm">
                      <Loader2 size={16} className="animate-spin" /> Aranıyor...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center text-center px-4">
                      <Package size={30} className="text-neutral-700 mb-3" />
                      <p className="text-sm text-neutral-500 font-semibold">"{searchQuery}" için sonuç bulunamadı</p>
                      <p className="text-xs text-neutral-700 mt-1">Farklı bir kelime deneyin</p>
                    </div>
                  ) : (
                    <>
                      {searchResults.map((product, idx) => (
                        <button key={product.id}
                          onClick={() => { navigate(`/urun/${product.slug}`); setSearchOpen(false); }}
                          data-testid={`search-result-${idx}`}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-orange-500/6 border-b border-[#161616] last:border-0 transition-colors text-left group ${activeIdx === idx ? 'bg-orange-500/8' : ''}`}
                        >
                          <div className="w-12 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#111] border border-[#1e1e1e]">
                            {product.image
                              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Package size={13} className="text-neutral-700" /></div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-orange-300 transition-colors">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-orange-500/70 uppercase">{product.brand}</span>
                              <span className="text-neutral-700 text-[10px]">·</span>
                              <span className="text-[10px] text-neutral-600 truncate">{product.category}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-black text-orange-400 font-chivo whitespace-nowrap">
                              {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </p>
                            <p className={`text-[9px] font-bold mt-0.5 ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {product.stock > 0 ? 'Stokta' : 'Tükendi'}
                            </p>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={() => { navigate(`/urunler?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-bold text-orange-400 hover:text-white hover:bg-orange-500/8 transition-all border-t border-[#1a1a1a]"
                      >
                        <Search size={12} />
                        "{searchQuery}" için tüm {searchTotal} sonucu gör
                        <ArrowRight size={12} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════
          MOBİL MENÜ — Full-screen bottom drawer
          ═══════════════════════════════════════ */}

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] lg:hidden transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '88vh' }}
      >
        <div className="bg-[#0a0a0a] border-t border-orange-500/20 rounded-t-3xl flex flex-col"
          style={{ maxHeight: '88vh', boxShadow: '0 -8px 40px rgba(0,0,0,0.7), 0 -1px 0 rgba(249,115,22,0.15)' }}>

          {/* Top handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-[#333] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a] flex-shrink-0">
            <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-[10px] font-chivo">MP</span>
              </div>
              <span className="font-black text-lg font-chivo tracking-tight">
                <span className="text-orange-400">MOTO</span><span className="text-white">PROF</span>
              </span>
            </Link>
            <button onClick={closeMenu}
              className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white bg-white/5 rounded-full transition-all">
              <X size={15} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* User section */}
            <div className="p-4">
              {user ? (
                <div className="flex items-center gap-3 bg-[#111] border border-[#222] rounded-2xl p-3.5">
                  <div className="w-10 h-10 bg-orange-500/15 border border-orange-500/25 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-black text-orange-400">{(user.name || 'K')[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name || 'Kullanıcı'}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/profil" onClick={closeMenu}
                    className="text-xs font-bold text-orange-400 border border-orange-500/25 px-3 py-1.5 rounded-lg hover:bg-orange-500/10 transition-colors flex-shrink-0">
                    Profil
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link to="/giris" onClick={closeMenu}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm active:scale-95">
                    <LogIn size={16} />
                    Giriş Yap
                  </Link>
                  <Link to="/giris?mode=register" onClick={closeMenu}
                    className="flex items-center justify-center gap-2 bg-[#111] border border-[#2a2a2a] hover:border-orange-500/40 text-neutral-300 hover:text-white font-bold py-3.5 rounded-2xl transition-all text-sm active:scale-95">
                    <UserPlus size={16} />
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>

            {/* Quick action bar */}
            <div className="grid grid-cols-3 gap-2 px-4 pb-4">
              <Link to="/" onClick={closeMenu}
                className="flex flex-col items-center gap-1.5 py-3 bg-[#111] border border-[#1e1e1e] rounded-2xl hover:border-orange-500/20 transition-colors active:scale-95">
                <Home size={18} className="text-neutral-400" />
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Ana Sayfa</span>
              </Link>
              <Link to="/urunler" onClick={closeMenu}
                className="flex flex-col items-center gap-1.5 py-3 bg-[#111] border border-[#1e1e1e] rounded-2xl hover:border-orange-500/20 transition-colors active:scale-95">
                <Grid3x3 size={18} className="text-neutral-400" />
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Tüm Ürünler</span>
              </Link>
              <Link to="/sepet" onClick={closeMenu}
                className="relative flex flex-col items-center gap-1.5 py-3 bg-[#111] border border-[#1e1e1e] rounded-2xl hover:border-orange-500/20 transition-colors active:scale-95">
                {itemCount > 0 && (
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {itemCount}
                  </span>
                )}
                <ShoppingCart size={18} className="text-neutral-400" />
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Sepetim</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 px-4 pb-3">
              <div className="flex-1 h-px bg-[#1a1a1a]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-700">Markalar</span>
              <div className="flex-1 h-px bg-[#1a1a1a]" />
            </div>

            {/* Brand accordion */}
            <div className="px-4 pb-2 space-y-2">
              {BRANDS.map(brand => (
                <div key={brand.id} className="rounded-2xl overflow-hidden border border-[#1a1a1a]">
                  {/* Brand header */}
                  <button
                    onClick={() => setExpandedBrand(expandedBrand === brand.id ? null : brand.id)}
                    className="w-full flex items-center justify-between px-4 py-4 bg-[#111] hover:bg-[#161616] active:bg-[#1a1a1a] transition-colors"
                    data-testid={`mobile-brand-${brand.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">
                        <Package size={14} className="text-orange-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-white tracking-tight">{brand.name}</p>
                        <p className="text-[10px] text-neutral-600 font-medium">{brand.models.length} model</p>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-neutral-600 transition-transform duration-200 ${expandedBrand === brand.id ? 'rotate-90 text-orange-400' : ''}`}
                    />
                  </button>

                  {/* Models list */}
                  {expandedBrand === brand.id && (
                    <div className="bg-[#0d0d0d] border-t border-[#1a1a1a]">
                      <Link
                        to={`/urunler/${brand.slug}`}
                        onClick={closeMenu}
                        className="flex items-center justify-between px-5 py-3 hover:bg-white/3 transition-colors border-b border-[#141414]"
                      >
                        <span className="text-xs font-bold text-orange-400">Tüm {brand.name} Ürünleri</span>
                        <ChevronRight size={13} className="text-orange-400/60" />
                      </Link>
                      {brand.models.map(model => (
                        <Link
                          key={model.id}
                          to={`/urunler/${brand.slug}/${model.slug}`}
                          onClick={closeMenu}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors border-b border-[#111] last:border-0 active:bg-white/5"
                        >
                          <span className="text-sm text-neutral-300 font-medium">{model.full_name}</span>
                          <ChevronRight size={13} className="text-neutral-700" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Logout */}
            {user && (
              <div className="px-4 py-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-red-400 hover:text-red-300 border border-red-500/15 hover:border-red-500/30 rounded-2xl transition-all active:scale-95"
                >
                  Çıkış Yap
                </button>
              </div>
            )}

            {/* Safe area bottom padding */}
            <div className="h-6" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
