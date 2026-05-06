import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../api/services';
import Layout from '../components/Layout';

export default function RegistroClientePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    numeroCedula: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      if (!payload.segundoNombre) delete payload.segundoNombre;
      if (!payload.segundoApellido) delete payload.segundoApellido;
      if (!payload.telefono) delete payload.telefono;

      const res = await clienteService.crear(payload);
      const clienteId = res.data?.id;
      setSuccess(`Cliente registrado exitosamente.`);
      setTimeout(() => navigate(`/clientes/${clienteId}`), 1500);
    } catch (err) {
      setError(err.message || 'Error al registrar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Registrar Cliente</h1>
        <p>Complete el formulario para crear un nuevo perfil de cliente</p>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>⚠ {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 24 }}>✓ {success}</div>}

          <h3 className="section-title">Identificación</h3>
          <div className="form-grid form-grid-2" style={{ marginBottom: 28 }}>
            <div className="form-group">
              <label className="form-label">Número de cédula *</label>
              <input className="form-input" name="numeroCedula" value={form.numeroCedula} onChange={handleChange} placeholder="1234567890" required />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de nacimiento *</label>
              <input className="form-input" type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
            </div>
          </div>

          <h3 className="section-title">Nombre completo</h3>
          <div className="form-grid form-grid-2" style={{ marginBottom: 28 }}>
            <div className="form-group">
              <label className="form-label">Primer nombre *</label>
              <input className="form-input" name="primerNombre" value={form.primerNombre} onChange={handleChange} placeholder="Juan" required />
            </div>
            <div className="form-group">
              <label className="form-label">Segundo nombre</label>
              <input className="form-input" name="segundoNombre" value={form.segundoNombre} onChange={handleChange} placeholder="Carlos" />
            </div>
            <div className="form-group">
              <label className="form-label">Primer apellido *</label>
              <input className="form-input" name="primerApellido" value={form.primerApellido} onChange={handleChange} placeholder="García" required />
            </div>
            <div className="form-group">
              <label className="form-label">Segundo apellido</label>
              <input className="form-input" name="segundoApellido" value={form.segundoApellido} onChange={handleChange} placeholder="López" />
            </div>
          </div>

          <h3 className="section-title">Contacto</h3>
          <div className="form-grid form-grid-2" style={{ marginBottom: 32 }}>
            <div className="form-group">
              <label className="form-label">Correo electrónico *</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="juan@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="3001234567" />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Registrando...</> : 'Registrar Cliente'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/clientes')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
