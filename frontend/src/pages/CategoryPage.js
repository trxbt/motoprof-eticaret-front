import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, SlidersHorizontal, X, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useBrands } from '../contexts/BrandsContext';
import { useSettings } from '../contexts/SettingsContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CategoryPage = () => {
  const { brand: brandSlug, model: modelSlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  const { brands: BRANDS, getBrandBySlug, getModelBySlug, getCategoryBySlug, PARTS_CATEGORIES } = useBrands();
  const { settings: siteSettings } = useSettings();

  const brandData = brandSlug ? getBrandBySlug(brandSlug) : null;
  const modelData = modelSlug ? getModelBySlug(brandSlug, modelSlug) : null;

  // SEO — öncelik: model > marka > site geneli
  const activeSeo = modelData || brandData || {};
  const pageTitle = activeSeo.seo_title
    || (modelData ? `${modelData.full_name} Yedek Parça | MotoProf` : null)
    || (brandData ? `${brandData.name} Yedek Parça | MotoProf` : null)
    || siteSettings.seo_title
    || 'MotoProf';
  const pageDesc = activeSeo.seo_description || siteSettings.seo_description || '';
  const pageKeywords = activeSeo.seo_keywords || siteSettings.seo_keywords || '';

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState(brandData?.name || '');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const LIMIT = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (brandData) params.set('brand', brandData.name);
      if (modelData) params.set('model_id', modelData.id);
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', LIMIT);
      params.set('skip', (page - 1) * LIMIT);
      const { data } = await axios.get(`${API}/products?${params}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [brandData, modelData, selectedCategory, searchQuery, page]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, [fetchProducts]);

  useEffect(() => {
    // Helmet zaten yönetiyor, eski manual title kaldırıldı
  }, [brandData, modelData]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
    setPage(1);
    setShowFilters(false);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Moto Parçaları', href: '/urunler' },
  ];
  if (brandData) breadcrumbs.push({ label: brandData.name, href: `/urunler/${brandSlug}` });
  if (modelData) breadcrumbs.push({ label: modelData.full_name.replace(`${brandData?.name} `, ''), href: `/urunler/${brandSlug}/${modelSlug}` });
  if (selectedCategory) breadcrumbs.push({ label: selectedCategory, href: null });

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-600 mb-3">Parça Kategorisi</h3>
        <div className="space-y-0.5">
          <button
            onClick={() => handleCategorySelect('')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${!selectedCategory ? 'bg-orange-500 text-white' : 'text-neutral-500 hover:text-white hover:bg-white/4'}`}
          >
            Tümü
          </button>
          {PARTS_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              data-testid={`filter-category-${cat}`}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${selectedCategory === cat ? 'bg-orange-500 text-white' : 'text-neutral-500 hover:text-white hover:bg-white/4'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {!brandSlug && (
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-600 mb-3">Marka</h3>
          <div className="space-y-0.5">
            {BRANDS.map(b => (
              <Link
                key={b.id}
                to={`/urunler/${b.slug}`}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-500 hover:text-white hover:bg-white/4 transition-all"
                data-testid={`filter-brand-${b.id}`}
              >
                <span className="font-semibold">{b.name}</span>
                <span className="text-[10px] text-neutral-700">{b.models.length}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      {brandData && (
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-600 mb-3">Model</h3>
          <div className="space-y-0.5">
            {brandData.models.map(m => (
              <Link
                key={m.id}
                to={`/urunler/${brandSlug}/${m.slug}`}
                data-testid={`filter-model-${m.id}`}
                className={`block px-3 py-2 rounded-xl text-xs font-semibold transition-all ${modelData?.id === m.id ? 'text-orange-400 bg-orange-500/10' : 'text-neutral-500 hover:text-white hover:bg-white/4'}`}
              >
                {m.full_name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <Helmet>
        <title>{pageTitle}</title>
        {pageDesc && <meta name="description" content={pageDesc} />}
        {pageKeywords && <meta name="keywords" content={pageKeywords} />}
        {(modelData?.image || brandData?.image) && <meta property="og:image" content={modelData?.image || brandData?.image} />}
        <meta property="og:title" content={pageTitle} />
        {pageDesc && <meta property="og:description" content={pageDesc} />}
      </Helmet>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 mb-5 flex-wrap" data-testid="breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={11} className="text-neutral-700 flex-shrink-0" />}
            {crumb.href ? (
              <Link to={crumb.href} className="text-[10px] text-neutral-600 hover:text-orange-400 transition-colors font-bold uppercase tracking-widest">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Model / Brand Hero Banner */}
      {(modelData || brandData) && !searchQuery && (
        <div className="relative h-44 sm:h-56 lg:h-64 rounded-2xl overflow-hidden mb-8 border border-[#1e1e1e]">
          <img
            src={modelData?.image || brandData?.image}
            alt={modelData?.full_name || brandData?.name}
            className="w-full h-full object-cover"
          />
          {/* Dark cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/65 to-[#050505]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-end pb-6 px-6 sm:px-8">
            <div>
              <span className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                {brandData?.name}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-chivo tracking-tight leading-tight">
                {modelData ? modelData.full_name : `${brandData?.name} Parçaları`}
              </h1>
              {modelData?.description && (
                <p className="text-neutral-400 text-sm mt-1.5 hidden sm:block">{modelData.description}</p>
              )}
              {!loading && (
                <p className="text-neutral-500 text-xs mt-2 font-semibold uppercase tracking-widest">
                  {total} ürün mevcut
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search result title */}
      {searchQuery && (
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white font-chivo tracking-tight">
            "{searchQuery}" için Sonuçlar
          </h1>
          <p className="text-neutral-600 text-xs mt-2 uppercase tracking-widest font-semibold">{total} ürün bulundu</p>
        </div>
      )}

      {/* No hero - All Products */}
      {!modelData && !brandData && !searchQuery && (
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-chivo tracking-tight">
            Tüm Ürünler
          </h1>
          <p className="text-neutral-600 text-xs mt-2 uppercase tracking-widest font-semibold">{total} ürün</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter toggle */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              data-testid="toggle-filters-btn"
              className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-[#3f3f46] rounded-lg text-sm text-neutral-300 hover:text-white transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filtreler
              {selectedCategory && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
            </button>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="lg:hidden mb-4 bg-[#171717] border border-[#3f3f46] rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-white">Filtreler</span>
                <button onClick={() => setShowFilters(false)} className="text-neutral-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <FilterSidebar />
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-[#171717] border border-[#3f3f46] rounded-xl overflow-hidden animate-pulse">
                  <div className="bg-[#262626] h-40" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-[#262626] rounded w-1/3" />
                    <div className="h-4 bg-[#262626] rounded" />
                    <div className="h-4 bg-[#262626] rounded w-3/4" />
                    <div className="h-8 bg-[#262626] rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="no-products">
              <div className="p-4 bg-[#171717] rounded-full mb-4">
                <Search size={32} className="text-neutral-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ürün Bulunamadı</h3>
              <p className="text-neutral-400 text-sm">Bu kriterlere uygun ürün bulunmuyor.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm bg-[#171717] border border-[#3f3f46] rounded-lg text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Önceki
                  </button>
                  <span className="text-sm text-neutral-400">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm bg-[#171717] border border-[#3f3f46] rounded-lg text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
