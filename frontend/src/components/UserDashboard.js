import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";

function SimplifiedDashboard() {
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

  const updateProfile = async (e) => {
    e.preventDefault();
    setProfileForm(prev => ({ ...prev, loading: true, error: '', success: false }));

    try {
      const response = await apiCall('http://localhost:8000/accounts/api/auth/profile/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
              <h2 style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>📋 Historial</h2>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Revisa tu actividad reciente y navegación anterior
              </p>
            </div>
            <div className="empty-state" style={{
              backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
              borderColor: darkMode ? '#334155' : '#cbd5e1'
            }}>
              <div className="empty-icon">🕐</div>
              <h3 style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>Historial vacío</h3>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Tu historial de actividad se mostrará aquí conforme uses la aplicación
              </p>
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
    <div className="dashboard" style={{
      backgroundColor: darkMode ? '#0f172a' : '#f1f5f9'
    }}>
      {/* Sidebar */}
      <div id="sidebar" className="sidebar" style={{
        background: darkMode 
          ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(180deg, #1e293b 0%, #334155 100%)'
      }}>
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
      <main className="main-content" style={{
        backgroundColor: darkMode ? '#020617' : '#f8fafc'
      }}>
        {renderContent()}
      </main>

      <style>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
        }

        .sidebar {
          width: 280px;
          color: #f1f5f9;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 1000;
          transition: transform 0.3s ease;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
        }

        .sidebar.closed {
          transform: translateX(-100%);
        }

        .header {
          padding: 28px 24px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.05);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo {
          padding: 8px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .company-name {
          font-size: 14px;
          font-weight: 600;
          color: #f8fafc;
          line-height: 1.2;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .menu {
          flex: 1;
          padding: 24px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 24px;
          background: none;
          border: none;
          color: #cbd5e1;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
          border-radius: 0 25px 25px 0;
          margin-right: 16px;
        }

        .menu-item:hover:not(.active) {
          background-color: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          transform: translateX(4px);
        }

        .menu-item.active {
          background-color: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          font-weight: 600;
          transform: translateX(8px);
          box-shadow: inset 3px 0 0 #3b82f6;
        }

        .logout-btn {
          margin-top: auto;
          color: #f87171 !important;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
          margin-top: 20px;
          padding-top: 20px;
          margin-right: 0;
          border-radius: 0;
        }

        .logout-btn:hover {
          background-color: rgba(248, 113, 113, 0.15) !important;
          color: #fca5a5 !important;
        }

        .menu-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        .toggle-btn {
          position: fixed;
          top: 24px;
          left: 300px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          cursor: pointer;
          z-index: 999;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .toggle-btn:hover {
          transform: scale(1.05);
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 40px;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
        }

        .dashboard:has(.sidebar.closed) .main-content {
          margin-left: 0;
        }

        .dashboard:has(.sidebar.closed) .toggle-btn {
          left: 20px;
        }

        .content-section {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          margin: 40px;
          flex: 1;
        }

        .content-header {
          margin-bottom: 32px;
        }

        .content-header h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .content-header p {
          font-size: 15px;
          color: #64748b;
        }

        .empty-state {
          text-align: center;
          padding: 60px 30px;
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          background: #f8fafc;
        }

        .empty-icon {
          font-size: 42px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .empty-state p {
          font-size: 14px;
          color: #64748b;
        }

        .profile-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-card {
          border-radius: 16px;
          padding: 32px;
          border: 1px solid #e2e8f0;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
        }

        .avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #3b82f6;
          flex-shrink: 0;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info h3 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .profile-badge {
          background: #3b82f6;
          color: white;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-group label {
          font-size: 14px;
          font-weight: 600;
          color: #475569;
        }

        .field-group input {
          padding: 14px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: white;
        }

        .field-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .read-only-value {
          padding: 14px;
          background: #f1f5f9;
          border-radius: 10px;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 2px solid #e2e8f0;
        }

        .read-only-note {
          font-size: 12px;
          color: #64748b;
          font-style: italic;
        }

        .verified-badge {
          color: #22c55e;
          font-weight: bold;
          font-size: 12px;
        }

        .save-btn {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.3s ease;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-container,
        .error-container {
          text-align: center;
          padding: 60px 30px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          margin: 0 auto 16px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-content h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #ef4444;
        }

        .retry-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          margin-top: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .retry-btn:hover {
          background: #2563eb;
        }

        .config-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .config-section {
          background: ${darkMode ? '#0f172a' : 'white'};
          border: 1px solid ${darkMode ? '#334155' : '#e2e8f0'};
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
        }

        .config-section h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 24px;
          color: ${darkMode ? '#f1f5f9' : '#1e293b'};
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .success-message {
          background: #dcfce7;
          color: #166534;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #bbf7d0;
          font-weight: 500;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
          font-weight: 500;
        }

        /* Dark mode adjustments for forms */
        ${darkMode ? `
          .field-group input {
            background: #1e293b;
            border-color: #475569;
            color: #f1f5f9;
          }
          
          .field-group input:focus {
            border-color: #3b82f6;
            background: #1e293b;
          }
          
          .field-group label {
            color: #cbd5e1;
          }
          
          .read-only-value {
            background: #1e293b;
            border-color: #475569;
            color: #f1f5f9;
          }
          
          .read-only-note {
            color: #94a3b8;
          }
        ` : ''}

        /* Responsive design */
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            transform: translateX(-100%);
          }
          
          .main-content {
            margin-left: 0;
            padding: 20px;
          }
          
          .toggle-btn {
            left: 20px;
          }
          
          .content-section {
            margin: 0;
            padding: 20px;
          }
          
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
        }

        /* Main content margin adjustment */
        .main-content {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
}

export default SimplifiedDashboard;