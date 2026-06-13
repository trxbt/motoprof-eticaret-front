import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, UserPlus, UserCheck, ArrowRight, Shield } from 'lucide-react';

const CheckoutAuthModal = ({ onClose, onGuest }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[9995] flex items-end sm:items-center justify-center px-0 sm:px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md animate-fade-in-up">
        <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ boxShadow: '0 -8px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.1)' }}>

          {/* Top accent */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <div>
              <h2 className="text-white font-black text-lg font-chivo tracking-tight">Ödemeye Geç</h2>
              <p className="text-neutral-500 text-xs mt-0.5">Nasıl devam etmek istersiniz?</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all">
              <X size={15} />
            </button>
          </div>

          <div className="px-5 pb-5 space-y-2.5">

            {/* Option 1: Giriş Yap */}
            <button
              data-testid="checkout-auth-login"
              onClick={() => navigate('/giris?redirect=/odeme')}
              className="w-full group flex items-center gap-4 p-4 bg-orange-500 hover:bg-orange-400 rounded-2xl transition-all duration-200 active:scale-[0.98] text-left"
              style={{ boxShadow: '0 0 20px rgba(249,115,22,0.25)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <LogIn size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm tracking-tight">Giriş Yap</p>
                <p className="text-orange-100/70 text-xs mt-0.5">Siparişlerini takip et, hızlı ödeme yap</p>
              </div>
              <ArrowRight size={16} className="text-white/70 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>

            {/* Option 2: Kayıt Ol */}
            <button
              data-testid="checkout-auth-register"
              onClick={() => navigate('/giris?redirect=/odeme&mode=register')}
              className="w-full group flex items-center gap-4 p-4 bg-[#141414] hover:bg-[#1a1a1a] border border-[#2a2a2a] hover:border-orange-500/30 rounded-2xl transition-all duration-200 active:scale-[0.98] text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <UserPlus size={18} className="text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-black text-sm tracking-tight">Kayıt Ol</p>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-orange-500/15 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full">
                    %10 İndirim
                  </span>
                </div>
                <p className="text-neutral-500 text-xs mt-0.5">Yeni üyelere özel hoş geldin indirimi</p>
              </div>
              <ArrowRight size={16} className="text-neutral-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[#1e1e1e]" />
              <span className="text-[10px] text-neutral-700 font-bold uppercase tracking-widest">ya da</span>
              <div className="flex-1 h-px bg-[#1e1e1e]" />
            </div>

            {/* Option 3: Misafir */}
            <button
              data-testid="checkout-auth-guest"
              onClick={onGuest}
              className="w-full group flex items-center gap-4 p-4 bg-[#0a0a0a] hover:bg-[#111] border border-[#1e1e1e] hover:border-[#333] rounded-2xl transition-all duration-200 active:scale-[0.98] text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-white/3 border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                <UserCheck size={18} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-neutral-300 group-hover:text-white font-bold text-sm tracking-tight transition-colors">
                  Misafir Olarak Devam Et
                </p>
                <p className="text-neutral-600 text-xs mt-0.5">Hesap açmadan satın al</p>
              </div>
              <ArrowRight size={16} className="text-neutral-700 group-hover:text-neutral-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <Shield size={11} className="text-neutral-700" />
              <p className="text-[10px] text-neutral-700">256-bit SSL şifreleme ile güvenli ödeme</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAuthModal;
