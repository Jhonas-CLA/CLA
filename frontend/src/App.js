import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Layout from './components/Layout';

import Home from './pages/Home';
import QuienesSomos from './pages/QuienesSomos';
import Categorias from './pages/Categorias';
import Novedades from './pages/Novedades';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Register from './pages/Register';
import CategoriaDetalle from './pages/CategoriaDetalle';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Carrito from './pages/Carrito';
import Proveedores from './pages/proveedores';
import DashboardProductos from './pages/DashboardProductos';

import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

import { ThemeProvider, useTheme } from './context/ThemeContext';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './index.css';

function AppContent() {
  const { darkMode } = useTheme();

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <Router>
        <Routes>
          {/* Con Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/novedades" element={<Novedades />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/perfil" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registrarse" element={<Register />} />
            <Route path="/categorias/:nombre" element={<CategoriaDetalle />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          </Route>

          {/* Sin Layout */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/analiticas" element={<UserDashboard />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/dashboard/productos" element={<DashboardProductos />} />

        </Routes>
      </Router>
    </div>
  ); 
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;