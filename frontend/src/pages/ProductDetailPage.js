import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, CheckCircle, Package, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getBrandBySlug } from '../constants/categories';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/products/${slug}`);
      setProduct(data);
      document.title = `${data.name} - MotoProf`;
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
        <div className="animate-pulse">
          <div className="h-4 bg-[#262626] rounded w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-[#262626] rounded-xl aspect-square" />
            <div className="space-y-4">
              <div className="h-6 bg-[#262626] rounded w-24" />
              <div className="h-8 bg-[#262626] rounded" />
              <div className="h-8 bg-[#262626] rounded w-1/2" />
              <div className="h-12 bg-[#262626] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-20 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <Package size={48} className="text-neutral-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Ürün Bulunamadı</h2>
        <p className="text-neutral-400 mb-6">Aradığınız ürün mevcut değil.</p>
        <Link to="/urunler" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
          Tüm Ürünlere Dön
        </Link>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const brandSlug = product.brand.toLowerCase().replace(' ', '');
  const brandData = getBrandBySlug(brandSlug === 'cfmoto' ? 'cfmoto' : brandSlug === 'bajaj' ? 'bajaj' : brandSlug === 'yamaha' ? 'yamaha' : 'honda');

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" data-testid="product-detail-page">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 mb-8 flex-wrap">
        <Link to="/" className="text-[10px] text-neutral-600 hover:text-neutral-400 font-bold uppercase tracking-widest transition-colors">Ana Sayfa</Link>
        <ChevronRight size={11} className="text-neutral-700" />
        <Link to="/urunler" className="text-[10px] text-neutral-600 hover:text-neutral-400 font-bold uppercase tracking-widest transition-colors">Moto Parçaları</Link>
        {brandData && (
          <>
            <ChevronRight size={11} className="text-neutral-700" />
            <Link to={`/urunler/${brandSlug}`} className="text-[10px] text-neutral-600 hover:text-orange-400 font-bold uppercase tracking-widest transition-colors">{product.brand}</Link>
          </>
        )}
        <ChevronRight size={11} className="text-neutral-700" />
        <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest truncate max-w-32 sm:max-w-none">{product.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        {/* Product Image */}
        <div>
          <div className="relative bg-[#111111] border border-[#1e1e1e] rounded-3xl overflow-hidden aspect-[4/3]">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {/* bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 via-transparent to-transparent" />
            {discount && (
              <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full tracking-wider">
                -{discount}% İndirim
              </div>
            )}
          </div>
          <p className="text-[10px] text-neutral-700 mt-3 text-center font-mono uppercase tracking-widest">SKU: {product.sku}</p>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              {product.brand}
            </span>
            <span className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider">{product.category}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-chivo leading-tight mb-5 tracking-tight">
            {product.name}
          </h1>

          {/* Compatibility */}
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-2.5">Uyumlu Araç</p>
            <span className="inline-flex items-center gap-2 bg-[#151515] border border-[#252525] text-white text-xs font-bold px-3 py-2 rounded-xl">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              {product.brand} {product.model}{product.year_range ? ` (${product.year_range})` : ''}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-4 mb-4">
            <div>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-1">Fiyat</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-orange-400 font-chivo leading-none">
                  {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xl font-black text-orange-400 font-chivo">₺</span>
              </div>
            </div>
            {product.original_price && (
              <div className="mb-1">
                <span className="text-lg text-neutral-600 line-through font-chivo">
                  {product.original_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
                {discount && (
                  <p className="text-xs text-green-400 font-bold mt-0.5">%{discount} tasarruf</p>
                )}
              </div>
            )}
          </div>

          {/* Stock badge */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <div className="inline-flex items-center gap-2 bg-green-500/8 border border-green-500/15 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
                <CheckCircle size={13} />
                Stokta var — {product.stock} adet
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
              <div className="flex items-center bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} data-testid="quantity-dec"
                  className="px-3.5 py-3.5 text-neutral-500 hover:text-white hover:bg-white/5 transition-colors">
                  <ChevronLeft size={15} />
                </button>
                <span className="px-4 text-white font-black min-w-12 text-center font-chivo" data-testid="quantity-value">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} data-testid="quantity-inc"
                  className="px-3.5 py-3.5 text-neutral-500 hover:text-white hover:bg-white/5 transition-colors">
                  <ChevronRightIcon size={15} />
                </button>
              </div>
              <button onClick={handleAddToCart} data-testid="product-detail-add-to-cart"
                className="flex-1 group flex items-center justify-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest glow-orange-sm shimmer">
                <ShoppingCart size={16} />
                Sepete Ekle
              </button>
            </div>
          )}

          {/* Description */}
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-3">Ürün Açıklaması</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
