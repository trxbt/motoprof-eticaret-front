import React, { useState } from 'react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#3f3f46]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" data-testid={NAVBAR.logo} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-orange-500 text-2xl font-black tracking-tighter font-chivo">MOTO</span>
              <span className="text-white text-2xl font-black tracking-tighter font-chivo">PROF</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {BRANDS.map(brand => (
              <div
                key={brand.id}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(brand.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={`/urunler/${brand.slug}`}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-neutral-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  {brand.name}
                  <ChevronDown size={13} className={`transition-transform duration-200 ${openDropdown === brand.id ? 'rotate-180' : ''}`} />
                </Link>
                {openDropdown === brand.id && (
                  <div className="absolute top-full left-0 mt-1 bg-[#171717] border border-[#3f3f46] rounded-lg p-2 min-w-52 shadow-2xl shadow-black/50 z-50">
                    {brand.models.map(model => (
                      <Link
                        key={model.id}
                        to={`/urunler/${brand.slug}/${model.slug}`}
                        className="block px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-[#262626] rounded-md transition-colors"
                      >
                        {model.full_name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link to="/urunler" className="px-3 py-2 text-sm font-semibold text-neutral-300 hover:text-white transition-colors rounded-md hover:bg-white/5">
              Tüm Ürünler
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-neutral-400 hover:text-white transition-colors rounded-md hover:bg-white/5"
              data-testid="navbar-search-btn"
            >
              <Search size={19} />
            </button>

            {/* Cart */}
            <Link to="/sepet" data-testid={NAVBAR.cartBtn} className="relative p-2.5 text-neutral-400 hover:text-white transition-colors rounded-md hover:bg-white/5">
              <ShoppingCart size={19} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button
                  data-testid={NAVBAR.profileBtn}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <User size={18} />
                  <span className="hidden sm:inline max-w-20 truncate text-xs">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute top-full right-0 mt-1 bg-[#171717] border border-[#3f3f46] rounded-lg p-2 min-w-40 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link to="/profil" className="block px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-[#262626] rounded-md transition-colors">
                    Profilim
                  </Link>
                  <hr className="my-1 border-[#3f3f46]" />
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#262626] rounded-md transition-colors">
                    Çıkış Yap
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/giris"
                data-testid={NAVBAR.loginBtn}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors"
              >
                Giriş Yap
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2.5 text-neutral-400 hover:text-white transition-colors" data-testid={NAVBAR.mobileMenuBtn}>
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0a0a] border-[#3f3f46] text-white w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-[#3f3f46]">
                    <span className="font-black text-xl font-chivo">
                      <span className="text-orange-500">MOTO</span>PROF
                    </span>
                    <button onClick={() => setMobileOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto py-4">
                    {user ? (
                      <div className="px-4 py-3 bg-[#171717] mx-4 rounded-lg mb-4">
                        <p className="text-sm text-neutral-400">Merhaba,</p>
                        <p className="font-semibold text-white">{user.name}</p>
                      </div>
                    ) : (
                      <Link to="/giris" onClick={() => setMobileOpen(false)}
                        className="mx-4 mb-4 flex items-center justify-center py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors text-sm">
                        Giriş Yap / Kayıt Ol
                      </Link>
                    )}
                    {BRANDS.map(brand => (
                      <div key={brand.id} className="mb-2">
                        <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500">{brand.name}</p>
                        {brand.models.map(model => (
                          <Link
                            key={model.id}
                            to={`/urunler/${brand.slug}/${model.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="block px-6 py-2 text-sm text-neutral-300 hover:text-white hover:bg-[#171717] transition-colors"
                          >
                            {model.full_name}
                          </Link>
                        ))}
                      </div>
                    ))}
                    <hr className="border-[#3f3f46] my-3 mx-4" />
                    <Link to="/urunler" onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-[#171717] transition-colors">
                      Tüm Ürünler
                    </Link>
                    <Link to="/sepet" onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-[#171717] transition-colors">
                      Sepetim ({itemCount})
                    </Link>
                    {user && (
                      <>
                        <Link to="/profil" onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-[#171717] transition-colors">
                          Profilim
                        </Link>
                        <button onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#171717] transition-colors">
                          Çıkış Yap
                        </button>
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
          <div className="pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün, marka veya model ara..."
                autoFocus
                className="w-full bg-[#171717] border border-[#3f3f46] text-white placeholder-neutral-500 rounded-lg py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                data-testid="navbar-search-input"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-orange-500 transition-colors">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
