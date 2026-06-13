import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, ChevronDown, X, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { BRANDS } from '../constants/categories';
import { NAVBAR } from '../constants/testIds';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/urunler?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
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
            <div className="relative">
              <div className={`bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-400 transition-all duration-300 ${scrolled ? 'w-7 h-7' : 'w-8 h-8'}`}>
                <span className={`text-white font-black font-chivo transition-all duration-300 ${scrolled ? 'text-[9px]' : 'text-xs'}`}>MP</span>
              </div>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-orange-400 font-black tracking-tighter font-chivo transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`}>MOTO</span>
              <span className={`text-white font-black tracking-tighter font-chivo transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`}>PROF</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {BRANDS.map(brand => (
              <div
                key={brand.id}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(brand.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={`/urunler/${brand.slug}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/4 uppercase tracking-wider"
                >
                  {brand.name}
                  <ChevronDown size={11} className={`transition-transform duration-200 ${openDropdown === brand.id ? 'rotate-180 text-orange-400' : ''}`} />
                </Link>
                {openDropdown === brand.id && (
                  <div className="absolute top-full left-0 mt-2 bg-[#111111] border border-white/8 rounded-xl p-2 min-w-56 shadow-2xl shadow-black/60 z-50 animate-fade-in">
                    <div className="px-3 py-1.5 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">{brand.name} Modelleri</span>
                    </div>
                    {brand.models.map(model => (
                      <Link
                        key={model.id}
                        to={`/urunler/${brand.slug}/${model.slug}`}
                        className="flex items-center justify-between px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group/item"
                      >
                        <span>{model.full_name}</span>
                        <ChevronDown size={11} className="rotate-[-90deg] text-neutral-700 group-hover/item:text-orange-500 transition-colors" />
                      </Link>
                    ))}
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
            <button onClick={() => setSearchOpen(!searchOpen)} data-testid="navbar-search-btn"
              className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <Search size={17} />
            </button>

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
              <div className="relative group">
                <button data-testid={NAVBAR.profileBtn}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <div className="w-5 h-5 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-black text-orange-400">{user.name[0].toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline max-w-16 truncate font-semibold">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 bg-[#111111] border border-white/8 rounded-xl p-2 min-w-44 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs font-semibold text-white">{user.name}</p>
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
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors uppercase tracking-wider glow-orange-sm">
                Giriş Yap
              </Link>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" data-testid={NAVBAR.mobileMenuBtn}>
                  <Menu size={18} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#080808] border-white/8 text-white w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-[10px]">MP</span>
                      </div>
                      <span className="font-black text-lg font-chivo">
                        <span className="text-orange-400">MOTO</span>PROF
                      </span>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto py-4">
                    {user ? (
                      <div className="mx-4 mb-4 p-3 bg-white/4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center">
                            <span className="text-sm font-black text-orange-400">{user.name[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-[10px] text-neutral-500">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link to="/giris" onClick={() => setMobileOpen(false)}
                        className="mx-4 mb-4 flex items-center justify-center py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-widest">
                        Giriş Yap / Kayıt Ol
                      </Link>
                    )}
                    {BRANDS.map(brand => (
                      <div key={brand.id} className="mb-1">
                        <p className="px-5 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-neutral-600">{brand.name}</p>
                        {brand.models.map(model => (
                          <Link key={model.id} to={`/urunler/${brand.slug}/${model.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="block px-7 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/4 transition-colors">
                            {model.full_name}
                          </Link>
                        ))}
                      </div>
                    ))}
                    <div className="h-px bg-white/5 mx-4 my-3" />
                    <Link to="/urunler" onClick={() => setMobileOpen(false)} className="block px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/4 transition-colors">Tüm Ürünler</Link>
                    <Link to="/sepet" onClick={() => setMobileOpen(false)} className="block px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/4 transition-colors">
                      Sepetim {itemCount > 0 && <span className="ml-1.5 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{itemCount}</span>}
                    </Link>
                    {user && (
                      <>
                        <Link to="/profil" onClick={() => setMobileOpen(false)} className="block px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/4 transition-colors">Profilim</Link>
                        <button onClick={handleLogout} className="block w-full text-left px-5 py-2.5 text-xs font-semibold text-red-400 hover:bg-white/4 transition-colors">Çıkış Yap</button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-3 animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün, marka veya model ara..." autoFocus data-testid="navbar-search-input"
                className="w-full bg-[#111111] border border-white/8 hover:border-white/15 focus:border-orange-500 text-white placeholder-neutral-600 rounded-xl py-3 pl-11 pr-4 text-sm transition-all outline-none focus:ring-1 focus:ring-orange-500/30" />
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
