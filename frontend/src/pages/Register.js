import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // NUEVO: Estado para la fortaleza de la contraseña
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    color: "#ccc",
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
    },
  });

  // NUEVO: Función para evaluar la fortaleza de la contraseña
  const evaluatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let text, color;

    if (password.length === 0) {
      text = "";
      color = "#ccc";
    } else if (password.length < 8) {
      text = "Muy débil (mínimo 8 caracteres)";
      color = "#ef4444";
    } else if (score <= 2) {
      text = "Débil";
      color = "#ef4444";
    } else if (score === 3) {
      text = "Regular";
      color = "#f59e0b";
    } else if (score === 4) {
      text = "Segura";
      color = "#10b981";
    } else if (score === 5) {
      text = "Muy segura";
      color = "#059669";
    }

    return { score, text, color, requirements };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Limpiar errores cuando el usuario empiece a escribir
    if (error) {
      setError("");
    }

    // NUEVO: Evaluar fortaleza cuando cambia la contraseña
    if (name === "password") {
      const strength = evaluatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de contraseña mínima
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const formData = {
      email: form.email,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name,
      rol: "usuario",
    };

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/accounts/register/", formData);

      if (data.id) {
        setSuccess("Usuario registrado correctamente");
        setForm({
          email: "",
          password: "",
          confirmPassword: "",
          first_name: "",
          last_name: "",
        });
        setTimeout(() => navigate("/"), 2000);
        // Limpiar indicador de fortaleza
        setPasswordStrength({
          score: 0,
          text: "",
          color: "#ccc",
          requirements: {
            length: false,
            uppercase: false,
            lowercase: false,
            numbers: false,
            symbols: false,
          },
        });
        navigate("/");
      } else {
        setError(data.error || "Error en el registro");
      }
    } catch (error) {
      setError("Error del servidor. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="register-title">Crear Cuenta</h2>

        {/* Mensaje de éxito */}
        {success && (
          <div
            style={{
              backgroundColor: "#d1fae5",
              border: "1px solid #10b981",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              color: "#047857",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            ✅ {success}
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              color: "#dc2626",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <input
          className="register-input"
          name="first_name"
          placeholder="Nombre"
          value={form.first_name}
          onChange={handleChange}
          required
        />

        <input
          className="register-input"
          name="last_name"
          placeholder="Apellido"
          value={form.last_name}
          onChange={handleChange}
          required
        />

        <input
          className="register-input"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        {/* Campo de contraseña con validación */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            className="register-input"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            className="register-input"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirmar Contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={{ marginTop: "8px" }}
          />
        </div>

        {/* NUEVO: Indicador de fortaleza de contraseña */}
        {form.password.length > 0 && (
          <div
            style={{
              width: "100%",
              marginTop: "8px",
              marginBottom: "16px",
              textAlign: "left",
            }}
          >
            {/* Barra de fortaleza */}
            <div
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "#e5e7eb",
                borderRadius: "3px",
                overflow: "hidden",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  height: "100%",
                  backgroundColor: passwordStrength.color,
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            {/* Texto de fortaleza */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  color: passwordStrength.color,
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                {passwordStrength.text}
              </span>
            </div>

            {/* Requisitos de la contraseña */}
            <div
              style={{
                fontSize: "0.8rem",
                color: "#64748b",
                backgroundColor: "#f8fafc",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
                Requisitos de seguridad:
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    color: passwordStrength.requirements.length
                      ? "#10b981"
                      : "#ef4444",
                  }}
                >
                  {passwordStrength.requirements.length ? "✓" : "✗"} 8+
                  caracteres
                </span>
                <span
                  style={{
                    color: passwordStrength.requirements.uppercase
                      ? "#10b981"
                      : "#ef4444",
                  }}
                >
                  {passwordStrength.requirements.uppercase ? "✓" : "✗"}{" "}
                  Mayúsculas (A-Z)
                </span>
                <span
                  style={{
                    color: passwordStrength.requirements.lowercase
                      ? "#10b981"
                      : "#ef4444",
                  }}
                >
                  {passwordStrength.requirements.lowercase ? "✓" : "✗"}{" "}
                  Minúsculas (a-z)
                </span>
                <span
                  style={{
                    color: passwordStrength.requirements.numbers
                      ? "✓0b981"
                      : "#ef4444",
                  }}
                >
                  {passwordStrength.requirements.numbers ? "✓" : "✗"} Números
                  (0-9)
                </span>
                <span
                  style={{
                    color: passwordStrength.requirements.symbols
                      ? "#10b981"
                      : "#ef4444",
                    gridColumn: "span 2",
                  }}
                >
                  {passwordStrength.requirements.symbols ? "✓" : "✗"} Símbolos
                  (!@#$%^&*)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Campo de confirmar contraseña */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            className="register-input"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirmar Contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={{
              borderColor:
                form.confirmPassword.length > 0
                  ? form.password === form.confirmPassword
                    ? "#10b981"
                    : "#ef4444"
                  : "#ddd",
              borderWidth: "2px",
            }}
          />
        </div>

        {/* Indicador de coincidencia de contraseñas */}
        {form.confirmPassword.length > 0 && (
          <div
            style={{
              marginTop: "4px",
              marginBottom: "16px",
              fontSize: "0.8rem",
              color:
                form.password === form.confirmPassword ? "#10b981" : "#ef4444",
              textAlign: "left",
              width: "100%",
            }}
          >
            {form.password === form.confirmPassword
              ? "✓ Las contraseñas coinciden"
              : "✗ Las contraseñas no coinciden"}
          </div>
        )}

        <button
          type="submit"
          className="register-button"
          disabled={
            loading ||
            form.password.length < 8 ||
            form.password !== form.confirmPassword ||
            !form.first_name ||
            !form.last_name ||
            !form.email
          }
          style={{
            opacity:
              loading ||
              form.password.length < 8 ||
              form.password !== form.confirmPassword ||
              !form.first_name ||
              !form.last_name ||
              !form.email
                ? 0.6
                : 1,
            cursor:
              loading ||
              form.password.length < 8 ||
              form.password !== form.confirmPassword ||
              !form.first_name ||
              !form.last_name ||
              !form.email
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <Link to="/" className="register-back-link">
          ← Volver al inicio
        </Link>
      </form>
    </div>
  );
}

export default Register;
