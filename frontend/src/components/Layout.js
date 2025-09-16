// src/components/Layout.jsx
import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  const location = useLocation();

  const hideLayoutRoutes = [
    '/admin/dashboard',
    '/user/dashboard',
    '/usuario/dashboard'
  ];

  const hideLayout = hideLayoutRoutes.some(route =>
    location.pathname.toLowerCase().startsWith(route)
  );

  return (
    <>
      {!hideLayout && <Navbar />}
      <main>
        <Outlet />
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

export default Layout;
