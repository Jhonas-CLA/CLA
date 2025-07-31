import React, { useEffect } from 'react';
import './Dashboard.css';

function AdminDashboard() {
  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('closed');
  };

  const setActive = (target) => {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    target.classList.add('active');
  };

  const logout = () => {
    if (window.confirm('¿Estás seguro de que quieres salir?')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
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

    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar');
      const toggleBtn = document.querySelector('.toggle-btn');
      if (
        !sidebar.classList.contains('closed') &&
        !sidebar.contains(event.target) &&
        !toggleBtn.contains(event.target)
      ) {
        sidebar.classList.add('closed');
      }
    };

    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        toggleSidebar();
      }
      if (event.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('closed')) {
          sidebar.classList.add('closed');
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div id="sidebar" className="sidebar">
        <div className="header">
          <div className="logo-section">
            <div className="logo">⚡</div>
            <div className="company-name">
              Eléctricos &<br />Soluciones
            </div>
          </div>
          <button className="close-btn" onClick={toggleSidebar}>✕</button>
        </div>

        <nav className="menu">
          <button className="menu-item active" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">👤</div>
            <span>Usuarios</span>
          </button>

          <button className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">👥</div>
            <span>Proveedores</span>
          </button>

          <button className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">📊</div>
            <span>Analíticos</span>
          </button>

          <button className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">📦</div>
            <span>Productos</span>
          </button>

          <button className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">🛒</div>
            <span>Pedidos</span>
          </button>

          <button className="menu-item" onClick={(e) => setActive(e.target)}>
            <div className="menu-icon">⚙️</div>
            <span>Configuración</span>
          </button>

          <button
            className="menu-item"
            onClick={logout}
            style={{
              marginTop: 'auto',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="menu-icon">🚪</div>
            <span>Salir</span>
          </button>
        </nav>
      </div>

      {/* Botón toggle */}
      <button className="toggle-btn" onClick={toggleSidebar}>☰</button>
    </div>
  );
}

export default AdminDashboard;
