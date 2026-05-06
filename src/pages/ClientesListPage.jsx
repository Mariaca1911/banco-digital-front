import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../api/services';
import Layout from '../components/Layout';

export default function ClientesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!clienteId.trim()) return;
    setLoading(true);
    setError('');
    setCliente(null);
    try {
      const res = await clienteService.obtener(clienteId.trim());
      setCliente(res.data || res);
    } catch (err) {
      setError(err.message || 'Cliente no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const fullName = cliente
    ? [cliente.primerNombre, cliente.segundoNombre, cliente.primerApellido, cliente.segundoApellido].filter(Boolean).join(' ')
    : '';

  return (
    <Layout>
      <div className="page-header">
        <div className="page-title-line">
          <h1>Gestión de Clientes</h1>
          <span className="badge-role cajero">Cajero / Admin</span>
        </div>
        <p>Consulta, actualiza y gestiona los perfiles de clientes</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <button className="btn btn-primary" onClick={() => navigate('/clientes/nuevo')}>
          + Nuevo Cliente
        </button>
        <button className="btn btn-gold" onClick={() => navigate('/cuentas/nueva')}>
          + Nueva Cuenta
        </button>
      </div>

      <div className="card" style={{ maxWidth: 620, marginBottom: 28 }}>
        <h2 className="section-title">Buscar cliente por ID</h2>
        <form onSubmit={handleBuscar} style={{ display: 'flex', gap: 12 }}>
          <input
            className="form-input"
            placeholder="UUID del cliente..."
            value={clienteId}
            onChange={e => { setClienteId(e.target.value); setError(''); setCliente(null); }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Buscar'}
          </button>
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>⚠ {error}</div>}

        {cliente && (
          <div style={{ marginTop: 20, padding: '16px 0', borderTop: '1px solid var(--paper-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>{fullName}</div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  C.C. {cliente.numeroCedula} · {cliente.email}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className={`tag ${cliente.activo ? 'tag-green' : 'tag-red'}`}>
                  {cliente.activo ? 'Activo' : 'Inactivo'}
                </span>
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/clientes/${cliente.id}`)}>
                  Ver detalle →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Busca un cliente por su ID</h3>
          <p>Ingresa el UUID del cliente en el campo de búsqueda para ver su información y gestionarlo.</p>
        </div>
      </div>
    </Layout>
  );
}
