import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import api from '../api';
import './ProductCarousel.css';

function ProductCarousel({ limite = 20, productos = null, useProp = false }) {
  const navigate = useNavigate();
  const [productosState, setProductosState] = useState([]);
  const [loading, setLoading] = useState(!useProp); // Si useProp es true, no hay loading inicial
 
  useEffect(() => {
    if (useProp && productos) {
      // Si se pasan productos como prop, usarlos directamente
      const productosMezclados = [...productos].sort(() => Math.random() - 0.5);
      const productosLimitados = productosMezclados.slice(0, limite);
      setProductosState(productosLimitados);
      setLoading(false);
    } else if (!useProp) {
      // Si no se usan props, cargar desde la API (comportamiento original)
      cargarProductosMezclados();
    }
  }, [limite, productos, useProp]);

  const cargarProductosMezclados = async () => {
    try {
      setLoading(true);
      
      // Cargar TODOS los productos usando la instancia de api configurada
      const response = await api.get('/api/products/');
      
      if (response.data && response.data.length > 0) {
        // Mezclar productos aleatoriamente (shuffle)
        const productosMezclados = [...response.data].sort(() => Math.random() - 0.5);
        
        // Limitar a la cantidad especificada
        const productosLimitados = productosMezclados.slice(0, limite);
        
        setProductosState(productosLimitados);
      } else {
        setProductosState([]);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductosState([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="carousel-container">
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          padding: '40px 0'
        }}>
          Cargando productos...
        </p>
      </div>
    );
  }

  if (!productosState || productosState.length === 0) {
    return (
      <div className="carousel-container">
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          padding: '40px 0'
        }}>
          No hay productos disponibles.
        </p>
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: productosState.length > 1,
    speed: 500,
    slidesToShow: Math.min(productosState.length, 4), // máximo 4 visibles
    slidesToScroll: 1,
    autoplay: true, // ✅ AUTOPLAY ACTIVADO
    autoplaySpeed: 3000, // Cambia cada 3 segundos
    pauseOnHover: true, // Se pausa al pasar el mouse
    arrows: true,
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(productosState.length, 3),
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(productosState.length, 2),
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      },
    ],
  };

  // Función para manejar clic en agregar al carrito
  const handleAddToCart = (producto) => {
    // Guardar el producto seleccionado en localStorage
    localStorage.setItem('productoSeleccionado', JSON.stringify(producto));
    
    // Guardar la categoría del producto si existe
    if (producto.categoria) {
      // Obtener el nombre de la categoría (puede ser objeto o string)
      const categoriaNombre = typeof producto.categoria === 'object' 
        ? producto.categoria.name 
        : producto.categoria;
      
      // Mapeo inverso para obtener la URL de la categoría
      const categoriasMapInverso = {
        'Automáticos / Breakers': 'automaticos-breakers',
        'Alambres y Cables': 'alambres-cables',
        'Abrazaderas y Amarres': 'abrazaderas-amarres',
        'Accesorios para Canaletas / EMT / PVC': 'accesorios-canaletas-emt-pvc',
        'Bornas y Conectores': 'bornas-conectores',
        'Herramientas y Accesorios Especiales': 'herramientas-accesorios-especiales',
        'Boquillas': 'boquillas',
        'Cajas': 'cajas',
        'Canaletas': 'canaletas',
        'Capacetes y Chazos': 'capacetes-chazos',
        'Cintas Aislantes': 'cintas-aislantes',
        'Clavijas': 'clavijas',
        'Conectores': 'conectores',
        'Contactores y Contadores': 'contactores-contadores',
        'Curvas y Accesorios de Tubería': 'curvas-accesorios-tuberia',
        'Discos para Pulidora': 'discos-pulidora',
        'Duchas': 'duchas',
        'Extensiones y Multitomas': 'extensiones-multitomas',
        'Hebillas, Grapas y Perchas': 'hebillas-grapas-perchas',
        'Iluminación': 'iluminacion',
        'Instrumentos de Medición': 'instrumentos-medicion',
        'Interruptores y Programadores': 'interruptores-programadores',
        'Otros / Misceláneos': 'otros-miscelaneos',
        'Portalamparas y Plafones': 'portalamparas-plafones',
        'Reflectores y Fotoceldas': 'reflectores-fotoceldas',
        'Relés': 'reles',
        'Rosetas': 'rosetas',
        'Sensores y Temporizadores': 'sensores-temporizadores',
        'Soldaduras': 'soldaduras',
        'Soportes, Pernos y Herrajes': 'soportes-pernos-herrajes',
        'Tableros Eléctricos': 'tableros-electricos',
        'Tapas y Accesorios de Superficie': 'tapas-accesorios-superficie',
        'Tensores': 'tensores',
        'Terminales y Uniones': 'terminales-uniones',
        'Timbres': 'timbres',
        'Tomas y Enchufes': 'tomas-enchufes',
        'Tuberia': 'tuberia'
      };
      
      // Obtener la URL de la categoría
      const categoriaUrl = categoriasMapInverso[categoriaNombre];
      
      if (categoriaUrl) {
        localStorage.setItem('categoriaSeleccionada', categoriaUrl);
      }
    }
    
    // Navegar al carrito
    navigate('/carrito');
  };

  const formatPrice = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {productosState.map((producto) => (
          <div key={producto.id}>
            <div className="product-card">
              <div className="product-image-container">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="product-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              <div className="product-info">
                <h5
                  className="product-name"
                  title={producto.nombre}
                >
                  {truncateText(producto.nombre, 50)}
                </h5>
               
                <p className="product-price">
                  {formatPrice(producto.precio)}
                </p>
               
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(producto)}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default ProductCarousel;