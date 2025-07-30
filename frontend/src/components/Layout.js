import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
  const location = useLocation();

  // Detectamos si estamos en el dashboard (ajusta rutas según necesites)
  const isDashboard =
    location.pathname.startsWith('/admin/dashboard') ||
    location.pathname.startsWith('/analiticas');

  return (
    <>
      {!isDashboard && <Navbar />}
      <main>{children}</main>
      {!isDashboard && <Footer />}
    </>
  );
}

export default Layout;
