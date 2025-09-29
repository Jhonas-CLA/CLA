// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, userRole } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 2s linear infinite'
        }}></div>
        <p style={{ marginTop: '10px', color: '#666' }}>Verificando autenticación...</p>
      </div>
    );
  }

  // Si no está autenticado, redireccionar al login
  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  // Verificar rol si se requiere uno específico
  if (requiredRole && userRole !== requiredRole) {
    // Si no tiene el rol requerido, redirigir al dashboard general
    return <Navigate to="/analiticas" replace />;
  }

  // Todo correcto, renderizar los hijos
  return children;
};

export default ProtectedRoute;
