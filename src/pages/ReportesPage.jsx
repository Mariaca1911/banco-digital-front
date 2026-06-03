import { useState, useEffect } from 'react';
import { reporteService } from '../api/services';
import Layout from '../components/Layout';

function formatCOP(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ReportesPage() {
  const today         = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [tab, setTab] = useState('actividad');

  // Saldo total
  const [saldoTotal, setSaldoTotal]     = useState(null);
  const [saldoLoading, setSaldoLoading] = useState(false);
  const [saldoError, setSaldoError]     = useState('');

  // Reporte actividad
  const [fechaInicio, setFechaInicio] = useState(thirtyDaysAgo);
  const [fechaFin, setFechaFin]       = useState(today);
  const [reporte, setReporte]         = useState(null);
  const [reporteLoading, setReporteLoading] = useState(false);
  const [reporteError, setReporteError]     = useState('');

  // Movimientos
  const [movimientos, setMovimientos]         = useState(null);
  const [movLoading, setMovLoading]           = useState(false);
  const [movError, setMovError]               = useState('');

  // Cuentas de reporte
  const [cuentasReporte, setCuentasReporte]   = useState(null);
  const [cuentasLoading, setCuentasLoading]   = useState(false);
  const [cuentasError, setCuentasError]       = useState('');

  // Resumen
  const [resumen, setResumen]                 = useState(null);
  const [resumenLoading, setResumenLoading]   = useState(false);
  const [resumenError, setResumenError]       = useState('');

  // ── Saldo total ──────────────────────────────────────────────
  const handleSaldoTotal = async () => {
    setSaldoLoading(true);
    setSaldoError('');
    try {
      const res = await reporteService.saldoTotal();
      // { success, data: { clienteId, saldoTotal } }
      setSaldoTotal(res.data?.saldoTotal ?? res.saldoTotal);
    } catch (err) {
      setSaldoError(err.message);
    } finally {
      setSaldoLoading(false);
    }
  };

  // ── Reporte actividad ────────────────────────────────────────
  const handleReporteActividad = async (e) => {
    e.preventDefault();
    setReporteLoading(true);
    setReporteError('');
    setReporte(null);
    try {
      const res = await reporteService.actividad(fechaInicio, fechaFin);
      // { success, data: ReporteActividad }
      setReporte(res.data || res);
    } catch (err) {
      setReporteError(err.message);
    } finally {
      setReporteLoading(false);
    }
  };

  // ── Movimientos ──────────────────────────────────────────────
  const handleMovimientos = async () => {
    setMovLoading(true);
    setMovError('');
    setMovimientos(null);
    try {
      const res = await reporteService.movimientos();
      // { success, data: [ { movimientoId, cuentaId, tipoMovimiento, monto, descripcion, fecha } ] }
      setMovimientos(res.data || []);
    } catch (err) {
      setMovError(err.message);
    } finally {
      setMovLoading(false);
    }
  };

  // ── Cuentas reporte ──────────────────────────────────────────
  const handleCuentas = async () => {
    setCuentasLoading(true);
    setCuentasError('');
    setCuentasReporte(null);
    try {
      const res = await reporteService.cuentas();
      // { success, data: [ { cuentaId, numeroCuenta, tipoCuenta, estado, saldoActual } ] }
      setCuentasReporte(res.data || []);
    } catch (err) {
      setCuentasError(err.message);
    } finally {
      setCuentasLoading(false);
    }
  };

  // ── Resumen ──────────────────────────────────────────────────
  const handleResumen = async () => {
    setResumenLoading(true);
    setResumenError('');
    setResumen(null);
    try {
      const res = await reporteService.resumenMovimientos();
      // { success, data: { totalIngresos, totalEgresos, cantidadMovimientos } }
      setResumen(res.data || res);
    } catch (err) {
      setResumenError(err.message);
    } finally {
      setResumenLoading(false);
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

      {/* Saldo consolidado siempre visible arriba */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="stat-label">Saldo total consolidado</div>
            {saldoTotal !== null ? (
              <div className="stat-value" style={{ color: 'var(--green)' }}>{formatCOP(saldoTotal)}</div>
            ) : (
              <div style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: 6 }}>
                {saldoError ? <span style={{ color: 'var(--red)' }}>⚠ {saldoError}</span> : 'Haz clic para consultar'}
              </div>
            )}
          </div>
          <button className="btn btn-gold" onClick={handleSaldoTotal} disabled={saldoLoading}>
            {saldoLoading ? <><span className="spinner" /> Consultando...</> : '↻ Consultar saldo total'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {[
          { key: 'actividad',   label: '📊 Reporte de actividad' },
          { key: 'movimientos', label: '📋 Movimientos' },
          { key: 'cuentas',     label: '💳 Mis cuentas' },
          { key: 'resumen',     label: '📈 Resumen' },
        ].map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Reporte actividad ────────────────────────────────── */}
      {tab === 'actividad' && (
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
            <button type="submit" className="btn btn-primary" disabled={reporteLoading}>
              {reporteLoading ? <><span className="spinner" /> Generando...</> : 'Generar reporte'}
            </button>
          </form>

          {reporteError && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠ {reporteError}</div>}

          {reporte && (
            <div>
              {/* Stats */}
              <div className="card-grid card-grid-3" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                  <div className="stat-label">Período</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: 8 }}>
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
                </div>
              </div>

              {/* Totales si existen */}
              {reporte.totales && (
                <div className="card-grid card-grid-3" style={{ marginBottom: 24 }}>
                  {reporte.totales.depositos != null && (
                    <div className="stat-card">
                      <div className="stat-label">Depósitos</div>
                      <div className="stat-value" style={{ color: 'var(--green)', fontSize: '1.3rem' }}>
                        {formatCOP(reporte.totales.depositos)}
                      </div>
                    </div>
                  )}
                  {reporte.totales.retiros != null && (
                    <div className="stat-card">
                      <div className="stat-label">Retiros</div>
                      <div className="stat-value" style={{ color: 'var(--red)', fontSize: '1.3rem' }}>
                        {formatCOP(reporte.totales.retiros)}
                      </div>
                    </div>
                  )}
                  {reporte.totales.transferencias != null && (
                    <div className="stat-card">
                      <div className="stat-label">Transferencias</div>
                      <div className="stat-value" style={{ fontSize: '1.3rem' }}>
                        {formatCOP(reporte.totales.transferencias)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lista de movimientos */}
              {reporte.movimientos?.length > 0 && (
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
                            <span className={`tag ${m.tipo === 'RETIRO' || m.tipo === 'TRANSFERENCIA_DEBITO' ? 'tag-red' : 'tag-green'}`}>
                              {m.tipo}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCOP(m.monto)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reporte.mensaje && (
                <div className="alert alert-info" style={{ marginTop: 20 }}>ℹ {reporte.mensaje}</div>
              )}
            </div>
          )}

          {!reporte && !reporteLoading && (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>Selecciona un rango de fechas</h3>
              <p>Elige el período y genera el reporte para ver tu actividad financiera.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Movimientos ──────────────────────────────────────── */}
      {tab === 'movimientos' && (
        <div className="card">
          <h2 className="section-title">Todos los movimientos</h2>
          {!movimientos && !movLoading && (
            <button className="btn btn-primary" onClick={handleMovimientos}>
              Cargar movimientos
            </button>
          )}
          {movLoading && <div className="loading-center"><span className="spinner" /> Cargando...</div>}
          {movError && <div className="alert alert-error">⚠ {movError}</div>}
          {movimientos !== null && (
            movimientos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>Sin movimientos</h3>
                <p>No hay movimientos registrados.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th style={{ textAlign: 'right' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((m, i) => (
                      <tr key={i}>
                        <td className="td-muted">{formatDateTime(m.fecha)}</td>
                        <td>
                          <span className={`tag ${m.tipoMovimiento === 'DEBITO' ? 'tag-red' : 'tag-green'}`}>
                            {m.tipoMovimiento}
                          </span>
                        </td>
                        <td style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{m.descripcion || '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCOP(m.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* ── Cuentas ──────────────────────────────────────────── */}
      {tab === 'cuentas' && (
        <div className="card">
          <h2 className="section-title">Mis cuentas (reporte)</h2>
          {!cuentasReporte && !cuentasLoading && (
            <button className="btn btn-primary" onClick={handleCuentas}>
              Cargar cuentas
            </button>
          )}
          {cuentasLoading && <div className="loading-center"><span className="spinner" /> Cargando...</div>}
          {cuentasError && <div className="alert alert-error">⚠ {cuentasError}</div>}
          {cuentasReporte !== null && (
            cuentasReporte.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💳</div>
                <h3>Sin cuentas</h3>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Saldo actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentasReporte.map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{c.numeroCuenta}</td>
                        <td>{c.tipoCuenta}</td>
                        <td>
                          <span className={`tag ${c.estado === 'ACTIVA' ? 'tag-green' : 'tag-red'}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCOP(c.saldoActual)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* ── Resumen ──────────────────────────────────────────── */}
      {tab === 'resumen' && (
        <div className="card">
          <h2 className="section-title">Resumen de movimientos</h2>
          {!resumen && !resumenLoading && (
            <button className="btn btn-primary" onClick={handleResumen}>
              Cargar resumen
            </button>
          )}
          {resumenLoading && <div className="loading-center"><span className="spinner" /> Cargando...</div>}
          {resumenError && <div className="alert alert-error">⚠ {resumenError}</div>}
          {resumen && (
            <div className="card-grid card-grid-3" style={{ marginTop: 20 }}>
              <div className="stat-card">
                <div className="stat-label">Total ingresos</div>
                <div className="stat-value" style={{ color: 'var(--green)' }}>
                  {formatCOP(resumen.totalIngresos)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total egresos</div>
                <div className="stat-value" style={{ color: 'var(--red)' }}>
                  {formatCOP(resumen.totalEgresos)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Cantidad de movimientos</div>
                <div className="stat-value">{resumen.cantidadMovimientos ?? 0}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}