import { MOCK_USERS, MOCK_CLIENTES, MOCK_HISTORIAL, MOCK_REPORTE } from './mockData.js';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ─── JWT falso ────────────────────────────────────────────────
function makeToken(user) {
  const payload = {
    sub: user.sub,
    roles: user.roles,
    clienteId: user.clienteId,
    uid: user.uid,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const h = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = btoa(JSON.stringify(payload));
  return `${h}.${p}.demo`;
}

// ─── Mock ─────────────────────────────────────────────────────
function mockRequest(path, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  return new Promise((resolve, reject) => {
    setTimeout(() => {

      // LOGIN
      if (path === '/api/v1/auth/login') {
        const user = MOCK_USERS[body.correo];
        const validPass = body.clave === 'Admin123!' || body.clave === 'Temp1234!';
        if (user && validPass) {
          return resolve({ token: makeToken(user), refreshToken: 'mock-refresh' });
        }
        return reject(new Error('Credenciales inválidas. Usa Admin123! o Temp1234!'));
      }

      // LOGOUT
      if (path === '/api/v1/auth/logout') return resolve(null);

      // ME
      if (path === '/api/v1/auth/me') return resolve({ userId: 'mock', username: 'demo' });

      // CLIENTES - Crear
      if (path === '/api/v1/clientes' && method === 'POST') {
        const id = 'c1a2b3c4-' + Date.now();
        return resolve({ data: { id, ...body, activo: true, createdAt: new Date().toISOString() } });
      }

      // CLIENTES - Obtener
      const clienteGet = path.match(/^\/api\/v1\/clientes\/([^/]+)$/);
      if (clienteGet && method === 'GET') {
        const mock = Object.values(MOCK_CLIENTES)[0];
        return resolve({ data: { ...mock, id: clienteGet[1] } });
      }

      // CLIENTES - Actualizar
      if (clienteGet && method === 'PATCH') {
        const mock = Object.values(MOCK_CLIENTES)[0];
        return resolve({ data: { ...mock, ...body, id: clienteGet[1] } });
      }

      // CUENTAS - Crear
      if (path === '/api/v1/cuentas' && method === 'POST') {
        return resolve({ data: {
          id: 'acc-' + Date.now(),
          numeroCuenta: '001-00' + Date.now().toString().slice(-6),
          ...body, saldo: 0, estado: 'ACTIVA',
          fechaApertura: new Date().toISOString().split('T')[0],
        }});
      }

      // CUENTAS - Saldo
      if (path.match(/\/api\/v1\/cuentas\/[^/]+\/saldo/)) {
        return resolve({ data: { saldo: 1500000 } });
      }

      // TRANSACCIONES - Retiro
      if (path === '/api/v1/transacciones/retiro' && method === 'POST') {
        return resolve({ data: { id: 'tx-' + Date.now(), tipo: 'RETIRO', monto: body.monto } });
      }

      // TRANSACCIONES - Historial
      if (path.match(/\/api\/v1\/transacciones\/historial\//)) {
        return resolve({ data: MOCK_HISTORIAL });
      }

      // TRANSFERENCIAS
      if (path === '/api/v1/transferencias' && method === 'POST') {
        return resolve({ data: {
          transaccionId: 'tx-' + Date.now(),
          referencia: 'REF-' + Date.now(),
          estado: 'COMPLETADA',
          monto: body.monto,
        }});
      }

      // REPORTES - Actividad
      if (path.startsWith('/api/v1/reportes/actividad')) {
        return resolve({ data: MOCK_REPORTE });
      }

      // REPORTES - Saldo total
      if (path === '/api/v1/reportes/saldo-total') {
        return resolve({ data: { saldoTotal: 1500000 } });
      }

      // Provision
      if (path.includes('/provision-client-access')) {
        return resolve({ data: { mensaje: 'Acceso provisionado (demo)' } });
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

  const token = getToken();
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
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};