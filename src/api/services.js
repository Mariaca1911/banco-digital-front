import { api } from './client';

// ── AUTH ──────────────────────────────────────────────────────
// POST /api/v1/auth/login       → { token, refreshToken }
// GET  /api/v1/auth/me          → { ... }
// POST /api/v1/auth/logout      → 204
// POST /api/v1/auth/change-password
export const authService = {
  login: (correo, clave) =>
    api.post('/api/v1/auth/login', { correo, clave }),

  logout: (token) =>
    api.post('/api/v1/auth/logout', {}),

  me: () => api.get('/api/v1/auth/me'),

  changePassword: (passwordActual, passwordNueva, passwordConfirmacion) =>
    api.post('/api/v1/auth/change-password', {
      passwordActual,
      passwordNueva,
      passwordConfirmacion,
    }),
};

// ── CLIENTES ──────────────────────────────────────────────────
// Respuesta envuelta en ApiResponse: { success, data: { id, ... } }
// POST  /api/v1/clientes
// GET   /api/v1/clientes/{id}
// PATCH /api/v1/clientes/{id}
// GET   /api/v1/clientes/{id}/cuentas  → { success, data: [ CuentaResponseDto ] }
export const clienteService = {
  crear: (data) => api.post('/api/v1/clientes', data),

  obtener: (id) => api.get(`/api/v1/clientes/${id}`),

  actualizar: (id, data) => api.patch(`/api/v1/clientes/${id}`, data),

  listarCuentas: (clienteId) =>
    api.get(`/api/v1/clientes/${clienteId}/cuentas`),
};

// ── CUENTAS ───────────────────────────────────────────────────
// POST /api/v1/cuentas                  body: { clienteId, tipoCuenta }
// GET  /api/v1/cuentas/{id}/saldo       → { success, data: { saldo } }
export const cuentaService = {
  crear: (clienteId, tipoCuenta) =>
    api.post('/api/v1/cuentas', { clienteId, tipoCuenta }),

  consultarSaldo: (cuentaId) =>
    api.get(`/api/v1/cuentas/${cuentaId}/saldo`),
};

// ── TRANSACCIONES ─────────────────────────────────────────────
// POST /api/v1/transacciones/retiro
//   body: { cuentaId, monto, descripcion }
// GET  /api/v1/transacciones/historial/{cuentaId}
//   → { success, data: [ { fechaHora, tipo, monto } ] }
export const transaccionService = {
  retirar: (cuentaId, monto, descripcion) =>
    api.post('/api/v1/transacciones/retiro', { cuentaId, monto, descripcion }),

  historial: (cuentaId) =>
    api.get(`/api/v1/transacciones/historial/${cuentaId}`),
};

// ── TRANSFERENCIAS ────────────────────────────────────────────
// POST /api/v1/transferencias
//   body: { numeroCuentaOrigen, numeroCuentaDestino, monto }
//   → { success, data: { transaccionId, referencia, estado, monto } }
export const transferenciaService = {
  transferir: (numeroCuentaOrigen, numeroCuentaDestino, monto) =>
    api.post('/api/v1/transferencias', {
      numeroCuentaOrigen,
      numeroCuentaDestino,
      monto,
    }),
};

// ── REPORTES ──────────────────────────────────────────────────
// GET /api/v1/reportes/saldo-total
//   → { success, data: { clienteId, saldoTotal } }
// GET /api/v1/reportes/actividad?fechaInicio=&fechaFin=
//   → { success, data: ReporteActividad }
// GET /api/v1/reportes/movimientos?cuentaId=&fechaDesde=&fechaHasta=&tipo=
//   → { success, data: [ MovimientoReporteResponseDto ] }
// GET /api/v1/reportes/cuentas
//   → { success, data: [ CuentaReporteResponseDto ] }
// GET /api/v1/reportes/resumen-movimientos
//   → { success, data: { totalIngresos, totalEgresos, cantidadMovimientos } }
export const reporteService = {
  saldoTotal: () =>
    api.get('/api/v1/reportes/saldo-total'),

  actividad: (fechaInicio, fechaFin) =>
    api.get(`/api/v1/reportes/actividad?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),

  movimientos: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.cuentaId)   qs.append('cuentaId',   params.cuentaId);
    if (params.fechaDesde) qs.append('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) qs.append('fechaHasta', params.fechaHasta);
    if (params.tipo)       qs.append('tipo',        params.tipo);
    return api.get(`/api/v1/reportes/movimientos?${qs.toString()}`);
  },

  cuentas: () =>
    api.get('/api/v1/reportes/cuentas'),

  resumenMovimientos: () =>
    api.get('/api/v1/reportes/resumen-movimientos'),
};

// ── PROVISIÓN DE ACCESO (admin / cajero) ──────────────────────
// POST /api/v1/internal/users/provision-client-access
//   body: { clienteId, email }
export const adminService = {
  provisionarAcceso: (clienteId, email) =>
    api.post('/api/v1/internal/users/provision-client-access', { clienteId, email }),
};