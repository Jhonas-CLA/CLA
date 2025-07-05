import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setShowDropdown(false);
  }, [location]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link className="navbar-logo" to="/" onClick={closeMenu}>
          <img 
            src="https://i.postimg.cc/YCZg4n8g/LOGO-ELECTRICOS-removebg-preview.png" 
            alt="Logo" 
          />
        </Link>

        {/* Botón menú móvil */}
        <button
          className={`mobile-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Enlaces de navegación */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            className={`nav-link ${isActiveLink('/quienes-somos') ? 'active' : ''}`} 
            to="/quienes-somos" 
            onClick={closeMenu}
          >
            Quienes Somos
          </Link>

          {/* Dropdown Categorías */}
          <div className="nav-dropdown">
            <button 
              className={`nav-link dropdown-btn ${isActiveLink('/categorias') ? 'active' : ''}`}
              onClick={toggleDropdown}
            >
              Categorías
              <span className={`dropdown-arrow ${showDropdown ? 'active' : ''}`}>▼</span>
            </button>
            {showDropdown && (
              <div className="dropdown-content">
                <Link to="/categorias/iluminacion" onClick={closeMenu}>💡 Iluminación</Link>
                <Link to="/categorias/cables" onClick={closeMenu}>🔌 Cables y Conectores</Link>
                <Link to="/categorias/tuberia y accesorios" onClick={closeMenu}>🔧 Tuberia</Link>
                <Link to="/categorias/paneles" onClick={closeMenu}>⚡ Paneles Eléctricos</Link>
              </div>
            )}
          </div>

          <Link 
            className={`nav-link ${isActiveLink('/novedades') ? 'active' : ''}`} 
            to="/novedades" 
            onClick={closeMenu}
          >
            Novedades
          </Link>

          <Link 
            className={`nav-link ${isActiveLink('/contacto') ? 'active' : ''}`} 
            to="/contacto" 
            onClick={closeMenu}
          >
            Contacto
          </Link>
        </div>

        {/* Iconos derecha */}
        <div className="nav-actions">

          {/* Ícono de Productos con imagen */}
          <Link 
            to="/productos" 
            className={`action-icon cart-icon ${isActiveLink('/productos') ? 'active' : ''}`}
            onClick={closeMenu}
            title="Carrito"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/8146/8146003.png"
              alt="Productos"
              style={{ width: '50px', height: '40px', objectFit: 'cover' }}
            />
          </Link>

          {/* Imagen de contacto (usuario) */}
          <Link 
            to="/perfil" 
            className={`action-icon profile-icon ${isActiveLink('/perfil') ? 'active' : ''}`}
            onClick={closeMenu}
            title="Perfil"
          >
            <div className="profile-circle" style={{ width: '60px', height: '60px', overflow: 'hidden', borderRadius: '50%' }}>
              <img
                src="https://static.vecteezy.com/ti/vetor-gratis/p3/7407996-user-icon-person-icon-client-symbol-login-head-sign-icon-design-vetor.jpg"
                alt="Usuario"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </Link>

          {/* Botón modo oscuro */}
          <button 
            className="mode-toggle-btn"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <span className="mode-icon">{isDarkMode ? '☀️' : '🌙'}</span>
            <span className="mode-text">Modo {isDarkMode ? 'Claro' : 'Oscuro'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
