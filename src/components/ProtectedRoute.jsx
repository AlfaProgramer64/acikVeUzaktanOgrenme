import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Supabase oturumu kontrol edilirken bekle
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Giriş yapılmamışsa → login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rol kısıtlaması varsa kontrol et
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect =
      user.role === 'admin'   ? '/admin'   :
      user.role === 'teacher' ? '/teacher' : '/student';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
