import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import Proveedores from '../pages/proveedores';

function AdminDashboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [activeSection, setActiveSection] = useState('usuarios');
  
  // Estados para el modal de edición
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

  // 🔹 Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosPorPagina] = useState(1);

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

  const logout = () => {
    if (window.confirm('¿Estás seguro de que quieres salir?')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/accounts/usuarios/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUsuarios(data.usuarios);
      } else {
        setError(data.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir modal de edición
  const abrirModalEdicion = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      email: usuario.email,
      phone: usuario.phone || '',
      rol: usuario.rol
    });
    setShowEditModal(true);
  };

  // Función para cerrar modal
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

  // Función para guardar cambios
  const guardarCambios = async () => {
    try {
      setLoadingAction(true);
      
      const response = await fetch(`http://localhost:8000/accounts/usuarios/${usuarioEditando.id}/editar/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista de usuarios
        setUsuarios(usuarios.map(usuario => 
          usuario.id === usuarioEditando.id 
            ? { ...usuario, ...data.usuario }
            : usuario
        ));
        cerrarModal();
        alert('Usuario actualizado correctamente');
      } else {
        alert(data.error || 'Error al actualizar usuario');
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
      console.error('Error:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Función para toggle estado del usuario
  const toggleEstadoUsuario = async (usuarioId, nombreUsuario) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    const accion = usuario.is_active ? 'inhabilitar' : 'habilitar';
    
    if (window.confirm(`¿Estás seguro de que quieres ${accion} a ${nombreUsuario}?`)) {
      try {
        setLoadingAction(true);
        
        const response = await fetch(`http://localhost:8000/accounts/usuarios/${usuarioId}/toggle-estado/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Actualizar la lista de usuarios
          setUsuarios(usuarios.map(usuario => 
            usuario.id === usuarioId 
              ? { ...usuario, is_active: data.is_active }
              : usuario
          ));
          alert(data.message);
        } else {
          alert(data.error || 'Error al cambiar estado del usuario');
        }
      } catch (err) {
        alert('Error de conexión con el servidor');
        console.error('Error:', err);
      } finally {
        setLoadingAction(false);
      }
    }
  };

  useEffect(() => {
    if (activeSection === 'usuarios') {
      fetchUsuarios();
    }
  }, [activeSection]);

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.email.toLowerCase().includes(filtro.toLowerCase()) ||
    (usuario.full_name && usuario.full_name.toLowerCase().includes(filtro.toLowerCase())) ||
    usuario.rol.toLowerCase().includes(filtro.toLowerCase())
  );

  // 🔹 Cálculo de paginación
  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosActuales = usuariosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

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

  const renderContent = () => {
    switch (activeSection) {
      case 'usuarios':
        return renderUsuarios();
      case 'proveedores':
        return <Proveedores />;
      case 'analiticos':
        return <div className="content-section"><h2>Analíticos</h2><p>Aquí irán las estadísticas y gráficos</p></div>;
      case 'productos':
        return <div className="content-section"><h2>Productos</h2><p>Aquí irá la gestión de productos</p></div>;
      case 'pedidos':
        return <div className="content-section"><h2>Pedidos</h2><p>Aquí irá la gestión de pedidos</p></div>;
      case 'configuracion':
        return <div className="content-section"><h2>Configuración</h2><p>Aquí irá la configuración del sistema</p></div>;
      default:
        return renderUsuarios();
    }
  };

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
            <button onClick={fetchUsuarios} className="retry-btn">
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="usuarios-section">
        {/* Header de usuarios */}
        <div className="usuarios-header">
          <div>
            <h2>Lista de Usuarios</h2>
            <p>Gestiona todos los usuarios del sistema</p>
          </div>
          <div className="usuarios-stats">
            <span>Total: {usuarios.length}</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="usuarios-filters">
          <input
            type="text"
            placeholder="Buscar por email, nombre o rol..."
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginaActual(1); // Reinicia a la primera página al filtrar
            }}
            className="search-input"
          />
          <button onClick={fetchUsuarios} className="refresh-btn">
            Actualizar
          </button>
        </div>

        {/* Tabla de usuarios */}
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
              {usuariosActuales.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className="usuario-info">
                      <div className="usuario-avatar">
                        {usuario.profile_image ? (
                          <img 
                            src={usuario.profile_image} 
                            alt={usuario.full_name || `${usuario.first_name} ${usuario.last_name}`}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {usuario.first_name?.charAt(0)}{usuario.last_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="usuario-details">
                        <div className="usuario-name">
                          {usuario.full_name || `${usuario.first_name} ${usuario.last_name}`}
                        </div>
                        <div className="usuario-email">{usuario.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`rol-badge ${getRolBadgeColor(usuario.rol)}`}>
                      {usuario.rol === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td>
                    <div className="estado-info">
                      <div className={`estado-dot ${usuario.is_active ? 'activo' : 'inactivo'}`}></div>
                      <span className={`estado-text ${usuario.is_active ? 'activo' : 'inactivo'}`}>
                        {usuario.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td>{usuario.phone || 'No especificado'}</td>
                  <td>{formatearFecha(usuario.date_joined)}</td>
                  <td>{formatearFecha(usuario.last_login)}</td>
                  <td>
                    <div className="acciones-usuario">
                      <button
                        className="btn-editar"
                        onClick={() => abrirModalEdicion(usuario)}
                        title="Editar usuario"
                        disabled={loadingAction}
                      >
                        ✏️
                      </button>
                      <button
                        className={`btn-toggle ${usuario.is_active ? 'btn-inhabilitar' : 'btn-habilitar'}`}
                        onClick={() => toggleEstadoUsuario(usuario.id, usuario.full_name || `${usuario.first_name} ${usuario.last_name}`)}
                        title={usuario.is_active ? 'Inhabilitar usuario' : 'Habilitar usuario'}
                        disabled={loadingAction}
                      >
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
              <p>
                {filtro ? 'No se encontraron usuarios con ese filtro.' : 'Comienza agregando usuarios al sistema.'}
              </p>
            </div>
          )}
        </div>

        {/* 🔹 Paginación */}
        {totalPaginas > 1 && (
          <div className="paginacion">
            <button 
              onClick={() => setPaginaActual(paginaActual - 1)} 
              disabled={paginaActual === 1}
            >
              ⬅️ Anterior
            </button>

            {[...Array(totalPaginas)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setPaginaActual(index + 1)}
                className={paginaActual === index + 1 ? 'activo' : ''}
              >
                {index + 1}
              </button>
            ))}

            <button 
              onClick={() => setPaginaActual(paginaActual + 1)} 
              disabled={paginaActual === totalPaginas}
            >
              Siguiente ➡️
            </button>
          </div>
        )}

        {/* Modal de edición */}
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
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="Nombre del usuario"
                  />
                </div>
                
                <div className="form-group">
                  <label>Apellido:</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="Apellido del usuario"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Email del usuario"
                  />
                </div>
                
                <div className="form-group">
                  <label>Teléfono:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Teléfono del usuario"
                  />
                </div>
                
                <div className="form-group">
                  <label>Rol:</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  >
                    <option value="usuario">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn-cancelar" 
                  onClick={cerrarModal}
                  disabled={loadingAction}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-guardar" 
                  onClick={guardarCambios}
                  disabled={loadingAction}
                >
                  {loadingAction ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div id="sidebar" className="sidebar">
        <div className="header">
          <div className="logo-section">
            <div className="logo">
              <img 
                src="https://i.postimg.cc/YCZg4n8g/LOGO-ELECTRICOS-removebg-preview.png"
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
          <button 
            className={`menu-item ${activeSection === 'usuarios' ? 'active' : ''}`} 
            onClick={(e) => setActive(e.target, 'usuarios')}
          >
            <div className="menu-icon">👤</div>
            <span>Usuarios</span>
          </button>
          <button 
            className={`menu-item ${activeSection === 'proveedores' ? 'active' : ''}`} 
            onClick={(e) => setActive(e.target, 'proveedores')}
          >
            <div className="menu-icon">👥</div>
            <span>Proveedores</span>
          </button>
          <button 
            className={`menu-item ${activeSection === 'analiticos' ? 'active' : ''}`} 
            onClick={(e) => setActive(e.target, 'analiticos')}
          >
            <div className="menu-icon">📊</div>
            <span>Analíticos</span>
          </button>
          <button 
            className={`menu-item ${activeSection === 'productos' ? 'active' : ''}`} 
            onClick={(e) => setActive(e.target, 'productos')}
          >
            <div className="menu-icon">📦</div>
            <span>Productos</span>
          </button>
          <button 
            className={`menu-item ${activeSection === 'pedidos' ? 'active' : ''}`} 
            onClick={(e) => setActive(e.target, 'pedidos')}
          >
            <div className="menu-icon">🛒</div>
            <span>Pedidos</span>
          </button>
          <button 
            className={`menu-item ${activeSection === 'configuracion' ? 'active' : ''}`} 
            onClick={(e) => setActive(e.target, 'configuracion')}
          >
            <div className="menu-icon">⚙️</div>
            <span>Configuración</span>
          </button>
          <button
            className="menu-item logout-btn"
            onClick={logout}
          >
            <div className="menu-icon">🚪</div>
            <span>Salir</span>
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