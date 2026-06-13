import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AUTH } from '../constants/testIds';
import WelcomeDiscountModal from '../components/WelcomeDiscountModal';

function formatError(detail) {
  if (!detail) return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(' ');
  if (detail?.msg) return detail.msg;
  return String(detail);
}

const AuthPage = () => {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const initMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initMode);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('E-posta ve şifre zorunludur.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Ad, e-posta ve şifre zorunludur.'); return; }
    if (form.password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    if (form.password !== form.confirmPassword) { setError('Şifreler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone || undefined);
      setNewUserName(form.name);
      setShowWelcome(true);
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    navigate(redirect, { replace: true });
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 bg-[#050505]">
      {showWelcome && (
        <WelcomeDiscountModal userName={newUserName} onClose={handleWelcomeClose} />
      )}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 bg-orange-500 group-hover:bg-orange-400 rounded-xl flex items-center justify-center transition-colors">
              <span className="text-white font-black text-sm font-chivo">MP</span>
            </div>
            <div>
              <span className="text-orange-400 text-2xl font-black tracking-tighter font-chivo">MOTO</span>
              <span className="text-white text-2xl font-black tracking-tighter font-chivo">PROF</span>
            </div>
          </Link>
          <p className="text-neutral-600 text-xs mt-3 uppercase tracking-widest">Motorcycle Spare Parts</p>
        </div>

        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex bg-[#070707] border border-[#151515] rounded-2xl p-1 mb-7">
            <button onClick={() => { setMode('login'); setError(''); }} data-testid="tab-login"
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all uppercase tracking-wider ${mode === 'login' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-neutral-600 hover:text-neutral-400'}`}>
              Giriş Yap
            </button>
            <button onClick={() => { setMode('register'); setError(''); }} data-testid="tab-register"
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all uppercase tracking-wider ${mode === 'register' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-neutral-600 hover:text-neutral-400'}`}>
              Kayıt Ol
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} data-testid={AUTH.loginForm} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">E-posta Adresi</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="ornek@email.com" data-testid={AUTH.emailInput}
                  className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 px-4 text-sm transition-all outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">Şifre</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                    placeholder="••••••••" data-testid={AUTH.passwordInput}
                    className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 pl-4 pr-11 text-sm transition-all outline-none" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} data-testid={AUTH.submitBtn}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest glow-orange-sm mt-2">
                {loading ? <span className="flex items-center justify-center gap-2"><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Giriş yapılıyor...</span> : 'Giriş Yap'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} data-testid={AUTH.registerForm} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">Ad Soyad *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Adınız ve soyadınız"
                  data-testid={AUTH.nameInput}
                  className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 px-4 text-sm transition-all outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">E-posta *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="ornek@email.com"
                  data-testid={AUTH.emailInput}
                  className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 px-4 text-sm transition-all outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">Telefon (İsteğe Bağlı)</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="0(5XX) XXX XX XX"
                  className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 px-4 text-sm transition-all outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">Şifre *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="En az 6 karakter"
                    data-testid={AUTH.passwordInput}
                    className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 pl-4 pr-11 text-sm transition-all outline-none" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 block mb-2">Şifre Tekrar *</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Şifreyi tekrar girin"
                  className="w-full bg-[#070707] border border-[#1a1a1a] hover:border-[#252525] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white placeholder-neutral-700 rounded-xl py-3 px-4 text-sm transition-all outline-none" />
              </div>
              <button type="submit" disabled={loading} data-testid={AUTH.submitBtn}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-widest glow-orange-sm mt-2">
                {loading ? <span className="flex items-center justify-center gap-2"><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Kayıt olunuyor...</span> : 'Kayıt Ol'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-neutral-500 mt-4">
          Devam ederek{' '}
          <a href="#" className="text-orange-400 hover:text-orange-300">Kullanım Şartları</a>
          {' '}ve{' '}
          <a href="#" className="text-orange-400 hover:text-orange-300">Gizlilik Politikası</a>'nı
          kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
