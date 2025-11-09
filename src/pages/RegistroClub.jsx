// src/pages/RegistroClub.jsx - NUEVO REGISTRO PARA PLATAFORMA FÚTBOL 2.0

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function RegistroClub() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombreClub: '',
    ciudad: '',
    pais: '',
    telefono: '',
    nombreAdministrador: '',
    apellidoAdministrador: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signupClub } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.nombreClub.trim()) {
      setError('El nombre del club es obligatorio');
      setLoading(false);
      return;
    }

    try {
      await signupClub(formData);
      navigate('/dashboard-club');
    } catch (err) {
      setError('Error al crear el club. Puede que el email ya esté en uso.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box club-registration">
        <h2>Crear un Nuevo Club</h2>
        <p className="subtitle">Plataforma Fútbol 2.0 - Gestión Integral de Clubes</p>
        
        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Información del Administrador */}
          <div className="form-section">
            <h3>Información del Administrador</h3>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="nombreAdministrador">Nombre *</label>
                <input
                  type="text"
                  id="nombreAdministrador"
                  name="nombreAdministrador"
                  value={formData.nombreAdministrador}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="apellidoAdministrador">Apellido *</label>
                <input
                  type="text"
                  id="apellidoAdministrador"
                  name="apellidoAdministrador"
                  value={formData.apellidoAdministrador}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="email">Correo electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="password">Contraseña *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Información del Club */}
          <div className="form-section">
            <h3>Información del Club</h3>
            <div className="input-group">
              <label htmlFor="nombreClub">Nombre del Club *</label>
              <input
                type="text"
                id="nombreClub"
                name="nombreClub"
                value={formData.nombreClub}
                onChange={handleChange}
                placeholder="Ej: Club Deportivo Los Leones"
                required
              />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="ciudad">Ciudad *</label>
                <input
                  type="text"
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="pais">País *</label>
                <input
                  type="text"
                  id="pais"
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="telefono">Teléfono de Contacto</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: +34 123 456 789"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-auth-primary"
            disabled={loading}
          >
            {loading ? 'Creando Club...' : 'Crear Club'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegistroClub;
