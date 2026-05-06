import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, canManageClients, isCliente } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        ◆ Banco<span>Digital</span>
      </NavLink>

      <ul className="navbar-nav">
        {canManageClients() && (
          <>
            <li><NavLink to="/clientes">Clientes</NavLink></li>
            <li><NavLink to="/clientes/nuevo">Registrar</NavLink></li>
            <li><NavLink to="/cuentas/nueva">Nueva Cuenta</NavLink></li>
          </>
        )}
        {isCliente() && (
          <>
            <li><NavLink to="/mi-perfil">Mi Perfil</NavLink></li>
            <li><NavLink to="/mis-cuentas">Mis Cuentas</NavLink></li>
            <li><NavLink to="/operaciones">Operaciones</NavLink></li>
            <li><NavLink to="/reportes">Reportes</NavLink></li>
          </>
        )}
      </ul>

      <div className="navbar-right">
        <span className="navbar-user">{user?.sub}</span>
        <button className="btn btn-outline btn-sm" style={{ color: 'var(--ink-faint)', borderColor: 'rgba(255,255,255,0.15)' }} onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}
