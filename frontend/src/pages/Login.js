import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'usuario',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirección según el rol del usuario
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/analiticas');
        }
      } else {
        setError(data.message || 'Correo o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error en el servidor. Intenta de nuevo.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    try {
      const response = await fetch('http://localhost:8000/accounts/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registro exitoso. Ahora inicia sesión.');
        setActiveTab('login');
        setRegisterData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirmPassword: '',
          rol: 'usuario',
        });
      } else {
        setError(data.message || 'Error al registrar');
      }
    } catch (err) {
      setError('Error en el servidor. Intenta de nuevo.');
    }
  };

  return (
    <div className="login-container">
      {error && <p className="text-danger text-center">{error}</p>}

      {activeTab === 'login' ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              placeholder="Ingresa tu correo"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
          <Link to="/registrarse" className="register-link">
            ¿No tienes cuenta? Regístrate
          </Link>
        </form>
      ) : null}
    </div>
  );
}

export default Login;
