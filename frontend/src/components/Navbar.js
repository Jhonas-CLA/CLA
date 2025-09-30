// Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { darkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const categorias = {
    // ... tus categorías aquí
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

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate("/"); // Redirige a la página principal
  };

  return (
    <nav className={`custom-navbar ${darkMode ? "dark-mode" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link className="navbar-logo" to="/" onClick={closeMenu}>
          <img
            src="https://i.postimg.cc/YCZg4n8g/LOGO-ELECTRICOS-removebg-preview.png"
            alt="Logo"
          />
        </Link>

        {/* Botón hamburguesa */}
        <button
          className={`mobile-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menú principal */}
        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <Link
            className={`nav-link ${isActiveLink("/quienes-somos") ? "active" : ""}`}
            to="/quienes-somos"
            onClick={closeMenu}
          >
            Quienes Somos
          </Link>

          {/* Dropdown categorías */}
          <div className="nav-dropdown">
            <button
              className={`nav-link dropdown-btn ${isActiveLink("/categorias") ? "active" : ""}`}
              onClick={toggleDropdown}
            >
              Categorías{" "}
              <span className={`dropdown-arrow ${showDropdown ? "active" : ""}`}>
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

        {/* Acciones (carrito, usuario, modo oscuro) */}
        <div className="nav-actions">
          {/* Carrito */}
          <Link
            to="/carrito"
            className={`action-icon cart-icon ${isActiveLink("/carrito") ? "active" : ""}`}
            onClick={closeMenu}
            title="Carrito"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/8146/8146003.png"
              alt="Productos"
              style={{ width: "50px", height: "40px", objectFit: "cover" }}
            />
          </Link>

          {/* Usuario */}
          {isAuthenticated && user ? (
            <div
              className="user-section"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <Link
                to="/analiticas"
                className={`action-icon profile-icon ${isActiveLink("/analiticas") ? "active" : ""}`}
                onClick={closeMenu}
                title={`Dashboard - ${user?.first_name || "Usuario"}`}
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
                  <span>Hola, {user?.first_name || "Usuario"}</span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="logout-btn"
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/Login"
              className={`action-icon profile-icon ${isActiveLink("/Login") ? "active" : ""}`}
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

          {/* Botón modo oscuro */}
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

