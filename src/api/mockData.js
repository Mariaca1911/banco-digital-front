export const MOCK_USERS = {
  'admin@bancodigital.com': {
    sub: 'admin@bancodigital.com',
    roles: ['ADMIN'],
    clienteId: null,
    uid: 'admin-001',
  },
  'alice@test.com': {
    sub: 'alice@test.com',
    roles: ['CLIENTE'],
    clienteId: 'c1a2b3c4-0000-0000-0000-000000000001',
    uid: 'user-001',
  },
};

export const MOCK_CLIENTES = {
  'c1a2b3c4-0000-0000-0000-000000000001': {
    id: 'c1a2b3c4-0000-0000-0000-000000000001',
    numeroCedula: '1234567890',
    primerNombre: 'Alice',
    segundoNombre: 'María',
    primerApellido: 'García',
    segundoApellido: 'López',
    email: 'alice@test.com',
    telefono: '3001111111',
    fechaNacimiento: '1990-01-01',
    activo: true,
    createdAt: '2026-01-15T10:00:00Z',
  },
};

export const MOCK_HISTORIAL = [
  { fechaHora: '2026-05-01T09:00:00Z', tipo: 'DEPOSITO', monto: 2000000 },
  { fechaHora: '2026-05-03T14:30:00Z', tipo: 'TRANSFERENCIA', monto: 300000 },
  { fechaHora: '2026-05-05T11:00:00Z', tipo: 'RETIRO', monto: 200000 },
];

export const MOCK_REPORTE = {
  fechaInicio: '2026-04-01',
  fechaFin: '2026-05-06',
  movimientos: MOCK_HISTORIAL,
  totales: { totalCreditos: 2000000, totalDebitos: 500000 },
  saldoFinal: 1500000,
  mensaje: 'Reporte generado en modo demo',
};