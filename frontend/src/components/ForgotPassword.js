import { useState } from "react";
import './ForgotPassword.css';
import api from "../api"; // Asegúrate de que apunte a la instancia de axios con la URL de Render

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/accounts/forgot-password/', { email });
      setMsg(data.message || data.error);
    } catch (error) {
      console.error(error);
      setMsg(error.response?.data?.error || 'Error al enviar el correo');
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
      </div>
    </div>
  );
}

export default ForgotPassword;
