import React, { useState, useEffect } from 'react';

function SimplifiedDashboard() {
  const [activeSection, setActiveSection] = useState('favoritos');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [userProfile, setUserProfile] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    loading: true,
    error: null
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
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

      try {
        const response = await fetch('http://localhost:8000/accounts/profile/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          const profileData = {
            email: data.email || userEmail || '',
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            phone: data.phone || '',
            loading: false,
            error: null
          };
          setUserProfile(profileData);
          setEditForm({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            phone: data.phone || ''
          });
          return;
        }
      } catch (apiError) {
        console.log('API no disponible, usando datos del localStorage');
      }

      const fallbackData = {
        email: userEmail || '',
        firstName: '',
        lastName: '',
        phone: '',
        loading: false,
        error: null
      };
      setUserProfile(fallbackData);
      setEditForm({
        firstName: '',
        lastName: '',
        phone: ''
      });

    } catch (err) {
      console.error('Error fetching user profile:', err);
      const userEmail = localStorage.getItem('userEmail');
      const finalFallbackData = {
        email: userEmail || '',
        firstName: '',
        lastName: '',
        phone: '',
        loading: false,
        error: null
      };
      
      setUserProfile(finalFallbackData);
      setEditForm({
        firstName: '',
        lastName: '',
        phone: ''
      });
    }
  };

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUserProfile(prev => ({ 
          ...prev, 
          error: 'No se encontró token de autenticación' 
        }));
        return;
      }

      const response = await fetch('http://localhost:8000/accounts/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          phone: editForm.phone
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(prev => ({
          ...prev,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          phone: data.phone || '',
        }));
        setIsEditing(false);
        alert('Perfil actualizado correctamente');
      } else {
        throw new Error('Error al actualizar el perfil');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setUserProfile(prev => ({
        ...prev,
        error: 'Error al actualizar el perfil'
      }));
    }
  };

  const cancelEdit = () => {
    setEditForm({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      phone: userProfile.phone
    });
    setIsEditing(false);
  };

  const startEdit = () => {
    setEditForm({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      phone: userProfile.phone
    });
    setIsEditing(true);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    sidebar.classList.toggle('closed');
    
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

  useEffect(() => {
    if (activeSection === 'perfil') {
      fetchUserProfile();
    }
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'favoritos':
        return (
          <div className="content-section" style={{
            backgroundColor: darkMode ? '#1e293b' : 'white',
            color: darkMode ? '#f1f5f9' : '#1e293b'
          }}>
            <div style={contentHeaderStyles}>
              <h2 style={{
                ...contentTitleStyles,
                color: darkMode ? '#f1f5f9' : '#1e293b'
              }}>⭐ Favoritos</h2>
              <p style={{
                ...contentDescriptionStyles,
                color: darkMode ? '#94a3b8' : '#64748b'
              }}>Administra y accede rápidamente a tus elementos favoritos</p>
            </div>
            <div style={{
              ...emptyStateStyles,
              backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
              borderColor: darkMode ? '#334155' : '#cbd5e1'
            }}>
              <div style={emptyIconStyles}>💫</div>
              <h3 style={{
                ...emptyTitleStyles,
                color: darkMode ? '#cbd5e1' : '#475569'
              }}>Aún no tienes favoritos</h3>
              <p style={{
                ...emptyDescStyles,
                color: darkMode ? '#94a3b8' : '#64748b'
              }}>Los elementos que marques como favoritos aparecerán aquí</p>
            </div>
          </div>
        );
      case 'historial':
        return (
          <div className="content-section" style={{
            backgroundColor: darkMode ? '#1e293b' : 'white',
            color: darkMode ? '#f1f5f9' : '#1e293b'
          }}>
            <div style={contentHeaderStyles}>
              <h2 style={{
                ...contentTitleStyles,
                color: darkMode ? '#f1f5f9' : '#1e293b'
              }}>📋 Historial</h2>
              <p style={{
                ...contentDescriptionStyles,
                color: darkMode ? '#94a3b8' : '#64748b'
              }}>Revisa tu actividad reciente y navegación anterior</p>
            </div>
            <div style={{
              ...emptyStateStyles,
              backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
              borderColor: darkMode ? '#334155' : '#cbd5e1'
            }}>
              <div style={emptyIconStyles}>🕐</div>
              <h3 style={{
                ...emptyTitleStyles,
                color: darkMode ? '#cbd5e1' : '#475569'
              }}>Historial vacío</h3>
              <p style={{
                ...emptyDescStyles,
                color: darkMode ? '#94a3b8' : '#64748b'
              }}>Tu historial de actividad se mostrará aquí conforme uses la aplicación</p>
            </div>
          </div>
        );
      case 'configuracion':
        return (
          <div className="content-section" style={{
            backgroundColor: darkMode ? '#1e293b' : 'white',
            color: darkMode ? '#f1f5f9' : '#1e293b'
          }}>
            <div style={contentHeaderStyles}>
              <h2 style={{
                ...contentTitleStyles,
                color: darkMode ? '#f1f5f9' : '#1e293b'
              }}>⚙️ Configuración</h2>
              <p style={{
                ...contentDescriptionStyles,
                color: darkMode ? '#94a3b8' : '#64748b'
              }}>Personaliza tu experiencia y ajustes de la aplicación</p>
            </div>
            <div style={configContainerStyles}>
              <div style={{
                ...configSectionStyles,
                backgroundColor: darkMode ? '#0f172a' : 'white',
                borderColor: darkMode ? '#334155' : '#e2e8f0'
              }}>
                <h3 style={{
                  ...configSectionTitleStyles,
                  color: darkMode ? '#f1f5f9' : '#1e293b'
                }}>🎨 Apariencia</h3>
                <div style={configItemStyles}>
                  <div style={configItemInfoStyles}>
                    <div style={{
                      ...configItemTitleStyles,
                      color: darkMode ? '#e2e8f0' : '#374151'
                    }}>
                      {darkMode ? '🌙' : '☀️'} Modo {darkMode ? 'Oscuro' : 'Claro'}
                    </div>
                    <div style={{
                      ...configItemDescStyles,
                      color: darkMode ? '#94a3b8' : '#6b7280'
                    }}>
                      Cambia entre el tema claro y oscuro de la aplicación
                    </div>
                  </div>
                  <div style={toggleContainerStyles} onClick={toggleDarkMode}>
                    <div style={{
                      ...toggleStyles,
                      backgroundColor: darkMode ? '#10b981' : '#e5e7eb'
                    }}>
                      <div style={{
                        ...toggleBallStyles,
                        transform: darkMode ? 'translateX(24px)' : 'translateX(2px)'
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'perfil':
        return (
          <div className="content-section" style={{
            backgroundColor: darkMode ? '#1e293b' : 'white',
            color: darkMode ? '#f1f5f9' : '#1e293b'
          }}>
            <div style={contentHeaderStyles}>
              <h2 style={{
                ...contentTitleStyles,
                color: darkMode ? '#f1f5f9' : '#1e293b'
              }}>👤 Perfil de Usuario</h2>
              <p style={{
                ...contentDescriptionStyles,
                color: darkMode ? '#94a3b8' : '#64748b'
              }}>Gestiona tu información personal y configuración de cuenta</p>
            </div>
            {userProfile.loading ? (
              <div style={loadingStyles}>
                <div style={spinnerStyles}></div>
                <span>Cargando perfil...</span>
              </div>
            ) : userProfile.error ? (
              <div style={errorStyles}>
                <div style={errorIconStyles}>⚠️</div>
                <h3 style={errorTitleStyles}>Error al cargar perfil</h3>
                <p style={errorMessageStyles}>{userProfile.error}</p>
                <button onClick={fetchUserProfile} style={retryBtnStyles}>
                  🔄 Reintentar
                </button>
              </div>
            ) : (
              <div style={profileContainerStyles}>
                <div style={{
                  ...profileCardStyles,
                  backgroundColor: darkMode ? '#0f172a' : 'white',
                  borderColor: darkMode ? '#334155' : '#e2e8f0'
                }}>
                  <div style={{
                    ...profileHeaderStyles,
                    borderBottomColor: darkMode ? '#334155' : '#f1f5f9'
                  }}>
                    <div style={avatarStyles}>
                      <img 
                        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" 
                        alt="Avatar del usuario" 
                        style={avatarImageStyles}
                      />
                    </div>
                    <div style={profileInfoStyles}>
                      <h3 style={{
                        ...profileNameStyles,
                        color: darkMode ? '#f1f5f9' : '#1e293b'
                      }}>
                        {userProfile.firstName || userProfile.lastName ? 
                          `${userProfile.firstName} ${userProfile.lastName}`.trim() : 
                          'Usuario'
                        }
                      </h3>
                      <span style={profileBadgeStyles}>Usuario activo</span>
                    </div>
                  </div>
                  
                  <div style={profileDetailsStyles}>
                    <div style={fieldGroupStyles}>
                      <label style={{
                        ...labelStyles,
                        color: darkMode ? '#e2e8f0' : '#374151'
                      }}>📧 Correo electrónico</label>
                      <div style={{
                        ...readOnlyValueStyles,
                        backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                        borderColor: darkMode ? '#475569' : '#e2e8f0',
                        color: darkMode ? '#f1f5f9' : '#1f2937'
                      }}>
                        {userProfile.email}
                        <span style={verifiedBadgeStyles}>✓ Verificado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="content-section" style={{
            backgroundColor: darkMode ? '#1e293b' : 'white',
            color: darkMode ? '#f1f5f9' : '#1e293b'
          }}>
            <div style={contentHeaderStyles}>
              <h2 style={{
                ...contentTitleStyles,
                color: darkMode ? '#f1f5f9' : '#1e293b'
              }}>⭐ Favoritos</h2>
              <p style={{
                ...contentDescriptionStyles,
                color: darkMode ? '#94a3b8' : '#64748b'
              }}>Administra y accede rápidamente a tus elementos favoritos</p>
            </div>
            <div style={{
              ...emptyStateStyles,
              backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
              borderColor: darkMode ? '#334155' : '#cbd5e1'
            }}>
              <div style={emptyIconStyles}>💫</div>
              <h3 style={{
                ...emptyTitleStyles,
                color: darkMode ? '#cbd5e1' : '#475569'
              }}>Aún no tienes favoritos</h3>
              <p style={{
                ...emptyDescStyles,
                color: darkMode ? '#94a3b8' : '#64748b'
              }}>Los elementos que marques como favoritos aparecerán aquí</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard" style={{
      ...dashboardStyles,
      backgroundColor: darkMode ? '#0f172a' : '#f1f5f9'
    }}>
      <div id="sidebar" style={{
        ...sidebarStyles,
        background: darkMode 
          ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(180deg, #1e293b 0%, #334155 100%)'
      }}>
        <div style={headerStyles}>
          <div style={logoSectionStyles}>
            <div style={logoStyles}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3L4 14H11L10.5 18.5L19.5 7H12.5L13 3Z"/>
              </svg>
            </div>
            <div style={companyNameStyles}>
              <span style={companyMainStyles}>Eléctricos &</span>
              <span style={companySubStyles}>Soluciones</span>
            </div>
          </div>
          <button style={closeBtnStyles} onClick={toggleSidebar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
            </svg>
          </button>
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
            className={`menu-item ${activeSection === 'configuracion' ? 'active' : ''}`}
            style={{...menuItemStyles, ...(activeSection === 'configuracion' ? activeMenuItemStyles : {})}}
            onClick={(e) => setActive(e.target, 'configuracion')}
          >
            <div style={menuIconStyles}>⚙️</div>
            <span>Configuración</span>
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

      <button className="toggle-btn" style={toggleBtnStyles} onClick={toggleSidebar}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H21V18H3V16Z"/>
        </svg>
      </button>

      <main style={{
        ...mainContentStyles,
        backgroundColor: darkMode ? '#020617' : '#f8fafc'
      }}>
        {renderContent()}
      </main>
    </div>
  );
}

// Estilos para el contenido
const contentHeaderStyles = {
  marginBottom: '32px',
  borderBottom: '2px solid #e2e8f0',
  paddingBottom: '20px',
};

// Estilos para configuración
const configContainerStyles = {
  maxWidth: '700px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const configSectionStyles = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const configSectionTitleStyles = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 16px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const configItemStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 0',
  borderBottom: '1px solid #f1f5f9',
};

const configItemInfoStyles = {
  flex: 1,
};

const configItemTitleStyles = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#374151',
  margin: '0 0 4px 0',
};

const configItemDescStyles = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const toggleContainerStyles = {
  cursor: 'pointer',
};

const toggleStyles = {
  width: '48px',
  height: '24px',
  borderRadius: '12px',
  position: 'relative',
  transition: 'background-color 0.2s',
  cursor: 'pointer',
};

const toggleBallStyles = {
  width: '20px',
  height: '20px',
  backgroundColor: 'white',
  borderRadius: '50%',
  position: 'absolute',
  top: '2px',
  transition: 'transform 0.2s',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
};

const contentTitleStyles = {
  margin: '0 0 8px 0',
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: '700',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const contentDescriptionStyles = {
  color: '#64748b',
  fontSize: '16px',
  margin: '0',
  fontWeight: '400',
};

const emptyStateStyles = {
  textAlign: 'center',
  padding: '60px 20px',
  backgroundColor: '#f8fafc',
  borderRadius: '16px',
  border: '2px dashed #cbd5e1',
};

const emptyIconStyles = {
  fontSize: '48px',
  marginBottom: '16px',
  opacity: '0.7',
};

const emptyTitleStyles = {
  color: '#475569',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const emptyDescStyles = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
};

// Estilos para el perfil
const loadingStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  padding: '40px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  color: '#64748b',
  fontSize: '16px',
  fontWeight: '500',
};

const spinnerStyles = {
  width: '24px',
  height: '24px',
  border: '3px solid #e2e8f0',
  borderTop: '3px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const errorStyles = {
  padding: '40px',
  backgroundColor: '#fef2f2',
  border: '2px solid #fecaca',
  borderRadius: '16px',
  textAlign: 'center',
};

const errorIconStyles = {
  fontSize: '48px',
  marginBottom: '16px',
};

const errorTitleStyles = {
  color: '#dc2626',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const errorMessageStyles = {
  color: '#991b1b',
  fontSize: '14px',
  margin: '0 0 24px 0',
};

const retryBtnStyles = {
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
};

const profileContainerStyles = {
  maxWidth: '700px',
  margin: '0 auto',
};

const profileCardStyles = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '32px',
  marginTop: '16px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  position: 'relative',
  overflow: 'hidden',
};

const profileHeaderStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '32px',
  paddingBottom: '20px',
  borderBottom: '2px solid #f1f5f9',
  position: 'relative',
};

const avatarStyles = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  fontWeight: '700',
  boxShadow: '0 8px 25px -5px rgba(59, 130, 246, 0.4)',
  border: '3px solid white',
  textTransform: 'uppercase',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  overflow: 'hidden',
  position: 'relative',
};

const avatarImageStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '50%',
};

const profileInfoStyles = {
  flex: 1,
};

const profileNameStyles = {
  margin: '0 0 8px 0',
  fontSize: '22px',
  fontWeight: '700',
  color: '#1e293b',
};

const profileBadgeStyles = {
  display: 'inline-block',
  backgroundColor: '#dcfce7',
  color: '#166534',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  border: '1px solid #bbf7d0',
};

const profileDetailsStyles = {
  display: 'grid',
  gap: '24px',
};

const fieldGroupStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const labelStyles = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const readOnlyValueStyles = {
  fontSize: '16px',
  color: '#1f2937',
  padding: '16px 20px',
  backgroundColor: '#f8fafc',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  fontWeight: '500',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const verifiedBadgeStyles = {
  backgroundColor: '#dcfce7',
  color: '#166534',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '600',
  border: '1px solid #bbf7d0',
};

const profileActionsStyles = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  marginTop: '24px',
  paddingTop: '20px',
  borderTop: '1px solid #e2e8f0',
};

const editBtnStyles = {
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
};

const saveBtnStyles = {
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
};

const cancelBtnStyles = {
  backgroundColor: '#6b7280',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(107, 114, 128, 0.2)',
};

const editInputStyles = {
  fontSize: '16px',
  color: '#1f2937',
  padding: '16px 20px',
  backgroundColor: 'white',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  fontWeight: '500',
  outline: 'none',
  transition: 'border-color 0.2s',
  width: '100%',
  boxSizing: 'border-box',
};

// Estilos principales
const dashboardStyles = {
  display: 'flex',
  minHeight: '100vh',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
  backgroundColor: '#f1f5f9',
  position: 'relative',
  isolation: 'isolate',
};

const sidebarStyles = {
  width: '280px',
  background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
  color: '#f1f5f9',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'fixed',
  height: '100vh',
  left: 0,
  top: 0,
  zIndex: 1000,
  boxSizing: 'border-box',
  boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
};

const headerStyles = {
  padding: '28px 24px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
};

const logoSectionStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const logoStyles = {
  padding: '8px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
};

const companyNameStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const companyMainStyles = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#f8fafc',
  lineHeight: '1.2',
};

const companySubStyles = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#cbd5e1',
  lineHeight: '1.2',
};

const closeBtnStyles = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  color: '#cbd5e1',
  fontSize: '16px',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '8px',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const menuStyles = {
  flex: 1,
  padding: '24px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const menuItemStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '14px 24px',
  background: 'none',
  border: 'none',
  color: '#cbd5e1',
  fontSize: '15px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  textAlign: 'left',
  width: '100%',
  borderRadius: '0 25px 25px 0',
  marginRight: '16px',
  position: 'relative',
};

const activeMenuItemStyles = {
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  color: '#60a5fa',
  fontWeight: '600',
  transform: 'translateX(8px)',
  boxShadow: 'inset 3px 0 0 #3b82f6',
};

const logoutBtnStyles = {
  marginTop: 'auto',
  color: '#f87171',
  borderTop: '1px solid rgba(148, 163, 184, 0.2)',
  marginTop: '20px',
  paddingTop: '20px',
  marginRight: '0',
  borderRadius: '0',
};

const menuIconStyles = {
  fontSize: '18px',
  width: '24px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const toggleBtnStyles = {
  position: 'fixed',
  top: '24px',
  left: '300px',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  color: 'white',
  border: 'none',
  padding: '14px',
  borderRadius: '12px',
  cursor: 'pointer',
  fontSize: '16px',
  zIndex: 999,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const mainContentStyles = {
  flex: 1,
  marginLeft: '280px',
  padding: '40px',
  transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
};

// CSS mejorado
const enhancedStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dashboard #sidebar.closed {
    transform: translateX(-100%) !important;
  }
  
  .dashboard #sidebar.closed + .toggle-btn {
    left: 20px !important;
  }
  
  .dashboard .main-content {
    margin-left: 280px !important;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .dashboard:has(#sidebar.closed) .main-content {
    margin-left: 0 !important;
  }
  
  .dashboard .menu-item:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.08) !important;
    color: #f1f5f9 !important;
    transform: translateX(4px) !important;
  }
  
  .dashboard .logout-btn:hover {
    background-color: rgba(248, 113, 113, 0.15) !important;
    color: #fca5a5 !important;
    transform: translateX(4px) !important;
  }
  
  .dashboard .close-btn:hover {
    background-color: rgba(255, 255, 255, 0.2) !important;
    color: #f1f5f9 !important;
    transform: scale(1.1) !important;
  }
  
  .dashboard .toggle-btn:hover {
    transform: scale(1.05) !important;
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
  }
  
  .dashboard .content-section {
    background: white !important;
    padding: 40px !important;
    border-radius: 20px !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    border: 1px solid #e2e8f0 !important;
    animation: fadeIn 0.5s ease-out !important;
    position: relative !important;
    overflow: hidden !important;
  }
  
  .dashboard .content-section::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 4px !important;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899) !important;
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

// Inyectar los estilos CSS mejorados
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = enhancedStyles;
  document.head.appendChild(styleSheet);
}

export default SimplifiedDashboard;