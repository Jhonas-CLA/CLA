// Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext"; // Agregar el useAuth
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { darkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth(); // Usar el contexto de auth
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const categorias = {
    "Cables y Conectores": [
      {
        name: "Alambres y Cables",
        path: "/categorias/alambres-cables",
        icon: "🔌",
      },
      {
        name: "Bornas y Conectores",
        path: "/categorias/bornas-conectores",
        icon: "🔗",
      },
      { name: "Conectores", path: "/categorias/conectores", icon: "🔌" },
      {
        name: "Terminales y Uniones",
        path: "/categorias/terminales-uniones",
        icon: "🔗",
      },
      { name: "Clavijas", path: "/categorias/clavijas", icon: "🔌" },
    ],
    Iluminación: [
      { name: "Iluminación", path: "/categorias/iluminacion", icon: "💡" },
      {
        name: "Portalamparas y Plafones",
        path: "/categorias/portalamparas-plafones",
        icon: "💡",
      },
      {
        name: "Reflectores y Fotoceldas",
        path: "/categorias/reflectores-fotoceldas",
        icon: "🔦",
      },
      { name: "Boquillas", path: "/categorias/boquillas", icon: "💡" },
    ],
    "Protección Eléctrica": [
      {
        name: "Automáticos / Breakers",
        path: "/categorias/automaticos-breakers",
        icon: "⚡",
      },
      {
        name: "Tableros Eléctricos",
        path: "/categorias/tableros-electricos",
        icon: "📋",
      },
      {
        name: "Contactores y Contadores",
        path: "/categorias/contactores-contadores",
        icon: "⚙️",
      },
      { name: "Relés", path: "/categorias/reles", icon: "🔄" },
    ],
    "Tubería y Accesorios": [
      { name: "Tuberia", path: "/categorias/tuberia", icon: "🔧" },
      {
        name: "Curvas y Accesorios de Tubería",
        path: "/categorias/curvas-accesorios-tuberia",
        icon: "🔧",
      },
      { name: "Canaletas", path: "/categorias/canaletas", icon: "📐" },
      {
        name: "Accesorios para Canaletas / EMT / PVC",
        path: "/categorias/accesorios-canaletas-emt-pvc",
        icon: "🔧",
      },
    ],
    "Cajas e Instalación": [
      { name: "Cajas", path: "/categorias/cajas", icon: "📦" },
      {
        name: "Tapas y Accesorios de Superficie",
        path: "/categorias/tapas-accesorios-superficie",
        icon: "🔲",
      },
      { name: "Rosetas", path: "/categorias/rosetas", icon: "🌸" },
      {
        name: "Capacetes y Chazos",
        path: "/categorias/capacetes-chazos",
        icon: "🔩",
      },
    ],
    "Interruptores y Tomas": [
      {
        name: "Interruptores y Programadores",
        path: "/categorias/interruptores-programadores",
        icon: "🔲",
      },
      {
        name: "Tomas y Enchufes",
        path: "/categorias/tomas-enchufes",
        icon: "🔌",
      },
      {
        name: "Extensiones y Multitomas",
        path: "/categorias/extensiones-multitomas",
        icon: "🔌",
      },
    ],
    "Herramientas y Medición": [
      {
        name: "Herramientas y Accesorios Especiales",
        path: "/categorias/herramientas-accesorios-especiales",
        icon: "🛠️",
      },
      {
        name: "Instrumentos de Medición",
        path: "/categorias/instrumentos-medicion",
        icon: "📏",
      },
      {
        name: "Discos para Pulidora",
        path: "/categorias/discos-pulidora",
        icon: "💿",
      },
    ],
    "Sujeción y Soporte": [
      {
        name: "Abrazaderas y Amarres",
        path: "/categorias/abrazaderas-amarres",
        icon: "🔗",
      },
      {
        name: "Soportes, Pernos y Herrajes",
        path: "/categorias/soportes-pernos-herrajes",
        icon: "🔩",
      },
      {
        name: "Hebillas, Grapas y Perchas",
        path: "/categorias/hebillas-grapas-perchas",
        icon: "📎",
      },
      { name: "Tensores", path: "/categorias/tensores", icon: "🔗" },
    ],
    "Sensores y Control": [
      {
        name: "Sensores y Temporizadores",
        path: "/categorias/sensores-temporizadores",
        icon: "⏱️",
      },
      { name: "Timbres", path: "/categorias/timbres", icon: "🔔" },
    ],
    "Materiales y Sellantes": [
      {
        name: "Cintas Aislantes",
        path: "/categorias/cintas-aislantes",
        icon: "📏",
      },
      { name: "Soldaduras", path: "/categorias/soldaduras", icon: "🔥" },
    ],
    Electrodomésticos: [
      { name: "Duchas", path: "/categorias/duchas", icon: "🚿" },
    ],
    Otros: [
      {
        name: "Otros / Misceláneos",
        path: "/categorias/otros-miscelaneos",
        icon: "📦",
      },
    ],
  };

  useEffect(() => {
    setIsMenuOpen(false);
    setShowDropdown(false);
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowDropdown(false);
  };
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const isActiveLink = (path) => location.pathname === path;

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate("/"); // Redirige a la página principal
  };

  return (
    <nav className={`custom-navbar ${darkMode ? "dark-mode" : ""}`}>
      <div className="navbar-container">
        <Link className="navbar-logo" to="/" onClick={closeMenu}>
          <img
            src="https://i.postimg.cc/YCZg4n8g/LOGO-ELECTRICOS-removebg-preview.png"
            alt="Logo"
          />
        </Link>

        <button
          className={`mobile-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <Link
            className={`nav-link ${
              isActiveLink("/quienes-somos") ? "active" : ""
            }`}
            to="/quienes-somos"
            onClick={closeMenu}
          >
            Quienes Somos
          </Link>

          <div className="nav-dropdown">
            <button
              className={`nav-link dropdown-btn ${
                isActiveLink("/categorias") ? "active" : ""
              }`}
              onClick={toggleDropdown}
            >
              Categorías{" "}
              <span
                className={`dropdown-arrow ${showDropdown ? "active" : ""}`}
              >
                ▼
              </span>
            </button>
            {showDropdown && (
              <div className="dropdown-content mega-dropdown">
                <div className="dropdown-columns">
                  {Object.entries(categorias).map(([grupo, items]) => (
                    <div key={grupo} className="dropdown-column">
                      <h4 className="dropdown-group-title">{grupo}</h4>
                      <div className="dropdown-group-items">
                        {items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeMenu}
                            className="dropdown-item"
                          >
                            <span className="item-icon">{item.icon}</span>
                            <span className="item-name">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            className={`nav-link ${isActiveLink("/novedades") ? "active" : ""}`}
            to="/novedades"
            onClick={closeMenu}
          >
            Novedades
          </Link>
          <Link
            className={`nav-link ${isActiveLink("/contacto") ? "active" : ""}`}
            to="/contacto"
            onClick={closeMenu}
          >
            Contacto
          </Link>
        </div>

        <div className="nav-actions">
          <Link
            to="/carrito"
            className={`action-icon cart-icon ${
              isActiveLink("/carrito") ? "active" : ""
            }`}
            onClick={closeMenu}
            title="Carrito"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/8146/8146003.png"
              alt="Productos"
              style={{ width: "50px", height: "40px", objectFit: "cover" }}
            />
          </Link>

          {/* Sección de usuario - Cambia según si está autenticado */}
          {isAuthenticated ? (
            <div
              className="user-section"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              {/* Usuario logueado */}
              <Link
                to="/analiticas"
                className={`action-icon profile-icon ${
                  isActiveLink("/analiticas") ? "active" : ""
                }`}
                onClick={closeMenu}
                title={`Dashboard - ${user.first_name}`}
              >
                <div
                  className="user-greeting"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    backgroundColor: "#FFD700",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#001152",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>Hola, {user.first_name}</span>
                </div>
              </Link>

              {/* Botón de logout */}
              <button 
  onClick={handleLogout}
  className="logout-btn"
  style={{
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  }}
  title="Cerrar sesión"
>
  Salir
</button>
            </div>
          ) : (
            /* Usuario no logueado */
            <Link
              to="/Login"
              className={`action-icon profile-icon ${
                isActiveLink("/Login") ? "active" : ""
              }`}
              onClick={closeMenu}
              title="Login"
            >
              <div
                className="profile-circle"
                style={{
                  width: "60px",
                  height: "60px",
                  overflow: "hidden",
                  borderRadius: "50%",
                }}
              >
                <img
                  src="https://static.vecteezy.com/ti/vetor-gratis/p3/7407996-user-icon-person-icon-client-symbol-login-head-sign-icon-design-vetor.jpg"
                  alt="Usuario"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </Link>
          )}

          <button
            className="mode-toggle-btn"
            onClick={toggleTheme}
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <span className="mode-icon">{darkMode ? "☀️" : "🌙"}</span>
            <span className="mode-text">
              Modo {darkMode ? "Claro" : "Oscuro"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
