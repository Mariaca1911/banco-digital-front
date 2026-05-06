import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const claims = parseJwt(token);
      if (claims && claims.exp * 1000 > Date.now()) {
        setUser({
          token,
          roles: claims.roles || [],
          clienteId: claims.clienteId,
          uid: claims.uid,
          sub: claims.sub,
        });
      } else {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (correo, clave) => {
    const data = await authService.login(correo, clave);
    const { token, refreshToken } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    const claims = parseJwt(token);
    const userData = {
      token,
      roles: claims?.roles || [],
      clienteId: claims?.clienteId,
      uid: claims?.uid,
      sub: claims?.sub,
    };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) await authService.logout(token);
    } catch (_) {}
    localStorage.clear();
    setUser(null);
  };

  const isAdmin = () =>
    user?.roles?.some((r) => r === 'ADMIN' || r === 'ROLE_ADMIN');

  const isCajero = () =>
    user?.roles?.some((r) => r === 'CAJERO' || r === 'ROLE_CAJERO');

  const isCliente = () =>
    user?.roles?.some((r) => r === 'CLIENTE' || r === 'ROLE_CLIENTE');

  const canManageClients = () => isAdmin() || isCajero();

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAdmin, isCajero, isCliente, canManageClients }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
