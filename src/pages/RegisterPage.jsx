import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, BookOpen, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    realEmail: '',
    className: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched]                   = useState({});
  const [success, setSuccess]                   = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur   = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const passwordsMatch = form.password === form.confirmPassword;
  const passwordValid  = form.password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, username: true, realEmail: true, className: true, password: true, confirmPassword: true });
    if (!form.fullName || !form.username || !form.realEmail || !form.className || !form.password || !passwordValid || !passwordsMatch) return;

    const result = await register({
      username:   form.username.trim().toLowerCase(),
      fullName:   form.fullName.trim(),
      realEmail:  form.realEmail.trim(),
      className:  form.className.trim(),
      password:   form.password,
    });

    if (result.success) setSuccess(true);
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6 py-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-slate-900">Kayıt Başarılı! 🎉</h2>
            <p className="text-slate-500 text-sm mt-2">
              Hesabın oluşturuldu. Şimdi giriş yapabilirsin!
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary flex items-center justify-center gap-2 mx-auto"
          >
            Giriş Yap
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/30 text-2xl mb-1">
            ⚡
          </div>
          <h1 className="font-display font-black text-2xl text-gradient">Kayıt Ol</h1>
          <p className="text-slate-500 text-xs">Öğrenme yolculuğuna katıl!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

          {/* Ad Soyad */}
          <Field label="Ad Soyad" id="reg-fullname" icon={<User size={15} />}>
            <input
              id="reg-fullname" type="text" className="form-input pl-10"
              placeholder="Ahmet Yılmaz"
              value={form.fullName} onChange={update('fullName')} onBlur={blur('fullName')}
            />
            {touched.fullName && !form.fullName && <FieldError msg="Ad Soyad gerekli" />}
          </Field>

          {/* Kullanıcı Adı */}
          <Field label="Kullanıcı Adı" id="reg-username" icon={<User size={15} />}>
            <input
              id="reg-username" type="text" className="form-input pl-10"
              placeholder="ahmet123"
              value={form.username} onChange={update('username')} onBlur={blur('username')}
            />
            {touched.username && !form.username && <FieldError msg="Kullanıcı adı gerekli" />}
          </Field>

          {/* E-posta */}
          <Field label="E-posta" id="reg-email" icon={<Mail size={15} />}>
            <input
              id="reg-email" type="email" className="form-input pl-10"
              placeholder="ahmet@okul.com"
              value={form.realEmail} onChange={update('realEmail')} onBlur={blur('realEmail')}
            />
            {touched.realEmail && !form.realEmail && <FieldError msg="E-posta gerekli" />}
          </Field>

          {/* Sınıf */}
          <Field label="Sınıf" id="reg-class" icon={<BookOpen size={15} />}>
            <input
              id="reg-class" type="text" className="form-input pl-10"
              placeholder="6-A"
              value={form.className} onChange={update('className')} onBlur={blur('className')}
            />
            {touched.className && !form.className && <FieldError msg="Sınıf gerekli" />}
          </Field>

          {/* Şifre */}
          <Field label="Şifre" id="reg-password" icon={<Lock size={15} />}>
            <input
              id="reg-password" type={showPassword ? 'text' : 'password'}
              className="form-input pl-10 pr-11" placeholder="En az 6 karakter"
              value={form.password} onChange={update('password')} onBlur={blur('password')}
            />
            <TogglePassword show={showPassword} onToggle={() => setShowPassword(v => !v)} />
            {touched.password && !passwordValid && <FieldError msg="Şifre en az 6 karakter olmalı" />}
          </Field>

          {/* Şifre Tekrar */}
          <Field label="Şifre Tekrar" id="reg-confirm" icon={<Lock size={15} />}>
            <input
              id="reg-confirm" type={showConfirmPassword ? 'text' : 'password'}
              className="form-input pl-10 pr-11" placeholder="Şifreyi tekrar gir"
              value={form.confirmPassword} onChange={update('confirmPassword')} onBlur={blur('confirmPassword')}
            />
            <TogglePassword show={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} />
            {touched.confirmPassword && form.confirmPassword && !passwordsMatch && (
              <FieldError msg="Şifreler eşleşmiyor" />
            )}
          </Field>

          {/* API Hatası */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 !mt-5">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Kayıt yapılıyor...
              </>
            ) : (
              <><UserPlus size={18} /> Kayıt Ol</>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

// ─── Yardımcı bileşenler ──────────────────────────────────────────────────────
function Field({ label, id, icon, children }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-600">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        {children}
      </div>
    </div>
  );
}
function FieldError({ msg }) {
  return <p className="text-xs text-rose-400 flex items-center gap-1 mt-1"><AlertCircle size={11} />{msg}</p>;
}
function TogglePassword({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}
