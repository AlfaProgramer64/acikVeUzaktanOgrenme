import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ─── Pages ────────────────────────────────────────────────────────────────────
import LoginPage        from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentStore     from './pages/StudentStore';
import StudentInventory from './pages/StudentInventory';
import Leaderboard      from './pages/Leaderboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard   from './pages/AdminDashboard';

// ─── Placeholder pages (ilerleyen sprint'lerde geliştirilecek) ────────────────
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <div className="text-6xl animate-float">🚧</div>
      <h2 className="font-display font-black text-2xl text-slate-900">{title}</h2>
      <p className="text-slate-500 text-sm">Bu sayfa yakında gelecek!</p>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/roadmap"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ComingSoon title="Yol Haritası" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/achievements"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ComingSoon title="Başarılar" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/ai-assistant"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ComingSoon title="AI Asistan" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/store"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentStore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/inventory"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentInventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/lessons"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ComingSoon title="Dersler" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/stats"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ComingSoon title="İstatistikler" />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ComingSoon title="Kullanıcı Yönetimi" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ComingSoon title="Ayarlar" />
              </ProtectedRoute>
            }
          />

          {/* Catch-all → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
