import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import WishlistButton from './WishlistButton';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Sepete eklendi!', { description: product.name });
  };

  const isOutOfStock = product.stock === 0;

  return (
    <Link
      to={`/urun/${product.slug}`}
      data-testid={`product-card-${product.slug}`}
      className="group block focus:outline-none"
    >
      <div className="bg-[#111111] border border-[#222222] group-hover:border-orange-500/30 rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-orange-500/8 h-full flex flex-col shimmer">
        {/* Image */}
        <div className="relative overflow-hidden bg-[#1a1a1a]" style={{ paddingTop: '68%' }}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {discount && !isOutOfStock && (
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider">
                -{discount}%
              </span>
            )}
            {product.is_featured && !discount && !isOutOfStock && (
              <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                ÖZEL
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <WishlistButton
            productId={product.id}
            size={15}
            className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-[1px]">
              <span className="text-neutral-400 text-xs font-semibold border border-neutral-700 px-3 py-1 rounded-full">
                Stok Tükendi
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Brand & Category */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
              {product.brand}
            </span>
            <span className="text-[10px] text-neutral-600 truncate ml-2 max-w-[80px]">{product.category}</span>
          </div>

          {/* Name */}
          <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-white line-clamp-2 flex-1 leading-snug transition-colors">
            {product.name}
          </h3>

          {product.year_range && (
            <p className="text-[10px] text-neutral-600 mt-1.5 flex items-center gap-1">
              <span className="w-3 h-px bg-neutral-700 inline-block" />
              {product.year_range}
            </p>
          )}

          {/* Divider */}
          <div className="h-px bg-[#222222] my-3" />

          {/* Price row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-black text-orange-400 font-chivo leading-none">
                {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-orange-400 font-bold text-sm ml-0.5">₺</span>
              {product.original_price && (
                <div className="text-[11px] text-neutral-600 line-through mt-0.5">
                  {product.original_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </div>
              )}
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                Son {product.stock}!
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            data-testid={`add-to-cart-${product.slug}`}
            className="group/btn flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold bg-[#1e1e1e] hover:bg-orange-500 border border-[#2a2a2a] hover:border-orange-500 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 hover:text-white rounded-xl transition-all duration-200 active:scale-95 uppercase tracking-wider"
          >
            <ShoppingCart size={13} className="group-hover/btn:scale-110 transition-transform" />
            {isOutOfStock ? 'Stok Yok' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
