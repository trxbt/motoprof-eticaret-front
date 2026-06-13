import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);

  const status  = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const msg     = searchParams.get('msg');

  const isSuccess = status === 'success';

  useEffect(() => {
    if (isSuccess) clearCart();
    if (orderId) {
      axios.get(`${API}/orders/${orderId}`, { withCredentials: true })
        .then(({ data }) => setOrder(data))
        .catch(() => {});
    }
  }, [orderId, isSuccess]);

  if (isSuccess) {
    return (
      <div className="pt-24 min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="p-5 bg-green-500/10 rounded-full mb-5 border border-green-500/20">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-black text-white font-chivo mb-3">Ödeme Başarılı!</h1>
        <p className="text-neutral-400 text-sm mb-2">
          Sipariş Numaranız:{' '}
          <span className="text-orange-400 font-mono font-semibold text-xs">
            {orderId?.slice(0, 8).toUpperCase()}
          </span>
        </p>
        {order && (
          <p className="text-neutral-500 text-xs mb-1">
            Toplam: <span className="text-white font-semibold">{order.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
          </p>
        )}
        <p className="text-neutral-400 text-sm mb-8 max-w-md mt-2">
          Siparişiniz başarıyla alındı. Hazırlanmaya başlandı. Kargo bilgisi e-posta ile iletilecektir.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link to="/profil" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
            Siparişimi Görüntüle <ArrowRight size={14} />
          </Link>
          <Link to="/urunler" className="flex items-center gap-2 bg-[#171717] hover:bg-[#262626] border border-[#3f3f46] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
            <ShoppingBag size={14} /> Alışverişe Devam
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="pt-24 min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="p-5 bg-red-500/10 rounded-full mb-5 border border-red-500/20">
          <XCircle size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white font-chivo mb-3">Ödeme Başarısız</h1>
        {msg && (
          <p className="text-red-400 text-sm mb-2 max-w-sm">{decodeURIComponent(msg)}</p>
        )}
        <p className="text-neutral-400 text-sm mb-8 max-w-md">
          Ödemeniz gerçekleştirilemedi. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link to="/odeme" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
            Tekrar Dene <ArrowRight size={14} />
          </Link>
          <Link to="/sepet" className="flex items-center gap-2 bg-[#171717] hover:bg-[#262626] border border-[#3f3f46] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
            Sepete Dön
          </Link>
        </div>
      </div>
    );
  }

  // Generic / error state
  return (
    <div className="pt-24 min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="p-5 bg-yellow-500/10 rounded-full mb-5 border border-yellow-500/20">
        <AlertCircle size={48} className="text-yellow-500" />
      </div>
      <h1 className="text-2xl font-black text-white font-chivo mb-3">Ödeme Durumu Bilinmiyor</h1>
      <p className="text-neutral-400 text-sm mb-8 max-w-md">
        Ödemenizin durumunu doğrulayamadık. Sipariş geçmişinizi kontrol edin veya destek ile iletişime geçin.
      </p>
      <Link to="/profil" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
        Sipariş Geçmişi <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default PaymentResultPage;
