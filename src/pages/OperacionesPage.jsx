import { useState } from 'react';
import { transaccionService, transferenciaService } from '../api/services';
import Layout from '../components/Layout';

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

function formatDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OperacionesPage() {
  const [tab, setTab] = useState('transferir');

  return (
    <Layout>
      <div className="page-header">
        <h1>Operaciones</h1>
        <p>Realiza transferencias, retiros y consulta tu historial</p>
      </div>

      <div className="tabs">
        {[
          { key: 'transferir', label: '↔ Transferir' },
          { key: 'retirar', label: '↑ Retirar' },
          { key: 'historial', label: '☰ Historial' },
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'transferir' && <TransferirTab />}
      {tab === 'retirar' && <RetirarTab />}
      {tab === 'historial' && <HistorialTab />}
    </Layout>
  );
}

/* ── Transferir ─────────────────────────────────────────────── */
function TransferirTab() {
  const [form, setForm] = useState({ numeroCuentaOrigen: '', numeroCuentaDestino: '', monto: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await transferenciaService.transferir(
        form.numeroCuentaOrigen,
        form.numeroCuentaDestino,
        parseFloat(form.monto)
      );
      setResult(res.data || res);
      setForm({ numeroCuentaOrigen: '', numeroCuentaDestino: '', monto: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h2 className="section-title">Transferir Dinero</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠ {error}</div>}
        {result && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            ✓ Transferencia exitosa · Referencia: <strong>{result.referencia || result.transaccionId}</strong>
          </div>
        )}
        <div className="form-stack">
          <div className="form-group">
            <label className="form-label">Número de cuenta origen *</label>
            <input className="form-input" value={form.numeroCuentaOrigen}
              onChange={e => setForm(f => ({ ...f, numeroCuentaOrigen: e.target.value }))}
              placeholder="Ej: 0001-00123456" required />
          </div>
          <div className="form-group">
            <label className="form-label">Número de cuenta destino *</label>
            <input className="form-input" value={form.numeroCuentaDestino}
              onChange={e => setForm(f => ({ ...f, numeroCuentaDestino: e.target.value }))}
              placeholder="Ej: 0002-00654321" required />
          </div>
          <div className="form-group">
            <label className="form-label">Monto (COP) *</label>
            <input className="form-input" type="number" min="0.01" step="0.01"
              value={form.monto}
              onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
              placeholder="50000" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Procesando...</> : 'Realizar Transferencia'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Retirar ─────────────────────────────────────────────────── */
function RetirarTab() {
  const [form, setForm] = useState({ cuentaId: '', monto: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await transaccionService.retirar(form.cuentaId, parseFloat(form.monto), form.descripcion);
      setResult(res.data || res);
      setForm({ cuentaId: '', monto: '', descripcion: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h2 className="section-title">Retirar Dinero</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠ {error}</div>}
        {result && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            ✓ Retiro procesado exitosamente
          </div>
        )}
        <div className="form-stack">
          <div className="form-group">
            <label className="form-label">ID de la cuenta *</label>
            <input className="form-input" value={form.cuentaId}
              onChange={e => setForm(f => ({ ...f, cuentaId: e.target.value }))}
              placeholder="UUID de la cuenta..." required />
          </div>
          <div className="form-group">
            <label className="form-label">Monto (COP) *</label>
            <input className="form-input" type="number" min="0.01" step="0.01"
              value={form.monto}
              onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
              placeholder="100000" required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción (opcional)</label>
            <input className="form-input" value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Retiro cajero automático..." />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Procesando...</> : 'Realizar Retiro'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Historial ───────────────────────────────────────────────── */
function HistorialTab() {
  const [cuentaId, setCuentaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [movimientos, setMovimientos] = useState(null);

  const handleConsultar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMovimientos(null);
    try {
      const res = await transaccionService.historial(cuentaId.trim());
      setMovimientos(res.data || res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Historial de Operaciones</h2>
      <form onSubmit={handleConsultar} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input className="form-input" value={cuentaId}
          onChange={e => { setCuentaId(e.target.value); setError(''); setMovimientos(null); }}
          placeholder="ID de la cuenta (UUID)..." />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Consultar'}
        </button>
      </form>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      {movimientos !== null && (
        movimientos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Sin movimientos</h3>
            <p>Esta cuenta no tiene transacciones registradas.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m, i) => (
                  <tr key={i}>
                    <td className="td-muted">{formatDateTime(m.fechaHora)}</td>
                    <td>
                      <span className={`tag ${m.tipo === 'RETIRO' ? 'tag-red' : m.tipo === 'TRANSFERENCIA' ? 'tag-blue' : 'tag-green'}`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      {formatCOP(m.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
