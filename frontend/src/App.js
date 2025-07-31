// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Páginas
import Home from './pages/Home';
import QuienesSomos from './pages/QuienesSomos';
import Categorias from './pages/Categorias';
import Novedades from './pages/Novedades';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Register from './pages/Register';
import CategoriaDetalle from './pages/CategoriaDetalle';
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ShoppingCartElectrical from './pages/Carrito';

// Dashboards
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/novedades" element={<Novedades />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/perfil" element={<Login />} />
        <Route path="/categorias/:nombre" element={<CategoriaDetalle />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
        <Route path="/productos" element={<ShoppingCartElectrical />} />
        {/* Rutas con Layout (Navbar y Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/novedades" element={<Novedades />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/registrarse" element={<Register />} />
          <Route path="/categorias/:nombre" element={<CategoriaDetalle />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
        </Route>

        {/* Rutas sin Layout (sin Navbar ni Footer) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/analiticas" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;