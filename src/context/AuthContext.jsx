import { createContext, useContext, useState, useCallback } from 'react';

// ─── Mock User Database ────────────────────────────────────────────────────────
// Backend olmadığı için sahte kullanıcılar burada tanımlıdır.
// E-posta'ya göre rol belirlenir: admin@ → admin, ogretmen@ → teacher, geri kalan → student
const MOCK_USERS = {
  'ogrenci@demo.com': {
    id: 'u001',
    name: 'Ahmet Yılmaz',
    email: 'ogrenci@demo.com',
    role: 'student',
    level: 3,
    xp: 1250,
    avatar: '🎒',
    badges: ['first_login', 'quiz_master'],
    inventory: [],
    activeBadge: null,
    activeBadgeName: null,
  },
  'ogretmen@demo.com': {
    id: 'u002',
    name: 'Ayşe Kaya',
    email: 'ogretmen@demo.com',
    role: 'teacher',
    level: 10,
    xp: 9800,
    avatar: '🎓',
    badges: [],
    inventory: [],
    activeBadge: null,
    activeBadgeName: null,
  },
  'admin@demo.com': {
    id: 'u003',
    name: 'Sistem Yöneticisi',
    email: 'admin@demo.com',
    role: 'admin',
    level: 99,
    xp: 99999,
    avatar: '⚙️',
    badges: [],
    inventory: [],
    activeBadge: null,
    activeBadgeName: null,
  },
};

// ─── Helper: E-postaya göre rol çıkar ─────────────────────────────────────────
function inferRoleFromEmail(email) {
  const prefix = email.split('@')[0].toLowerCase();
  if (prefix === 'admin')     return 'admin';
  if (prefix === 'ogretmen')  return 'teacher';
  return 'student';
}

// ─── LocalStorage Persistence Helpers ──────────────────────────────────────────
const STORAGE_KEY = 'lms_users_db';

function getUsersDB() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      // MOCK_USERS'ı temel alıp, üzerine localStorage'daki güncel/yeni verileri yazıyoruz
      const parsedData = { ...MOCK_USERS, ...JSON.parse(data) };
      
      // Eski kayıtlarda kalan roket ikonunu sırt çantası ile değiştirme (migration)
      let needsUpdate = false;
      Object.values(parsedData).forEach(u => {
        if (u.role === 'student' && u.avatar === '🚀' && !u.inventory?.includes('car_rocket')) {
          u.avatar = '🎒';
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
      }
      
      return parsedData;
    }
  } catch (e) {
    console.error('Local storage okuma hatası', e);
  }
  return MOCK_USERS;
}

function saveUserToDB(userObj) {
  try {
    const db = getUsersDB();
    db[userObj.email.toLowerCase()] = userObj;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Local storage yazma hatası', e);
  }
}

// ─── Context Definition ────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── AuthProvider Component ────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedEmail = localStorage.getItem('lms_active_user');
      if (savedEmail) {
        const db = getUsersDB();
        return db[savedEmail.toLowerCase()] || null;
      }
    } catch (e) {
      console.error('Session geri yükleme hatası', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  /**
   * Mock login: e-posta + şifre alır, MOCK_USERS'dan kullanıcıyı bulur.
   * Bilinmeyen e-posta için rol tahmini yapıp genel bir kullanıcı oluşturur.
   * Şifre kontrolü: şimdilik her şifre kabul edilir (minimum 6 karakter).
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');

    // Simüle edilmiş ağ gecikmesi (500ms)
    await new Promise((r) => setTimeout(r, 500));

    // Basit validasyon
    if (!email || !password) {
      setError('E-posta ve şifre alanları boş bırakılamaz.');
      setLoading(false);
      return { success: false };
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      setLoading(false);
      return { success: false };
    }

    // Kullanıcıyı bul ya da dinamik olarak oluştur
    const db = getUsersDB();
    let foundUser = db[email.toLowerCase()];
    
    if (!foundUser) {
      // Bilinmeyen kullanıcı → rolü e-postadan çıkar
      const role = inferRoleFromEmail(email);
      foundUser = {
        id: `u_${Date.now()}`,
        name: email.split('@')[0],
        email: email.toLowerCase(),
        role,
        level: 1,
        xp: 0,
        avatar: role === 'teacher' ? '🎓' : role === 'admin' ? '⚙️' : '🎒',
        badges: [],
        inventory: [],
        activeBadge: null,
        activeBadgeName: null,
      };
      saveUserToDB(foundUser);
    }
    
    // Aktif kullanıcıyı localStorage'a kaydet ki sayfa yenilendiğinde gitmesin
    localStorage.setItem('lms_active_user', foundUser.email.toLowerCase());
    setUser(foundUser);

    setLoading(false);
    return { success: true };
  }, []);

  /** Oturumu kapat */
  const logout = useCallback(() => {
    localStorage.removeItem('lms_active_user');
    setUser(null);
    setError('');
  }, []);

  /** XP güncelleme yardımcısı (ilerleyen aşamalarda kullanılacak) */
  const addXP = useCallback((amount) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newXP    = prev.xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      const updatedUser = { ...prev, xp: newXP, level: newLevel };
      
      saveUserToDB(updatedUser);
      return updatedUser;
    });
  }, []);

  /** Mağaza işlemleri */
  const buyItem = useCallback((item) => {
    setUser((prev) => {
      if (!prev) return prev;
      if (prev.xp < item.cost) return prev;
      if (prev.inventory?.includes(item.id)) return prev;

      const newXP = prev.xp - item.cost;
      const updatedUser = { 
        ...prev, 
        xp: newXP, 
        inventory: [...(prev.inventory || []), item.id]
      };
      
      saveUserToDB(updatedUser);
      return updatedUser;
    });
  }, []);

  const equipItem = useCallback((item) => {
    setUser((prev) => {
      if (!prev) return prev;
      if (!prev.inventory?.includes(item.id)) return prev;

      const updatedUser = { ...prev };
      if (item.type === 'avatar') {
        updatedUser.avatar = item.icon;
      } else if (item.type === 'badge') {
        updatedUser.activeBadge = item.id;
        updatedUser.activeBadgeName = item.name;
      }
      
      saveUserToDB(updatedUser);
      return updatedUser;
    });
  }, []);

  const unequipItem = useCallback((type) => {
    setUser((prev) => {
      if (!prev) return prev;
      
      const updatedUser = { ...prev };
      if (type === 'avatar') {
        // Varsayılan avatara dön
        updatedUser.avatar = prev.role === 'teacher' ? '🎓' : prev.role === 'admin' ? '⚙️' : '🎒';
      } else if (type === 'badge') {
        updatedUser.activeBadge = null;
        updatedUser.activeBadgeName = null;
      }
      
      saveUserToDB(updatedUser);
      return updatedUser;
    });
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    addXP,
    buyItem,
    equipItem,
    unequipItem,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Custom Hook ───────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}

export { getUsersDB };
export default AuthContext;
