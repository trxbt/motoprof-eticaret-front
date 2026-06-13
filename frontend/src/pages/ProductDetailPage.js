import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight, ShoppingCart, CheckCircle, Package,
  ChevronLeft, ChevronRight as ChevronRightIcon,
  Truck, RotateCcw, Shield, Wrench, Lock
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getBrandBySlug, BRANDS } from '../constants/categories';
import ProductCard from '../components/ProductCard';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SHIPPING_INFO = [
  { icon: Truck, title: 'Hızlı Kargo', desc: 'Aynı gün kargo' },
  { icon: RotateCcw, title: '30 Gün İade', desc: 'Koşulsuz iade' },
  { icon: Shield, title: 'Orijinal Kalite', desc: 'Garantili ürün' },
  { icon: Wrench, title: 'Teknik Destek', desc: 'Montaj desteği' },
];

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    setRelatedProducts([]);
    try {
      const { data } = await axios.get(`${API}/products/${slug}`);
      setProduct(data);
      document.title = `${data.name} - MotoProf`;
      const rel = await axios.get(`${API}/products?model_id=${data.model_id}&limit=4`);
      setRelatedProducts((rel.data.products || []).filter(p => p.slug !== slug));
    } catch (err) {
      setError('Ürün bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success('Sepete eklendi!', { description: `${quantity}x ${product.name}` });
  };

  if (loading) {
    return (
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="animate-pulse space-y-6 pt-4">
          <div className="h-3 bg-[#1a1a1a] rounded-full w-56" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#111] rounded-3xl aspect-[4/3]" />
            <div className="space-y-4">
              <div className="h-4 bg-[#1a1a1a] rounded-full w-24" />
              <div className="h-7 bg-[#1a1a1a] rounded-full" />
              <div className="h-7 bg-[#1a1a1a] rounded-full w-3/4" />
              <div className="h-14 bg-[#1a1a1a] rounded-2xl" />
              <div className="h-12 bg-[#1a1a1a] rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-20 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <Package size={48} className="text-neutral-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Ürün Bulunamadı</h2>
        <p className="text-neutral-500 mb-6 text-sm">Aradığınız ürün mevcut değil veya kaldırılmış.</p>
        <Link to="/urunler" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wider">
          Tüm Ürünlere Dön
        </Link>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const brandSlugMap = { HONDA: 'honda', YAMAHA: 'yamaha', CFMOTO: 'cfmoto', BAJAJ: 'bajaj' };
  const brandSlug = brandSlugMap[product.brand] || product.brand.toLowerCase();
  const brandData = getBrandBySlug(brandSlug);
  const modelData = brandData?.models.find(m => m.id === product.model_id);

  return (
    <div className="pt-16 sm:pt-20 pb-28 lg:pb-20" data-testid="product-detail-page">
      {/* Model hero banner */}
      {modelData?.image && (
        <div className="relative h-28 sm:h-44 overflow-hidden">
          <img src={modelData.image} alt={modelData.full_name} className="w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/10 via-[#050505]/50 to-[#0a0a0a]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb — horizontal scroll on mobile */}
        <nav className="flex items-center gap-1.5 py-3 mb-4 overflow-x-auto scrollbar-hide whitespace-nowrap" data-testid="breadcrumb">
          <Link to="/" className="text-[10px] text-neutral-600 hover:text-neutral-400 font-bold uppercase tracking-widest transition-colors flex-shrink-0">Ana Sayfa</Link>
          <ChevronRight size={10} className="text-neutral-700 flex-shrink-0" />
          <Link to="/urunler" className="text-[10px] text-neutral-600 hover:text-neutral-400 font-bold uppercase tracking-widest transition-colors flex-shrink-0">Parçalar</Link>
          {brandData && (
            <>
              <ChevronRight size={10} className="text-neutral-700 flex-shrink-0" />
              <Link to={`/urunler/${brandSlug}`} className="text-[10px] text-neutral-600 hover:text-orange-400 font-bold uppercase tracking-widest transition-colors flex-shrink-0">{product.brand}</Link>
            </>
          )}
          {modelData && (
            <>
              <ChevronRight size={10} className="text-neutral-700 flex-shrink-0" />
              <Link to={`/urunler/${brandSlug}/${modelData.slug}`} className="text-[10px] text-neutral-600 hover:text-orange-400 font-bold uppercase tracking-widest transition-colors flex-shrink-0">{product.model}</Link>
            </>
          )}
          <ChevronRight size={10} className="text-neutral-700 flex-shrink-0" />
          <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest flex-shrink-0">{product.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14 mb-12">

          {/* LEFT: Image */}
          <div className="space-y-3">
            <div className="relative bg-[#111111] border border-[#1e1e1e] rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3]">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/50 via-transparent to-transparent" />
              {discount && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-orange-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full tracking-wider">
                  -{discount}% İndirim
                </div>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-amber-500/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider">
                  Son {product.stock}!
                </div>
              )}
            </div>

            {/* Shipping info — 2x2 on mobile, 2x2 on all */}
            <div className="grid grid-cols-2 gap-2">
              {SHIPPING_INFO.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5 p-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl">
                  <Icon size={13} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{title}</p>
                    <p className="text-[10px] text-neutral-600 mt-0.5 leading-tight">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Info */}
          <div className="flex flex-col">
            {/* Brand + category */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <span className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider">{product.category}</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-chivo leading-tight mb-4 tracking-tight">
              {product.name}
            </h1>

            {/* Price — mobile compact */}
            <div className="flex items-center justify-between p-4 bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl mb-4">
              <div>
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-0.5">Fiyat</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-orange-400 font-chivo leading-none">
                    {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-orange-400 font-chivo">₺</span>
                </div>
                {product.original_price && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-neutral-600 line-through font-chivo">
                      {product.original_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>
                    {discount && <span className="text-xs text-green-400 font-bold">%{discount} tasarruf</span>}
                  </div>
                )}
              </div>
              {/* Stock badge */}
              {product.stock > 0 ? (
                <div className="flex flex-col items-center gap-1 bg-green-500/8 border border-green-500/15 text-green-400 text-[10px] font-bold px-3 py-2 rounded-xl text-center">
                  <CheckCircle size={14} />
                  <span>Stokta</span>
                  <span>{product.stock} adet</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 bg-red-500/8 border border-red-500/15 text-red-400 text-[10px] font-bold px-3 py-2 rounded-xl text-center">
                  <span>Stok</span>
                  <span>Tükendi</span>
                </div>
              )}
            </div>

            {/* Compatibility card */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-2.5">Uyumlu Araç</p>
              <div className="flex items-center gap-3">
                {modelData?.image && (
                  <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#252525]">
                    <img src={modelData.image} alt={modelData.full_name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-white font-bold text-sm">{product.brand} {product.model}</p>
                  {product.year_range && (
                    <p className="text-neutral-500 text-xs mt-0.5">Model Yılı: {product.year_range}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity + Cart — DESKTOP ONLY (mobile uses sticky bar) */}
            {product.stock > 0 && (
              <div className="hidden lg:flex items-center gap-3 mb-5">
                <div className="flex items-center bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl overflow-hidden h-[50px]">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} data-testid="quantity-dec"
                    className="px-4 h-full text-neutral-500 hover:text-white hover:bg-white/5 transition-colors">
                    <ChevronLeft size={15} />
                  </button>
                  <span className="px-4 text-white font-black min-w-12 text-center font-chivo text-lg" data-testid="quantity-value">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} data-testid="quantity-inc"
                    className="px-4 h-full text-neutral-500 hover:text-white hover:bg-white/5 transition-colors">
                    <ChevronRightIcon size={15} />
                  </button>
                </div>
                <button onClick={handleAddToCart} data-testid="product-detail-add-to-cart"
                  className="flex-1 flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold h-[50px] px-6 rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest glow-orange-sm shimmer">
                  <ShoppingCart size={16} />
                  Sepete Ekle
                </button>
              </div>
            )}

            {/* Description */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-2.5">Ürün Açıklaması</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{product.description}</p>
            </div>

            {/* Specs table */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-3">Ürün Bilgileri</h3>
              <div className="space-y-2">
                {[
                  { label: 'SKU / Stok Kodu', value: product.sku },
                  { label: 'Marka', value: product.brand },
                  { label: 'Uyumlu Model', value: `${product.model}${product.year_range ? ` (${product.year_range})` : ''}` },
                  { label: 'Parça Kategorisi', value: product.category },
                  { label: 'Stok Durumu', value: product.stock > 0 ? `${product.stock} adet` : 'Tükendi' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-[#151515] last:border-0 gap-4">
                    <span className="text-xs text-neutral-600 font-semibold flex-shrink-0">{label}</span>
                    <span className="text-xs text-white font-semibold text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="section-label mb-1.5 block">Aynı Model</span>
                <h2 className="text-lg sm:text-xl font-black text-white font-chivo tracking-tight">
                  {product.model} İçin Diğer Parçalar
                </h2>
              </div>
              {modelData && (
                <Link to={`/urunler/${brandSlug}/${modelData.slug}`}
                  className="text-xs font-bold text-neutral-500 hover:text-orange-400 transition-colors uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                  Tümü <ChevronRight size={13} />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── MOBİL STICKY BOTTOM BAR ── */}
      {product.stock > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-[#1e1e1e] px-4 py-3 safe-area-bottom"
          style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.5), 0 -1px 0 rgba(249,115,22,0.1)' }}>
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            {/* Adet kontrol */}
            <div className="flex items-center bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden h-12 flex-shrink-0">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 h-full text-neutral-500 active:bg-white/5 transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="px-3 text-white font-black min-w-8 text-center font-chivo">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="px-3 h-full text-neutral-500 active:bg-white/5 transition-colors">
                <ChevronRightIcon size={15} />
              </button>
            </div>

            {/* Fiyat + Sepete Ekle */}
            <button onClick={handleAddToCart} data-testid="product-detail-add-to-cart-mobile"
              className="flex-1 flex items-center justify-between gap-2 bg-orange-500 active:bg-orange-600 text-white font-bold h-12 px-4 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(249,115,22,0.35)]">
              <span className="text-sm font-black font-chivo">
                {(product.price * quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </span>
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold">
                <ShoppingCart size={15} />
                Sepete Ekle
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
