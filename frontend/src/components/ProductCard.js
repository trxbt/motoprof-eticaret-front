import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
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
    toast.success('Sepete eklendi!', {
      description: product.name,
    });
  };

  const isOutOfStock = product.stock === 0;

  return (
    <Link
      to={`/urun/${product.slug}`}
      data-testid={`product-card-${product.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xl"
    >
      <div className="bg-[#171717] border border-[#3f3f46] rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden bg-[#262626]" style={{ paddingTop: '65%' }}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount && !isOutOfStock && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">Stok Yok</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">
              {product.brand}
            </span>
            <span className="text-[10px] text-neutral-500 truncate">{product.category}</span>
          </div>

          <h3 className="text-sm font-semibold text-white line-clamp-2 flex-1 leading-snug">
            {product.name}
          </h3>

          {product.year_range && (
            <p className="text-xs text-neutral-500 mt-1">{product.year_range}</p>
          )}

          {/* Price */}
          <div className="mt-3 mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-orange-500 font-chivo">
                {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </span>
              {product.original_price && (
                <span className="text-xs text-neutral-500 line-through">
                  {product.original_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              )}
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            data-testid={`add-to-cart-${product.slug}`}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-bold bg-orange-500 hover:bg-orange-600 disabled:bg-[#262626] disabled:text-neutral-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors active:scale-95"
          >
            <ShoppingCart size={14} />
            {isOutOfStock ? 'Stok Yok' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
