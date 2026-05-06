import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="loading-center">
      <span className="spinner" />
      Cargando...
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    const userRoles = user.roles.map(r => r.replace('ROLE_', ''));
    const hasRole = roles.some(r => userRoles.includes(r));
    if (!hasRole) return <Navigate to="/" replace />;
  }

  return children;
}
