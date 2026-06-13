import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WishlistPage = () => {
  const { wishlist, toggle } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wishlist.length) { setLoading(false); setProducts([]); return; }
    setLoading(true);
    Promise.all(
      wishlist.map(id =>
        axios.get(`${API}/products?search=${id}`).then(r => r.data.products?.[0]).catch(() => null)
      )
    ).then(results => {
      setProducts(results.filter(Boolean));
      setLoading(false);
    });
  }, [wishlist]);

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success('Sepete eklendi!', { description: product.name });
  };

  return (
    <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={22} className="text-red-500 fill-red-500" />
        <div>
          <h1 className="text-2xl font-black text-white font-chivo">Favorilerim</h1>
          <p className="text-neutral-600 text-sm">{wishlist.length} ürün</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-[#111] rounded-2xl animate-pulse" />)}
        </div>
      ) : !wishlist.length ? (
        <div className="text-center py-20">
          <Heart size={48} className="text-neutral-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Henüz favori ürün yok</h2>
          <p className="text-neutral-500 text-sm mb-6">Beğendiğin ürünleri favorilere ekle, sonra kolayca bul.</p>
          <Link to="/urunler" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm">
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} data-testid={`wishlist-item-${product.slug}`}
              className="flex items-center gap-4 bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 hover:border-orange-500/20 transition-colors">
              <Link to={`/urun/${product.slug}`} className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/urun/${product.slug}`}>
                  <p className="text-sm font-semibold text-white hover:text-orange-400 transition-colors line-clamp-2">{product.name}</p>
                </Link>
                <p className="text-xs text-neutral-600 mt-0.5">{product.brand} · {product.category}</p>
                <p className="text-base font-black text-orange-400 font-chivo mt-1">
                  {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {product.stock > 0 && (
                  <button onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95">
                    <ShoppingCart size={13} />
                    <span className="hidden sm:inline">Sepete Ekle</span>
                  </button>
                )}
                <button onClick={() => toggle(product.id)}
                  data-testid={`wishlist-remove-${product.slug}`}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
