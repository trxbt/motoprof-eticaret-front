import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Shield, Truck, RotateCcw } from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
import SearchEngine from '../components/SearchEngine';
import ProductCard from '../components/ProductCard';
import { BRANDS } from '../constants/categories';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FEATURES = [
  { icon: Shield, title: 'Orijinal Kalite', desc: 'Tüm ürünler orijinal standartlarda' },
  { icon: Truck, title: 'Hızlı Kargo', desc: 'Aynı gün kargo garantisi' },
  { icon: RotateCcw, title: 'Kolay İade', desc: '30 gün içinde sorunsuz iade' },
  { icon: Wrench, title: 'Teknik Destek', desc: 'Uzman ekip yardımı' },
];

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'MotoProf - Motosiklet Yedek Parça';
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const { data } = await axios.get(`${API}/products?featured=true&limit=8`);
      setFeaturedProducts(data.products || []);
    } catch (err) {
      console.error('Featured products error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Search Engine */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-16">
        <SearchEngine />
      </div>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-4 bg-[#171717] border border-[#3f3f46] rounded-xl">
              <div className="p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
                <Icon size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Kategoriler</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-chivo">Markalar</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BRANDS.map(brand => (
            <Link
              key={brand.id}
              to={`/urunler/${brand.slug}`}
              data-testid={`brand-card-${brand.id}`}
              className="group relative overflow-hidden rounded-xl border border-[#3f3f46] hover:border-orange-500/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className="relative h-36 sm:h-44 overflow-hidden bg-[#262626]">
                <img
                  src={brand.image}
                  alt={brand.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-black text-lg font-chivo">{brand.name}</p>
                  <p className="text-neutral-400 text-xs">{brand.models.length} model</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Öne Çıkanlar</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-chivo">Popüler Ürünler</h2>
          </div>
          <Link
            to="/urunler"
            className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            data-testid="view-all-products-btn"
          >
            Tümünü Gör <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#171717] border border-[#3f3f46] rounded-xl overflow-hidden animate-pulse">
                <div className="bg-[#262626] h-48" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#262626] rounded w-1/3" />
                  <div className="h-4 bg-[#262626] rounded" />
                  <div className="h-4 bg-[#262626] rounded w-3/4" />
                  <div className="h-8 bg-[#262626] rounded mt-3" />
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

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-chivo mb-3">
              Uyumlu Parçayı Bulamadınız mı?
            </h2>
            <p className="text-orange-100 mb-6 text-sm sm:text-base">
              Teknik ekibimiz size yardımcı olmak için hazır. Aradığınız parçayı birlikte bulalım.
            </p>
            <Link
              to="/urunler"
              className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
              data-testid="cta-browse-btn"
            >
              Tüm Ürünlere Göz At <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
