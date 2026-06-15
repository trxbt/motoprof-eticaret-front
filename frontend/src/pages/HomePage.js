import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Shield, Truck, RotateCcw, Star } from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
import SearchEngine from '../components/SearchEngine';
import ProductCard from '../components/ProductCard';
import { useBrands } from '../contexts/BrandsContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FEATURES = [
  { icon: Shield, title: 'Orijinal Kalite', desc: 'Tüm ürünler garantili' },
  { icon: Truck, title: 'Aynı Gün Kargo', desc: 'Saat 14:00\'a kadar' },
  { icon: RotateCcw, title: 'Kolay İade', desc: '30 gün içinde' },
  { icon: Wrench, title: 'Teknik Destek', desc: 'Uzman kadro' },
];

const SectionHeader = ({ label, title, action }) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      <span className="section-label mb-3 block">{label}</span>
      <h2 className="text-2xl sm:text-3xl font-black text-white font-chivo tracking-tight">{title}</h2>
    </div>
    {action}
  </div>
);

const HomePage = () => {
  const { brands: BRANDS } = useBrands();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'MotoProf - Motosiklet Yedek Parça';
    axios.get(`${API}/products?featured=true&limit=8`)
      .then(({ data }) => setFeaturedProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <HeroSlider />

      {/* Search Engine – overlapping hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-14">
        <SearchEngine />
      </div>

      {/* Trust Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="relative flex items-center gap-3.5 p-4 sm:p-5 bg-[#111111] border border-[#1e1e1e] rounded-2xl group hover:border-orange-500/20 transition-all duration-300 overflow-hidden">
              {/* Glow bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-2.5 bg-orange-500/8 group-hover:bg-orange-500/15 border border-orange-500/10 rounded-xl transition-colors flex-shrink-0">
                <Icon size={17} className="text-orange-500" />
              </div>
              <div className="relative">
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-[11px] text-neutral-600 mt-0.5 hidden sm:block">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <SectionHeader label="Kategoriler" title="Marka Seçin" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {BRANDS.map((brand, i) => (
            <Link
              key={brand.id}
              to={`/urunler/${brand.slug}`}
              data-testid={`brand-card-${brand.id}`}
              className="group relative overflow-hidden rounded-2xl border border-[#1e1e1e] hover:border-orange-500/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-500/10 block"
            >
              <div className="relative overflow-hidden bg-[#111111]" style={{ paddingTop: '100%' }}>
                <img src={brand.image} alt={brand.name} loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-75" />
                {/* Cinematic overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent transition-all duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-black text-lg font-chivo tracking-tight leading-none">{brand.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-neutral-500 text-[11px]">{brand.models.length} model</p>
                    <div className="w-5 h-5 rounded-full bg-orange-500/0 group-hover:bg-orange-500 border border-white/10 group-hover:border-orange-500 flex items-center justify-center transition-all duration-200">
                      <ArrowRight size={10} className="text-transparent group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <SectionHeader
          label="Öne Çıkanlar"
          title="Popüler Ürünler"
          action={
            <Link to="/urunler" data-testid="view-all-products-btn"
              className="group flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-orange-400 transition-colors uppercase tracking-wider mb-0.5">
              Tümünü Gör
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          }
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-[#1e1e1e] rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-[#1a1a1a]" style={{ paddingTop: '68%' }} />
                <div className="p-4 space-y-2.5">
                  <div className="h-2.5 bg-[#1a1a1a] rounded-full w-1/3" />
                  <div className="h-3.5 bg-[#1a1a1a] rounded-full" />
                  <div className="h-3.5 bg-[#1a1a1a] rounded-full w-3/4" />
                  <div className="h-px bg-[#1a1a1a] rounded-full" />
                  <div className="h-4 bg-[#1a1a1a] rounded-full w-1/2" />
                  <div className="h-9 bg-[#1a1a1a] rounded-xl mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="featured-products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Premium CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative overflow-hidden rounded-3xl bg-[#0f0f0f] border border-[#1e1e1e] p-8 sm:p-12">
          {/* Pattern */}
          <div className="absolute inset-0 stripe-pattern" />
          {/* Orange glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-500/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl" />
          {/* Orange left border accent */}
          <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-orange-500 to-transparent rounded-full" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star size={13} className="text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Uzman Destek</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-chivo mb-2 tracking-tight">
                Uyumlu Parçayı<br />Bulamadınız mı?
              </h2>
              <p className="text-neutral-500 text-sm max-w-md">
                Teknik ekibimiz aradığınız parçayı bulmak için hazır.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <Link to="/urunler" data-testid="cta-browse-btn"
                className="group inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all glow-orange-sm text-xs uppercase tracking-widest whitespace-nowrap active:scale-95">
                Tüm Ürünleri Gör
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
