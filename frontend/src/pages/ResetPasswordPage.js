import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { API } from '../config';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Geçersiz veya eksik sıfırlama bağlantısı.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    
    if (password !== passwordConfirm) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API}/auth/reset-password`, { token, new_password: password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/giris');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Şifre sıfırlanırken bir hata oluştu. Linkin süresi dolmuş olabilir.');
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
          <h1 className="text-2xl font-black text-white font-chivo mb-2">Yeni Şifre Belirle</h1>
          <p className="text-sm text-neutral-400">
            Lütfen hesabınız için yeni ve güvenli bir şifre oluşturun.
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
            <h2 className="text-lg font-bold text-white mb-2">Şifreniz Sıfırlandı!</h2>
            <p className="text-sm text-neutral-400 mb-8">
              Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
            <Link to="/giris" className="w-full inline-block text-center bg-white hover:bg-neutral-200 text-black font-bold py-3.5 rounded-xl transition-all text-xs uppercase tracking-widest">
              Giriş Yap
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">Yeni Şifre</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 pl-11 pr-11 text-sm transition-all outline-none" />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">Yeni Şifre (Tekrar)</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 pl-11 pr-4 text-sm transition-all outline-none" />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
              </div>
            </div>
            
            <button type="submit" disabled={loading || !token}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest glow-orange-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Güncelleniyor...
                </span>
              ) : (
                'Şifreyi Güncelle'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
