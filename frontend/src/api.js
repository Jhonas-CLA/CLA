// src/api.js
import axios from "axios";

// URL base de tu backend en Render
export const BASE_URL = "https://electricosandsoluciones.onrender.com/api";

// Instancia de axios para usar en toda la app
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // si usas autenticación por token:
    // "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
});

export default api;
