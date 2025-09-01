// frontend/src/components/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import './Dashboard.css';

/**
 * AdminDashboard (single-file) - incluye:
 * - Lista de usuarios + editar / toggle estado (usa endpoints existentes)
 * - Sección "Configuración" integrada: carga perfil del usuario actual y permite editar nombre, apellido, teléfono
 *
 * Notas:
 * - API base: http://localhost:8000 (igual que tu código)
 * - Intenta recuperar usuario actual desde localStorage key "user" (user.user_id / user_id).
 * - Si no hay user en localStorage intenta buscar en la lista de usuarios un admin (is_staff o email codigolatino).
 * - Actualiza localStorage con los cambios de perfil cuando guarda.
 *
 * Copia y pega este archivo directamente en tu proyecto (reemplaza el AdminDashboard existente).
 */

function AdminDashboard() {
  // ===== Estados generales =====
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [activeSection, setActiveSection] = useState('usuarios');

  // ===== Modal edición (lista) =====
  const [showEditModal, setShowEditModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    rol: 'usuario'
  });
  const [loadingAction, setLoadingAction] = useState(false);

  // ===== Configuración (perfil actual) =====
  const [perfil, setPerfil] = useState({
    id: null,
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    rol: ''
  });
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [savingPerfil, setSavingPerfil] = useState(false);

  // Otros
  const API = 'http://localhost:8000';
  const KNOWN_ADMIN_EMAIL = 'codigolatino123@gmail.com'; // mail que mencionaste (ajusta si difiere)

  // ===== Utilidades =====
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  };

  const getAuthHeaders = () => {
    // si usas JWT accesstoken en localStorage bajo 'access' u otro nombre, inclúyelo
    const headers = { 'Content-Type': 'application/json' };
    const access = localStorage.getItem('access') || localStorage.getItem('token') || null;
    if (access) headers['Authorization'] = `Bearer ${access}`;
    return headers;
  };

  // ===== UI helpers =====
  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('closed');
  };

  const setActive = (target, section) => {
    try {
      document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
      target.classList.add('active');
    } catch (e) { /* ignore if DOM not ready */ }
    setActiveSection(section);
  };

  const logout = () => {
    if (window.confirm('¿Estás seguro de que quieres salir?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('access');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  // ===== Lista de usuarios =====
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/accounts/usuarios/`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data) {
        // Si tu backend devuelve { success: True, usuarios: [...] } lo respetamos
        if (data.success && Array.isArray(data.usuarios)) {
          setUsuarios(data.usuarios);
        } else if (Array.isArray(data)) {
          // en caso tu endpoint devolviera directamente array
          setUsuarios(data);
        } else if (data.usuarios) {
          setUsuarios(data.usuarios);
        } else {
          // try to handle other shapes
          setUsuarios([]);
          setError('Respuesta inesperada del servidor al listar usuarios');
        }
      } else {
        const msg = (data && (data.error || data.detail)) || `Error HTTP ${res.status}`;
        setError(msg);
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // ===== Modal edición (lista) handlers =====
  const abrirModalEdicion = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      first_name: usuario.first_name || '',
      last_name: usuario.last_name || '',
      email: usuario.email || '',
      phone: usuario.phone || '',
      rol: usuario.rol || 'usuario'
    });
    setShowEditModal(true);
  };

  const cerrarModal = () => {
    setShowEditModal(false);
    setUsuarioEditando(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      rol: 'usuario'
    });
  };

  const guardarCambios = async () => {
    if (!usuarioEditando) return;
    try {
      setLoadingAction(true);
      const res = await fetch(`${API}/accounts/usuarios/${usuarioEditando.id}/editar/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data && data.success) {
        // Reemplaza usuario en lista
        setUsuarios(prev =>
          prev.map(u => (u.id === usuarioEditando.id ? { ...u, ...data.usuario } : u))
        );
        // Si editaste tu propio perfil y está en localStorage, actualiza localStorage
        const current = getCurrentUser();
        if (current && (current.user_id === usuarioEditando.id || current.userId === usuarioEditando.id || current.id === usuarioEditando.id)) {
          localStorage.setItem('user', JSON.stringify({
            ...current,
            first_name: data.usuario.first_name,
            last_name: data.usuario.last_name,
            email: data.usuario.email || current.email
          }));
        }
        cerrarModal();
        alert('Usuario actualizado correctamente');
      } else {
        const msg = (data && (data.error || data.detail)) || `Error HTTP ${res.status}`;
        alert(msg);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor');
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleEstadoUsuario = async (usuarioId, nombreUsuario) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (!usuario) return;
    const accion = usuario.is_active ? 'inhabilitar' : 'habilitar';
    if (!window.confirm(`¿Estás seguro de que quieres ${accion} a ${nombreUsuario}?`)) return;

    try {
      setLoadingAction(true);
      const res = await fetch(`${API}/accounts/usuarios/${usuarioId}/toggle-estado/`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data && data.success) {
        setUsuarios(prev => prev.map(u => (u.id === usuarioId ? { ...u, is_active: data.is_active } : u)));
        alert(data.message || 'Estado actualizado');
      } else {
        const msg = (data && (data.error || data.detail)) || `Error HTTP ${res.status}`;
        alert(msg);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor');
    } finally {
      setLoadingAction(false);
    }
  };

  // ===== Configuración (perfil) =====
  const fetchPerfil = async () => {
    // 1) intenta user_id en localStorage
    const current = getCurrentUser();
    const userId = current?.user_id || current?.userId || current?.id || null;

    if (!userId) {
      // si no hay user en localStorage, intenta descubrir admin en la lista de usuarios
      // llamamos a usuarios endpoint para encontrar admin por email o is_staff
      try {
        setLoadingPerfil(true);
        const res = await fetch(`${API}/accounts/usuarios/`, { headers: getAuthHeaders() });
        const data = await res.json();
        let found = null;

        if (res.ok && data) {
          const list = data.usuarios || Array.isArray(data) ? (data.usuarios || data) : [];
          // buscar por correo conocido
          if (Array.isArray(list) && list.length) {
            found = list.find(u => (u.email && u.email.toLowerCase() === KNOWN_ADMIN_EMAIL.toLowerCase()));
            if (!found) {
              // buscar is_staff o rol admin
              found = list.find(u => u.is_staff === true || (u.rol && u.rol === 'admin'));
            }
          }
        }

        if (found) {
          setPerfil({
            id: found.id,
            email: found.email || '',
            first_name: found.first_name || '',
            last_name: found.last_name || '',
            phone: found.phone || '',
            rol: found.rol || (found.is_staff ? 'admin' : 'usuario')
          });

          // store minimal current user info to localStorage to avoid repeated lookup
          const toStore = {
            user_id: found.id,
            email: found.email,
            first_name: found.first_name,
            last_name: found.last_name
          };
          localStorage.setItem('user', JSON.stringify(toStore));
          return;
        }

        // si no encontramos admin, mostramos alerta y pedimos re-login
        alert('No se encontró el usuario actual. Por favor inicia sesión.');
        window.location.href = '/login';
      } catch (err) {
        console.error(err);
        alert('Error al intentar obtener perfil desde la lista de usuarios');
        window.location.href = '/login';
      } finally {
        setLoadingPerfil(false);
      }

      return;
    }

    // si tenemos userId: pedimos /accounts/usuarios/:id/
    try {
      setLoadingPerfil(true);
      const res = await fetch(`${API}/accounts/usuarios/${userId}/`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data && data.success) {
        const u = data.usuario;
        setPerfil({
          id: u.id,
          email: u.email || '',
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          phone: u.phone || '',
          rol: u.rol || (u.is_staff ? 'admin' : 'usuario')
        });
        // ensure localStorage has user minimal info
        const curr = getCurrentUser();
        localStorage.setItem('user', JSON.stringify({
          ...curr,
          user_id: u.id,
          email: u.email,
          first_name: u.first_name,
          last_name: u.last_name
        }));
      } else if (res.ok && data && data.id) {
        // si tu endpoint devuelve directamente el usuario (sin wrapper)
        const u = data;
        setPerfil({
          id: u.id,
          email: u.email || '',
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          phone: u.phone || '',
          rol: u.rol || (u.is_staff ? 'admin' : 'usuario')
        });
      } else {
        const msg = (data && (data.error || data.detail)) || `Error HTTP ${res.status}`;
        alert(msg);
        // forzamos re-login si no encontramos usuario
        window.location.href = '/login';
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al obtener el perfil');
      window.location.href = '/login';
    } finally {
      setLoadingPerfil(false);
    }
  };

  const guardarPerfil = async () => {
    if (!perfil.id) {
      alert('Perfil no disponible para guardar');
      return;
    }
    try {
      setSavingPerfil(true);
      const body = {
        first_name: perfil.first_name,
        last_name: perfil.last_name,
        phone: perfil.phone
      };
      const res = await fetch(`${API}/accounts/usuarios/${perfil.id}/editar/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data && data.success) {
        alert('Perfil actualizado correctamente');
        // actualizar localStorage
        const current = getCurrentUser();
        localStorage.setItem('user', JSON.stringify({
          ...current,
          first_name: data.usuario.first_name,
          last_name: data.usuario.last_name,
          email: data.usuario.email || current.email
        }));
        // actualizar estado local
        setPerfil(prev => ({
          ...prev,
          first_name: data.usuario.first_name,
          last_name: data.usuario.last_name,
          phone: data.usuario.phone || prev.phone
        }));
        // actualizar lista usuarios si existe
        setUsuarios(prev => prev.map(u => (u.id === perfil.id ? { ...u, ...data.usuario } : u)));
      } else {
        const msg = (data && (data.error || data.detail)) || `Error HTTP ${res.status}`;
        alert(msg);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar el perfil');
    } finally {
      setSavingPerfil(false);
    }
  };

  // ===== Efectos =====
  useEffect(() => {
    // carga inicial: si estamos en usuarios, lista usuarios; si en configuracion, carga perfil
    if (activeSection === 'usuarios') fetchUsuarios();
    if (activeSection === 'configuracion') fetchPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // ===== Utils y render subcomponents =====
  const usuariosFiltrados = usuarios.filter(usuario =>
    (usuario.email || '').toLowerCase().includes(filtro.toLowerCase()) ||
    ((usuario.full_name || `${usuario.first_name || ''} ${usuario.last_name || ''}`).toLowerCase().includes(filtro.toLowerCase())) ||
    ((usuario.rol || '').toLowerCase().includes(filtro.toLowerCase()))
  );

  const formatearFecha = (fechaString) => {
    if (!fechaString || fechaString === 'Nunca') return 'Nunca';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRolBadgeColor = (rol) => {
    switch (rol) {
      case 'admin': return 'badge-admin';
      case 'usuario': return 'badge-usuario';
      default: return 'badge-default';
    }
  };

  // ===== Renderers =====
  const renderUsuarios = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Cargando usuarios...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-content">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={fetchUsuarios} className="retry-btn">Reintentar</button>
          </div>
        </div>
      );
    }

    return (
      <div className="usuarios-section">
        <div className="usuarios-header">
          <div>
            <h2>Lista de Usuarios</h2>
            <p>Gestiona todos los usuarios del sistema</p>
          </div>
          <div className="usuarios-stats">
            <span>Total: {usuarios.length}</span>
          </div>
        </div>

        <div className="usuarios-filters">
          <input
            type="text"
            placeholder="Buscar por email, nombre o rol..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchUsuarios} className="refresh-btn">Actualizar</button>
        </div>

        <div className="tabla-container">
          <table className="tabla-usuarios">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Teléfono</th>
                <th>Registro</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className="usuario-info">
                      <div className="usuario-avatar">
                        {usuario.profile_image ? (
                          <img src={usuario.profile_image} alt={usuario.full_name || `${usuario.first_name} ${usuario.last_name}`} />
                        ) : (
                          <div className="avatar-placeholder">
                            {(usuario.first_name || '').charAt(0)}{(usuario.last_name || '').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="usuario-details">
                        <div className="usuario-name">{usuario.full_name || `${usuario.first_name || ''} ${usuario.last_name || ''}`}</div>
                        <div className="usuario-email">{usuario.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`rol-badge ${getRolBadgeColor(usuario.rol)}`}>{usuario.rol === 'admin' ? 'Administrador' : 'Usuario'}</span></td>
                  <td>
                    <div className="estado-info">
                      <div className={`estado-dot ${usuario.is_active ? 'activo' : 'inactivo'}`}></div>
                      <span className={`estado-text ${usuario.is_active ? 'activo' : 'inactivo'}`}>{usuario.is_active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </td>
                  <td>{usuario.phone || 'No especificado'}</td>
                  <td>{formatearFecha(usuario.date_joined)}</td>
                  <td>{formatearFecha(usuario.last_login)}</td>
                  <td>
                    <div className="acciones-usuario">
                      <button className="btn-editar" onClick={() => abrirModalEdicion(usuario)} title="Editar usuario" disabled={loadingAction}>✏️</button>
                      <button className={`btn-toggle ${usuario.is_active ? 'btn-inhabilitar' : 'btn-habilitar'}`}
                        onClick={() => toggleEstadoUsuario(usuario.id, usuario.full_name || `${usuario.first_name} ${usuario.last_name}`)}
                        title={usuario.is_active ? 'Inhabilitar usuario' : 'Habilitar usuario'} disabled={loadingAction}>
                        {usuario.is_active ? '🚫' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {usuariosFiltrados.length === 0 && (
            <div className="empty-state">
              <h3>No hay usuarios</h3>
              <p>{filtro ? 'No se encontraron usuarios con ese filtro.' : 'Comienza agregando usuarios al sistema.'}</p>
            </div>
          )}
        </div>

        {/* Modal edición */}
        {showEditModal && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Editar Usuario</h3>
                <button className="modal-close" onClick={cerrarModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre:</label>
                  <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} placeholder="Nombre del usuario" />
                </div>

                <div className="form-group">
                  <label>Apellido:</label>
                  <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} placeholder="Apellido del usuario" />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email del usuario" />
                </div>

                <div className="form-group">
                  <label>Teléfono:</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Teléfono del usuario" />
                </div>

                <div className="form-group">
                  <label>Rol:</label>
                  <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                    <option value="usuario">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancelar" onClick={cerrarModal} disabled={loadingAction}>Cancelar</button>
                <button className="btn-guardar" onClick={guardarCambios} disabled={loadingAction}>{loadingAction ? 'Guardando...' : 'Guardar Cambios'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderConfiguracion = () => {
    return (
      <div className="content-section">
        <h2>Configuración de mi perfil</h2>
        <p>Aquí puedes ver tu correo y actualizar tu nombre, apellido y teléfono.</p>

        {loadingPerfil ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Cargando perfil...</span>
          </div>
        ) : (
          <div className="config-form">
            <div className="form-group">
              <label>Correo (solo lectura)</label>
              <input type="email" value={perfil.email} readOnly />
            </div>

            <div className="form-group">
              <label>Nombre</label>
              <input type="text" value={perfil.first_name} onChange={(e) => setPerfil({ ...perfil, first_name: e.target.value })} placeholder="Tu nombre" />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input type="text" value={perfil.last_name} onChange={(e) => setPerfil({ ...perfil, last_name: e.target.value })} placeholder="Tu apellido" />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input type="text" value={perfil.phone} onChange={(e) => setPerfil({ ...perfil, phone: e.target.value })} placeholder="Tu teléfono" />
            </div>

            <div className="form-group">
              <label>Rol</label>
              <input type="text" value={perfil.rol || 'usuario'} readOnly />
            </div>

            <div className="config-actions">
              <button className="btn-guardar" onClick={guardarPerfil} disabled={savingPerfil}>{savingPerfil ? 'Guardando...' : 'Guardar cambios'}</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===== Main content selector =====
  const renderContent = () => {
    switch (activeSection) {
      case 'usuarios': return renderUsuarios();
      case 'proveedores': return (<div className="content-section"><h2>Sección de Proveedores</h2><p>Aquí irá la gestión de proveedores</p></div>);
      case 'analiticos': return (<div className="content-section"><h2>Analíticos</h2><p>Aquí irán las estadísticas y gráficos</p></div>);
      case 'productos': return (<div className="content-section"><h2>Productos</h2><p>Aquí irá la gestión de productos</p></div>);
      case 'pedidos': return (<div className="content-section"><h2>Pedidos</h2><p>Aquí irá la gestión de pedidos</p></div>);
      case 'configuracion': return renderConfiguracion();
      default: return renderUsuarios();
    }
  };

  useEffect(() => {
    // initial load: if user was already in usuarios section, fetch them
    if (activeSection === 'usuarios') fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div id="sidebar" className="sidebar">
        <div className="header">
          <div className="logo-section">
            <div className="logo">⚡</div>
            <div className="company-name">Eléctricos &<br/>Soluciones</div>
          </div>
          <button className="close-btn" onClick={toggleSidebar}>✕</button>
        </div>

        <nav className="menu">
          <button className={`menu-item ${activeSection === 'usuarios' ? 'active' : ''}`} onClick={(e) => setActive(e.target, 'usuarios')}>
            <div className="menu-icon">👤</div><span>Usuarios</span>
          </button>

          <button className={`menu-item ${activeSection === 'proveedores' ? 'active' : ''}`} onClick={(e) => setActive(e.target, 'proveedores')}>
            <div className="menu-icon">👥</div><span>Proveedores</span>
          </button>

          <button className={`menu-item ${activeSection === 'analiticos' ? 'active' : ''}`} onClick={(e) => setActive(e.target, 'analiticos')}>
            <div className="menu-icon">📊</div><span>Analíticos</span>
          </button>

          <button className={`menu-item ${activeSection === 'productos' ? 'active' : ''}`} onClick={(e) => setActive(e.target, 'productos')}>
            <div className="menu-icon">📦</div><span>Productos</span>
          </button>

          <button className={`menu-item ${activeSection === 'pedidos' ? 'active' : ''}`} onClick={(e) => setActive(e.target, 'pedidos')}>
            <div className="menu-icon">🛒</div><span>Pedidos</span>
          </button>

          <button className={`menu-item ${activeSection === 'configuracion' ? 'active' : ''}`} onClick={(e) => setActive(e.target, 'configuracion')}>
            <div className="menu-icon">⚙️</div><span>Configuración</span>
          </button>

          <button className="menu-item logout-btn" onClick={logout}>
            <div className="menu-icon">🚪</div><span>Salir</span>
          </button>
        </nav>
      </div>

      {/* Toggle Button */}
      <button className="toggle-btn" onClick={toggleSidebar}>☰</button>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default AdminDashboard;
