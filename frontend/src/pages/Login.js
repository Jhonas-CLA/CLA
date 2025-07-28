import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.role === 'admin') {
          navigate('/admin/dashboard');  // Ajusta si tienes otra ruta
        } else {
          navigate('/analiticas');  // Usuario normal
        }
      } else {
        setError(data.message || 'Correo o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error en el servidor. Intenta de nuevo.');
    }
  };

  return (
    <div className="login-container">
      <h1 className="text-primary text-center mb-4">Inicia Sesión</h1>

      {error && <p className="text-danger text-center">{error}</p>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />
          <div className="checkbox-container">
            <input
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
            /> Mostrar contraseña
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

export default Login;
