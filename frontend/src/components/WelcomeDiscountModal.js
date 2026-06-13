import React, { useState } from 'react';
import { X, Tag, Copy, CheckCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';

const DISCOUNT_CODE = 'YENI10';

const WelcomeDiscountModal = ({ userName, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE).then(() => {
      setCopied(true);
      toast.success('Kod kopyalandı!');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-fade-in-up">
        {/* Neon glow */}
        <div className="absolute inset-0 rounded-3xl bg-orange-500/10 blur-xl" />

        <div className="relative bg-[#0d0d0d] border border-orange-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20">

          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />

          {/* Close */}
          <button
            onClick={onClose}
            data-testid="welcome-modal-close"
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={14} />
          </button>

          <div className="p-7 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/25 mb-5">
              <Zap size={30} className="text-orange-400" fill="currentColor" />
            </div>

            {/* Welcome text */}
            <h2 className="text-white font-black text-xl font-chivo mb-1">
              Hoş Geldin{userName ? `, ${userName.split(' ')[0]}` : ''}! 🎉
            </h2>
            <p className="text-neutral-400 text-sm mb-5">
              İlk siparişine özel <span className="text-orange-400 font-bold">%10 indirim</span> kazandın!
            </p>

            {/* Discount badge */}
            <div className="bg-[#111] border border-orange-500/30 rounded-2xl p-4 mb-5">
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2 font-semibold">
                <Tag size={11} className="inline mr-1" />
                İndirim Kodun
              </p>
              <div className="flex items-center justify-between gap-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3">
                <span className="text-2xl font-black text-orange-400 font-chivo tracking-widest">
                  {DISCOUNT_CODE}
                </span>
                <button
                  onClick={handleCopy}
                  data-testid="copy-discount-code"
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/25 transition-all"
                >
                  {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                  {copied ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>
            </div>

            {/* Info */}
            <p className="text-xs text-neutral-600 mb-5">
              Bu kod 30 gün geçerlidir. Ödeme adımında girebilirsin.
            </p>

            {/* CTA */}
            <button
              onClick={onClose}
              data-testid="welcome-modal-cta"
              className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
            >
              Alışverişe Başla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDiscountModal;
