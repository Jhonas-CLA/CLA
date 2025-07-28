import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

function UserDashboard() {
  const [isOpen, setIsOpen] = useState(false);

  // 👉 Función para alternar el menú
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 👉 Función para manejar click en enlaces
  const handleEnlaceClick = (enlace) => {
    setIsOpen(true);
    console.log(`Navegando a: ${enlace}`);
  };

  // 👉 Función para manejar logout
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres salir?')) {
      console.log('Usuario desconectado');
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
  };

  // 👉 Cargar iconos de Boxicons al montar el componente
  useEffect(() => {
    // Verificar si ya existe el link de boxicons
    if (!document.querySelector('link[href*="boxicons"]')) {
      const link = document.createElement('link');
      link.href = 'https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="dashboard-container">
      {/* SIDEBAR MENU */}
      <div className={`menu-dashboard ${isOpen ? 'open' : ''}`}>
        {/* TOP MENU */}
        <div className="top-menu">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <span>Eléctricos & Soluciones</span>
          </div>
          <div className="toggle" onClick={toggleMenu}>
            <i className={`bx ${isOpen ? 'bx-x' : 'bx-menu'}`}></i>
          </div>
        </div>

        {/* INPUT SEARCH */}
        <div className="input-search">
          <i className="bx bx-search"></i>
          <input 
            type="text" 
            className="input" 
            placeholder="Buscar..."
          />
        </div>

        {/* MENU */}
        <div className="menu">
          <div className="enlace" onClick={() => handleEnlaceClick('usuarios')}>
            <i className="bx bx-user"></i>
            <span>Usuarios</span>
          </div>

          <div className="enlace" onClick={() => handleEnlaceClick('proveedores')}>
            <i className="bx bx-group"></i>
            <span>Proveedores</span>
          </div>

          <div className="enlace" onClick={() => handleEnlaceClick('analiticos')}>
            <i className="bx bx-bar-chart-alt-2"></i>
            <span>Analíticos</span>
          </div>

          <div className="enlace" onClick={() => handleEnlaceClick('productos')}>
            <i className="bx bx-package"></i>
            <span>Productos</span>
          </div>

          <div className="enlace" onClick={() => handleEnlaceClick('pedidos')}>
            <i className="bx bx-shopping-bag"></i>
            <span>Pedidos</span>
          </div>

          <div className="enlace" onClick={() => handleEnlaceClick('configuracion')}>
            <i className="bx bx-cog"></i>
            <span>Configuración</span>
          </div>

          <div className="enlace logout" onClick={handleLogout}>
            <i className="bx bx-exit"></i>
            <span>Salir</span>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className={`main-content ${isOpen ? 'shifted' : ''}`}>
        <div className="welcome-section">
          <h1>Bienvenido al Dashboard</h1>
          <p>Gestiona tu negocio eléctrico de manera eficiente.</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bx bx-user"></i>
            </div>
            <div className="stat-info">
              <h3>156</h3>
              <p>Usuarios Activos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bx bx-package"></i>
            </div>
            <div className="stat-info">
              <h3>2,847</h3>
              <p>Productos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bx bx-shopping-bag"></i>
            </div>
            <div className="stat-info">
              <h3>432</h3>
              <p>Pedidos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bx bx-dollar"></i>
            </div>
            <div className="stat-info">
              <h3>$45,280</h3>
              <p>Ingresos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;