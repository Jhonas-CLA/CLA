import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import './ResetPassword.css';

function ResetPassword() {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // NUEVO: Estado para la fortaleza de la contraseña
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: '',
    color: '#ccc',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false
    }
  });

  // NUEVO: Función para evaluar la fortaleza de la contraseña
  const evaluatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let text, color;
    
    if (password.length === 0) {
      text = '';
      color = '#ccc';
    } else if (password.length < 8) {
      text = 'Muy débil (mínimo 8 caracteres)';
      color = '#ef4444';
    } else if (score <= 2) {
      text = 'Débil';
      color = '#ef4444';
    } else if (score === 3) {
      text = 'Regular';
      color = '#f59e0b';
    } else if (score === 4) {
      text = 'Segura';
      color = '#10b981';
    } else if (score === 5) {
      text = 'Muy segura';
      color = '#059669';
    }

    return { score, text, color, requirements };
  };

  // NUEVO: Manejar cambio en la contraseña
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Limpiar mensajes cuando el usuario empiece a escribir
    if (msg) {
      setMsg('');
    }
    
    // Evaluar fortaleza en tiempo real
    const strength = evaluatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NUEVO: Validación de contraseña mínima
    if (password.length < 8) {
      setMsg("❌ La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("❌ Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      const url = `https://electricosandsoluciones.onrender.com/accounts/reset-password/${uidb64}/${token}/`;
      console.log("Enviando a:", url);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMsg("✅ " + (data.message || "Contraseña cambiada correctamente"));
        // Limpiar formulario en caso de éxito
        setPassword('');
        setConfirmPassword('');
        setPasswordStrength({
          score: 0,
          text: '',
          color: '#ccc',
          requirements: {
            length: false,
            uppercase: false,
            lowercase: false,
            numbers: false,
            symbols: false
          }
        });
      } else {
        setMsg("❌ " + (data.error || data.message || "Error al cambiar la contraseña"));
      }
    } catch (error) {
      console.error("ERROR DE FETCH:", error);
      setMsg("❌ Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2>Restablecer Contraseña</h2>
        <p style={{ 
          color: '#666', 
          marginBottom: '20px', 
          textAlign: 'center',
          fontSize: '0.9rem' 
        }}>
          Crea una nueva contraseña segura para tu cuenta
        </p>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* Campo de nueva contraseña */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña (mínimo 8 caracteres)"
              value={password}
              onChange={handlePasswordChange}
              required
              minLength="8"
              disabled={loading}
              style={{
                borderColor: password.length > 0 ? passwordStrength.color : '#ddd',
                borderWidth: '2px',
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* NUEVO: Indicador de fortaleza de contraseña */}
          {password.length > 0 && (
            <div style={{ 
              width: '100%', 
              marginTop: '8px', 
              marginBottom: '16px',
              textAlign: 'left'
            }}>
              {/* Barra de fortaleza */}
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#e5e7eb',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  height: '100%',
                  backgroundColor: passwordStrength.color,
                  transition: 'all 0.3s ease'
                }} />
              </div>
              
              {/* Texto de fortaleza */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <span style={{
                  color: passwordStrength.color,
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {passwordStrength.text}
                </span>
              </div>
              
              {/* Requisitos de la contraseña */}
              <div style={{
                fontSize: '0.8rem',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>Requisitos de seguridad:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <span style={{ color: passwordStrength.requirements.length ? '#10b981' : '#ef4444' }}>
                    {passwordStrength.requirements.length ? '✓' : '✗'} 8+ caracteres
                  </span>
                  <span style={{ color: passwordStrength.requirements.uppercase ? '#10b981' : '#ef4444' }}>
                    {passwordStrength.requirements.uppercase ? '✓' : '✗'} Mayúsculas (A-Z)
                  </span>
                  <span style={{ color: passwordStrength.requirements.lowercase ? '#10b981' : '#ef4444' }}>
                    {passwordStrength.requirements.lowercase ? '✓' : '✗'} Minúsculas (a-z)
                  </span>
                  <span style={{ color: passwordStrength.requirements.numbers ? '#10b981' : '#ef4444' }}>
                    {passwordStrength.requirements.numbers ? '✓' : '✗'} Números (0-9)
                  </span>
                  <span style={{ 
                    color: passwordStrength.requirements.symbols ? '#10b981' : '#ef4444', 
                    gridColumn: 'span 2' 
                  }}>
                    {passwordStrength.requirements.symbols ? '✓' : '✗'} Símbolos (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Campo de confirmar contraseña */}
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (msg) setMsg(''); // Limpiar mensajes
            }}
            required
            disabled={loading}
            style={{
              borderColor: confirmPassword.length > 0 
                ? (password === confirmPassword ? '#10b981' : '#ef4444')
                : '#ddd',
              borderWidth: '2px',
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
              marginTop: '8px'
            }}
          />

          {/* Indicador de coincidencia de contraseñas */}
          {confirmPassword.length > 0 && (
            <div style={{ 
              marginTop: '4px', 
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: password === confirmPassword ? '#10b981' : '#ef4444',
              textAlign: 'left',
              width: '100%'
            }}>
              {password === confirmPassword 
                ? '✓ Las contraseñas coinciden' 
                : '✗ Las contraseñas no coinciden'
              }
            </div>
          )}

          <div className="checkbox-container">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              disabled={loading}
            />
            <label htmlFor="showPassword">Mostrar contraseñas</label>
          </div>

          <button 
            type="submit"
            disabled={
              loading || 
              password.length < 8 || 
              password !== confirmPassword
            }
            style={{
              opacity: (loading || password.length < 8 || password !== confirmPassword) ? 0.6 : 1,
              cursor: (loading || password.length < 8 || password !== confirmPassword) ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              width: '100%',
              marginTop: '8px'
            }}
          >
            {loading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
          </button>
        </form>

        {/* Mensaje de estado */}
        {msg && (
          <div style={{
            padding: '12px',
            borderRadius: '6px',
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            backgroundColor: msg.startsWith('✅') ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${msg.startsWith('✅') ? '#22c55e' : '#ef4444'}`,
            color: msg.startsWith('✅') ? '#065f46' : '#dc2626'
          }}>
            {msg}
          </div>
        )}

        <div className="back-to-login">
          <Link to="/login">← Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;