import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  // Organización de categorías por grupos
  const categorias = {
    'Cables y Conectores': [
      { name: 'Alambres y Cables', path: '/categorias/alambres-cables', icon: '🔌' },
      { name: 'Bornas y Conectores', path: '/categorias/bornas-conectores', icon: '🔗' },
      { name: 'Conectores', path: '/categorias/conectores', icon: '🔌' },
      { name: 'Terminales y Uniones', path: '/categorias/terminales-uniones', icon: '🔗' }
    ],
    'Iluminación': [
      { name: 'Iluminación', path: '/categorias/iluminacion', icon: '💡' },
      { name: 'Portalamparas y Plafones', path: '/categorias/portalamparas-plafones', icon: '💡' },
      { name: 'Reflectores y Fotoceldas', path: '/categorias/reflectores-fotoceldas', icon: '🔦' },
      { name: 'Boquillas', path: '/categorias/boquillas', icon: '💡' }
    ],
    'Protección Eléctrica': [
      { name: 'Automáticos / Breakers', path: '/categorias/automaticos-breakers', icon: '⚡' },
      { name: 'Tableros Eléctricos', path: '/categorias/tableros-electricos', icon: '📋' },
      { name: 'Contactores y Contadores', path: '/categorias/contactores-contadores', icon: '⚙️' },
      { name: 'Relés', path: '/categorias/reles', icon: '🔄' }
    ],
    'Tubería y Accesorios': [
      { name: 'Tubería EMT / IMC / PVC / LED', path: '/categorias/tuberia-emt-imc-pvc-led', icon: '🔧' },
      { name: 'Curvas y Accesorios de Tubería', path: '/categorias/curvas-accesorios-tuberia', icon: '🔧' },
      { name: 'Canaletas', path: '/categorias/canaletas', icon: '📐' },
      { name: 'Accesorios para Canaletas', path: '/categorias/accesorios-canaletas', icon: '🔧' }
    ],
    'Cajas y Instalación': [
      { name: 'Cajas', path: '/categorias/cajas', icon: '📦' },
      { name: 'Tapas y Accesorios de Superficie', path: '/categorias/tapas-accesorios-superficie', icon: '🔲' },
      { name: 'Rosetas', path: '/categorias/rosetas', icon: '🌸' },
      { name: 'Capacetes y Chazos', path: '/categorias/capacetes-chazos', icon: '🔩' }
    ],
    'Interruptores y Tomas': [
      { name: 'Interruptores y Programadores', path: '/categorias/interruptores-programadores', icon: '🔲' },
      { name: 'Tomas y Enchufes', path: '/categorias/tomas-enchufes', icon: '🔌' },
      { name: 'Clavijas', path: '/categorias/clavijas', icon: '🔌' },
      { name: 'Extensiones y Multitomas', path: '/categorias/extensiones-multitomas', icon: '🔌' }
    ],
    'Herramientas y Medición': [
      { name: 'Herramientas y Accesorios Especiales', path: '/categorias/herramientas-accesorios-especiales', icon: '🛠️' },
      { name: 'Instrumentos de Medición', path: '/categorias/instrumentos-medicion', icon: '📏' },
      { name: 'Testers y Medidores', path: '/categorias/testers-medidores', icon: '🔍' },
      { name: 'Discos para Pulidora', path: '/categorias/discos-pulidora', icon: '💿' }
    ],
    'Sujeción y Soporte': [
      { name: 'Abrazaderas y Amarres', path: '/categorias/abrazaderas-amarres', icon: '🔗' },
      { name: 'Soportes, Pernos y Herrajes', path: '/categorias/soportes-pernos-herrajes', icon: '🔩' },
      { name: 'Hebillas, Grapas y Perchas', path: '/categorias/hebillas-grapas-perchas', icon: '📎' },
      { name: 'Tensores', path: '/categorias/tensores', icon: '🔗' }
    ],
    'Sensores y Control': [
      { name: 'Sensores y Temporizadores', path: '/categorias/sensores-temporizadores', icon: '⏱️' },
      { name: 'Timbres', path: '/categorias/timbres', icon: '🔔' }
    ],
    'Materiales y Sellantes': [
      { name: 'Cintas Aislantes', path: '/categorias/cintas-aislantes', icon: '📏' },
      { name: 'Siliconas y Sellantes', path: '/categorias/siliconas-sellantes', icon: '🧴' },
      { name: 'Soldaduras', path: '/categorias/soldaduras', icon: '🔥' }
    ],
    'Electrodomésticos': [
      { name: 'Campanas Extractoras', path: '/categorias/campanas-extractoras', icon: '💨' },
      { name: 'Duchas', path: '/categorias/duchas', icon: '🚿' }
    ],
    'Otros': [
      { name: 'Otros / Misceláneos', path: '/categorias/otros-miscelaneos', icon: '📦' }
    ]
  };

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
            to="/Login" 
            className={`action-icon profile-icon ${isActiveLink('/Login') ? 'active' : ''}`}
            onClick={closeMenu}
            title="Login"
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