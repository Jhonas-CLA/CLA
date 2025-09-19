import React from 'react';
import Slider from 'react-slick';
import './ProductCarousel.css';

function ProductCarousel({ productos }) {
  if (!productos || productos.length === 0) {
    return <p className="text-center mt-4">No hay productos disponibles.</p>;
  }

  // 👇 Limitamos a solo 20 productos
  const productosLimitados = productos.slice(0, 20);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(productosLimitados.length, 5), // máximo 5 visibles
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      { breakpoint: 1400, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {productosLimitados.map((producto) => (
          <div key={producto.id} className="product-card">
            <div className="product-image-container">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="product-image"
              />
            </div>
            <div className="product-info">
              <h5 className="product-name">{producto.nombre}</h5>
              <p className="product-price">${producto.precio}</p>
              <p
                className={`product-stock ${
                  producto.cantidad > 0 ? 'in-stock' : 'out-of-stock'
                }`}
              >
                {producto.cantidad > 0
                  ? `Cantidad: ${producto.cantidad}`
                  : 'Sin stock'}
              </p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default ProductCarousel;
