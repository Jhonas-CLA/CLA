import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Proveedores from "../pages/proveedores";
import DashboardProductos from "../pages/DashboardProductos";
import Pedidos from "../pages/Pedidos";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Analiticas from "../pages/Analiticas";
import Documentos from "../pages/Documentos";
import api from "../api";

function AdminDashboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [activeSection, setActiveSection] = useState("usuarios");

  const [showEditModal, setShowEditModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    rol: "usuario",
  });
  const [loadingAction, setLoadingAction] = useState(false);

  const [adminData, setAdminData] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [perfilFormData, setPerfilFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    rol: "",
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosPorPagina] = useState(5);

  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("closed");
  };

  const setActive = (target, section) => {
    document.querySelectorAll(".menu-item").forEach((item) => item.classList.remove("active"));
    target.classList.add("active");
    setActiveSection(section);
  };

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que quieres salir?")) {
      try {
        await logout();
        navigate("/");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        navigate("/");
      }
    }
  };

  // 🔹 API Calls usando api.js
  const fetchAdminData = async () => {
    try {
      setLoadingAdmin(true);
      const token = localStorage.getItem("token");
      const { data } = await api.get("/accounts/perfil-admin/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setAdminData(data.admin);
        setPerfilFormData({
          first_name: data.admin.first_name,
          last_name: data.admin.last_name,
          phone: data.admin.phone || "",
          email: data.admin.email,
          rol: data.admin.rol,
        });
      } else {
        setError("Error al cargar datos del administrador");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const guardarPerfilAdmin = async () => {
    try {
      setLoadingAction(true);
      const token = localStorage.getItem("token");
      const datosEditables = {
        first_name: perfilFormData.first_name,
        last_name: perfilFormData.last_name,
        phone: perfilFormData.phone,
      };

      const { data } = await api.put("/accounts/actualizar-perfil-admin/", datosEditables, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setAdminData({ ...adminData, ...data.admin });
        setEditandoPerfil(false);
        alert("Perfil actualizado correctamente");
      } else {
        alert(data.error || "Error al actualizar perfil");
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const { data } = await api.get("/accounts/usuarios/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUsuarios(data.usuarios);
      } else {
        setError(data.error || "Error al cargar usuarios");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async () => {
    try {
      setLoadingAction(true);
      const datosEditables = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      };

      const { data } = await api.put(`/accounts/usuarios/${usuarioEditando.id}/editar/`, datosEditables);

      if (data.success) {
        setUsuarios(
          usuarios.map((usuario) =>
            usuario.id === usuarioEditando.id ? { ...usuario, ...data.usuario } : usuario
          )
        );
        cerrarModal();
        alert("Usuario actualizado correctamente");
      } else {
        alert(data.error || "Error al actualizar usuario");
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleEstadoUsuario = async (usuarioId, nombreUsuario) => {
    const usuario = usuarios.find((u) => u.id === usuarioId);
    const accion = usuario.is_active ? "inhabilitar" : "habilitar";

    if (window.confirm(`¿Estás seguro de que quieres ${accion} a ${nombreUsuario}?`)) {
      try {
        setLoadingAction(true);
        const { data } = await api.patch(`/accounts/usuarios/${usuarioId}/toggle-estado/`);
        if (data.success) {
          setUsuarios(
            usuarios.map((usuario) =>
              usuario.id === usuarioId ? { ...usuario, is_active: data.is_active } : usuario
            )
          );
          alert(data.message);
        } else {
          alert(data.error || "Error al cambiar estado del usuario");
        }
      } catch (err) {
        alert("Error de conexión con el servidor");
        console.error(err);
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const abrirModalEdicion = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      email: usuario.email,
      phone: usuario.phone || "",
      rol: usuario.rol,
    });
    setShowEditModal(true);
  };

  const cerrarModal = () => {
    setShowEditModal(false);
    setUsuarioEditando(null);
    setFormData({ first_name: "", last_name: "", email: "", phone: "", rol: "usuario" });
  };

  useEffect(() => {
    if (activeSection === "usuarios") fetchUsuarios();
    else if (activeSection === "configuracion") fetchAdminData();
  }, [activeSection]);

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.email.toLowerCase().includes(filtro.toLowerCase()) ||
      (usuario.full_name &&
        usuario.full_name.toLowerCase().includes(filtro.toLowerCase())) ||
      usuario.rol.toLowerCase().includes(filtro.toLowerCase())
  );

  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosActuales = usuariosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const formatearFecha = (fechaString) => {
    if (!fechaString || fechaString === "Nunca") return "Nunca";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRolBadgeColor = (rol) => {
    switch (rol) {
      case "admin":
        return "badge-admin";
      case "usuario":
        return "badge-usuario";
      default:
        return "badge-default";
    }
  };

  // 🔹 Render completo de usuarios y perfil del admin
  const renderContent = () => {
    switch (activeSection) {
      case "usuarios":
        return renderUsuarios();
      case "proveedores":
        return <Proveedores />;
      case "analiticos":
        return (
          <div className="content-section">
            <Analiticas />
          </div>
        );
      case "documentos":
        return (
          <div className="content-section">
            <Documentos />
          </div>
        );
      case "productos":
        return (
          <div className="content-section">
            <DashboardProductos />
          </div>
        );
      case "pedidos":
        return (
          <div className="content-section">
            <Pedidos />
          </div>
        );
      case "configuracion":
        return renderConfiguracion();
      default:
        return renderUsuarios();
    }
  };

  const renderConfiguracion = () => {
    if (loadingAdmin)
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Cargando configuración...</span>
        </div>
      );

    if (!adminData)
      return (
        <div className="error-container">
          <div className="error-content">
            <h3>Error</h3>
            <p>No se pudo cargar la configuración del administrador</p>
            <button onClick={fetchAdminData} className="retry-btn">
              Reintentar
            </button>
          </div>
        </div>
      );

    return (
      <div className="configuracion-section">
        <div className="config-header">
          <div>
            <h2>Configuración del Administrador</h2>
            <p>Gestiona tu perfil y configuración personal</p>
          </div>
        </div>

        <div className="admin-profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {adminData.profile_image ? (
                <img src={adminData.profile_image} alt={adminData.full_name} />
              ) : (
                <div className="avatar-placeholder-large">
                  {adminData.first_name?.charAt(0)}
                  {adminData.last_name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{adminData.full_name}</h3>
              <p>{adminData.email}</p>
              <span className={`rol-badge ${getRolBadgeColor(adminData.rol)}`}>
                {adminData.rol === "admin" ? "Administrador" : "Usuario"}
              </span>
            </div>
            <div className="profile-actions">
              {!editandoPerfil ? (
                <button className="btn-edit-profile" onClick={() => setEditandoPerfil(true)}>
                  ✏️ Editar Perfil
                </button>
              ) : (
                <div className="edit-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setEditandoPerfil(false);
                      setPerfilFormData({
                        first_name: adminData.first_name,
                        last_name: adminData.last_name,
                        phone: adminData.phone || "",
                        email: adminData.email,
                        rol: adminData.rol,
                      });
                    }}
                    disabled={loadingAction}
                  >
                    Cancelar
                  </button>
                  <button className="btn-save" onClick={guardarPerfilAdmin} disabled={loadingAction}>
                    {loadingAction ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {editandoPerfil && (
            <div className="profile-edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Nombre <span style={{ color: "green" }}>✓ Editable</span>
                  </label>
                  <input
                    type="text"
                    value={perfilFormData.first_name}
                    onChange={(e) => setPerfilFormData({ ...perfilFormData, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Apellido <span style={{ color: "green" }}>✓ Editable</span>
                  </label>
                  <input
                    type="text"
                    value={perfilFormData.last_name}
                    onChange={(e) => setPerfilFormData({ ...perfilFormData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Teléfono <span style={{ color: "green" }}>✓ Editable</span>
                  </label>
                  <input
                    type="text"
                    value={perfilFormData.phone}
                    onChange={(e) => setPerfilFormData({ ...perfilFormData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Email <span style={{ color: "red" }}>🔒 No editable</span>
                  </label>
                  <input type="email" value={perfilFormData.email} readOnly disabled style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed", opacity: "0.6" }} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Rol <span style={{ color: "red" }}>🔒 No editable</span>
                  </label>
                  <input
                    type="text"
                    value={perfilFormData.rol === "admin" ? "Administrador" : "Usuario"}
                    readOnly
                    disabled
                    style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed", opacity: "0.6" }}
                  />
                </div>
              </div>
            </div>
          )}

          {!editandoPerfil && (
            <div className="profile-details">
              <div className="detail-item">
                <strong>Teléfono:</strong>
                <span>{adminData.phone || "No especificado"}</span>
              </div>
              <div className="detail-item">
                <strong>Registro:</strong>
                <span>{formatearFecha(adminData.date_joined)}</span>
              </div>
              <div className="detail-item">
                <strong>Último acceso:</strong>
                <span>{formatearFecha(adminData.last_login)}</span>
              </div>
              <div className="detail-item">
                <strong>Estado:</strong>
                <span className={`estado-text ${adminData.is_active ? "activo" : "inactivo"}`}>
                  {adminData.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUsuarios = () => {
    if (loading)
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Cargando usuarios...</span>
        </div>
      );

    if (error)
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

    return (
      <div className="usuarios-section">
        {/* Tabla de usuarios completa */}
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
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginaActual(1);
            }}
            className="search-input"
          />
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
              {usuariosActuales.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className="usuario-info">
                      <div className="usuario-avatar">
                        {usuario.profile_image ? (
                          <img src={usuario.profile_image} alt={usuario.full_name || `${usuario.first_name} ${usuario.last_name}`} />
                        ) : (
                          <div className="avatar-placeholder">
                            {usuario.first_name?.charAt(0)}
                            {usuario.last_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="usuario-details">
                        <div className="usuario-name">{usuario.full_name || `${usuario.first_name} ${usuario.last_name}`}</div>
                        <div className="usuario-email">{usuario.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`rol-badge ${getRolBadgeColor(usuario.rol)}`}>
                      {usuario.rol === "admin" ? "Administrador" : "Usuario"}
                    </span>
                  </td>
                  <td>
                    <div className="estado-info">
                      <div className={`estado-dot ${usuario.is_active ? "activo" : "inactivo"}`}></div>
                      <span className={`estado-text ${usuario.is_active ? "activo" : "inactivo"}`}>
                        {usuario.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>
                  <td>{usuario.phone || "No especificado"}</td>
                  <td>{formatearFecha(usuario.date_joined)}</td>
                  <td>{formatearFecha(usuario.last_login)}</td>
                  <td>
                    <div className="acciones-usuario">
                      <button
                        className="btn-editar"
                        onClick={() => abrirModalEdicion(usuario)}
                        title="Editar usuario"
                        disabled={loadingAction}
                        style={{
                          opacity: 0,
                          pointerEvents: "none",
                          position: "absolute",
                          width: 0,
                          height: 0,
                          overflow: "hidden",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className={`btn-toggle ${usuario.is_active ? "btn-inhabilitar" : "btn-habilitar"}`}
                        onClick={() =>
                          toggleEstadoUsuario(usuario.id, usuario.full_name || `${usuario.first_name} ${usuario.last_name}`)
                        }
                        title={usuario.is_active ? "Inhabilitar usuario" : "Habilitar usuario"}
                        disabled={loadingAction}
                      >
                        {usuario.is_active ? "🚫" : "✅"}
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
              <p>{filtro ? "No se encontraron usuarios con ese filtro." : "Comienza agregando usuarios al sistema."}</p>
            </div>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="paginacion">
            <button onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1}>
              ⬅️ Anterior
            </button>

            {[...Array(totalPaginas)].map((_, index) => (
              <button key={index + 1} onClick={() => setPaginaActual(index + 1)} className={paginaActual === index + 1 ? "activo" : ""}>
                {index + 1}
              </button>
            ))}

            <button onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
              Siguiente ➡️
            </button>
          </div>
        )}

        {showEditModal && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Editar Usuario</h3>
                <button className="modal-close" onClick={cerrarModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre: <span style={{ color: "green" }}>✓ Editable</span></label>
                  <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Apellido: <span style={{ color: "green" }}>✓ Editable</span></label>
                  <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email: <span style={{ color: "red" }}>🔒 No editable</span></label>
                  <input type="email" value={formData.email} readOnly disabled style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed", opacity: "0.6" }} />
                </div>
                <div className="form-group">
                  <label>Teléfono: <span style={{ color: "green" }}>✓ Editable</span></label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={cerrarModal} disabled={loadingAction}>Cancelar</button>
                <button className="btn-save" onClick={guardarCambios} disabled={loadingAction}>
                  {loadingAction ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar" id="sidebar">
        <div className="sidebar-header">
          <h2>Admin Dashboard</h2>
          <button className="toggle-btn" onClick={toggleSidebar}>
            ☰
          </button>
        </div>
        <ul className="menu">
          <li className="menu-item active" onClick={(e) => setActive(e.currentTarget, "usuarios")}>
            Usuarios
          </li>
          <li className="menu-item" onClick={(e) => setActive(e.currentTarget, "proveedores")}>
            Proveedores
          </li>
          <li className="menu-item" onClick={(e) => setActive(e.currentTarget, "productos")}>
            Productos
          </li>
          <li className="menu-item" onClick={(e) => setActive(e.currentTarget, "pedidos")}>
            Pedidos
          </li>
          <li className="menu-item" onClick={(e) => setActive(e.currentTarget, "analiticos")}>
            Analíticas
          </li>
          <li className="menu-item" onClick={(e) => setActive(e.currentTarget, "documentos")}>
            Documentos
          </li>
          <li className="menu-item" onClick={(e) => setActive(e.currentTarget, "configuracion")}>
            Configuración
          </li>
          <li className="menu-item logout" onClick={handleLogout}>
            Cerrar sesión
          </li>
        </ul>
      </div>
      <div className="main-content">{renderContent()}</div>
    </div>
  );
}

export default AdminDashboard;
