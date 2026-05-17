import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, user } = useAuth();

  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched]           = useState({ username: false, password: false });

  // Zaten giriş yapılmışsa direkt yönlendir
  const getRoleRedirect = (role) => {
    if (role === 'admin')   return '/admin';
    if (role === 'teacher') return '/teacher';
    return '/student';
  };

  // Eğer kullanıcı zaten oturum açmışsa dashboard'a gönder
  if (user) {
    return <Navigate to={getRoleRedirect(user.role)} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!username || !password) return;
    const result = await login(username, password);
    if (result.success) {
      // onAuthStateChange user'ı setleyecek, o zaman yukarıdaki if bloğu devreye girer
    }
  };

  const handleDemoLogin = async (uname, role) => {
    await login(uname, '123456');
    // user state güncellenince yukarıdaki redirect if'i devreye girer
  };


  return (
    <AuthLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-2xl shadow-blue-500/40 text-3xl mb-2 animate-float">
            ⚡
          </div>
          <h1 className="font-display font-black text-3xl text-gradient">Kuvvet &amp; Hareket</h1>
          <p className="text-slate-500 text-sm">Öğrenme yolculuğuna devam etmek için giriş yap!</p>
        </div>

        {/* Demo Hesaplar — sadece öğrenci ve öğretmen */}
        <div>
          <p className="text-xs text-slate-500 mb-2 text-center uppercase tracking-wider font-semibold">Hızlı Demo Girişi</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('ahmet', 'student')}
              disabled={loading}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-gradient-to-b from-blue-50 to-blue-100 border-blue-200 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              <span className="text-2xl">🎒</span>
              <span className="text-xs font-bold text-blue-900">Öğrenci Girişi</span>
            </button>
            <button
              onClick={() => handleDemoLogin('ogretmen1', 'teacher')}
              disabled={loading}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-gradient-to-b from-cyan-50 to-cyan-100 border-cyan-200 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              <span className="text-2xl">🎓</span>
              <span className="text-xs font-bold text-cyan-900">Öğretmen Girişi</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-500 font-medium">veya giriş yap</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Kullanıcı Adı */}
          <div className="space-y-1.5">
            <label htmlFor="login-username" className="text-sm font-semibold text-slate-600">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                placeholder="kullanici_adi"
                autoComplete="username"
                className="form-input pl-10"
                required
              />
            </div>
            {touched.username && !username && (
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
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                autoComplete="current-password"
                className="form-input pl-10 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Hata */}
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
                <LogIn size={18} /> Giriş Yap
              </>
            )}
          </button>
        </form>

        {/* Kayıt Ol linki */}
        <p className="text-center text-sm text-slate-500">
          Hesabın yok mu?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
