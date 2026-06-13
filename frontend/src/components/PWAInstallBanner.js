import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Daha önce kapatıldıysa gösterme
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-banner-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      data-testid="pwa-install-banner"
      className="fixed bottom-20 left-3 right-3 z-50 lg:left-auto lg:right-5 lg:bottom-5 lg:w-80"
      style={{ animation: 'fadeInUp 0.35s ease' }}
    >
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-4 shadow-2xl flex items-center gap-3"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.15)' }}>

        {/* İkon */}
        <img src="/icon-192.png" alt="MotoProf" className="w-12 h-12 rounded-xl flex-shrink-0" />

        {/* Metin */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">MotoProf'u Yükle</p>
          <p className="text-neutral-500 text-xs mt-0.5 leading-tight">Ana ekrana ekle, uygulama gibi aç</p>
        </div>

        {/* Yükle butonu */}
        <button
          onClick={handleInstall}
          data-testid="pwa-install-btn"
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex-shrink-0"
        >
          <Download size={13} />
          Yükle
        </button>

        {/* Kapat */}
        <button
          onClick={handleDismiss}
          className="text-neutral-600 hover:text-white transition-colors flex-shrink-0 ml-1"
          aria-label="Kapat"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
