import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Bike, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AUTH } from '../constants/testIds';

function formatError(detail) {
  if (!detail) return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(' ');
  if (detail?.msg) return detail.msg;
  return String(detail);
}

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

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
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-orange-500 text-3xl font-black tracking-tighter font-chivo">MOTO</span>
            <span className="text-white text-3xl font-black tracking-tighter font-chivo">PROF</span>
          </Link>
          <p className="text-neutral-400 text-sm mt-2">Motorcycle Spare Parts</p>
        </div>

        <div className="bg-[#171717] border border-[#3f3f46] rounded-2xl p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex bg-[#0a0a0a] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              data-testid="tab-login"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              data-testid="tab-register"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
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
            <form onSubmit={handleLogin} data-testid={AUTH.loginForm} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">E-posta Adresi</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  data-testid={AUTH.emailInput}
                  className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Şifreniz"
                    data-testid={AUTH.passwordInput}
                    className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                data-testid={AUTH.submitBtn}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm uppercase tracking-wider mt-2"
              >
                {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Giriş yapılıyor...</span> : 'Giriş Yap'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} data-testid={AUTH.registerForm} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Ad Soyad *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Adınız ve soyadınız"
                  data-testid={AUTH.nameInput}
                  className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">E-posta *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="ornek@email.com"
                  data-testid={AUTH.emailInput}
                  className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Telefon (İsteğe Bağlı)</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="0(5XX) XXX XX XX"
                  className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Şifre *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="En az 6 karakter"
                    data-testid={AUTH.passwordInput}
                    className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Şifre Tekrar *</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Şifreyi tekrar girin"
                  className="w-full bg-[#0a0a0a] border border-[#3f3f46] text-white placeholder-neutral-600 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" />
              </div>
              <button type="submit" disabled={loading} data-testid={AUTH.submitBtn}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm uppercase tracking-wider mt-2">
                {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Kayıt olunuyor...</span> : 'Kayıt Ol'}
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
