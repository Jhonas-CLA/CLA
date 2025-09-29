import axios from "axios";

// Usa variable de entorno si existe, si no, elige según el hostname
export const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://electricosandsoluciones.onrender.com");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;