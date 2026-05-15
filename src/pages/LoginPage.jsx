import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

// ─── Demo hesap listesi ────────────────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  { label: 'Öğrenci Girişi', email: 'ogrenci@demo.com', role: 'student', icon: '🚀', color: 'from-blue-50 to-blue-100', border: 'border-blue-200 text-blue-900' },
  { label: 'Öğretmen Girişi', email: 'ogretmen@demo.com', role: 'teacher', icon: '🎓', color: 'from-cyan-50 to-cyan-100', border: 'border-cyan-200 text-cyan-900' },
  { label: 'Admin Girişi', email: 'admin@demo.com', role: 'admin', icon: '⚙️', color: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200 text-indigo-900' },
];

export default function LoginPage() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { login, loading, error } = useAuth();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched]         = useState({ email: false, password: false });

  const from = location.state?.from?.pathname || null;

  // Rol bazlı yönlendirme hedefi
  const getRoleRedirect = (role) => {
    if (from) return from;
    if (role === 'admin')   return '/admin';
    if (role === 'teacher') return '/teacher';
    return '/student';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const result = await login(email, password);
    if (result.success) {
      // Kullanıcı rolünü doğrudan AuthContext'ten almak yerine e-postadan çıkarıyoruz
      const prefix = email.split('@')[0].toLowerCase();
      const role = prefix === 'admin' ? 'admin' : prefix === 'ogretmen' ? 'teacher' : 'student';
      navigate(getRoleRedirect(role), { replace: true });
    }
  };

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword('demo123');
    const result = await login(account.email, 'demo123');
    if (result.success) {
      navigate(getRoleRedirect(account.role), { replace: true });
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-2xl shadow-violet-500/40 text-3xl mb-2 animate-float">
            ⚡
          </div>
          <h1 className="font-display font-black text-3xl text-gradient">
            Kuvvet &amp; Hareket
          </h1>
          <p className="text-slate-500 text-sm">
            Öğrenme yolculuğuna devam etmek için giriş yap!
          </p>
        </div>

        {/* Demo Hesaplar */}
        <div>
          <p className="text-xs text-slate-500 mb-2 text-center uppercase tracking-wider font-semibold">
            Hızlı Demo Girişi
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => handleDemoLogin(acc)}
                disabled={loading}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-gradient-to-b ${acc.color} ${acc.border} hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50`}
              >
                <span className="text-2xl">{acc.icon}</span>
                <span className="text-xs font-bold text-slate-900 leading-tight text-center">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-500 font-medium">veya manuel giriş</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Kullanıcı Adı */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm font-semibold text-slate-600">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="kullanici_adi"
                autoComplete="username"
                className="form-input"
                required
              />
            </div>
            {touched.email && !email && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle size={11} /> Kullanıcı adı gerekli
              </p>
            )}
          </div>

          {/* Şifre */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-sm font-semibold text-slate-600">
              Şifre
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                autoComplete="current-password"
                className="form-input pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {touched.password && password.length > 0 && password.length < 6 && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle size={11} /> Şifre en az 6 karakter olmalı
              </p>
            )}
          </div>

          {/* API Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="btn-login-submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Giriş yapılıyor...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        {/* Hint */}
        <p className="text-center text-xs text-slate-500">
          Demo şifresi: <span className="text-blue-500 font-bold">demo123</span>
        </p>
      </div>
    </AuthLayout>
  );
}
