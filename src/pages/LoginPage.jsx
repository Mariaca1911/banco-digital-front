import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', clave: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = await login(form.correo, form.clave);
      const roles = userData.roles.map(r => r.replace('ROLE_', ''));
      if (roles.includes('CLIENTE')) {
        navigate('/mis-cuentas');
      } else {
        navigate('/clientes');
      }
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-tagline">
          <h2>Banca que<br />te <em>inspira</em><br />confianza.</h2>
          <p>Gestiona tus finanzas con la seguridad y el respaldo que mereces.</p>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-inner">
          <div className="login-logo">◆ Banco<span>Digital</span></div>

          <h1>Bienvenido</h1>
          <p>Ingresa tus credenciales para continuar</p>

          <form className="form-stack" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                ⚠ {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                className="form-input"
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                placeholder="usuario@banco.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                className="form-input"
                type="password"
                name="clave"
                value={form.clave}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: 8, padding: '14px' }}
            >
              {loading ? <><span className="spinner" /> Ingresando...</> : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
