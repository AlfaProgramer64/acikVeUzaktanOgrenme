import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Map, Trophy, Bot, LayoutDashboard, LogOut,
  ChevronLeft, ChevronRight, Star, Zap, Bell, User,
  BookOpen, BarChart3, Settings, Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Sidebar menü konfigürasyonu (role göre filtrelenir) ──────────────────────
const NAV_ITEMS = [
  {
    label: 'Kontrol Paneli',
    icon: LayoutDashboard,
    href: null,          // rol bazlı href App.jsx'ten gelir
    roles: ['student', 'teacher', 'admin'],
    hrefMap: { student: '/student', teacher: '/teacher', admin: '/admin' },
  },
  {
    label: 'Yol Haritası',
    icon: Map,
    href: '/student/roadmap',
    roles: ['student'],
  },
  {
    label: 'Başarılar',
    icon: Trophy,
    href: '/student/achievements',
    roles: ['student'],
  },
  {
    label: 'AI Asistan',
    icon: Bot,
    href: '/student/ai-assistant',
    roles: ['student'],
  },
  {
    label: 'Dersler',
    icon: BookOpen,
    href: '/teacher/lessons',
    roles: ['teacher'],
  },
  {
    label: 'İstatistikler',
    icon: BarChart3,
    href: '/teacher/stats',
    roles: ['teacher'],
  },
  {
    label: 'Kullanıcılar',
    icon: Users,
    href: '/admin/users',
    roles: ['admin'],
  },
  {
    label: 'Ayarlar',
    icon: Settings,
    href: '/admin/settings',
    roles: ['admin'],
  },
];

// ─── XP seviyesi için renk gradyanı ──────────────────────────────────────────
const LEVEL_COLORS = {
  student: 'from-blue-500 to-cyan-500',
  teacher: 'from-sky-500 to-blue-500',
  admin:   'from-amber-500 to-orange-500',
};

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
function SidebarItem({ item, collapsed, userRole }) {
  const href = item.hrefMap ? item.hrefMap[userRole] : item.href;
  if (!href) return null;

  return (
    <NavLink
      to={href}
      end
      className={({ isActive }) =>
        `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`
      }
    >
      <item.icon size={20} className="shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

// ─── DashboardLayout ──────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));
  const levelColor  = LEVEL_COLORS[user?.role] || LEVEL_COLORS.student;

  // XP progress (her 500 XP bir seviye)
  const xpInLevel    = (user?.xp || 0) % 500;
  const xpPercent    = Math.round((xpInLevel / 500) * 100);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen animated-bg overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={[
          'flex flex-col h-full glass border-r border-slate-200 transition-all duration-300 z-20 shrink-0',
          collapsed ? 'w-[72px]' : 'w-64',
        ].join(' ')}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-200 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-lg shrink-0 shadow-lg shadow-blue-500/30">
            ⚡
          </div>
          {!collapsed && (
            <div>
              <p className="font-display font-black text-sm leading-tight text-gradient">
                Kuvvet &amp; Hareket
              </p>
              <p className="text-xs text-slate-500">LMS Platformu</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              userRole={user?.role}
            />
          ))}
        </nav>

        {/* User Mini Card */}
        <div className={`px-3 py-4 border-t border-slate-200 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed ? (
            <div className="glass-light rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{user?.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{
                    user?.role === 'student' ? 'Öğrenci' :
                    user?.role === 'teacher' ? 'Öğretmen' : 'Admin'
                  }</p>
                </div>
              </div>
              {/* XP Progress */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Seviye {user?.level}</span>
                  <span>{xpInLevel}/500 XP</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${levelColor} progress-bar`}
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-rose-400 transition-colors w-full mt-1"
              >
                <LogOut size={13} />
                Çıkış Yap
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="p-2 hover:text-rose-400 text-slate-500 transition-colors">
              <LogOut size={20} />
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass border border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors z-30 shadow-lg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="glass border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          {/* Left: Greeting */}
          <div>
            <h1 className="font-display font-black text-xl text-slate-900">
              Merhaba, <span className="text-gradient">{user?.name?.split(' ')[0]} {user?.avatar}</span>
            </h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Right: Stats + Notif + Profile */}
          <div className="flex items-center gap-3">
            {/* Level + XP badge */}
            <div className="hidden sm:flex items-center gap-2 glass-light rounded-xl px-4 py-2 border border-slate-200">
              <Star size={15} className="text-amber-400" />
              <span className="text-sm font-bold text-slate-900">Seviye {user?.level}</span>
              <span className="w-px h-4 bg-slate-300" />
              <Zap size={15} className="text-blue-500" />
              <span className="text-sm font-bold text-blue-600">
                {(user?.xp || 0).toLocaleString('tr-TR')} Puan
              </span>
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((n) => !n)}
                className="w-10 h-10 glass-light rounded-xl flex items-center justify-center border border-slate-200 hover:border-blue-500/50 transition-colors relative"
              >
                <Bell size={18} className="text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-72 glass-light border border-slate-200 rounded-2xl p-4 z-50 shadow-2xl">
                  <p className="font-bold text-sm text-slate-900 mb-3">Bildirimler</p>
                  <div className="space-y-2">
                    {[
                      { icon: '🏆', text: 'Yeni rozet kazandın: "Quiz Ustası"', time: '5 dk önce' },
                      { icon: '📚', text: 'Yeni ders eklendi: Sürtünme Kuvveti', time: '1 saat önce' },
                    ].map((n) => (
                      <div key={n.text} className="flex gap-3 p-2 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
                        <span className="text-lg">{n.icon}</span>
                        <div>
                          <p className="text-xs text-slate-900">{n.text}</p>
                          <p className="text-xs text-slate-500">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 glass-light rounded-xl flex items-center justify-center border border-slate-200 text-xl">
              {user?.avatar}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
