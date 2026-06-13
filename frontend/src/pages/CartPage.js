import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CART } from '../constants/testIds';
import CheckoutAuthModal from '../components/CheckoutAuthModal';

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCheckout = () => {
    if (user) {
      navigate('/odeme');
    } else {
      setShowAuthModal(true);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-[60vh] flex flex-col items-center justify-center px-4" data-testid={CART.page}>
        <div className="p-5 bg-[#171717] rounded-full mb-5 border border-[#3f3f46]">
          <ShoppingCart size={40} className="text-neutral-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sepetiniz Boş</h2>
        <p className="text-neutral-400 text-sm mb-6 text-center">
          Motosikletiniz için uygun parçaları keşfetmeye başlayın.
        </p>
        <Link
          to="/urunler"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm uppercase tracking-wider"
        >
          Alışverişe Başla <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" data-testid={CART.page}>
      {showAuthModal && (
        <CheckoutAuthModal
          onClose={() => setShowAuthModal(false)}
          onGuest={() => { setShowAuthModal(false); navigate('/odeme'); }}
        />
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white font-chivo">Sepetim</h1>
          <p className="text-neutral-400 text-sm mt-1">{itemCount} ürün</p>
        </div>
        <button
          onClick={clearCart}
          data-testid={CART.clearBtn}
          className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
        >
          <Trash2 size={14} />
          Sepeti Temizle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              data-testid={`${CART.item}-${item.id}`}
              className="bg-[#171717] border border-[#3f3f46] rounded-xl p-4 flex gap-4"
            >
              <Link to={`/urun/${item.slug}`} className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#262626] rounded-lg overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">{item.brand}</span>
                    <Link to={`/urun/${item.slug}`} className="block text-sm font-semibold text-white hover:text-orange-400 transition-colors mt-0.5 line-clamp-2">
                      {item.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    data-testid={`${CART.removeBtn}-${item.id}`}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center bg-[#0a0a0a] border border-[#3f3f46] rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      data-testid={`${CART.quantityDec}-${item.id}`}
                      className="px-2.5 py-1.5 text-neutral-400 hover:text-white hover:bg-[#262626] transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3 text-white text-sm font-semibold min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      data-testid={`${CART.quantityInc}-${item.id}`}
                      className="px-2.5 py-1.5 text-neutral-400 hover:text-white hover:bg-[#262626] transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="text-lg font-black text-orange-500 font-chivo">
                    {(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#171717] border border-[#3f3f46] rounded-xl p-5 sticky top-24">
            <h2 className="text-base font-bold text-white mb-4">Sipariş Özeti</h2>

            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400 truncate mr-2 flex-1">{item.name} ({item.quantity}x)</span>
                  <span className="text-neutral-300 flex-shrink-0">
                    {(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#3f3f46] pt-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Kargo</span>
                <span className="text-sm text-green-400 font-semibold">Ücretsiz</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-white">Toplam</span>
                <span className="text-xl font-black text-orange-500 font-chivo">
                  {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              data-testid={CART.checkoutBtn}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-wider active:scale-95"
            >
              Siparişi Tamamla <ArrowRight size={16} />
            </button>

            <Link
              to="/urunler"
              className="block text-center text-sm text-neutral-400 hover:text-white mt-3 transition-colors"
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
