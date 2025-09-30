import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const FavoriteButton = ({ producto, onToggle = null, size = 'normal' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { apiCall, isAuthenticated } = useAuth();

  const buttonSize = size === 'small' ? '32px' : '40px';
  const iconSize = size === 'small' ? '16px' : '20px';

  // Verificar si es favorito al cargar el componente
  useEffect(() => {
    const verificarFavorito = async () => {
      if (!isAuthenticated || !producto?.id) return;

      try {
        const response = await apiCall(`/api/favoritos/verificar/${producto.id}/`);
        const data = response.data || response;

        if (data.es_favorito !== undefined) {
          setIsFavorite(data.es_favorito);
        }
      } catch (error) {
        console.error('Error verificando favorito:', error);
      }
    };

    verificarFavorito();
  }, [producto?.id, isAuthenticated, apiCall]);

  const toggleFavorito = async () => {
    if (!isAuthenticated || !producto?.id) return;

    // ✅ Cambio optimista
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);
    setLoading(true);

    try {
      const response = await apiCall('/api/favoritos/toggle/', {
        method: 'POST',
        body: JSON.stringify({ producto_id: producto.id }),
      });

      const data = response.data || response;

      if (data.success) {
        if (onToggle) {
          onToggle(producto.id, data.es_favorito, data.action);
        }
      } else {
        // ❌ Si falla, revertir
        setIsFavorite(previousState);
      }
    } catch (error) {
      console.error('Error en toggle favorito:', error);
      // ❌ Si falla, revertir
      setIsFavorite(previousState);
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
