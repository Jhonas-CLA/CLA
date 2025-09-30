// src/pages/ForgotPassword.js
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api"; // tu instancia de Axios ya configurada
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const response = await api.post('/accounts/forgot-password/', { email });
      setMsg(response.data.message || "✅ Correo enviado correctamente");
    } catch (error) {
      console.error("Error enviando el enlace:", error);
      if (error.response) {
        // El servidor respondió con un error
        setMsg("❌ " + (error.response.data.error || "Error al enviar el correo"));
      } else {
        // Error de red u otro
        setMsg("❌ Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
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
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
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
