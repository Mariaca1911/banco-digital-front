import { useState } from 'react';
import { cuentaService } from '../api/services';
import Layout from '../components/Layout';

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

export default function MisCuentasPage() {
  const [cuentaId, setCuentaId] = useState('');
  const [saldo, setSaldo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConsultar = async (e) => {
    e.preventDefault();
    if (!cuentaId.trim()) return;
    setLoading(true);
    setError('');
    setSaldo(null);
    try {
      const res = await cuentaService.consultarSaldo(cuentaId.trim());
      setSaldo(res.data?.saldo ?? res.saldo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-title-line">
          <h1>Mis Cuentas</h1>
          <span className="badge-role cliente">Cliente</span>
        </div>
        <p>Consulta el saldo de tus cuentas</p>
      </div>

      <div className="card" style={{ maxWidth: 540, marginBottom: 24 }}>
        <h2 className="section-title">Consultar Saldo</h2>
        <form onSubmit={handleConsultar} style={{ display: 'flex', gap: 12 }}>
          <input
            className="form-input"
            placeholder="ID de la cuenta (UUID)..."
            value={cuentaId}
            onChange={e => { setCuentaId(e.target.value); setError(''); setSaldo(null); }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Consultar'}
          </button>
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>⚠ {error}</div>}

        {saldo !== null && (
          <div style={{
            marginTop: 24,
            padding: '24px',
            background: 'var(--ink)',
            borderRadius: 'var(--radius)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
              Saldo disponible
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--gold-light)' }}>
              {formatCOP(saldo)}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <h3>Consulta el saldo de tu cuenta</h3>
          <p>Ingresa el ID de tu cuenta para ver el saldo disponible en tiempo real.</p>
        </div>
      </div>
    </Layout>
  );
}
