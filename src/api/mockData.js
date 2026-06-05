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

export const MOCK_CUENTAS = {
  'c1a2b3c4-0000-0000-0000-000000000001': [
    {
      id: 'acc-0000-0000-0000-000000000001',
      numeroCuenta: 'CTA-001-2026',
      clienteId: 'c1a2b3c4-0000-0000-0000-000000000001',
      tipoCuenta: 'AHORROS',
      saldo: 1500000,
      estado: 'ACTIVA',
      fechaApertura: '2026-01-15',
    },
    {
      id: 'acc-0000-0000-0000-000000000002',
      numeroCuenta: 'CTA-002-2026',
      clienteId: 'c1a2b3c4-0000-0000-0000-000000000001',
      tipoCuenta: 'CORRIENTE',
      saldo: 500000,
      estado: 'ACTIVA',
      fechaApertura: '2026-02-01',
    },
  ],
};

export const MOCK_HISTORIAL = [
  { fechaHora: '2026-05-01T09:00:00Z', tipo: 'DEPOSITO',      monto: 2000000 },
  { fechaHora: '2026-05-03T14:30:00Z', tipo: 'TRANSFERENCIA', monto: 300000  },
  { fechaHora: '2026-05-05T11:00:00Z', tipo: 'RETIRO',        monto: 200000  },
];

export const MOCK_REPORTE = {
  fechaInicio: '2026-04-01',
  fechaFin:    '2026-05-06',
  movimientos: MOCK_HISTORIAL,
  totales: {
    depositos:       2000000,
    retiros:          200000,
    transferencias:   300000,
    totalCreditos:   2000000,
    totalDebitos:     500000,
  },
  saldoFinal: 1500000,
  mensaje: 'Reporte generado en modo demo',
};

export const MOCK_MOVIMIENTOS = [
  { movimientoId: 'mov-001', cuentaId: 'acc-0000-0000-0000-000000000001', tipoMovimiento: 'CREDITO', monto: 2000000, descripcion: 'Depósito inicial',       fecha: '2026-05-01T09:00:00Z' },
  { movimientoId: 'mov-002', cuentaId: 'acc-0000-0000-0000-000000000001', tipoMovimiento: 'DEBITO',  monto: 300000,  descripcion: 'Transferencia enviada', fecha: '2026-05-03T14:30:00Z' },
  { movimientoId: 'mov-003', cuentaId: 'acc-0000-0000-0000-000000000001', tipoMovimiento: 'DEBITO',  monto: 200000,  descripcion: 'Retiro cajero',         fecha: '2026-05-05T11:00:00Z' },
];

export const MOCK_RESUMEN = {
  totalIngresos:        2000000,
  totalEgresos:          500000,
  cantidadMovimientos:        3,
};