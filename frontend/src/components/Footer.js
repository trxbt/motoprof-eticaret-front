import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { BRANDS } from '../constants/categories';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#3f3f46] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-orange-500 text-2xl font-black tracking-tighter font-chivo">MOTO</span>
              <span className="text-white text-2xl font-black tracking-tighter font-chivo">PROF</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              Türkiye'nin en güvenilir motosiklet yedek parça platformu. Orijinal kalitede ürünler, hızlı kargo.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 bg-[#171717] hover:bg-orange-500 text-neutral-400 hover:text-white rounded-lg transition-all duration-200">
                <Facebook size={16} />
              </a>
              <a href="#" className="p-2 bg-[#171717] hover:bg-orange-500 text-neutral-400 hover:text-white rounded-lg transition-all duration-200">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 bg-[#171717] hover:bg-orange-500 text-neutral-400 hover:text-white rounded-lg transition-all duration-200">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Markalar */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Markalar</h3>
            <ul className="space-y-2">
              {BRANDS.map(brand => (
                <li key={brand.id}>
                  <Link to={`/urunler/${brand.slug}`} className="text-sm text-neutral-400 hover:text-orange-400 transition-colors">
                    {brand.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/urunler" className="text-sm text-neutral-400 hover:text-orange-400 transition-colors">
                  Tüm Ürünler
                </Link>
              </li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Müşteri Hizmetleri</h3>
            <ul className="space-y-2">
              {['Hakkımızda', 'SSS', 'İade Politikası', 'Kargo Bilgisi', 'Gizlilik Politikası'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-neutral-400 hover:text-orange-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone size={15} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-neutral-400">+90 (212) 000 00 00</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={15} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-neutral-400">info@motoprof.com.tr</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-neutral-400">İstanbul, Türkiye</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-[#171717] rounded-lg border border-[#3f3f46]">
              <p className="text-xs text-neutral-400">Hafta içi</p>
              <p className="text-sm font-semibold text-white">09:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#3f3f46]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-500">© 2025 MotoProf. Tüm hakları saklıdır.</p>
          <p className="text-xs text-neutral-500">Motorcycle Spare Parts</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
