// ForgotPassword.js
import { useState } from "react";
import { Link } from "react-router-dom"; // Asegúrate de importar Link
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/accounts/forgot-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    setMsg(data.message || data.error);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>¿Olvidaste tu contraseña?</h2>
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Enviar enlace</button>
        </form>
        {msg && <p className="forgot-password-message">{msg}</p>}
        {/* Enlace al inicio de sesión */}
        <p className="back-to-login">
          <Link to="/login">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
