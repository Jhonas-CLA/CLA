import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const formData = {
      email: form.email,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name,
      rol: 'usuario'
    };

    try {
      const res = await fetch('http://localhost:8000/accounts/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Usuario registrado correctamente');
        setForm({
          email: '',
          password: '',
          confirmPassword: '',
          first_name: '',
          last_name: ''
        });
        navigate('/');
      } else {
        alert(data.error || 'Error en el registro');
      }
    } catch (error) {
      alert('Error del servidor');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Crear Cuenta</h2>

        <input
          name="first_name"
          placeholder="Nombre"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <input
          name="last_name"
          placeholder="Apellido"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirmar Contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <label className="show-password">
          <input
            type="checkbox"
            onChange={() => setShowPassword(!showPassword)}
          /> Mostrar contraseña
        </label>

        <button type="submit">Registrarse</button>

        <Link to="/" className="back-link">← Volver al inicio</Link>
      </form>
    </div>
  );
}

export default Register;
