// pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
  const [isLoading, setIsLoading] = useState(false);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Intentar usar el contexto de autenticación primero
      if (login && typeof login === 'function') {
        const result = await login(loginData.email, loginData.password);

        if (result.success) {
          // Redirección según el rol del usuario
          if (result.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/analiticas');
          }
        } else {
          setError(result.error || 'Correo o contraseña incorrectos');
        }
      } else {
        // Fallback: hacer la petición directamente
        const response = await fetch('http://localhost:8000/accounts/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // IMPORTANTE: Guardar el token y datos del usuario
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('userEmail', loginData.email);
          
          // Redirección según el rol del usuario
          if (data.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/analiticas');
          }
        } else {
          setError(data.message || data.error || 'Correo o contraseña incorrectos');
        }
      }
    } catch (err) {
      setError('Error en el servidor. Intenta de nuevo.');
      console.error('Error en login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setIsLoading(true);

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
        setError(data.error || data.message || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error en el servidor. Intenta de nuevo.');
      console.error('Error en registro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">
        {activeTab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </h2>
      
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            <div className="checkbox-container">
              <input
                type="checkbox"
                onChange={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              /> Mostrar contraseña
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
          
          <div className="text-center mt-3">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              onClick={() => switchTab('register')}
              disabled={isLoading}
            >
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={registerData.first_name}
              onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
              placeholder="Ingresa tu nombre"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              value={registerData.last_name}
              onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
              placeholder="Ingresa tu apellido"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              placeholder="Ingresa tu correo"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              placeholder="Ingresa tu contraseña"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              placeholder="Confirma tu contraseña"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
          
          <div className="text-center mt-3">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              onClick={() => switchTab('login')}
              disabled={isLoading}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Login;