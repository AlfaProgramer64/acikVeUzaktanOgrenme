import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// ─── AuthProvider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Profili Supabase'den çek
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Profil yükleme hatası:', error);
    }
    if (!data) {
      console.warn('Bu kullanıcı için profiles tablosunda kayıt bulunamadı:', userId);
    }
      
    if (data) setUser(data);
    setLoading(false);
    return data;
  }, []);

  // Oturum dinle
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession === 'true') {
      setUser({ id: 'admin-id', role: 'admin', full_name: 'Sistem Yöneticisi', email: 'admin@local' });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (localStorage.getItem('adminSession') === 'true') return;
      if (session) await fetchProfile(session.user.id);
      else { setUser(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ─── Giriş (kullanıcı adı + şifre) ────────────────────────────────────────
  const login = useCallback(async (username, password, isAdminLogin = false) => {
    setLoading(true);
    setError('');

    if (isAdminLogin) {
      if (username === import.meta.env.VITE_ADMIN_USERNAME && password === import.meta.env.VITE_ADMIN_PASSWORD) {
        localStorage.setItem('adminSession', 'true');
        setUser({ id: 'admin-id', role: 'admin', full_name: 'Sistem Yöneticisi', email: 'admin@local' });
        setLoading(false);
        return { success: true };
      } else {
        setError('Kullanıcı adı veya şifre hatalı.');
        setLoading(false);
        return { success: false };
      }
    }

    const email = `${username.trim().toLowerCase()}@lms.local`;
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) {
      setError('Kullanıcı adı veya şifre hatalı.');
      setLoading(false);
      return { success: false };
    }

    // Rol kontrolü
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
    if (profile) {
      if (profile.role === 'admin') {
        // Normal girişten admin hesabı varsa güvenlik amaçlı çıkar
        await supabase.auth.signOut();
        setError('Kullanıcı adı veya şifre hatalı.');
        setLoading(false);
        return { success: false };
      }
    }

    return { success: true };
  }, []);

  // ─── Kayıt (sadece öğrenci) ────────────────────────────────────────────────
  const register = useCallback(async ({ username, fullName, realEmail, className, password }) => {
    setLoading(true);
    setError('');

    const fakeEmail = `${username.trim().toLowerCase()}@lms.local`;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: {
        data: {
          username: username.trim().toLowerCase(),
          full_name: fullName,
          real_email: realEmail,
          class_name: className,
          role: 'student',
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Bu kullanıcı adı zaten alınmış.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return { success: false };
    }

    setLoading(false);
    return { success: true, data };
  }, []);

  // ─── Çıkış ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (localStorage.getItem('adminSession') === 'true') {
      localStorage.removeItem('adminSession');
      setUser(null);
      setError('');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setError('');
  }, []);

  // ─── Profil güncelleme yardımcıları ───────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (data) setUser(data);
  }, [user]);

  const addXP = useCallback(async (amount) => {
    if (!user) return;
    const newXP    = (user.xp || 0) + amount;
    const newCoins = (user.coins || 0) + amount;
    const newLevel = Math.floor(newXP / 500) + 1;
    await updateProfile({ xp: newXP, coins: newCoins, level: Math.max(user.level || 1, newLevel) });
  }, [user, updateProfile]);

  const addCoins = useCallback(async (amount) => {
    if (!user) return;
    await updateProfile({ coins: (user.coins || 0) + amount });
  }, [user, updateProfile]);

  // ─── Mağaza işlemleri ─────────────────────────────────────────────────────
  const buyItem = useCallback(async (item) => {
    if (!user) return false;
    const currentCoins = user.coins || 0;
    if (currentCoins < item.cost) return false;
    const currentInventory = user.inventory || [];
    if (currentInventory.includes(item.id)) return false;

    const newInventory = [...currentInventory, item.id];
    const newCoins     = currentCoins - item.cost;

    // DB'ye yaz
    await supabase.from('user_inventory').insert({ user_id: user.id, item_id: item.id });
    await updateProfile({ coins: newCoins, inventory: newInventory });
    return true;
  }, [user, updateProfile]);

  const equipItem = useCallback(async (item) => {
    if (!user || !user.inventory?.includes(item.id)) return;
    if (item.type === 'avatar') {
      await updateProfile({ avatar: item.icon });
    } else if (item.type === 'badge') {
      await updateProfile({ active_badge: item.id, active_badge_name: item.name });
    }
  }, [user, updateProfile]);

  const unequipItem = useCallback(async (type) => {
    if (!user) return;
    if (type === 'avatar') {
      const defaultAvatar = user.role === 'teacher' ? '🎓' : user.role === 'admin' ? '⚙️' : '🚗';
      await updateProfile({ avatar: defaultAvatar });
    } else if (type === 'badge') {
      await updateProfile({ active_badge: null, active_badge_name: null });
    }
  }, [user, updateProfile]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    addXP,
    addCoins,
    buyItem,
    equipItem,
    unequipItem,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}

export default AuthContext;
