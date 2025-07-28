import React, { useEffect } from 'react';
import './Dashboard.css';

function AdminDashboard() {
  // 👉 Función para alternar la visibilidad del sidebar
  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('closed');
  };

  // 👉 Función para activar los ítems del menú
  const setActive = (target) => {
    // Remover clase active de todos los elementos
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    // Agregar clase active al elemento clickeado
    target.classList.add('active');
  };

  // 👉 Función de logout
  const logout = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('¿Estás seguro de que quieres salir?')) {
      localStorage.removeItem('token'); // Elimina token
      window.location.href = '/login';  // Redirige
    }
  };

  // 👉 Efectos y animaciones al cargar el componente
  useEffect(() => {
    // Agregar animaciones al cargar la página
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.5s ease';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        }, 50);
      }, index * 100);
    });

    // Cerrar sidebar al hacer clic fuera de él
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar');
      const toggleBtn = document.querySelector('.toggle-btn');
      
      // Si el sidebar está abierto y se hace clic fuera de él y fuera del botón toggle
      if (!sidebar.classList.contains('closed') && 
          !sidebar.contains(event.target) && 
          !toggleBtn.contains(event.target)) {
        sidebar.classList.add('closed');
      }
    };

    // Navegación con teclado
    const handleKeyDown = (event) => {
      // Abrir/cerrar sidebar con Ctrl + M
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        toggleSidebar();
      }
      
      // Cerrar sidebar con Escape
      if (event.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('closed')) {
          sidebar.classList.add('closed');
        }
      }
    };

    // Agregar event listeners
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar con el estilo visual mejorado */}
      <div id="sidebar" className="sidebar">
        <div className="header">
          <div className="logo-section">
            <div className="logo">⚡</div>
            <div className="company-name">Eléctricos &<br />Soluciones</div>
          </div>
          <button className="close-btn" onClick={toggleSidebar}>✕</button>
        </div>
        
        <nav className="menu">
          <a href="#usuarios" className="menu-item active" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">👤</div>
            <span>Usuarios</span>
          </a>
          
          <a href="#proveedores" className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">👥</div>
            <span>Proveedores</span>
          </a>
          
          <a href="#analiticos" className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">📊</div>
            <span>Analíticos</span>
          </a>
          
          <a href="#productos" className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">📦</div>
            <span>Productos</span>
          </a>
          
          <a href="#pedidos" className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">🛒</div>
            <span>Pedidos</span>
          </a>
          
          <a href="#configuracion" className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">⚙️</div>
            <span>Configuración</span>
          </a>
          
          <a href="#salir" className="menu-item" onClick={logout} style={{marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            <div className="menu-icon">🚪</div>
            <span>Salir</span>
          </a>
        </nav>
      </div>
      
      {/* Botón toggle fuera del sidebar */}
      <button className="toggle-btn" onClick={toggleSidebar}>☰</button>
      
   
          
          
    </div>
  );
}

export default AdminDashboard;