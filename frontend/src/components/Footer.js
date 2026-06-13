import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Youtube, Facebook, ArrowRight } from 'lucide-react';
import { BRANDS } from '../constants/categories';

const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 mt-16">
      {/* Top CTA strip */}
      <div className="border-b border-white/4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-xs font-chivo">MP</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Ürün bulamadınız mı?</p>
              <p className="text-neutral-600 text-xs">Teknik ekibimize ulaşın, birlikte bulalım.</p>
            </div>
          </div>
          <a href="tel:+902120000000"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#1a1a1a] border border-white/6 hover:border-orange-500/20 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider whitespace-nowrap">
            <Phone size={13} className="text-orange-500" />
            +90 (212) 000 00 00
          </a>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-400 transition-colors">
                <span className="text-white font-black text-xs font-chivo">MP</span>
              </div>
              <span className="font-chivo font-black text-xl">
                <span className="text-orange-400">MOTO</span>
                <span className="text-white">PROF</span>
              </span>
            </Link>
            <p className="text-neutral-600 text-xs leading-relaxed mb-6 max-w-[200px]">
              Türkiye'nin güvenilir motosiklet yedek parça platformu.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Facebook, label: 'Facebook' },
                { icon: Youtube, label: 'YouTube' },
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-8 h-8 bg-[#111111] hover:bg-orange-500 border border-white/6 hover:border-orange-500 text-neutral-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-600 mb-5">Markalar</h3>
            <ul className="space-y-2.5">
              {BRANDS.map(brand => (
                <li key={brand.id}>
                  <Link to={`/urunler/${brand.slug}`}
                    className="group flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors">
                    <ArrowRight size={10} className="text-neutral-700 group-hover:text-orange-500 transition-colors" />
                    {brand.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/urunler" className="group flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors">
                  <ArrowRight size={10} className="text-neutral-700 group-hover:text-orange-500 transition-colors" />
                  Tüm Ürünler
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-600 mb-5">Müşteri Hizmetleri</h3>
            <ul className="space-y-2.5">
              {['Hakkımızda', 'SSS', 'İade Politikası', 'Kargo Bilgisi', 'Gizlilik Politikası', 'KVKK'].map(item => (
                <li key={item}>
                  <a href="#" className="group flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors">
                    <ArrowRight size={10} className="text-neutral-700 group-hover:text-orange-500 transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-600 mb-5">İletişim</h3>
            <ul className="space-y-3">
              {[
                { icon: Phone, text: '+90 (212) 000 00 00' },
                { icon: Mail, text: 'info@motoprof.com.tr' },
                { icon: MapPin, text: 'İstanbul, Türkiye' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon size={13} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-neutral-500">{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 p-3.5 bg-[#0d0d0d] rounded-xl border border-white/4">
              <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-0.5">Çalışma Saatleri</p>
              <p className="text-sm font-bold text-white">Pzt – Cum  /  09:00 – 18:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-neutral-700">© 2025 MotoProf. Tüm hakları saklıdır.</p>
          <p className="text-[11px] text-neutral-700">Motorcycle Spare Parts · motoprof.com.tr</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
