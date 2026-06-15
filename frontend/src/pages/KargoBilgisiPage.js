import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, Package } from 'lucide-react';

const KargoBilgisiPage = () => (
  <div className="min-h-screen bg-[#060606] pt-24 pb-20">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-[10px] text-neutral-600 mb-10 uppercase tracking-widest">
        <Link to="/" className="hover:text-orange-400 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-neutral-400">Kargo Bilgisi</span>
      </div>
      <h1 className="text-3xl font-black text-white mb-2">Kargo Bilgisi</h1>
      <div className="w-12 h-0.5 bg-orange-500 mb-10" />

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {[
          { icon: Truck, title: 'Kargo Firmaları', desc: 'Yurtiçi Kargo ve Aras Kargo ile çalışıyoruz.' },
          { icon: Clock, title: 'Teslimat Süresi', desc: 'Türkiye genelinde 1-3 iş günü.' },
          { icon: Package, title: 'Ücretsiz Kargo', desc: '500 TL ve üzeri siparişlerde kargo bedava.' },
          { icon: MapPin, title: 'Teslimat Bölgesi', desc: 'Türkiye genelinin tamamına gönderim yapılmaktadır.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
              <p className="text-xs text-neutral-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-7 space-y-6">
        <div>
          <h2 className="text-base font-black text-white mb-3">Kargo Ücretleri</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] text-neutral-600 uppercase tracking-wider py-2 pr-4">Sipariş Tutarı</th>
                  <th className="text-left text-[10px] text-neutral-600 uppercase tracking-wider py-2">Kargo Ücreti</th>
                </tr>
              </thead>
              <tbody className="text-neutral-400">
                <tr className="border-b border-white/3">
                  <td className="py-3 pr-4">0 – 499 TL</td>
                  <td className="py-3">49,90 TL</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-white">500 TL ve üzeri</td>
                  <td className="py-3 font-semibold text-orange-400">Ücretsiz</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-base font-black text-white mb-3">Kargoya Veriliş Saatleri</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">Hafta içi saat <strong className="text-white">17:00</strong>'ye kadar verilen siparişler aynı gün kargoya teslim edilir. Hafta sonu ve resmi tatil günlerinde verilen siparişler bir sonraki iş günü kargoya verilir.</p>
        </div>
        <div>
          <h2 className="text-base font-black text-white mb-3">Kargo Takibi</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">Siparişiniz kargoya verildiğinde, kayıtlı e-posta adresinize takip numarası gönderilir. Hesabım sayfanızdan da kargo durumunuzu takip edebilirsiniz.</p>
        </div>
      </div>
    </div>
  </div>
);

export default KargoBilgisiPage;
