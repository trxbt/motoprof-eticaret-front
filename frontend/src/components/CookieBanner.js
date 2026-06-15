import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, ChevronDown, Shield, BarChart2, Megaphone } from 'lucide-react';

const STORAGE_KEY = 'motoprof_cookie_consent';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const save = (consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...consent, savedAt: Date.now() }));
    setVisible(false);
  };

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true });
  const rejectAll = () => save({ necessary: true, analytics: false, marketing: false });
  const saveCustom = () => save({ necessary: true, ...prefs });

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-[#0e0e0e] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">

        {/* Main bar */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cookie size={18} className="text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white mb-1">Çerez Tercihleri</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Sitemizde zorunlu çerezlerin yanı sıra deneyiminizi iyileştirmek için analitik ve pazarlama çerezleri kullanıyoruz.
                Detaylı bilgi için{' '}
                <Link to="/gizlilik-politikasi" className="text-orange-400 hover:text-orange-300 underline" onClick={() => setVisible(false)}>Gizlilik Politikası</Link>
                {' '}ve{' '}
                <Link to="/kvkk" className="text-orange-400 hover:text-orange-300 underline" onClick={() => setVisible(false)}>KVKK metnini</Link>{' '}inceleyebilirsiniz.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={acceptAll}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Tümünü Kabul Et
            </button>
            <button
              onClick={rejectAll}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-white/8 text-neutral-300 text-xs font-bold rounded-xl transition-colors"
            >
              Sadece Zorunlular
            </button>
            <button
              onClick={() => setShowDetail(v => !v)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-transparent border border-white/8 hover:border-orange-500/30 text-neutral-500 hover:text-neutral-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              Özelleştir
              <ChevronDown size={13} className={`transition-transform duration-200 ${showDetail ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Detail panel */}
        {showDetail && (
          <div className="border-t border-white/5 p-5 sm:p-6 space-y-3">
            {/* Necessary - always on */}
            <div className="flex items-start gap-4 bg-[#151515] rounded-xl p-4">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={15} className="text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Zorunlu Çerezler</span>
                  <span className="text-[10px] text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">Her Zaman Aktif</span>
                </div>
                <p className="text-[11px] text-neutral-600 mt-1">Oturum yönetimi ve sepet gibi temel site işlevleri için gereklidir. Devre dışı bırakılamaz.</p>
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-start gap-4 bg-[#151515] rounded-xl p-4">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart2 size={15} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Analitik Çerezler</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs.analytics}
                      onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                    />
                    <div className="w-9 h-5 bg-[#2a2a2a] peer-checked:bg-orange-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
                <p className="text-[11px] text-neutral-600 mt-1">Ziyaretçi sayısı ve sayfa görüntüleme gibi anonim istatistikler toplanır. Site iyileştirme amacıyla kullanılır.</p>
              </div>
            </div>

            {/* Marketing */}
            <div className="flex items-start gap-4 bg-[#151515] rounded-xl p-4">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Megaphone size={15} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Pazarlama Çerezleri</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs.marketing}
                      onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                    />
                    <div className="w-9 h-5 bg-[#2a2a2a] peer-checked:bg-orange-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
                <p className="text-[11px] text-neutral-600 mt-1">Kişiselleştirilmiş reklamlar ve kampanya takibi için kullanılır. Açık rızanıza dayanır.</p>
              </div>
            </div>

            <button
              onClick={saveCustom}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-colors mt-1"
            >
              Seçimlerimi Kaydet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
