import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, isCliente, canManageClients } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (isCliente()) return <Navigate to="/mis-cuentas" replace />;
  if (canManageClients()) return <Navigate to="/clientes" replace />;

  return <Navigate to="/login" replace />;
}
