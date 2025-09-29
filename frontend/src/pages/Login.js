// pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
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

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: '',
    color: '#ccc',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false
    }
  });

  const evaluatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    let text, color;
    if (password.length === 0) {
      text = '';
      color = '#ccc';
    } else if (password.length < 8) {
      text = 'Muy débil (mínimo 8 caracteres)';
      color = '#ef4444';
    } else if (score <= 2) {
      text = 'Débil';
      color = '#ef4444';
    } else if (score === 3) {
      text = 'Regular';
      color = '#f59e0b';
    } else if (score === 4) {
      text = 'Segura';
      color = '#10b981';
    } else if (score === 5) {
      text = 'Muy segura';
      color = '#059669';
    }
    return { score, text, color, requirements };
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setLoginData({ email: '', password: '' });
    setRegisterData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      rol: 'usuario',
    });
    setPasswordStrength({
      score: 0,
      text: '',
      color: '#ccc',
      requirements: {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false
      }
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (login && typeof login === 'function') {
        const result = await login(loginData.email, loginData.password);

        if (result.success) {
          if (result.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/analiticas');
          }
        } else {
          setError(result.error || 'Correo o contraseña incorrectos');
        }
      } else {
        // Usa la instancia api y ruta relativa
        const response = await api.post('/accounts/login/', loginData);
        const data = response.data;

        if (response.status === 200 && data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('userEmail', loginData.email);

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

    if (registerData.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres');
    }
    if (registerData.password !== registerData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }
    setIsLoading(true);

    try {
      // Usa la instancia api y ruta relativa
      const response = await api.post('/accounts/register/', registerData);
      const data = response.data;

      if (response.status === 201 || response.status === 200) {
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
        setPasswordStrength({
          score: 0,
          text: '',
          color: '#ccc',
          requirements: {
            length: false,
            uppercase: false,
            lowercase: false,
            numbers: false,
            symbols: false
          }
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

  const handleRegisterPasswordChange = (e) => {
    const newPassword = e.target.value;
    setRegisterData({ ...registerData, password: newPassword });
    const strength = evaluatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  return (
    <div className="login-container">
      <h2 className="login-title">
        {activeTab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </h2>
      
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#dc2626',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}

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
            {/* CORREGIDO: Cambiar de type="submit" a type="button" */}
            <button
              type="button"
              className="btn btn-secondary btn-block"
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
            <label>Contraseña (mínimo 8 caracteres)</label>
            <input
              type="password"
              value={registerData.password}
              onChange={handleRegisterPasswordChange}
              placeholder="Ingresa tu contraseña"
              required
              minLength="8"
              disabled={isLoading}
              style={{
                borderColor: registerData.password.length > 0 ? passwordStrength.color : '#ddd',
                borderWidth: '2px'
              }}
            />

            {/* NUEVO: Indicador de fortaleza de contraseña */}
            {registerData.password.length > 0 && (
              <div style={{ 
                marginTop: '8px',
                marginBottom: '12px'
              }}>
                {/* Barra de fortaleza */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    height: '100%',
                    backgroundColor: passwordStrength.color,
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                
                {/* Texto de fortaleza */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    color: passwordStrength.color,
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {passwordStrength.text}
                  </span>
                </div>
                
                {/* Requisitos de la contraseña */}
                <div style={{
                  fontSize: '0.8rem',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Requisitos:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', fontSize: '0.75rem' }}>
                    <span style={{ color: passwordStrength.requirements.length ? '#10b981' : '#ef4444' }}>
                      {passwordStrength.requirements.length ? '✓' : '✗'} 8+ caracteres
                    </span>
                    <span style={{ color: passwordStrength.requirements.uppercase ? '#10b981' : '#ef4444' }}>
                      {passwordStrength.requirements.uppercase ? '✓' : '✗'} Mayúsculas
                    </span>
                    <span style={{ color: passwordStrength.requirements.lowercase ? '#10b981' : '#ef4444' }}>
                      {passwordStrength.requirements.lowercase ? '✓' : '✗'} Minúsculas
                    </span>
                    <span style={{ color: passwordStrength.requirements.numbers ? '#10b981' : '#ef4444' }}>
                      {passwordStrength.requirements.numbers ? '✓' : '✗'} Números
                    </span>
                    <span style={{ 
                      color: passwordStrength.requirements.symbols ? '#10b981' : '#ef4444', 
                      gridColumn: 'span 2' 
                    }}>
                      {passwordStrength.requirements.symbols ? '✓' : '✗'} Símbolos (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
            )}
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
              style={{
                borderColor: registerData.confirmPassword.length > 0 
                  ? (registerData.password === registerData.confirmPassword ? '#10b981' : '#ef4444')
                  : '#ddd',
                borderWidth: '2px'
              }}
            />

            {/* Indicador de coincidencia de contraseñas */}
            {registerData.confirmPassword.length > 0 && (
              <div style={{ 
                marginTop: '4px',
                fontSize: '0.8rem',
                color: registerData.password === registerData.confirmPassword ? '#10b981' : '#ef4444'
              }}>
                {registerData.password === registerData.confirmPassword 
                  ? '✓ Las contraseñas coinciden' 
                  : '✗ Las contraseñas no coinciden'
                }
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={
              isLoading || 
              registerData.password.length < 8 || 
              registerData.password !== registerData.confirmPassword ||
              !registerData.first_name ||
              !registerData.last_name ||
              !registerData.email
            }
            style={{
              opacity: (
                isLoading || 
                registerData.password.length < 8 || 
                registerData.password !== registerData.confirmPassword ||
                !registerData.first_name ||
                !registerData.last_name ||
                !registerData.email
              ) ? 0.6 : 1,
              cursor: (
                isLoading || 
                registerData.password.length < 8 || 
                registerData.password !== registerData.confirmPassword ||
                !registerData.first_name ||
                !registerData.last_name ||
                !registerData.email
              ) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
          
          <div className="text-center mt-3">
            {/* CORREGIDO: Cambiar de type="submit" a type="button" */}
            <button
              type="button"
              className="btn btn-secondary btn-block"
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