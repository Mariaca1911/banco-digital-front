import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cuentaService } from '../api/services';
import Layout from '../components/Layout';

export default function CrearCuentaPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ clienteId: '', tipoCuenta: 'AHORROS' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await cuentaService.crear(form.clienteId, form.tipoCuenta);
      const cuenta = res.data;
      setSuccess(`Cuenta ${cuenta?.numeroCuenta || ''} creada exitosamente para el cliente.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Crear Cuenta Financiera</h1>
        <p>Asocia una nueva cuenta bancaria a un cliente existente</p>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠ {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>✓ {success}</div>}

          <div className="form-stack">
            <div className="form-group">
              <label className="form-label">ID del cliente *</label>
              <input
                className="form-input"
                placeholder="UUID del cliente..."
                value={form.clienteId}
                onChange={e => setForm(f => ({ ...f, clienteId: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de cuenta *</label>
              <select
                className="form-input form-select"
                value={form.tipoCuenta}
                onChange={e => setForm(f => ({ ...f, tipoCuenta: e.target.value }))}
              >
                <option value="AHORROS">Ahorros</option>
                <option value="CORRIENTE">Corriente</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Creando...</> : 'Crear Cuenta'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/clientes')}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
