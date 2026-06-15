import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, Headphones, Award, Users, MapPin } from 'lucide-react';

const HakkimizdaPage = () => (
  <div className="min-h-screen bg-[#060606] pt-24 pb-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] text-neutral-600 mb-10 uppercase tracking-widest">
        <Link to="/" className="hover:text-orange-400 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-neutral-400">Hakkımızda</span>
      </div>

      {/* Hero */}
      <div className="mb-14">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Hakkımızda</h1>
        <div className="w-12 h-0.5 bg-orange-500 mb-6" />
        <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
          MotoProf olarak 2015 yılından bu yana Türkiye'nin güvenilir motosiklet yedek parça platformu olarak hizmet veriyoruz.
          Honda, Yamaha, CF Moto ve Bajaj başta olmak üzere onlarca markanın orijinal ve eşdeğer yedek parçasını
          sizlerle buluşturuyoruz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
        {[
          { value: '10.000+', label: 'Ürün Çeşidi' },
          { value: '50.000+', label: 'Mutlu Müşteri' },
          { value: '4', label: 'Marka' },
          { value: '9+', label: 'Yıl Deneyim' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-5 text-center">
            <div className="text-2xl font-black text-orange-400 mb-1">{value}</div>
            <div className="text-[10px] text-neutral-600 uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-7 mb-8">
        <h2 className="text-lg font-black text-white mb-4">Hikayemiz</h2>
        <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
          <p>MotoProf, motosiklet tutkunlarının orijinal yedek parçaya ulaşmakta yaşadığı zorluklardan yola çıkarak kurulmuştur. Kuruluşumuzdan bu yana temel amacımız; doğru parçayı, doğru fiyatla ve hızlı teslimatla müşterilerimize ulaştırmaktır.</p>
          <p>Türkiye genelinde yetkili distribütörler ve ithalatçılarla kurduğumuz güçlü tedarik zincirimiz sayesinde Honda, Yamaha, CF Moto ve Bajaj markalarına ait binlerce parçayı stoklu olarak sunuyoruz.</p>
          <p>Teknik destek ekibimiz, hangi parçaya ihtiyaç duyduğunuzu bilmediğiniz durumlarda bile yanınızdadır.</p>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          { icon: Shield, title: 'Güvenilir Ürünler', desc: 'Tüm ürünlerimiz orijinal veya onaylı eşdeğer parçalardan oluşmaktadır.' },
          { icon: Truck, title: 'Hızlı Teslimat', desc: 'Stoklu ürünlerde aynı gün kargo, Türkiye genelinde 1-3 iş günü teslimat.' },
          { icon: Headphones, title: 'Teknik Destek', desc: 'Uzman ekibimiz doğru parçayı bulmanızda size yardımcı olur.' },
          { icon: Award, title: 'Müşteri Memnuniyeti', desc: '30 gün iade garantisi ve kolay iade süreci ile alışveriş güvencesi.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-bold mb-1">Bizimle iletişime geçin</h3>
          <p className="text-neutral-500 text-xs">Sorularınız için 7/24 buradayız.</p>
        </div>
        <a href="mailto:info@motoprof.com.tr" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap">
          E-posta Gönder
        </a>
      </div>

    </div>
  </div>
);

export default HakkimizdaPage;
