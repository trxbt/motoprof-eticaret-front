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
      <nav className="flex items-center gap-1.5 mb-6 flex-wrap">
        <Link to="/" className="text-xs text-neutral-400 hover:text-orange-400 font-semibold uppercase tracking-wider">Ana Sayfa</Link>
        <ChevronRight size={14} className="text-neutral-600" />
        <Link to="/urunler" className="text-xs text-neutral-400 hover:text-orange-400 font-semibold uppercase tracking-wider">Moto Parçaları</Link>
        {brandData && (
          <>
            <ChevronRight size={14} className="text-neutral-600" />
            <Link to={`/urunler/${brandSlug}`} className="text-xs text-neutral-400 hover:text-orange-400 font-semibold uppercase tracking-wider">{product.brand}</Link>
          </>
        )}
        <ChevronRight size={14} className="text-neutral-600" />
        <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider truncate max-w-32 sm:max-w-none">{product.model}</span>
        <ChevronRight size={14} className="text-neutral-600" />
        <span className="text-xs text-neutral-500 truncate max-w-40 sm:max-w-none">{product.category}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div>
          <div className="relative bg-[#171717] border border-[#3f3f46] rounded-2xl overflow-hidden aspect-[4/3]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount && (
              <div className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discount}%
              </div>
            )}
          </div>
          {/* SKU */}
          <p className="text-xs text-neutral-500 mt-3 text-center">SKU: {product.sku}</p>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Brand badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
              {product.brand}
            </span>
            <span className="text-xs text-neutral-500">{product.category}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-chivo leading-tight mb-4">
            {product.name}
          </h1>

          {/* Compatibility */}
          <div className="bg-[#171717] border border-[#3f3f46] rounded-xl p-4 mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Uyumlu Araç</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#262626] text-white text-sm font-semibold px-3 py-1 rounded-lg border border-[#3f3f46]">
                {product.brand} {product.model}
                {product.year_range ? ` (${product.year_range})` : ''}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-black text-orange-500 font-chivo">
              {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </span>
            {product.original_price && (
              <span className="text-lg text-neutral-500 line-through">
                {product.original_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </span>
            )}
            {discount && (
              <span className="text-sm text-green-400 font-semibold">
                %{discount} indirim
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-green-400 font-semibold">
                  Stokta {product.stock} adet
                </span>
              </>
            ) : (
              <span className="text-sm text-red-400 font-semibold">Stok tükendi</span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center bg-[#171717] border border-[#3f3f46] rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-3 text-neutral-400 hover:text-white hover:bg-[#262626] transition-colors"
                  data-testid="quantity-dec"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-4 text-white font-bold min-w-12 text-center" data-testid="quantity-value">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-3 py-3 text-neutral-400 hover:text-white hover:bg-[#262626] transition-colors"
                  data-testid="quantity-inc"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                data-testid="product-detail-add-to-cart"
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all active:scale-95 text-sm uppercase tracking-wider"
              >
                <ShoppingCart size={18} />
                Sepete Ekle
              </button>
            </div>
          )}

          {/* Description */}
          <div className="bg-[#171717] border border-[#3f3f46] rounded-xl p-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Ürün Açıklaması</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
