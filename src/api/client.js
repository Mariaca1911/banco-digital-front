import {
  MOCK_USERS,
  MOCK_CLIENTES,
  MOCK_CUENTAS,
  MOCK_HISTORIAL,
  MOCK_REPORTE,
  MOCK_MOVIMIENTOS,
  MOCK_RESUMEN,
} from './mockData.js';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const BASE_URL  = import.meta.env.VITE_API_BASE_URL || '';

function makeToken(user) {
  const payload = {
    sub:       user.sub,
    roles:     user.roles,
    clienteId: user.clienteId,
    uid:       user.uid,
    exp:       Math.floor(Date.now() / 1000) + 3600,
  };
  const h = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = btoa(JSON.stringify(payload));
  return `${h}.${p}.demo`;
}

function mockRequest(path, options = {}) {
  const method = options.method || 'GET';
  const body   = options.body ? JSON.parse(options.body) : {};

  return new Promise((resolve, reject) => {
    setTimeout(() => {

      // ── AUTH ──────────────────────────────────────────────────
      if (path === '/api/v1/auth/login') {
        const user      = MOCK_USERS[body.correo];
        const validPass = body.clave === 'Admin123!' || body.clave === 'Temp1234!';
        if (user && validPass) {
          return resolve({ token: makeToken(user), refreshToken: 'mock-refresh' });
        }
        return reject(new Error('Credenciales inválidas. Usa Admin123! o Temp1234!'));
      }

      if (path === '/api/v1/auth/logout')          return resolve(null);
      if (path === '/api/v1/auth/me')              return resolve({ userId: 'mock', username: 'demo' });
      if (path === '/api/v1/auth/change-password') return resolve({ success: true, message: 'Contraseña actualizada (demo)' });

      // ── CLIENTES ──────────────────────────────────────────────
      if (path === '/api/v1/clientes' && method === 'POST') {
        const id = 'c1a2b3c4-' + Date.now();
        return resolve({ success: true, data: { id, ...body, activo: true, createdAt: new Date().toISOString() } });
      }

      const clienteMatch = path.match(/^\/api\/v1\/clientes\/([^/]+)$/);
      if (clienteMatch && method === 'GET') {
        const mock = MOCK_CLIENTES[clienteMatch[1]] || Object.values(MOCK_CLIENTES)[0];
        return resolve({ success: true, data: { ...mock, id: clienteMatch[1] } });
      }
      if (clienteMatch && method === 'PATCH') {
        const mock = MOCK_CLIENTES[clienteMatch[1]] || Object.values(MOCK_CLIENTES)[0];
        return resolve({ success: true, data: { ...mock, ...body, id: clienteMatch[1] } });
      }

      // ── CUENTAS POR CLIENTE ───────────────────────────────────
      const cuentasPorCliente = path.match(/^\/api\/v1\/clientes\/([^/]+)\/cuentas$/);
      if (cuentasPorCliente && method === 'GET') {
        const clienteId = cuentasPorCliente[1];
        const cuentas   = MOCK_CUENTAS[clienteId] || [];
        return resolve({ success: true, data: cuentas });
      }

      // ── CUENTAS ───────────────────────────────────────────────
      if (path === '/api/v1/cuentas' && method === 'POST') {
        const nueva = {
          id:            'acc-' + Date.now(),
          numeroCuenta:  'CTA-' + Date.now().toString().slice(-6),
          clienteId:     body.clienteId,
          tipoCuenta:    body.tipoCuenta,
          saldo:         0,
          estado:        'ACTIVA',
          fechaApertura: new Date().toISOString().split('T')[0],
        };
        return resolve({ success: true, data: nueva });
      }

      // ── SALDO (busca en MOCK_CUENTAS por ID) ──────────────────
      const saldoMatch = path.match(/^\/api\/v1\/cuentas\/([^/]+)\/saldo$/);
      if (saldoMatch) {
        const cuentaId = saldoMatch[1];
        let saldo = 0;
        for (const cuentas of Object.values(MOCK_CUENTAS)) {
          const cuenta = cuentas.find(c => c.id === cuentaId);
          if (cuenta) { saldo = cuenta.saldo; break; }
        }
        return resolve({ success: true, data: { saldo } });
      }

      // ── TRANSACCIONES ─────────────────────────────────────────
      if (path === '/api/v1/transacciones/retiro' && method === 'POST') {
        return resolve({ success: true, data: { id: 'tx-' + Date.now(), tipo: 'RETIRO', monto: body.monto } });
      }

      if (path.match(/^\/api\/v1\/transacciones\/historial\//)) {
        return resolve({ success: true, data: MOCK_HISTORIAL });
      }

      // ── TRANSFERENCIAS ────────────────────────────────────────
      if (path === '/api/v1/transferencias' && method === 'POST') {
        return resolve({ success: true, data: {
          transaccionId: 'tx-' + Date.now(),
          referencia:    'REF-' + Date.now(),
          estado:        'COMPLETADA',
          monto:         body.monto,
        }});
      }

      // ── REPORTES ──────────────────────────────────────────────
      if (path.startsWith('/api/v1/reportes/actividad')) {
        return resolve({ success: true, data: MOCK_REPORTE });
      }
      if (path === '/api/v1/reportes/saldo-total') {
        return resolve({ success: true, data: { clienteId: 'mock', saldoTotal: 2000000 } });
      }
      if (path.startsWith('/api/v1/reportes/movimientos')) {
        return resolve({ success: true, data: MOCK_MOVIMIENTOS });
      }
      if (path === '/api/v1/reportes/cuentas') {
        return resolve({ success: true, data: [
          { cuentaId: 'acc-001', numeroCuenta: 'CTA-001-2026', tipoCuenta: 'AHORROS',   estado: 'ACTIVA', saldoActual: 1500000 },
          { cuentaId: 'acc-002', numeroCuenta: 'CTA-002-2026', tipoCuenta: 'CORRIENTE', estado: 'ACTIVA', saldoActual: 500000  },
        ]});
      }
      if (path === '/api/v1/reportes/resumen-movimientos') {
        return resolve({ success: true, data: MOCK_RESUMEN });
      }

      // ── PROVISIÓN ─────────────────────────────────────────────
      if (path.includes('/provision-client-access')) {
        return resolve({ success: true, data: { mensaje: 'Acceso provisionado (demo)' } });
      }

      reject(new Error(`Sin mock para: ${method} ${path}`));
    }, 350);
  });
}

// ─── Real ─────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  if (DEMO_MODE) return mockRequest(path, options);

  const token   = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('No autorizado');
  }

  let data = null;
  if (res.status !== 204) {
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      if (res.status === 503 || res.status === 502) {
        throw new Error('El servidor no está disponible. Intenta de nuevo en unos segundos.');
      }
      throw new Error(`Error ${res.status}: respuesta inesperada del servidor.`);
    }
  }

  if (!res.ok) {
    throw new Error(
      data?.error?.message || data?.message || `Error ${res.status}`
    );
  }

  return data;
}

export const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
};