import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import './ResetPassword.css';

function ResetPassword() {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMsg("❌ Las contraseñas no coinciden.");
      return;
    }

    try {
      const url = `http://localhost:8000/accounts/reset-password/${uidb64}/${token}/`;
      console.log("Enviando a:", url);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      setMsg(data.message || data.error);
    } catch (error) {
      console.error("ERROR DE FETCH:", error);
      setMsg("Error al conectar con el servidor");
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2>Restablecer Contraseña</h2>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="checkbox-container">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword">Mostrar contraseña</label>
          </div>

          <button type="submit">Cambiar</button>
        </form>

        {msg && <p className="reset-password-message">{msg}</p>}

        <div className="back-to-login">
          <Link to="/login">← Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
