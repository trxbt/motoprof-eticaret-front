import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, AlertCircle, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_MAP = {
  pending:    { label: 'Beklemede',     color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',  icon: Clock },
  processing: { label: 'Hazırlanıyor',  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',        icon: Package },
  shipped:    { label: 'Kargoda',       color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',  icon: Truck },
  delivered:  { label: 'Teslim Edildi', color: 'text-green-400 bg-green-400/10 border-green-400/20',     icon: CheckCircle },
};

const PAYMENT_MAP = {
  paid:             { label: 'Ödendi',          color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  pending:          { label: 'Ödeme Bekleniyor', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  failed:           { label: 'Ödeme Başarısız',  color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  mock_paid:        { label: 'Ödendi',          color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  pending_transfer: { label: 'EFT/Havale Bekleniyor', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
};

const sectionCls = 'bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 mb-4';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Sipariş Detayı - MotoProf';
    axios.get(`${API}/orders/${orderId}`, { withCredentials: true })
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Sipariş bulunamadı veya erişim izniniz yok.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div className="pt-24 max-w-3xl mx-auto px-4 pb-16">
      <div className="space-y-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-28 bg-[#111] rounded-2xl border border-[#2a2a2a]" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="pt-24 min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20">
        <AlertCircle size={36} className="text-red-500" />
      </div>
      <p className="text-white font-bold mb-2">{error}</p>
      <Link to="/profil" className="text-orange-400 text-sm hover:text-orange-300 flex items-center gap-1 mt-2">
        <ArrowLeft size={14} /> Profile Dön
      </Link>
    </div>
  );

  const status  = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const payment = PAYMENT_MAP[order.payment_status] || PAYMENT_MAP.pending;
  const StatusIcon = status.icon;

  const subtotal   = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || order.total;
  const discount   = order.discount || 0;

  return (
    <div className="pt-20 max-w-3xl mx-auto px-4 sm:px-6 pb-16">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profil')} className="p-2 bg-[#171717] hover:bg-[#262626] border border-[#3f3f46] rounded-xl transition-colors">
          <ArrowLeft size={16} className="text-neutral-400" />
        </button>
        <div>
          <h1 className="text-lg font-black text-white font-chivo">Sipariş Detayı</h1>
          <p className="text-xs text-neutral-500 font-mono">#{order.id?.slice(-10).toUpperCase()}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`flex items-center justify-between flex-wrap gap-3 rounded-2xl border p-5 mb-4 ${status.color.split(' ').slice(1).join(' ')}`}>
        <div className="flex items-center gap-3">
          <StatusIcon size={22} className={status.color.split(' ')[0]} />
          <div>
            <p className="text-white font-bold text-sm">Sipariş Durumu</p>
            <p className={`text-sm font-semibold ${status.color.split(' ')[0]}`}>{status.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Sipariş Tarihi</p>
          <p className="text-xs text-neutral-300">{formatDate(order.created_at)}</p>
        </div>
      </div>

      {/* Products */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Package size={13} /> Ürünler ({order.items?.length})
        </h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1f1f1f] last:border-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] flex-shrink-0">
                {item.product_image
                  ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  : <Package size={20} className="m-auto mt-3 text-neutral-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{item.product_name}</p>
                <p className="text-xs text-neutral-500">{item.price?.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺ × {item.quantity}</p>
              </div>
              <p className="text-sm font-black text-orange-400 font-chivo flex-shrink-0">
                {(item.price * item.quantity).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CreditCard size={13} /> Ödeme Özeti
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Ara Toplam</span>
            <span className="text-white">{subtotal.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-400">İndirim {order.coupon_code && <span className="text-xs font-mono">({order.coupon_code})</span>}</span>
              <span className="text-green-400">-{discount.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[#2a2a2a]">
            <span className="font-bold text-white">Toplam</span>
            <span className="text-xl font-black text-orange-500 font-chivo">{order.total?.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-xs text-neutral-500">Ödeme Durumu</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${payment.color}`}>{payment.label}</span>
          </div>
          {order.payment_method === 'bank_transfer' && order.payment_status === 'pending_transfer' && (
            <div className="mt-3 p-3 bg-[#1a1a1a] border border-orange-500/20 rounded-lg">
              <p className="text-xs text-orange-400 font-semibold mb-1">Lütfen ödemenizi gerçekleştirin:</p>
              <p className="text-xs text-neutral-400">Sipariş tutarını banka hesabımıza Havale/EFT ile iletirken açıklama kısmına sipariş numaranızı (<span className="text-white font-mono">#{order.id?.slice(-10).toUpperCase()}</span>) yazmayı unutmayınız.</p>
            </div>
          )}
        </div>
      </div>

      {/* Shipping */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MapPin size={13} /> Teslimat Bilgileri
        </h2>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-white">{order.shipping_name}</p>
          <p className="text-sm text-neutral-400">{order.shipping_phone}</p>
          <p className="text-sm text-neutral-400">{order.shipping_address}</p>
          <p className="text-sm text-neutral-400">{order.shipping_city}</p>
        </div>
      </div>

      {/* Invoice */}
      {order.invoice && order.invoice.type && (
        <div className={sectionCls}>
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Fatura Bilgileri</h2>
          <p className="text-xs text-neutral-400 capitalize">{order.invoice.type === 'bireysel' ? 'Bireysel Fatura' : 'Kurumsal Fatura'}</p>
          
          {order.invoice.type === 'bireysel' ? (
            <>
              {order.invoice.name && <p className="text-sm text-white mt-1">{order.invoice.name}</p>}
              {order.invoice.tc_no && <p className="text-xs text-neutral-400 mt-0.5">TC: {order.invoice.tc_no}</p>}
            </>
          ) : (
            <>
              {order.invoice.company && <p className="text-sm text-white mt-1">{order.invoice.company}</p>}
              {order.invoice.tax_office && <p className="text-xs text-neutral-400 mt-0.5">VD: {order.invoice.tax_office}</p>}
              {order.invoice.tax_no && <p className="text-xs text-neutral-400 mt-0.5">VKN: {order.invoice.tax_no}</p>}
            </>
          )}
          {order.invoice.email && <p className="text-xs text-neutral-400 mt-0.5">{order.invoice.email}</p>}
          {order.invoice.address && <p className="text-xs text-neutral-400 mt-0.5">{order.invoice.address}</p>}
        </div>
      )}

      <Link to="/profil" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-orange-400 transition-colors mt-2">
        <ArrowLeft size={14} /> Tüm Siparişlerim
      </Link>
    </div>
  );
};

export default OrderDetailPage;
