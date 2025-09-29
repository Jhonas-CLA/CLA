import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const FavoriteButton = ({ producto, onToggle = null, size = 'normal' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, apiCall, isAuthenticated } = useAuth();

  const buttonSize = size === 'small' ? '32px' : '40px';
  const iconSize = size === 'small' ? '16px' : '20px';

  // Verificar si es favorito al cargar el componente
  useEffect(() => {
    const verificarFavorito = async () => {
      if (!isAuthenticated || !producto?.id) return;

      try {
        const response = await apiCall(`/api/favoritos/verificar/${producto.id}/`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.es_favorito);
        }
      } catch (error) {
        console.error('Error verificando favorito:', error);
      }
    };

    verificarFavorito();
  }, [producto?.id, isAuthenticated, apiCall]);

  const toggleFavorito = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    if (!producto?.id) {
      console.error('ID del producto no válido');
      return;
    }

    setLoading(true);

    try {
      const response = await apiCall('/api/favoritos/toggle/', {
        method: 'POST',
        body: JSON.stringify({ producto_id: producto.id }),
      });

      const data = await response.json();

      if (data.success) {
        setIsFavorite(data.es_favorito);
        if (onToggle) {
          onToggle(producto.id, data.es_favorito, data.action);
        }
      } else {
        console.error('Error:', data.error);
        alert(data.error || 'Error al actualizar favorito');
      }
    } catch (error) {
      console.error('Error en toggle favorito:', error);
      alert('Error de conexión al actualizar favorito');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorito();
      }}
      disabled={loading}
      style={{
        width: buttonSize,
        height: buttonSize,
        borderRadius: '50%',
        border: 'none',
        backgroundColor: isFavorite ? '#ef4444' : '#f3f4f6',
        color: isFavorite ? 'white' : '#6b7280',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: iconSize,
        transition: 'all 0.2s ease',
        opacity: loading ? 0.6 : 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
      }}
      onMouseOver={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = isFavorite ? '#dc2626' : '#e5e7eb';
        }
      }}
      onMouseOut={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = isFavorite ? '#ef4444' : '#f3f4f6';
        }
      }}
      title={loading ? 'Cargando...' : isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {loading ? (
        <div style={{ 
          width: '12px', 
          height: '12px', 
          border: '2px solid #ccc',
          borderTop: '2px solid #666',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      ) : (
        isFavorite ? '❤️' : '🤍'
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default FavoriteButton;