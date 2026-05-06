import { api } from './client';

// ── AUTH ──────────────────────────────────────────────────────
export const authService = {
  login: (correo, clave) =>
    api.post('/api/v1/auth/login', { correo, clave }),

  logout: (token) =>
    api.post('/api/v1/auth/logout', null, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  me: () => api.get('/api/v1/auth/me'),
};

// ── CLIENTES ──────────────────────────────────────────────────
export const clienteService = {
  crear: (data) => api.post('/api/v1/clientes', data),

  obtener: (id) => api.get(`/api/v1/clientes/${id}`),

  actualizar: (id, data) => api.patch(`/api/v1/clientes/${id}`, data),
};

// ── CUENTAS ───────────────────────────────────────────────────
export const cuentaService = {
  crear: (clienteId, tipoCuenta) =>
    api.post('/api/v1/cuentas', { clienteId, tipoCuenta }),

  consultarSaldo: (cuentaId) =>
    api.get(`/api/v1/cuentas/${cuentaId}/saldo`),
};

// ── TRANSACCIONES ─────────────────────────────────────────────
export const transaccionService = {
  retirar: (cuentaId, monto, descripcion) =>
    api.post('/api/v1/transacciones/retiro', { cuentaId, monto, descripcion }),

  historial: (cuentaId) =>
    api.get(`/api/v1/transacciones/historial/${cuentaId}`),
};

// ── TRANSFERENCIAS ────────────────────────────────────────────
export const transferenciaService = {
  transferir: (numeroCuentaOrigen, numeroCuentaDestino, monto) =>
    api.post('/api/v1/transferencias', {
      numeroCuentaOrigen,
      numeroCuentaDestino,
      monto,
    }),
};

// ── REPORTES ──────────────────────────────────────────────────
export const reporteService = {
  actividad: (fechaInicio, fechaFin) =>
    api.get(`/api/v1/reportes/actividad?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),

  saldoTotal: () => api.get('/api/v1/reportes/saldo-total'),
};
