import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import api, { BASE_URL } from "../api"; // Importa la instancia de Axios y la base URL
import FavoriteButton from '../components/FavoriteButton';
import "./Categorias.css";

// URL base para las imágenes (usa la misma que la API)
const IMAGE_BASE_URL = BASE_URL;

const CategoriasDetalle = () => {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeo de URLs a nombres exactos de categorías
  const categoriasMap = {
    'automaticos-breakers': 'Automáticos / Breakers',
    'alambres-cables': 'Alambres y Cables',
    'abrazaderas-amarres': 'Abrazaderas y Amarres',
    'accesorios-canaletas-emt-pvc': 'Accesorios para Canaletas / EMT / PVC',
    'bornas-conectores': 'Bornas y Conectores',
    'herramientas-accesorios-especiales': 'Herramientas y Accesorios Especiales',
    'boquillas': 'Boquillas',
    'cajas': 'Cajas',
    'canaletas': 'Canaletas',
    'capacetes-chazos': 'Capacetes y Chazos',
    'cintas-aislantes': 'Cintas Aislantes',
    'clavijas': 'Clavijas',
    'conectores': 'Conectores',
    'contactores-contadores': 'Contactores y Contadores',
    'curvas-accesorios-tuberia': 'Curvas y Accesorios de Tubería',
    'discos-pulidora': 'Discos para Pulidora',
    'duchas': 'Duchas',
    'extensiones-multitomas': 'Extensiones y Multitomas',
    'hebillas-grapas-perchas': 'Hebillas, Grapas y Perchas',
    'iluminacion': 'Iluminación',
    'instrumentos-medicion': 'Instrumentos de Medición',
    'interruptores-programadores': 'Interruptores y Programadores',
    'otros-miscelaneos': 'Otros / Misceláneos',
    'portalamparas-plafones': 'Portalamparas y Plafones',
    'reflectores-fotoceldas': 'Reflectores y Fotoceldas',
    'reles': 'Relés',
    'rosetas': 'Rosetas',
    'sensores-temporizadores': 'Sensores y Temporizadores',
    'soldaduras': 'Soldaduras',
    'soportes-pernos-herrajes': 'Soportes, Pernos y Herrajes',
    'tableros-electricos': 'Tableros Eléctricos',
    'tapas-accesorios-superficie': 'Tapas y Accesorios de Superficie',
    'tensores': 'Tensores',
    'terminales-uniones': 'Terminales y Uniones',
    'timbres': 'Timbres',
    'tomas-enchufes': 'Tomas y Enchufes',
    'tuberia': 'Tuberia'
  };

  // Función para obtener la URL completa de la imagen
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    let fullUrl;
    if (imagePath.startsWith('/media/')) {
      fullUrl = `${IMAGE_BASE_URL}${imagePath}`;
    } else if (imagePath.startsWith('media/')) {
      fullUrl = `${IMAGE_BASE_URL}/${imagePath}`;
    } else {
      fullUrl = `${IMAGE_BASE_URL}/media/${imagePath}`;
    }
    return fullUrl;
  };

  // Función para manejar clic en producto
  const handleProductoClick = (producto) => {
    localStorage.setItem('productoSeleccionado', JSON.stringify(producto));
    localStorage.setItem('categoriaSeleccionada', nombre);
    navigate('/carrito');
  };

  useEffect(() => {
    if (nombre) {
      setLoading(true);
      const categoriaExacta = categoriasMap[nombre];
      if (categoriaExacta) {
        api
          .get(`/api/productos/?categoria=${encodeURIComponent(nombre)}`)
          .then((response) => {
            setProductos(response.data);
          })
          .catch(() => {
            setProductos([]);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        const nombreFormateado = formatearNombre(nombre);
        api
          .get(`/api/productos/?categoria=${encodeURIComponent(nombreFormateado)}`)
          .then((response) => {
            setProductos(response.data);
          })
          .catch(() => {
            setProductos([]);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [nombre]);

  const formatearNombre = (nombre) => {
    return nombre
      .replace(/-/g, ' ')
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  const getNombreDisplay = () => {
    return categoriasMap[nombre] || formatearNombre(nombre);
  };

  if (loading) {
    return (
      <div className="carrito-container">
        <div className="page-wrapper" style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: '#666', fontSize: '1.2rem' }}>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="page-wrapper" style={{ position: "relative" }}>
        {/* Cuadro flotante dentro del área blanca */}
        <div style={{
          position: "absolute",
          top: "5px",
          right: "30px",
          width: "300px",
          background: "#fff8e1",
          padding: "18px",
          borderRadius: "14px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100
        }}>
          <h4 style={{ color: "#7a5a00", fontSize: "1rem", margin: "0 0 8px" }}>
            ¿Te gustó algo?
          </h4>
          <button
            onClick={() => navigate("/carrito")}
            style={{
              background: "#FFD700",
              color: "#000",
              border: "none",
              padding: "10px 20px",
              fontSize: "1rem",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "transform 0.14s ease, background 0.14s ease",
              fontWeight: "700",
              width: "100%"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e6c200";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#FFD700";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Ir al carrito
          </button>
        </div>

        {/* Header con espacio para el botón flotante */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px', 
          paddingRight: '320px' // Espacio para el botón flotante
        }}>
          <h1 style={{ color: '#FFD700', fontSize: '2.5rem', marginBottom: '10px' }}>
            {getNombreDisplay()}
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {productos.length} producto{productos.length !== 1 ? 's' : ''} encontrado{productos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Productos con mejor grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '25px',
          padding: '0 20px'
        }}>
          {productos.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center', 
              padding: '80px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '15px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: '0.5' }}>📦</div>
              <p style={{ color: '#666', fontSize: '1.4rem', marginBottom: '10px', fontWeight: '600' }}>
                No se encontraron productos
              </p>
              <p style={{ color: '#999', fontSize: '1rem' }}>
                en la categoría "{getNombreDisplay()}"
              </p>
              <button
                onClick={() => navigate('/')}
                style={{
                  marginTop: '20px',
                  background: '#FFD700',
                  color: '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'background 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e6c200'}
                onMouseOut={(e) => e.currentTarget.style.background = '#FFD700'}
              >
                Ver todas las categorías
              </button>
            </div>
          ) : (
            productos.map((prod) => (
              <div key={prod.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                border: '1px solid #f0f0f0',
                position: 'relative'
              }}
              onClick={() => handleProductoClick(prod)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              >
                {/* Botón de favorito en la esquina superior derecha */}
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  zIndex: 10 
                }}
                onClick={(e) => e.stopPropagation()}
                >
                  <FavoriteButton 
                    producto={prod} 
                    size="small"
                  />
                </div>

                {/* Imagen del producto */}
                {prod.imagen ? (
                  <div style={{ 
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    overflow: 'hidden',
                    backgroundColor: '#fafafa',
                    borderRadius: '8px'
                  }}>
                    <img 
                      src={getImageUrl(prod.imagen)} 
                      alt={prod.nombre || prod.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '6px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.image-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'image-placeholder';
                          placeholder.style.cssText = `
                            width: 100%;
                            height: 180px;
                            background-color: #f3f4f6;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            border-radius: 6px;
                            color: #9ca3af;
                            font-size: 14px;
                          `;
                          placeholder.innerHTML = '<div style="font-size: 2rem; margin-bottom: 8px;">📷</div>Sin imagen disponible';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    marginBottom: '15px',
                    height: '200px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📷</div>
                    Sin imagen disponible
                  </div>
                )}

                {/* Información del producto */}
                <div>
                  <h3 style={{ 
                    color: '#001152', 
                    marginBottom: '10px',
                    fontSize: '1.1rem',
                    lineHeight: '1.4',
                    minHeight: '50px',
                    fontWeight: '600'
                  }}>
                    {prod.nombre || prod.name}
                  </h3>
                  
                  {prod.codigo && (
                    <div style={{ 
                      color: '#666', 
                      fontSize: '0.85rem', 
                      marginBottom: '10px',
                      fontFamily: 'monospace',
                      backgroundColor: '#f8f9fa',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      border: '1px solid #e9ecef'
                    }}>
                      {prod.codigo}
                    </div>
                  )}
                  
                  {prod.descripcion && (
                    <p style={{ 
                      color: '#666', 
                      fontSize: '0.9rem', 
                      marginBottom: '15px',
                      lineHeight: '1.4',
                      maxHeight: '40px',
                      overflow: 'hidden'
                    }}>
                      {prod.descripcion}
                    </p>
                  )}
                  
                  {/* Precio e icono del carrito (CAMBIO: Se removió el stock) */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginTop: '15px'
                  }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1.3rem', 
                      color: '#001152' 
                    }}>
                      ${(prod.precio || 0).toLocaleString('es-CO')}
                    </span>
                    
                    {/* NUEVO: Icono de carrito en lugar del stock */}
                    <div style={{
                      backgroundColor: '#FFD700',
                      color: '#001152',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                    }}>
                      🛒
                      <span style={{ fontSize: '0.8rem' }}>Agregar</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriasDetalle;