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

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // Nuevo estado para mensajes de éxito

  // Estado para la fortaleza de la contraseña en registro
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

  // Función para evaluar la fortaleza de la contraseña
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

  // Función para cambiar pestañas
  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMessage(''); // Limpiar mensaje de éxito
    // Limpiar formularios cuando cambie de pestaña
    setLoginData({ email: '', password: '' });
    setRegisterData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      rol: 'usuario',
    });
    // Resetear estados de contraseñas
    setShowPassword(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
    // Limpiar indicador de fortaleza
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
    setSuccessMessage('');
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
        const { data } = await api.post('/accounts/login/', loginData);

        if (data.access) {
          // Guardar el token y datos del usuario
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
    setSuccessMessage('');

    // Validación de contraseña mínima
    if (registerData.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres');
    }

    if (registerData.password !== registerData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/accounts/register/', registerData);

      if (data.access) {
        // Mostrar mensaje de éxito
        setSuccessMessage('🎉 ¡Registro exitoso! Ya puedes iniciar sesión con tu nueva cuenta.');
        
        // Cambiar a la pestaña de login después de un breve delay
        setTimeout(() => {
          setActiveTab('login');
          setSuccessMessage(''); // Limpiar mensaje después del cambio
        }, 3000);
        
        // Limpiar formulario de registro
        setRegisterData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirmPassword: '',
          rol: 'usuario',
        });
        
        // Resetear estados de contraseñas
        setShowRegisterPassword(false);
        setShowConfirmPassword(false);
        
        // Limpiar indicador de fortaleza
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

  // Manejar cambio en contraseña de registro
  const handleRegisterPasswordChange = (e) => {
    const newPassword = e.target.value;
    setRegisterData({ ...registerData, password: newPassword });
    
    // Evaluar fortaleza en tiempo real
    const strength = evaluatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  return (
    <div className="login-container">
      <h2 className="login-title">
        {activeTab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </h2>
      
      {/* Mensaje de error */}
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

      {/* Mensaje de éxito */}
      {successMessage && (
        <div style={{
          backgroundColor: '#dcfce7',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#059669',
          fontSize: '0.9rem',
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease-in'
        }}>
          {successMessage}
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
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="Ingresa tu contraseña"
                required
                disabled={isLoading}
                style={{ paddingRight: '45px' }}
              />
            </div>
            <div className="checkbox-container" style={{ marginTop: '8px' }}>
              <input
                type="checkbox"
                checked={showPassword}
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
            <div style={{ position: 'relative' }}>
              <input
                type={showRegisterPassword ? 'text' : 'password'}
                value={registerData.password}
                onChange={handleRegisterPasswordChange}
                placeholder="Ingresa tu contraseña"
                required
                minLength="8"
                disabled={isLoading}
                style={{
                  borderColor: registerData.password.length > 0 ? passwordStrength.color : '#ddd',
                  borderWidth: '2px',
                  paddingRight: '45px'
                }}
              />
            </div>
            <div className="checkbox-container" style={{ marginTop: '8px' }}>
              <input
                type="checkbox"
                checked={showRegisterPassword}
                onChange={() => setShowRegisterPassword(!showRegisterPassword)}
                disabled={isLoading}
              /> Mostrar contraseña
            </div>

            {/* Indicador de fortaleza de contraseña */}
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
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                placeholder="Confirma tu contraseña"
                required
                disabled={isLoading}
                style={{
                  borderColor: registerData.confirmPassword.length > 0 
                    ? (registerData.password === registerData.confirmPassword ? '#10b981' : '#ef4444')
                    : '#ddd',
                  borderWidth: '2px',
                  paddingRight: '45px'
                }}
              />
            </div>
            <div className="checkbox-container" style={{ marginTop: '8px' }}>
              <input
                type="checkbox"
                checked={showConfirmPassword}
                onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              /> Mostrar contraseña
            </div>

            {/* Indicador de coincidencia de contraseñas */}
            {registerData.confirmPassword.length > 0 && (
              <div style={{ 
                marginTop: '8px',
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