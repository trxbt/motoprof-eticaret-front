import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { API } from '../config';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-50" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] pointer-events-none transition-opacity duration-700" />
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white font-chivo mb-2">Şifremi Unuttum</h1>
          <p className="text-sm text-neutral-400">
            E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">E-posta Gönderildi</h2>
            <p className="text-sm text-neutral-400 mb-8">
              <strong className="text-neutral-200">{email}</strong> adresine şifre sıfırlama talimatlarını gönderdik. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
            </p>
            <Link to="/giris" className="w-full inline-block text-center bg-white hover:bg-neutral-200 text-black font-bold py-3.5 rounded-xl transition-all text-xs uppercase tracking-widest">
              Giriş Sayfasına Dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">E-posta Adresi</label>
              <div className="relative">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 pl-11 pr-4 text-sm transition-all outline-none" />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
              </div>
            </div>
            
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest glow-orange-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gönderiliyor...
                </span>
              ) : (
                'Sıfırlama Linki Gönder'
              )}
            </button>
            
            <div className="mt-6 text-center">
              <Link to="/giris" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-white transition-colors">
                <ArrowLeft size={14} /> Giriş yap ekranına dön
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
