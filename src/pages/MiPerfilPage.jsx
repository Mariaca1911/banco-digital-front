import { useState, useEffect } from 'react';
import { clienteService, authService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function MiPerfilPage() {
  const { user } = useAuth();
  const clienteId = user?.clienteId;

  const [cliente, setCliente]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Edición de perfil
  const [editMode, setEditMode]     = useState(false);
  const [editForm, setEditForm]     = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg]       = useState({ type: '', text: '' });

  // Cambio de contraseña
  const [showPwd, setShowPwd]       = useState(false);
  const [pwdForm, setPwdForm]       = useState({ passwordActual: '', passwordNueva: '', passwordConfirmacion: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg]         = useState({ type: '', text: '' });

  useEffect(() => {
    if (clienteId) {
      loadCliente();
    } else {
      setError('No se encontró el ID de cliente en tu sesión.');
      setLoading(false);
    }
  }, [clienteId]);

  const loadCliente = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clienteService.obtener(clienteId);
      setCliente(res.data || res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setEditForm({
      primerNombre:    cliente.primerNombre,
      segundoNombre:   cliente.segundoNombre   || '',
      primerApellido:  cliente.primerApellido,
      segundoApellido: cliente.segundoApellido || '',
      email:           cliente.email,
      telefono:        cliente.telefono        || '',
    });
    setEditMode(true);
    setEditMsg({ type: '', text: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg({ type: '', text: '' });
    try {
      const res = await clienteService.actualizar(clienteId, editForm);
      setCliente(res.data || res);
      setEditMode(false);
      setEditMsg({ type: 'success', text: 'Información actualizada exitosamente' });
    } catch (err) {
      setEditMsg({ type: 'error', text: err.message });
    } finally {
      setEditLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.passwordNueva !== pwdForm.passwordConfirmacion) {
      setPwdMsg({ type: 'error', text: 'Las nuevas contraseñas no coinciden' });
      return;
    }
    setPwdLoading(true);
    setPwdMsg({ type: '', text: '' });
    try {
      await authService.changePassword(
        pwdForm.passwordActual,
        pwdForm.passwordNueva,
        pwdForm.passwordConfirmacion,
      );
      setPwdMsg({ type: 'success', text: 'Contraseña actualizada exitosamente' });
      setPwdForm({ passwordActual: '', passwordNueva: '', passwordConfirmacion: '' });
      setShowPwd(false);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading-center"><span className="spinner" /> Cargando perfil...</div></Layout>;
  if (error)   return <Layout><div className="alert alert-error">⚠ {error}</div></Layout>;
  if (!cliente) return null;

  const fullName = [cliente.primerNombre, cliente.segundoNombre, cliente.primerApellido, cliente.segundoApellido]
    .filter(Boolean).join(' ');

  return (
    <Layout>
      <div className="page-header">
        <div className="page-title-line">
          <h1>Mi Perfil</h1>
          <span className={`tag ${cliente.activo ? 'tag-green' : 'tag-red'}`}>
            {cliente.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <p>C.C. {cliente.numeroCedula}</p>
      </div>

      {editMsg.text && (
        <div className={`alert ${editMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 20 }}>
          {editMsg.type === 'success' ? '✓' : '⚠'} {editMsg.text}
        </div>
      )}
      {pwdMsg.text && (
        <div className={`alert ${pwdMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 20 }}>
          {pwdMsg.type === 'success' ? '✓' : '⚠'} {pwdMsg.text}
        </div>
      )}

      <div className="card" style={{ maxWidth: 720, marginBottom: 24 }}>
        {!editMode ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{fullName}</div>
                <div style={{ color: 'var(--ink-muted)', marginTop: 4 }}>{cliente.email}</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={startEdit}>Editar perfil</button>
            </div>
            <hr className="divider" />
            <div className="form-grid form-grid-2">
              {[
                ['Cédula',              cliente.numeroCedula],
                ['Teléfono',            cliente.telefono || '—'],
                ['Fecha de nacimiento', formatDate(cliente.fechaNacimiento)],
                ['Miembro desde',       formatDate(cliente.createdAt)],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="form-label" style={{ marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '0.95rem' }}>{val}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={handleEditSubmit}>
            <h2 className="section-title">Editar Perfil</h2>
            <div className="form-grid form-grid-2" style={{ marginBottom: 24 }}>
              {[
                ['primerNombre',    'Primer nombre',       'text'],
                ['segundoNombre',   'Segundo nombre',      'text'],
                ['primerApellido',  'Primer apellido',     'text'],
                ['segundoApellido', 'Segundo apellido',    'text'],
                ['email',           'Correo electrónico',  'email'],
                ['telefono',        'Teléfono',            'tel'],
              ].map(([name, label, type]) => (
                <div className="form-group" key={name}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} value={editForm[name] || ''}
                    onChange={e => setEditForm(f => ({ ...f, [name]: e.target.value }))} />
                </div>
              ))}
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

      {/* Cambio de contraseña */}
      <div className="card" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            Seguridad
          </h2>
          <button className="btn btn-outline btn-sm" onClick={() => { setShowPwd(!showPwd); setPwdMsg({ type: '', text: '' }); }}>
            {showPwd ? 'Cancelar' : 'Cambiar contraseña'}
          </button>
        </div>

        {showPwd && (
          <form onSubmit={handlePwdSubmit} style={{ marginTop: 24 }}>
            <div className="form-stack" style={{ maxWidth: 400 }}>
              {[
                ['passwordActual',       'Contraseña actual',           'current-password'],
                ['passwordNueva',        'Nueva contraseña',            'new-password'],
                ['passwordConfirmacion', 'Confirmar nueva contraseña',  'new-password'],
              ].map(([name, label, autoComplete]) => (
                <div className="form-group" key={name}>
                  <label className="form-label">{label}</label>
                  <input
                    className="form-input"
                    type="password"
                    autoComplete={autoComplete}
                    value={pwdForm[name]}
                    onChange={e => setPwdForm(f => ({ ...f, [name]: e.target.value }))}
                    required
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-primary" disabled={pwdLoading}>
                {pwdLoading ? <><span className="spinner" /> Cambiando...</> : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}