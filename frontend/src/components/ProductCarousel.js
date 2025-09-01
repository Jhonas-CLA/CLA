import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./ProductCarousel.css";

function ProductCarousel({ productos }) {
  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 5 },
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 },
    tablet: { breakpoint: { max: 1024, min: 768 }, items: 2 },
    mobile: { breakpoint: { max: 768, min: 0 }, items: 1 }
  };

  return (
    <div className="product-carousel-container">
      {productos.length > 0 ? (
        <Carousel
          responsive={responsive}
          infinite
          autoPlay
          autoPlaySpeed={3000}
          keyBoardControl
          containerClass="carousel-container"
          itemClass="carousel-item-padding-40-px"
        >
          {productos.map((producto) => (
            <div key={producto.id} className="product-card">
              <div className="image-container">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="product-image"
                />
                <span
                  className={`stock-badge ${
                    producto.cantidad > 0 ? "stock-available" : "stock-out"
                  }`}
                >
                  {producto.cantidad > 0
                    ? `Stock: ${producto.cantidad}`
                    : "Sin stock"}
                </span>
              </div>
              <div className="product-info">
                <h5 className="product-name">{producto.nombre}</h5>
                <p className="product-price">
                  ${producto.precio.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </Carousel>
      ) : (
        <p className="text-center text-muted">⚠️ No hay productos disponibles.</p>
      )}
    </div>
  );
}

export default ProductCarousel;
