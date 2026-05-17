import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Gizli admin giriş sayfası — /webadmin/login
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!username || !password) return;

    const result = await login(username, password, true);
    if (!result.success) return;

    // Supabase'den profil gelene kadar kısa bekle
    await new Promise(r => setTimeout(r, 600));

    // AuthContext'ten güncel kullanıcıyı alalım
    // ProtectedRoute zaten rol kontrolü yapacak
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-amber-500 mb-4">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-xl font-bold text-white">Yönetim Paneli</h1>
          <p className="text-slate-500 text-xs mt-1">Yetkili erişim gereklidir</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-username" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Kullanıcı Adı
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Şifre
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {(error || authError) && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {authError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Doğrulanıyor...
              </>
            ) : (
              <><LogIn size={16} /> Giriş Yap</>
            )}
          </button>
        </form>

        <p className="text-center text-slate-700 text-xs mt-8">
          Bu sayfa yetkisiz kişilerin erişimine kapalıdır.
        </p>
      </div>
    </div>
  );
}
