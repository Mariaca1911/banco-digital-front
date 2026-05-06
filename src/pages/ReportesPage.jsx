import { useState } from 'react';
import { reporteService } from '../api/services';
import Layout from '../components/Layout';

function formatCOP(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ReportesPage() {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [fechaInicio, setFechaInicio] = useState(thirtyDaysAgo);
  const [fechaFin, setFechaFin] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reporte, setReporte] = useState(null);
  const [saldoTotal, setSaldoTotal] = useState(null);
  const [saldoLoading, setSaldoLoading] = useState(false);

  const handleReporteActividad = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReporte(null);
    try {
      const res = await reporteService.actividad(fechaInicio, fechaFin);
      setReporte(res.data || res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaldoTotal = async () => {
    setSaldoLoading(true);
    try {
      const res = await reporteService.saldoTotal();
      setSaldoTotal(res.data?.saldoTotal ?? res.saldoTotal ?? res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaldoLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-title-line">
          <h1>Reportes</h1>
          <span className="badge-role cliente">Cliente</span>
        </div>
        <p>Revisa la actividad y el consolidado de tus cuentas</p>
      </div>

      {/* Saldo consolidado */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Saldo total consolidado</div>
            {saldoTotal !== null ? (
              <div className="stat-value" style={{ color: 'var(--green)' }}>{formatCOP(saldoTotal)}</div>
            ) : (
              <div style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: 6 }}>Haz clic para consultar</div>
            )}
          </div>
          <button className="btn btn-gold" onClick={handleSaldoTotal} disabled={saldoLoading}>
            {saldoLoading ? <><span className="spinner" /> Consultando...</> : '↻ Consultar saldo total'}
          </button>
        </div>
      </div>

      {/* Reporte de actividad */}
      <div className="card">
        <h2 className="section-title">Reporte de Actividad</h2>

        <form onSubmit={handleReporteActividad} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Fecha inicio</label>
            <input className="form-input" type="date" value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)} max={fechaFin} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Fecha fin</label>
            <input className="form-input" type="date" value={fechaFin}
              onChange={e => setFechaFin(e.target.value)} min={fechaInicio} max={today} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Generando...</> : 'Generar reporte'}
          </button>
        </form>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠ {error}</div>}

        {reporte && (
          <div>
            <div className="card-grid card-grid-3" style={{ marginBottom: 28 }}>
              <div className="stat-card">
                <div className="stat-label">Período</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 8 }}>
                  {formatDate(reporte.fechaInicio)}<br />
                  <span style={{ color: 'var(--ink-muted)', fontSize: '0.8rem' }}>al</span><br />
                  {formatDate(reporte.fechaFin)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Saldo final</div>
                <div className="stat-value">{formatCOP(reporte.saldoFinal)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Movimientos</div>
                <div className="stat-value">{reporte.movimientos?.length ?? 0}</div>
                <div className="stat-sub">en el período</div>
              </div>
            </div>

            {reporte.totales && (
              <div className="card-grid card-grid-3" style={{ marginBottom: 28 }}>
                {reporte.totales.totalCreditos != null && (
                  <div className="stat-card">
                    <div className="stat-label">Total créditos</div>
                    <div className="stat-value" style={{ color: 'var(--green)', fontSize: '1.4rem' }}>
                      {formatCOP(reporte.totales.totalCreditos)}
                    </div>
                  </div>
                )}
                {reporte.totales.totalDebitos != null && (
                  <div className="stat-card">
                    <div className="stat-label">Total débitos</div>
                    <div className="stat-value" style={{ color: 'var(--red)', fontSize: '1.4rem' }}>
                      {formatCOP(reporte.totales.totalDebitos)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {reporte.movimientos && reporte.movimientos.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16, color: 'var(--ink-muted)' }}>
                  Detalle de movimientos
                </h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th style={{ textAlign: 'right' }}>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.movimientos.map((m, i) => (
                        <tr key={i}>
                          <td className="td-muted">{formatDate(m.fecha || m.fechaHora)}</td>
                          <td>
                            <span className={`tag ${m.tipo === 'RETIRO' || m.tipo === 'DEBITO' ? 'tag-red' : 'tag-green'}`}>
                              {m.tipo}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCOP(m.monto)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {reporte.mensaje && (
              <div className="alert alert-info" style={{ marginTop: 20 }}>
                ℹ {reporte.mensaje}
              </div>
            )}
          </div>
        )}

        {!reporte && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>Selecciona un rango de fechas</h3>
            <p>Elige el período y genera el reporte para ver tu actividad financiera.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
