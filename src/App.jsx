import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RegistroClientePage from './pages/RegistroClientePage';
import ClientesListPage from './pages/ClientesListPage';
import ClienteDetallePage from './pages/ClienteDetallePage';
import CrearCuentaPage from './pages/CrearCuentaPage';
import MisCuentasPage from './pages/MisCuentasPage';
import MiPerfilPage from './pages/MiPerfilPage';
import OperacionesPage from './pages/OperacionesPage';
import ReportesPage from './pages/ReportesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Redirige por rol */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

          {/* Admin / Cajero */}
          <Route path="/clientes" element={
            <ProtectedRoute roles={['ADMIN', 'CAJERO']}>
              <ClientesListPage />
            </ProtectedRoute>
          } />
          <Route path="/clientes/nuevo" element={
            <ProtectedRoute roles={['ADMIN', 'CAJERO']}>
              <RegistroClientePage />
            </ProtectedRoute>
          } />
          <Route path="/clientes/:id" element={
            <ProtectedRoute roles={['ADMIN', 'CAJERO']}>
              <ClienteDetallePage />
            </ProtectedRoute>
          } />
          <Route path="/cuentas/nueva" element={
            <ProtectedRoute roles={['ADMIN', 'CAJERO']}>
              <CrearCuentaPage />
            </ProtectedRoute>
          } />

          {/* Cliente */}
          <Route path="/mi-perfil" element={
            <ProtectedRoute roles={['CLIENTE']}>
              <MiPerfilPage />
            </ProtectedRoute>
          } />
          <Route path="/mis-cuentas" element={
            <ProtectedRoute roles={['CLIENTE']}>
              <MisCuentasPage />
            </ProtectedRoute>
          } />
          <Route path="/operaciones" element={
            <ProtectedRoute roles={['CLIENTE']}>
              <OperacionesPage />
            </ProtectedRoute>
          } />
          <Route path="/reportes" element={
            <ProtectedRoute roles={['CLIENTE']}>
              <ReportesPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
