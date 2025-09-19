import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import './UserDashboard.css';

function UserDashboard() {
  const [activeSection, setActiveSection] = useState('favoritos');
  const [darkMode, setDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    email_verified: false,
    loading: true,
    error: null
  });

  // ✅ Estados para pedidos
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [errorPedidos, setErrorPedidos] = useState(null);

  // Estados para formularios
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    loading: false,
    success: false,
    error: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
    loading: false,
    success: false,
    error: ''
  });

  // Contexto de autenticación real
  const { user, token, apiCall, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres salir?')) {
      logout();
      navigate("/");
    }
  };

  const fetchUserProfile = async () => {
    if (!token) {
      setUserProfile(prev => ({ ...prev, loading: false, error: 'No estás autenticado' }));
      return;
    }

    setUserProfile(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall('http://localhost:8000/accounts/api/auth/profile/');
      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone || '',
          email_verified: data.email_verified ?? false,
          loading: false,
          error: null
        });
        
        // Actualizar formulario de perfil
        setProfileForm(prev => ({
          ...prev,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || ''
        }));
      } else {
        setUserProfile(prev => ({ ...prev, loading: false, error: 'No se pudo cargar perfil' }));
      }
    } catch (err) {
      console.error(err);
      setUserProfile(prev => ({ ...prev, loading: false, error: 'Error al cargar perfil' }));
    }
  };

  // ✅ Traer pedidos del usuario
  const fetchPedidosUsuario = async () => {
    if (!token) return;
    setLoadingPedidos(true);
    setErrorPedidos(null);

    try {
      const response = await apiCall('http://localhost:8000/api/pedidos/mis-pedidos/');
      if (response.ok) {
        const data = await response.json();
        setPedidos(data.pedidos || []);
      } else {
        setErrorPedidos('No se pudieron cargar los pedidos');
      }
    } catch (err) {
      setErrorPedidos('Error de conexión');
    } finally {
      setLoadingPedidos(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setProfileForm(prev => ({ ...prev, loading: true, error: '', success: false }));

    try {
      const response = await apiCall('http://localhost:8000/accounts/api/auth/profile/update/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          phone: profileForm.phone
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfileForm(prev => ({ ...prev, loading: false, success: true }));
        // Actualizar el perfil mostrado
        setUserProfile(prev => ({
          ...prev,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          phone: data.user.phone
        }));
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setProfileForm(prev => ({ ...prev, success: false }));
        }, 3000);
      } else {
        setProfileForm(prev => ({ 
          ...prev, 
          loading: false, 
          error: data.error || 'Error al actualizar perfil' 
        }));
      }
    } catch (err) {
      setProfileForm(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error de conexión' 
      }));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordForm(prev => ({ ...prev, loading: true, error: '', success: false }));

    try {
      const response = await apiCall('http://localhost:8000/accounts/api/auth/change-password/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
          confirm_password: passwordForm.confirm_password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: '',
          loading: false,
          success: true,
          error: ''
        });
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setPasswordForm(prev => ({ ...prev, success: false }));
        }, 3000);
      } else {
        setPasswordForm(prev => ({ 
          ...prev, 
          loading: false, 
          error: data.error || 'Error al cambiar contraseña' 
        }));
      }
    } catch (err) {
      setPasswordForm(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error de conexión' 
      }));
    }
  };
      
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('closed');
  };

  const setActive = (target, section) => {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    target.classList.add('active');
    setActiveSection(section);
  };

  useEffect(() => {
    if (activeSection === 'perfil') {
      fetchUserProfile();
    }
    if (activeSection === 'historial') {
      fetchPedidosUsuario();
    }
  }, [activeSection, token]);

  const renderContent = () => {
    const baseStyle = {
      backgroundColor: darkMode ? '#1e293b' : 'white',
      color: darkMode ? '#f1f5f9' : '#1e293b'
    };

    switch (activeSection) {
      case 'favoritos':
        return (
          <div className="content-section" style={baseStyle}>
            <div className="content-header">
              <h2 style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>⭐ Favoritos</h2>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Administra y accede rápidamente a tus elementos favoritos
              </p>
            </div>
            <div className="empty-state" style={{
              backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
              borderColor: darkMode ? '#334155' : '#cbd5e1'
            }}>
              <div className="empty-icon">💫</div>
              <h3 style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>Aún no tienes favoritos</h3>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Los elementos que marques como favoritos aparecerán aquí
              </p>
            </div>
          </div>
        );

      case 'historial':
        return (
          <div className="content-section" style={baseStyle}>
            <div className="content-header">
              <h2 style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>📋 Historial de Pedidos</h2>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Revisa todos tus pedidos realizados en la plataforma
              </p>
            </div>

            {loadingPedidos && <p>Cargando pedidos...</p>}
            {errorPedidos && <p style={{ color: 'red' }}>{errorPedidos}</p>}
            {!loadingPedidos && pedidos.length === 0 && (
              <div className="empty-state" style={{
                backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                borderColor: darkMode ? '#334155' : '#cbd5e1'
              }}>
                <div className="empty-icon">🕐</div>
                <h3 style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>Sin pedidos</h3>
                <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Cuando realices pedidos, aparecerán aquí
                </p>
              </div>
            )}

            <div className="pedidos-list">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className={`pedido-card ${pedido.estado}`}>
                  <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
                  <p><strong>Total:</strong> ${pedido.total}</p>
                  <p><strong>Estado:</strong> {pedido.estado}</p>
                  <div>
                    <strong>Productos:</strong>
                    <ul>
                      {pedido.productos.map((prod, idx) => (
                        <li key={idx}>
                          {prod.nombre} (x{prod.cantidad}) - ${prod.precio}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'configuracion':
        return (
          <div className="content-section" style={baseStyle}>
            <div className="content-header">
              <h2 style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>⚙️ Configuración</h2>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Administra la seguridad y preferencias de tu cuenta
              </p>
            </div>

            <div className="config-container">
              <div className="config-section">
                <h3>Cambiar Contraseña</h3>
                
                {passwordForm.success && (
                  <div className="success-message">
                    ✅ Contraseña cambiada correctamente
                  </div>
                )}
                
                {passwordForm.error && (
                  <div className="error-message">
                    ⚠️ {passwordForm.error}
                  </div>
                )}
                
                <form className="profile-form" onSubmit={changePassword}>
                  <div className="field-group">
                    <label>🔒 Contraseña actual</label>
                    <input 
                      type="password" 
                      placeholder="Ingresa tu contraseña actual"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev, 
                        current_password: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label>🔑 Nueva contraseña</label>
                    <input 
                      type="password" 
                      placeholder="Ingresa tu nueva contraseña"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev, 
                        new_password: e.target.value
                      }))}
                      minLength="6"
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label>✅ Confirmar contraseña</label>
                    <input 
                      type="password" 
                      placeholder="Repite tu nueva contraseña"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev, 
                        confirm_password: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="save-btn" 
                    disabled={passwordForm.loading}
                  >
                    {passwordForm.loading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'perfil':
        return (
          <div className="content-section" style={baseStyle}>
            <div className="content-header">
              <h2 style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>👤 Perfil de Usuario</h2>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Gestiona tu información personal y configuración de cuenta
              </p>
            </div>
            {userProfile.loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <span>Cargando perfil...</span>
              </div>
            ) : userProfile.error ? (
              <div className="error-container">
                <div className="error-content">
                  <h3>⚠️ Error al cargar perfil</h3>
                  <p>{userProfile.error}</p>
                  <button onClick={fetchUserProfile} className="retry-btn">
                    🔄 Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-container">
                <div className="profile-card" style={{
                  backgroundColor: darkMode ? '#0f172a' : 'white',
                  borderColor: darkMode ? '#334155' : '#e2e8f0'
                }}>
                  <div className="profile-header">
                    <div className="avatar">
                      <img 
                        src="https://i.postimg.cc/43rttPQt/LOGO.png" 
                        alt="Avatar del usuario"
                      />
                    </div>
                    <div className="profile-info">
                      <h3 style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                        {userProfile.firstName || userProfile.lastName ? 
                          `${userProfile.firstName} ${userProfile.lastName}`.trim() : 
                          'Usuario'
                        }
                      </h3>
                      <span className="profile-badge">Usuario activo</span>
                    </div>
                  </div>
                  
                  {profileForm.success && (
                    <div className="success-message">
                      ✅ Perfil actualizado correctamente
                    </div>
                  )}
                  
                  {profileForm.error && (
                    <div className="error-message">
                      ⚠️ {profileForm.error}
                    </div>
                  )}
                  
                  <form className="profile-details" onSubmit={updateProfile}>
                    <div className="field-group">
                      <label>📧 Correo electrónico</label>
                      <div className="read-only-value">
                        {userProfile.email}
                        <span className="read-only-note">No se puede modificar</span>
                      </div>
                    </div>

                    <div className="field-group">
                      <label>👤 Nombre</label>
                      <input 
                        type="text" 
                        placeholder="Tu nombre"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev, 
                          first_name: e.target.value
                        }))}
                      />
                    </div>

                    <div className="field-group">
                      <label>👤 Apellido</label>
                      <input 
                        type="text" 
                        placeholder="Tu apellido"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev, 
                          last_name: e.target.value
                        }))}
                      />
                    </div>

                    <div className="field-group">
                      <label>📞 Teléfono</label>
                      <input 
                        type="text" 
                        placeholder="Tu número de teléfono"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({
                          ...prev, 
                          phone: e.target.value
                        }))}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="save-btn"
                      disabled={profileForm.loading}
                    >
                      {profileForm.loading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return renderContent();
    }
  };

  return (
    <div className={`dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <div id="sidebar" className={`sidebar ${darkMode ? 'dark-mode' : ''}`}>
        <div className="header">
          <div className="logo-section">
            <div className="logo">
              <img 
                src="https://i.postimg.cc/4xQCXtjb/codigo.png"
                alt="Logo"
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
              />
            </div>
            <div className="company-name">
              Eléctricos &<br />Soluciones
            </div>
          </div>
          <button className="close-btn" onClick={toggleSidebar}>✕</button>
        </div>

        <nav className="menu">
          {[
            { key: 'favoritos', icon: '⭐', label: 'Favoritos' },
            { key: 'historial', icon: '📋', label: 'Historial' },
            { key: 'configuracion', icon: '⚙️', label: 'Configuración' },
            { key: 'perfil', icon: '👤', label: 'Perfil' }
          ].map(({ key, icon, label }) => (
            <button 
              key={key}
              className={`menu-item ${activeSection === key ? 'active' : ''}`}
              onClick={(e) => setActive(e.target, key)}
            >
              <div className="menu-icon">{icon}</div>
              <span>{label}</span>
            </button>
          ))}
          
          <button className="menu-item logout-btn" onClick={handleLogout}>
            <div className="menu-icon">🚪</div>
            <span>Salir</span>
          </button>
        </nav>
      </div>

      {/* Toggle Button */}
      <button className="toggle-btn" onClick={toggleSidebar}>☰</button>

      {/* Main Content */}
      <main className={`main-content ${darkMode ? 'dark-mode' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
}

export default UserDashboard;
