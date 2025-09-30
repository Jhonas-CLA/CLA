// ForgotPassword.js
import { useState } from "react";
import { Link } from "react-router-dom";
import './ForgotPassword.css';
import api from "../api"; // ✅ instancia de Axios con BASE_URL

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/accounts/forgot-password/", { email });
      setMsg(response.data.message || "Se envió el enlace correctamente");
    } catch (error) {
      console.error("Error enviando el enlace:", error);
      setMsg(error.response?.data?.error || "No se pudo enviar el enlace");
    }
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
            required
          />
          <button type="submit">Enviar enlace</button>
        </form>
        {msg && <p className="forgot-password-message">{msg}</p>}
        <p className="back-to-login">
          <Link to="/login">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
