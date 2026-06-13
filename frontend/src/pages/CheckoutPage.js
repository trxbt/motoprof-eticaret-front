import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, CreditCard, Lock, Package, User, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CHECKOUT } from '../constants/testIds';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shipping_name: user?.name || '',
    shipping_phone: user?.phone || '',
    shipping_address: '',
    shipping_city: '',
    guest_email: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shipping_name || !form.shipping_phone || !form.shipping_address || !form.shipping_city) {
      setError('Lütfen tüm teslimat alanlarını doldurun.');
      return;
    }
    if (!user && !form.guest_email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    if (items.length === 0) {
      toast.error('Sepetiniz boş!');
      navigate('/sepet');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total,
        shipping_name: form.shipping_name,
        shipping_phone: form.shipping_phone,
        shipping_address: form.shipping_address,
        shipping_city: form.shipping_city,
        guest_email: user ? undefined : form.guest_email,
      };
      const { data } = await axios.post(`${API}/orders`, orderData, { withCredentials: true });
      setOrderId(data.id);
      clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Sipariş oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-20 min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="p-5 bg-green-500/10 rounded-full mb-5 border border-green-500/20">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-black text-white font-chivo mb-3">Siparişiniz Alındı!</h1>
        <p className="text-neutral-400 text-sm mb-2">
          Sipariş numaranız: <span className="text-orange-400 font-mono font-semibold text-xs">{orderId}</span>
        </p>
        <p className="text-neutral-400 text-sm mb-6 max-w-md">
          Siparişiniz başarıyla oluşturuldu. Sipariş durumunuzu profilinizden takip edebilirsiniz.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link to="/profil" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm">
            Siparişimi Görüntüle
          </Link>
          <Link to="/urunler" className="bg-[#171717] hover:bg-[#262626] border border-[#3f3f46] text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm">
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <h1 className="text-2xl font-black text-white font-chivo mb-2">Siparişi Tamamla</h1>
      {!user && (
        <div className="flex items-center justify-between bg-[#111] border border-orange-500/20 rounded-xl px-4 py-3 mb-6">
          <div className="flex items-center gap-2.5">
            <User size={15} className="text-orange-400 flex-shrink-0" />
            <p className="text-sm text-neutral-400">
              Hesabın var mı? <Link to="/giris?redirect=/odeme" className="text-orange-400 hover:text-orange-300 font-semibold">Giriş yap</Link> — siparişlerini takip et
            </p>
          </div>
          <Link to="/giris?redirect=/odeme" className="hidden sm:flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-400 border border-orange-500/25 px-3 py-1.5 rounded-lg transition-colors">
            Giriş Yap <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Shipping Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} data-testid={CHECKOUT.form}>

            {/* Guest email - only if not logged in */}
            {!user && (
              <div className="bg-[#171717] border border-[#3f3f46] rounded-xl p-5 mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={16} className="text-orange-500" />
                  İletişim Bilgisi
                </h2>
                <div>
                  <label className="text-xs text-neutral-400 font-semibold block mb-1.5">E-posta Adresiniz *</label>
                  <input
                    type="email"
                    name="guest_email"
                    value={form.guest_email}
                    onChange={handleChange}
                    placeholder="siparis@ornek.com"
                    data-testid="checkout-guest-email"
                    className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                  <p className="text-xs text-neutral-600 mt-1.5">Sipariş bilgisi bu adrese gönderilecektir.</p>
                </div>
              </div>
            )}
            <div className="bg-[#171717] border border-[#3f3f46] rounded-xl p-5 mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package size={16} className="text-orange-500" />
                Teslimat Bilgileri
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-400 font-semibold block mb-1.5">Ad Soyad *</label>
                  <input
                    type="text"
                    name="shipping_name"
                    value={form.shipping_name}
                    onChange={handleChange}
                    placeholder="Adınız ve soyadınız"
                    data-testid={CHECKOUT.nameInput}
                    className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-semibold block mb-1.5">Telefon *</label>
                  <input
                    type="tel"
                    name="shipping_phone"
                    value={form.shipping_phone}
                    onChange={handleChange}
                    placeholder="0(5XX) XXX XX XX"
                    data-testid={CHECKOUT.phoneInput}
                    className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-semibold block mb-1.5">Adres *</label>
                  <textarea
                    name="shipping_address"
                    value={form.shipping_address}
                    onChange={handleChange}
                    placeholder="Mahalle, sokak, bina no, daire no"
                    rows={3}
                    data-testid={CHECKOUT.addressInput}
                    className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-semibold block mb-1.5">Şehir *</label>
                  <input
                    type="text"
                    name="shipping_city"
                    value={form.shipping_city}
                    onChange={handleChange}
                    placeholder="İstanbul"
                    data-testid={CHECKOUT.cityInput}
                    className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Mock Payment */}
            <div className="bg-[#171717] border border-[#3f3f46] rounded-xl p-5 mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-orange-500" />
                Ödeme Bilgileri
              </h2>
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock size={14} className="text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Test Ortamı</span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Bu bir demo ortamıdır. Gerçek ödeme bilgisi alınmamaktadır. Gerçek ödeme entegrasyonu 2. fazda eklenecektir.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid={CHECKOUT.submitBtn}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 text-sm uppercase tracking-wider"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />İşleniyor...</>
              ) : (
                <><Lock size={16} />Siparişi Onayla</>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-[#171717] border border-[#3f3f46] rounded-xl p-5 sticky top-24">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Sipariş Özeti</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-[#262626] rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-semibold line-clamp-2">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-neutral-500">x{item.quantity}</span>
                      <span className="text-xs font-bold text-orange-400">
                        {(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#3f3f46] pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Ara Toplam</span>
                <span className="text-neutral-300">{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Kargo</span>
                <span className="text-green-400 font-semibold">Ücretsiz</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#3f3f46]">
                <span className="font-bold text-white">Toplam</span>
                <span className="text-xl font-black text-orange-500 font-chivo">
                  {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
