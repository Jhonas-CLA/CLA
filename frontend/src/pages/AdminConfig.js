import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminConfig.css"; // Importar el archivo CSS

export default function AdminConfig() {
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAdminData = () => {
    const token = localStorage.getItem("token"); // JWT guardado al hacer login
    console.log("Token actual:", token);
    axios.get("http://localhost:8000/accounts/admin-profile/", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setAdminData(res.data);
      setError(null);
    })
    .catch(err => {
      console.error('Error completo:', err.response ? err.response.data : err);
      setError('Error al cargar los datos del administrador');
    });
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={fetchAdminData}
            className="retry-button"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!adminData) return <p className="loading-text">Cargando datos del administrador...</p>;

  return (
    <div className="admin-config-container">
      <div className="admin-profile">
        <img 
          src="https://via.placeholder.com/100" 
          alt="Avatar"
          className="avatar"
        />
        <div className="profile-info">
          <h2 className="admin-name">
            {adminData.first_name} {adminData.last_name}
          </h2>
          <p className="admin-email">{adminData.email}</p>
          <p className="admin-role">{adminData.role}</p>
        </div>
      </div>
    </div>
  );
}