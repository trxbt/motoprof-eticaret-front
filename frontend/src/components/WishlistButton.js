import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';

const WishlistButton = ({ productId, size = 14, className = '' }) => {
  const { toggle, isWishlisted } = useWishlist();
  const active = isWishlisted(productId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
  };

  return (
    <button
      onClick={handleClick}
      data-testid={`wishlist-btn-${productId}`}
      aria-label={active ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      className={`flex items-center justify-center transition-all active:scale-90 ${className}`}
    >
      <Heart
        size={size}
        className={`transition-all duration-200 ${active ? 'fill-red-500 text-red-500' : 'text-neutral-500 hover:text-red-400'}`}
      />
    </button>
  );
};

export default WishlistButton;
