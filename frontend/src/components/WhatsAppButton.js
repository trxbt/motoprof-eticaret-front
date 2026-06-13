import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '905551234567'; // Numarayı buradan güncelleyebilirsiniz
const WHATSAPP_MESSAGE = 'Merhaba! MotoProf hakkında bilgi almak istiyorum.';

const WhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="fixed bottom-24 sm:bottom-8 right-4 sm:right-6 z-[9990] flex flex-col items-end gap-2">

      {/* Tooltip balonu */}
      {showTooltip && !dismissed && (
        <div className="relative bg-[#111] border border-orange-500/30 rounded-2xl px-4 py-3 shadow-2xl shadow-orange-500/10 max-w-[220px] animate-fade-in">
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-[#1a1a1a] border border-[#333] rounded-full flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
          >
            <X size={10} />
          </button>
          <p className="text-white text-xs font-semibold leading-relaxed">
            Soru mu var? WhatsApp'tan <span className="text-orange-400">hemen yanıtlayalım</span>!
          </p>
          <div className="absolute bottom-[-6px] right-[22px] w-3 h-3 bg-[#111] border-r border-b border-orange-500/30 rotate-45" />
        </div>
      )}

      {/* Ana buton */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_35px_rgba(249,115,22,0.55)] transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        }}
      >
        {/* Ping animasyonu */}
        <span className="absolute inset-0 rounded-full bg-orange-500/40 animate-ping opacity-75" />
        <MessageCircle size={26} className="text-white relative z-10 fill-white" />
      </a>
    </div>
  );
};

export default WhatsAppButton;
