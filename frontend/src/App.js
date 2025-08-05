import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import QuienesSomos from './pages/QuienesSomos';
import Categorias from './pages/Categorias';
import Novedades from './pages/Novedades';
import Contacto from './pages/Contacto';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import CategoriaDetalle from './pages/CategoriaDetalle';
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

import { ThemeProvider, useTheme } from './context/ThemeContext'; // ✅ IMPORT CORRECTO

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './index.css'; // ✅ asegúrate de tener las variables CSS aquí

// 👇 Este componente puede usar el hook useTheme sin problema
function AppContent() {
  const { darkMode } = useTheme();

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/novedades" element={<Novedades />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/perfil" element={<Login />} />
          <Route path="/categorias/:nombre" element={<CategoriaDetalle />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/analiticas" element={<UserDashboard />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

// 👇 Envolvemos toda la app con el proveedor del contexto de tema
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;