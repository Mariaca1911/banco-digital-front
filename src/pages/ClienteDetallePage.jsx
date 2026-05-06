import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clienteService, cuentaService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ClienteDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManageClients } = useAuth();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edición
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState('');

  // Crear cuenta
  const [showCuenta, setShowCuenta] = useState(false);
  const [tipoCuenta, setTipoCuenta] = useState('AHORROS');
  const [cuentaLoading, setCuentaLoading] = useState(false);
  const [cuentaMsg, setCuentaMsg] = useState('');

  useEffect(() => {
    loadCliente();
  }, [id]);

  const loadCliente = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clienteService.obtener(id);
      setCliente(res.data || res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setEditForm({
      primerNombre: cliente.primerNombre,
      segundoNombre: cliente.segundoNombre || '',
      primerApellido: cliente.primerApellido,
      segundoApellido: cliente.segundoApellido || '',
      email: cliente.email,
      telefono: cliente.telefono || '',
      activo: cliente.activo,
    });
    setEditMode(true);
    setEditMsg('');
  };

  const handleEditChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEditForm((f) => ({ ...f, [e.target.name]: val }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg('');
    try {
      const res = await clienteService.actualizar(id, editForm);
      setCliente(res.data || res);
      setEditMode(false);
      setEditMsg('');
    } catch (err) {
      setEditMsg(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCrearCuenta = async () => {
    setCuentaLoading(true);
    setCuentaMsg('');
    try {
      await cuentaService.crear(id, tipoCuenta);
      setCuentaMsg('Cuenta creada exitosamente');
      setShowCuenta(false);
    } catch (err) {
      setCuentaMsg(err.message);
    } finally {
      setCuentaLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading-center"><span className="spinner" /> Cargando cliente...</div></Layout>;
  if (error) return <Layout><div className="alert alert-error">⚠ {error}</div></Layout>;
  if (!cliente) return null;

  const fullName = [cliente.primerNombre, cliente.segundoNombre, cliente.primerApellido, cliente.segundoApellido].filter(Boolean).join(' ');

  return (
    <Layout>
      <div className="page-header">
        <div className="page-title-line">
          <h1>{fullName}</h1>
          <span className={`tag ${cliente.activo ? 'tag-green' : 'tag-red'}`}>
            {cliente.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <p>C.C. {cliente.numeroCedula} · Registrado {formatDate(cliente.createdAt)}</p>
      </div>

      {cuentaMsg && (
        <div className={`alert ${cuentaMsg.includes('exitosa') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 20 }}>
          {cuentaMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
        <div className="card">
          {!editMode ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 className="section-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Información del Cliente</h2>
                {canManageClients() && (
                  <button className="btn btn-outline btn-sm" onClick={startEdit}>Editar</button>
                )}
              </div>
              <div className="form-grid form-grid-2">
                {[
                  ['Cédula', cliente.numeroCedula],
                  ['Email', cliente.email],
                  ['Primer nombre', cliente.primerNombre],
                  ['Segundo nombre', cliente.segundoNombre || '—'],
                  ['Primer apellido', cliente.primerApellido],
                  ['Segundo apellido', cliente.segundoApellido || '—'],
                  ['Teléfono', cliente.telefono || '—'],
                  ['Fecha de nacimiento', formatDate(cliente.fechaNacimiento)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="form-label" style={{ marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleEditSubmit}>
              <h2 className="section-title">Editar Cliente</h2>
              {editMsg && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠ {editMsg}</div>}
              <div className="form-grid form-grid-2" style={{ marginBottom: 24 }}>
                {[
                  ['primerNombre', 'Primer nombre', 'text'],
                  ['segundoNombre', 'Segundo nombre', 'text'],
                  ['primerApellido', 'Primer apellido', 'text'],
                  ['segundoApellido', 'Segundo apellido', 'text'],
                  ['email', 'Email', 'email'],
                  ['telefono', 'Teléfono', 'tel'],
                ].map(([name, label, type]) => (
                  <div className="form-group" key={name}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" type={type} name={name} value={editForm[name] || ''} onChange={handleEditChange} />
                  </div>
                ))}
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="activo" name="activo" checked={editForm.activo} onChange={handleEditChange} style={{ width: 18, height: 18 }} />
                  <label htmlFor="activo" className="form-label" style={{ margin: 0 }}>Cliente activo</label>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? <><span className="spinner" /> Guardando...</> : 'Guardar cambios'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setEditMode(false)}>Cancelar</button>
              </div>
            </form>
          )}
        </div>

        {canManageClients() && (
          <div className="card" style={{ minWidth: 220 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16 }}>Acciones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-gold btn-sm" onClick={() => setShowCuenta(!showCuenta)}>
                + Crear Cuenta
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/clientes')}>
                ← Volver
              </button>
            </div>

            {showCuenta && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--paper-3)' }}>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Tipo de cuenta</label>
                  <select className="form-input form-select" value={tipoCuenta} onChange={e => setTipoCuenta(e.target.value)}>
                    <option value="AHORROS">Ahorros</option>
                    <option value="CORRIENTE">Corriente</option>
                  </select>
                </div>
                <button className="btn btn-primary btn-sm btn-full" onClick={handleCrearCuenta} disabled={cuentaLoading}>
                  {cuentaLoading ? <><span className="spinner" /> Creando...</> : 'Confirmar'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
