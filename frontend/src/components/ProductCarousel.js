 import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import './ProductCarousel.css';

function ProductCarousel({ productos }) {
  const navigate = useNavigate();
 
  if (!productos || productos.length === 0) {
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

  // Limitamos a 20 productos máximo
  const productosLimitados = productos.slice(0, 20);

  const settings = {
    dots: true,
    infinite: productosLimitados.length > 1,
    speed: 500,
    slidesToShow: Math.min(productosLimitados.length, 4), // máximo 4 visibles
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
          slidesToShow: Math.min(productosLimitados.length, 3),
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(productosLimitados.length, 2),
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

  const handleAddToCart = () => {
    navigate("/carrito");
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
        {productosLimitados.map((producto) => (
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
                  title={producto.nombre} // Tooltip para nombre completo
                >
                  {truncateText(producto.nombre, 50)}
                </h5>
               
                <p className="product-price">
                  {formatPrice(producto.precio)}
                </p>
               
                <button
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
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