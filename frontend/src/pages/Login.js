// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === 'edinsongg@gmail.com' && password === 'solocodigo') {
      navigate('/analiticas'); // redirige a la ruta protegida
    } else {
      setError('Correo o contraseña incorrectos');
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
            <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;
