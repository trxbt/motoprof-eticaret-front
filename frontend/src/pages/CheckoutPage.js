import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, CreditCard, Lock, Package, User, ArrowRight, FileText, Building2, UserCheck, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CHECKOUT } from '../constants/testIds';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const inputCls = "w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white placeholder-neutral-700 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-colors";
const labelCls = "text-xs text-neutral-500 font-semibold block mb-1.5";
const sectionCls = "bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 mb-4";

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

  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [invoiceType, setInvoiceType] = useState('bireysel');
  const [invoice, setInvoice] = useState({
    name: user?.name || '',
    tc_no: '',
    email: user?.email || '',
    address: '',
    company: '',
    tax_office: '',
    tax_no: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleInvoiceChange = (e) => {
    setInvoice(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    if (wantsInvoice) {
      if (invoiceType === 'bireysel' && (!invoice.name || !invoice.tc_no)) {
        setError('Bireysel fatura için ad soyad ve TC kimlik no zorunludur.');
        return;
      }
      if (invoiceType === 'kurumsal' && (!invoice.company || !invoice.tax_office || !invoice.tax_no)) {
        setError('Kurumsal fatura için firma adı, vergi dairesi ve vergi no zorunludur.');
        return;
      }
    }
    if (items.length === 0) { toast.error('Sepetiniz boş!'); navigate('/sepet'); return; }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.id, name: item.name,
          price: item.price, quantity: item.quantity, image: item.image,
        })),
        total,
        shipping_name: form.shipping_name,
        shipping_phone: form.shipping_phone,
        shipping_address: form.shipping_address,
        shipping_city: form.shipping_city,
        guest_email: user ? undefined : form.guest_email,
        invoice: wantsInvoice ? { type: invoiceType, ...invoice } : null,
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
              <div className={sectionCls}>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={16} className="text-orange-500" />
                  İletişim Bilgisi
                </h2>
                <div>
                  <label className={labelCls}>E-posta Adresiniz *</label>
                  <input type="email" name="guest_email" value={form.guest_email} onChange={handleChange}
                    placeholder="siparis@ornek.com" data-testid="checkout-guest-email" className={inputCls} />
                  <p className="text-xs text-neutral-700 mt-1.5">Sipariş bilgisi bu adrese gönderilecektir.</p>
                </div>
              </div>
            )}
            <div className={sectionCls}>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package size={16} className="text-orange-500" />
                Teslimat Bilgileri
              </h2>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Ad Soyad *</label>
                  <input type="text" name="shipping_name" value={form.shipping_name} onChange={handleChange}
                    placeholder="Adınız ve soyadınız" data-testid={CHECKOUT.nameInput} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Telefon *</label>
                  <input type="tel" name="shipping_phone" value={form.shipping_phone} onChange={handleChange}
                    placeholder="0(5XX) XXX XX XX" data-testid={CHECKOUT.phoneInput} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Adres *</label>
                  <textarea name="shipping_address" value={form.shipping_address} onChange={handleChange}
                    placeholder="Mahalle, sokak, bina no, daire no" rows={3}
                    data-testid={CHECKOUT.addressInput} className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className={labelCls}>Şehir *</label>
                  <input type="text" name="shipping_city" value={form.shipping_city} onChange={handleChange}
                    placeholder="İstanbul" data-testid={CHECKOUT.cityInput} className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── FATURA BİLGİLERİ ── */}
            <div className={`${sectionCls} overflow-hidden`}>
              {/* Toggle header */}
              <button
                type="button"
                data-testid="invoice-toggle"
                onClick={() => setWantsInvoice(v => !v)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${wantsInvoice ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-[#1a1a1a] border border-[#2a2a2a]'}`}>
                    <FileText size={15} className={wantsInvoice ? 'text-orange-400' : 'text-neutral-600'} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Fatura İstiyorum</p>
                    <p className="text-xs text-neutral-600 mt-0.5">Bireysel veya kurumsal fatura</p>
                  </div>
                </div>
                {/* Toggle switch */}
                <div className={`relative w-11 h-6 rounded-full transition-all duration-200 ${wantsInvoice ? 'bg-orange-500' : 'bg-[#2a2a2a]'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${wantsInvoice ? 'left-[22px]' : 'left-0.5'}`} />
                </div>
              </button>

              {/* Invoice form */}
              {wantsInvoice && (
                <div className="mt-5 pt-5 border-t border-[#1e1e1e]">

                  {/* Type selector */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <button
                      type="button"
                      data-testid="invoice-type-bireysel"
                      onClick={() => setInvoiceType('bireysel')}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${invoiceType === 'bireysel'
                        ? 'border-orange-500/50 bg-orange-500/8 text-white'
                        : 'border-[#2a2a2a] bg-[#0d0d0d] text-neutral-500 hover:border-[#333]'}`}
                    >
                      <UserCheck size={15} className={invoiceType === 'bireysel' ? 'text-orange-400' : ''} />
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">Bireysel</p>
                        <p className="text-[10px] text-neutral-600 mt-0.5">TC Kimlikli</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      data-testid="invoice-type-kurumsal"
                      onClick={() => setInvoiceType('kurumsal')}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${invoiceType === 'kurumsal'
                        ? 'border-orange-500/50 bg-orange-500/8 text-white'
                        : 'border-[#2a2a2a] bg-[#0d0d0d] text-neutral-500 hover:border-[#333]'}`}
                    >
                      <Building2 size={15} className={invoiceType === 'kurumsal' ? 'text-orange-400' : ''} />
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">Kurumsal</p>
                        <p className="text-[10px] text-neutral-600 mt-0.5">Vergi Numaralı</p>
                      </div>
                    </button>
                  </div>

                  {/* BİREYSEL alanlar */}
                  {invoiceType === 'bireysel' && (
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Ad Soyad *</label>
                        <input type="text" name="name" value={invoice.name} onChange={handleInvoiceChange}
                          placeholder="Fatura sahibinin adı" data-testid="invoice-name"
                          className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>TC Kimlik No *</label>
                        <input type="text" name="tc_no" value={invoice.tc_no} onChange={handleInvoiceChange}
                          placeholder="11 haneli TC Kimlik No" maxLength={11} data-testid="invoice-tc"
                          className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Fatura E-postası</label>
                        <input type="email" name="email" value={invoice.email} onChange={handleInvoiceChange}
                          placeholder="fatura@ornek.com" data-testid="invoice-email"
                          className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Fatura Adresi</label>
                        <textarea name="address" value={invoice.address} onChange={handleInvoiceChange}
                          placeholder="Fatura adresi (boş bırakırsanız teslimat adresi kullanılır)"
                          rows={2} data-testid="invoice-address"
                          className={`${inputCls} resize-none`} />
                      </div>
                    </div>
                  )}

                  {/* KURUMSAL alanlar */}
                  {invoiceType === 'kurumsal' && (
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Firma Adı *</label>
                        <input type="text" name="company" value={invoice.company} onChange={handleInvoiceChange}
                          placeholder="Firma Adı A.Ş." data-testid="invoice-company"
                          className={inputCls} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Vergi Dairesi *</label>
                          <input type="text" name="tax_office" value={invoice.tax_office} onChange={handleInvoiceChange}
                            placeholder="Ör: Kadıköy VD" data-testid="invoice-tax-office"
                            className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Vergi No *</label>
                          <input type="text" name="tax_no" value={invoice.tax_no} onChange={handleInvoiceChange}
                            placeholder="10 haneli vergi no" maxLength={10} data-testid="invoice-tax-no"
                            className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Fatura E-postası</label>
                        <input type="email" name="email" value={invoice.email} onChange={handleInvoiceChange}
                          placeholder="muhasebe@firma.com" data-testid="invoice-company-email"
                          className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Fatura Adresi</label>
                        <textarea name="address" value={invoice.address} onChange={handleInvoiceChange}
                          placeholder="Şirket fatura adresi"
                          rows={2} data-testid="invoice-company-address"
                          className={`${inputCls} resize-none`} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mock Payment */}
            <div className={sectionCls}>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-orange-500" />
                Ödeme Bilgileri
              </h2>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock size={13} className="text-amber-400" />
                  <span className="text-amber-400 text-xs font-black uppercase tracking-wider">Test Ortamı</span>
                </div>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Bu bir demo ortamıdır. Gerçek ödeme alınmamaktadır. Ödeme entegrasyonu 2. fazda eklenecektir.
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
