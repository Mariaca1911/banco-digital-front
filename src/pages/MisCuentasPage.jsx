import { useState, useEffect } from 'react';
import { clienteService, cuentaService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function formatCOP(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function MisCuentasPage() {
  const { user } = useAuth();
  const clienteId = user?.clienteId;

  const [cuentas, setCuentas]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Saldo individual
  const [saldos, setSaldos]         = useState({});
  const [saldoLoading, setSaldoLoading] = useState({});

  useEffect(() => {
    if (clienteId) {
      cargarCuentas();
    } else {
      setError('No se encontró el ID de cliente en tu sesión.');
      setLoading(false);
    }
  }, [clienteId]);

  const cargarCuentas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clienteService.listarCuentas(clienteId);
      // ApiResponse: { success, data: [ CuentaResponseDto ] }
      setCuentas(res.data || res || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const consultarSaldo = async (cuentaId) => {
    setSaldoLoading((prev) => ({ ...prev, [cuentaId]: true }));
    try {
      const res = await cuentaService.consultarSaldo(cuentaId);
      // ApiResponse: { success, data: { saldo } }
      const saldo = res.data?.saldo ?? res.saldo;
      setSaldos((prev) => ({ ...prev, [cuentaId]: saldo }));
    } catch (err) {
      setSaldos((prev) => ({ ...prev, [cuentaId]: 'Error' }));
    } finally {
      setSaldoLoading((prev) => ({ ...prev, [cuentaId]: false }));
    }
  };

  const estadoTag = (estado) => {
    const map = {
      ACTIVA:   'tag-green',
      INACTIVA: 'tag-red',
      BLOQUEADA:'tag-red',
    };
    return map[estado] || 'tag-blue';
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-title-line">
          <h1>Mis Cuentas</h1>
          <span className="badge-role cliente">Cliente</span>
        </div>
        <p>Consulta el saldo y el detalle de tus cuentas</p>
      </div>

      {loading && (
        <div className="loading-center">
          <span className="spinner" /> Cargando cuentas...
        </div>
      )}

      {error && (
        <div className="alert alert-error">⚠ {error}</div>
      )}

      {!loading && !error && cuentas.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <h3>No tienes cuentas registradas</h3>
            <p>Comunícate con un asesor para abrir tu primera cuenta.</p>
          </div>
        </div>
      )}

      {!loading && cuentas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cuentas.map((cuenta) => (
            <div className="card" key={cuenta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>
                    {cuenta.numeroCuenta}
                  </span>
                  <span className={`tag ${estadoTag(cuenta.estado)}`}>{cuenta.estado}</span>
                  <span className="tag tag-blue">{cuenta.tipoCuenta}</span>
                </div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.82rem' }}>
                  Abierta: {cuenta.fechaApertura || '—'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {saldos[cuenta.id] !== undefined ? (
                  <div>
                    <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 4 }}>
                      Saldo disponible
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: saldos[cuenta.id] === 'Error' ? 'var(--red)' : 'var(--ink)' }}>
                      {saldos[cuenta.id] === 'Error' ? 'Error al consultar' : formatCOP(saldos[cuenta.id])}
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => consultarSaldo(cuenta.id)}
                    disabled={saldoLoading[cuenta.id]}
                  >
                    {saldoLoading[cuenta.id] ? <><span className="spinner" /> Consultando...</> : '↻ Ver saldo'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}