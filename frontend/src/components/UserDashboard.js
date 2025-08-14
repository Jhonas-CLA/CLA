import React, { useState, useEffect } from 'react';

function SimplifiedDashboard() {
  const [activeSection, setActiveSection] = useState('favoritos');
  const [userProfile, setUserProfile] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    loading: true,
    error: null
  });

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!token) {
        setUserProfile(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'No se encontró token de autenticación' 
        }));
        return;
      }

      // Intentar primero con endpoint de perfil, si no existe usar email del localStorage
      const response = await fetch('http://localhost:8000/accounts/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          email: data.email || userEmail || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          loading: false,
          error: null
        });
      } else {
        // Si no hay endpoint de perfil, usar datos del localStorage
        setUserProfile({
          email: userEmail || '',
          first_name: 'Usuario',
          last_name: '',
          phone: '',
          loading: false,
          error: null
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Fallback: usar email del localStorage si hay error
      const userEmail = localStorage.getItem('userEmail');
      setUserProfile({
        email: userEmail || '',
        first_name: 'Usuario',
        last_name: '',
        phone: '',
        loading: false,
        error: null
      });
    }
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    sidebar.classList.toggle('closed');
    
    // Mover el botón según el estado del sidebar
    if (sidebar.classList.contains('closed')) {
      toggleBtn.style.left = '20px';
    } else {
      toggleBtn.style.left = '300px';
    }
  };

  const setActive = (target, section) => {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    target.classList.add('active');
    setActiveSection(section);
  };

  const logout = () => {
    if (window.confirm('¿Estás seguro de que quieres salir?')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  // useEffect para cargar el perfil cuando se selecciona la sección
  useEffect(() => {
    if (activeSection === 'perfil') {
      fetchUserProfile();
    }
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'favoritos':
        return (
          <div className="content-section">
            <h2>Favoritos</h2>
            <p>Aquí se mostrarán tus elementos favoritos</p>
          </div>
        );
      case 'historial':
        return (
          <div className="content-section">
            <h2>Historial</h2>
            <p>Aquí se mostrará tu historial de actividad</p>
          </div>
        );
      case 'perfil':
        return (
          <div className="content-section">
            <h2>Perfil de Usuario</h2>
            {userProfile.loading ? (
              <div style={loadingStyles}>
                <div style={spinnerStyles}></div>
                <span>Cargando perfil...</span>
              </div>
            ) : userProfile.error ? (
              <div style={errorStyles}>
                <h3>Error</h3>
                <p>{userProfile.error}</p>
                <button onClick={fetchUserProfile} style={retryBtnStyles}>
                  Reintentar
                </button>
              </div>
            ) : (
              <div style={profileContainerStyles}>
                <div style={profileCardStyles}>
                  <div style={profileHeaderStyles}>
                    <div style={avatarStyles}>
                      {userProfile.first_name?.charAt(0)}{userProfile.last_name?.charAt(0)}
                    </div>
                    <div style={profileInfoStyles}>
                      <h3 style={profileNameStyles}>
                        {userProfile.first_name} {userProfile.last_name}
                      </h3>
                      <p style={profileEmailStyles}>{userProfile.email}</p>
                    </div>
                  </div>
                  
                  <div style={profileDetailsStyles}>
                    <div style={fieldGroupStyles}>
                      <label style={labelStyles}>Email:</label>
                      <span style={valueStyles}>{userProfile.email}</span>
                    </div>
                    
                    <div style={fieldGroupStyles}>
                      <label style={labelStyles}>Nombre:</label>
                      <span style={valueStyles}>{userProfile.first_name}</span>
                    </div>
                    
                    <div style={fieldGroupStyles}>
                      <label style={labelStyles}>Apellido:</label>
                      <span style={valueStyles}>{userProfile.last_name}</span>
                    </div>
                    
                    <div style={fieldGroupStyles}>
                      <label style={labelStyles}>Teléfono:</label>
                      <span style={valueStyles}>{userProfile.phone || 'No especificado'}</span>
                    </div>
                  </div>
                  
                  <div style={profileActionsStyles}>
                    <button style={editBtnStyles} onClick={() => alert('Función de editar en desarrollo')}>
                      ✏️ Editar Perfil
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="content-section">
            <h2>Favoritos</h2>
            <p>Aquí se mostrarán tus elementos favoritos</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard" style={dashboardStyles}>
      {/* Sidebar */}
      <div id="sidebar" style={sidebarStyles}>
        <div style={headerStyles}>
          <div style={logoSectionStyles}>
            <div style={logoStyles}>⚡</div>
            <div style={companyNameStyles}>
              Eléctricos &<br />Soluciones
            </div>
          </div>
          <button style={closeBtnStyles} onClick={toggleSidebar}>✕</button>
        </div>

        <nav style={menuStyles}>
          <button 
            className={`menu-item ${activeSection === 'favoritos' ? 'active' : ''}`}
            style={{...menuItemStyles, ...(activeSection === 'favoritos' ? activeMenuItemStyles : {})}}
            onClick={(e) => setActive(e.target, 'favoritos')}
          >
            <div style={menuIconStyles}>⭐</div>
            <span>Favoritos</span>
          </button>
          
          <button 
            className={`menu-item ${activeSection === 'historial' ? 'active' : ''}`}
            style={{...menuItemStyles, ...(activeSection === 'historial' ? activeMenuItemStyles : {})}}
            onClick={(e) => setActive(e.target, 'historial')}
          >
            <div style={menuIconStyles}>📋</div>
            <span>Historial</span>
          </button>
          
          <button 
            className={`menu-item ${activeSection === 'perfil' ? 'active' : ''}`}
            style={{...menuItemStyles, ...(activeSection === 'perfil' ? activeMenuItemStyles : {})}}
            onClick={(e) => setActive(e.target, 'perfil')}
          >
            <div style={menuIconStyles}>👤</div>
            <span>Perfil</span>
          </button>
          
          <button
            className="menu-item logout-btn"
            style={{...menuItemStyles, ...logoutBtnStyles}}
            onClick={logout}
          >
            <div style={menuIconStyles}>🚪</div>
            <span>Salir</span>
          </button>
        </nav>
      </div>

      {/* Toggle Button */}
      <button className="toggle-btn" style={toggleBtnStyles} onClick={toggleSidebar}>☰</button>

      {/* Main Content */}
      <main style={mainContentStyles}>
        {renderContent()}
      </main>
    </div>
  );
}

// Estilos adicionales para el perfil
const loadingStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '20px',
  color: '#666',
};

const spinnerStyles = {
  width: '20px',
  height: '20px',
  border: '2px solid #f3f3f3',
  borderTop: '2px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const errorStyles = {
  padding: '20px',
  backgroundColor: '#fee2e2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  color: '#dc2626',
};

const retryBtnStyles = {
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '12px',
};

const profileContainerStyles = {
  maxWidth: '600px',
  margin: '0 auto',
};

const profileCardStyles = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '24px',
  marginTop: '16px',
};

const profileHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #e2e8f0',
};

const avatarStyles = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: '#3b82f6',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: 'bold',
};

const profileInfoStyles = {
  flex: 1,
};

const profileNameStyles = {
  margin: '0 0 4px 0',
  fontSize: '20px',
  fontWeight: '600',
  color: '#1f2937',
};

const profileEmailStyles = {
  margin: 0,
  color: '#6b7280',
  fontSize: '14px',
};

const profileDetailsStyles = {
  display: 'grid',
  gap: '16px',
  marginBottom: '24px',
};

const fieldGroupStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const labelStyles = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
};

const valueStyles = {
  fontSize: '16px',
  color: '#111827',
  padding: '8px 12px',
  backgroundColor: 'white',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
};

const profileActionsStyles = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
};

const editBtnStyles = {
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'background-color 0.2s',
};
const dashboardStyles = {
  display: 'flex',
  minHeight: '100vh',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: '#f8fafc',
  // Asegurar que estos estilos tengan prioridad
  position: 'relative',
  isolation: 'isolate',
};

const sidebarStyles = {
  width: '280px',
  backgroundColor: '#1e293b !important',
  color: '#000000 !important',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease',
  position: 'fixed',
  height: '100vh',
  left: 0,
  top: 0,
  zIndex: 998,
  // Aislar de estilos externos
  boxSizing: 'border-box',
};

const headerStyles = {
  padding: '24px 20px',
  borderBottom: '1px solid #334155',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const logoSectionStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const logoStyles = {
  fontSize: '28px',
  fontWeight: 'bold',
};

const companyNameStyles = {
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.3',
  color: '#000000',
};

const closeBtnStyles = {
  background: 'none',
  border: 'none',
  color: '#000000',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  transition: 'color 0.2s',
};

const menuStyles = {
  flex: 1,
  padding: '20px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const menuItemStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 20px',
  background: 'none',
  border: 'none',
  color: '#000000',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'left',
  width: '100%',
};

const activeMenuItemStyles = {
  backgroundColor: '#3b82f6',
  color: '#000000',
};

const logoutBtnStyles = {
  marginTop: 'auto',
  color: '#000000',
  borderTop: '1px solid #334155',
  marginTop: '20px',
  paddingTop: '20px',
};

const menuIconStyles = {
  fontSize: '16px',
  width: '20px',
  textAlign: 'center',
};

const toggleBtnStyles = {
  position: 'fixed',
  top: '20px',
  left: '300px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  padding: '12px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  zIndex: 1001,
  transition: 'left 0.3s ease',
};

const mainContentStyles = {
  flex: 1,
  marginLeft: '280px',
  padding: '40px',
  transition: 'margin-left 0.3s ease',
};

// Agregar estilos CSS para el comportamiento del sidebar cerrado
const sidebarClosedStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .dashboard #sidebar.closed {
    transform: translateX(-100%) !important;
  }
  
  .dashboard #sidebar.closed + .toggle-btn {
    left: 20px !important;
  }
  
  .dashboard .main-content {
    margin-left: 280px !important;
    transition: margin-left 0.3s ease !important;
  }
  
  .dashboard:has(#sidebar.closed) .main-content {
    margin-left: 0 !important;
  }
  
  .dashboard .menu-item:hover:not(.active) {
    background-color: #334155 !important;
    color: #000000 !important;
  }
  
  .dashboard .logout-btn:hover {
    background-color: #7f1d1d !important;
    color: #000000 !important;
  }
  
  .dashboard .close-btn:hover {
    color: #000000 !important;
  }
  
  .dashboard .content-section {
    background: white !important;
    padding: 32px !important;
    border-radius: 12px !important;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
  }
  
  .dashboard .content-section h2 {
    margin: 0 0 16px 0 !important;
    color: #000000 !important;
    font-size: 24px !important;
    font-weight: 600 !important;
  }
  
  .dashboard .content-section p {
    color: #000000 !important;
    font-size: 16px !important;
    margin: 0 !important;
    line-height: 1.6 !important;
  }
  
  @media (max-width: 768px) {
    .dashboard .sidebar {
      width: 100% !important;
      transform: translateX(-100%) !important;
    }
    
    .dashboard .main-content {
      margin-left: 0 !important;
      padding: 20px !important;
    }
    
    .dashboard .toggle-btn {
      left: 20px !important;
    }
  }
`;

// Inyectar los estilos CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = sidebarClosedStyles;
document.head.appendChild(styleSheet);

export default SimplifiedDashboard;