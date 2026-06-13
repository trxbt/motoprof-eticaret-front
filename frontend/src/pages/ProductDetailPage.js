import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight, ShoppingCart, CheckCircle, Package,
  ChevronLeft, ChevronRight as ChevronRightIcon,
  Truck, RotateCcw, Shield, Wrench, Tag
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getBrandBySlug, getModelBySlug, BRANDS } from '../constants/categories';
import ProductCard from '../components/ProductCard';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SHIPPING_INFO = [
  { icon: Truck, title: 'Hızlı Kargo', desc: 'Saat 14:00\'a kadar aynı gün' },
  { icon: RotateCcw, title: '30 Gün İade', desc: 'Koşulsuz iade garantisi' },
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
      // fetch related products from same model
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
        <div className="animate-pulse space-y-8">
          <div className="h-3.5 bg-[#1a1a1a] rounded-full w-72" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-[#111] rounded-3xl aspect-[4/3]" />
            <div className="space-y-4">
              <div className="h-5 bg-[#1a1a1a] rounded-full w-24" />
              <div className="h-8 bg-[#1a1a1a] rounded-full" />
              <div className="h-8 bg-[#1a1a1a] rounded-full w-3/4" />
              <div className="h-16 bg-[#1a1a1a] rounded-2xl" />
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
    <div className="pt-20 pb-20" data-testid="product-detail-page">
      {/* Model hero banner */}
      {modelData?.image && (
        <div className="relative h-36 sm:h-44 overflow-hidden mb-0">
          <img src={modelData.image} alt={modelData.full_name} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-[#050505]/60 to-[#050505]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 mb-7 flex-wrap py-4" data-testid="breadcrumb">
          <Link to="/" className="text-[10px] text-neutral-600 hover:text-neutral-400 font-bold uppercase tracking-widest transition-colors">Ana Sayfa</Link>
          <ChevronRight size={11} className="text-neutral-700" />
          <Link to="/urunler" className="text-[10px] text-neutral-600 hover:text-neutral-400 font-bold uppercase tracking-widest transition-colors">Moto Parçaları</Link>
          {brandData && (
            <>
              <ChevronRight size={11} className="text-neutral-700" />
              <Link to={`/urunler/${brandSlug}`} className="text-[10px] text-neutral-600 hover:text-orange-400 font-bold uppercase tracking-widest transition-colors">{product.brand}</Link>
            </>
          )}
          {modelData && (
            <>
              <ChevronRight size={11} className="text-neutral-700" />
              <Link to={`/urunler/${brandSlug}/${modelData.slug}`} className="text-[10px] text-neutral-600 hover:text-orange-400 font-bold uppercase tracking-widest transition-colors">{product.model}</Link>
            </>
          )}
          <ChevronRight size={11} className="text-neutral-700" />
          <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest truncate max-w-40">{product.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-14">
          {/* LEFT: Image */}
          <div className="space-y-4">
            <div className="relative bg-[#111111] border border-[#1e1e1e] rounded-3xl overflow-hidden aspect-[4/3]">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/50 via-transparent to-transparent" />
              {discount && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full tracking-wider">
                  -{discount}% İndirim
                </div>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="absolute top-4 right-4 bg-amber-500/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider">
                  Son {product.stock} Adet!
                </div>
              )}
            </div>
            <p className="text-[10px] text-neutral-700 text-center font-mono uppercase tracking-widest">SKU: {product.sku}</p>

            {/* Shipping info cards */}
            <div className="grid grid-cols-2 gap-2">
              {SHIPPING_INFO.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl">
                  <Icon size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">{title}</p>
                    <p className="text-[10px] text-neutral-600 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Info */}
          <div className="flex flex-col">
            {/* Brand + category */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <span className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider">{product.category}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-chivo leading-tight mb-5 tracking-tight">
              {product.name}
            </h1>

            {/* Compatibility card */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-3">Uyumlu Araç</p>
              <div className="flex items-center gap-3">
                {modelData?.image && (
                  <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#252525]">
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

            {/* Price */}
            <div className="flex items-end gap-4 mb-4 p-4 bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl">
              <div>
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-1">Fiyat</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-orange-400 font-chivo leading-none">
                    {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-2xl font-black text-orange-400 font-chivo">₺</span>
                </div>
              </div>
              {product.original_price && (
                <div className="mb-1 pb-1">
                  <span className="text-base text-neutral-600 line-through font-chivo">
                    {product.original_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                  {discount && (
                    <p className="text-xs text-green-400 font-bold mt-0.5">%{discount} tasarruf</p>
                  )}
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="mb-5">
              {product.stock > 0 ? (
                <div className="inline-flex items-center gap-2 bg-green-500/8 border border-green-500/15 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
                  <CheckCircle size={13} />
                  Stokta {product.stock} adet mevcut
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-red-500/8 border border-red-500/15 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
                  Stok Tükendi
                </div>
              )}
            </div>

            {/* Quantity + Cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-6">
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
                  className="flex-1 group flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold h-[50px] px-6 rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest glow-orange-sm shimmer">
                  <ShoppingCart size={16} />
                  Sepete Ekle
                </button>
              </div>
            )}

            {/* Description */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-3">Ürün Açıklaması</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{product.description}</p>
            </div>

            {/* Specs table */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-4">Ürün Bilgileri</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'SKU / Stok Kodu', value: product.sku },
                  { label: 'Marka', value: product.brand },
                  { label: 'Uyumlu Model', value: `${product.model}${product.year_range ? ` (${product.year_range})` : ''}` },
                  { label: 'Parça Kategorisi', value: product.category },
                  { label: 'Stok Durumu', value: product.stock > 0 ? `${product.stock} adet` : 'Tükendi' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-[#151515] last:border-0">
                    <span className="text-xs text-neutral-600 font-semibold">{label}</span>
                    <span className="text-xs text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="section-label mb-2 block">Aynı Model</span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-chivo tracking-tight">
                  {product.model} İçin Diğer Parçalar
                </h2>
              </div>
              {modelData && (
                <Link to={`/urunler/${brandSlug}/${modelData.slug}`}
                  className="text-xs font-bold text-neutral-500 hover:text-orange-400 transition-colors uppercase tracking-wider flex items-center gap-1">
                  Tümünü Gör <ChevronRight size={13} />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
