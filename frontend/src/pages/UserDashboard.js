import React, { useState, useEffect } from 'react';
import './UserDashboard.css';

function UserDashboard() {
  const [isOpen, setIsOpen] = useState(false);

  // Función para alternar el menú
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Función para manejar click en enlaces
  const handleEnlaceClick = (enlace) => {
    setIsOpen(true);
    console.log(`Navegando a: ${enlace}`);
  };

  //  Función para manejar logout
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres salir?')) {
      console.log('Usuario desconectado');
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
  };

  // Cargar iconos de Boxicons al montar el componente
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
          <div className="enlace" onClick={() => handleEnlaceClick('Favoritos')}>
            <i className="bx bx-user"></i>
            <span>Favoritos</span>
          </div>

          <div className="enlace" onClick={() => handleEnlaceClick('productos')}>
            <i className="bx bx-package"></i>
            <span>Productos</span>
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
    </div>
  );
}

export default UserDashboard;