import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import QuienesSomos from './pages/QuienesSomos';
import Categorias from './pages/Categorias';
import Novedades from './pages/Novedades';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import CategoriaDetalle from './pages/CategoriaDetalle';
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ShoppingCartElectrical from './pages/Carrito';

function App() {
  return (
    <Router>
      <Navbar />
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
<<<<<<< HEAD
        <Route path="/productos" element={<ShoppingCartElectrical />} />
=======
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/analiticas" element={<UserDashboard />} />
>>>>>>> origin/develop
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;