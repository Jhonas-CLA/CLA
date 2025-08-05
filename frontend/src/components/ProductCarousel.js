// src/components/ProductCarousel.js
import React from 'react';
import Slider from 'react-slick';
import './ProductCarousel.css'; // Aquí puedes meter esto en el mismo archivo si lo prefieres

const productosMock = [
  {
    id: 1,
    nombre: 'Cable de Cobre',
    descripcion: 'Cable de cobre de 5m para instalaciones eléctricas',
    precio: '$10.000',
    imagen: 'https://via.placeholder.com/300x200?text=Cable+1'
  },
  {
    id: 2,
    nombre: 'Interruptor Inteligente',
    descripcion: 'Controla tus luces desde el celular',
    precio: '$25.000',
    imagen: 'https://via.placeholder.com/300x200?text=Interruptor'
  },
  {
    id: 3,
    nombre: 'Bombillo LED',
    descripcion: 'Ahorro de energía garantizado',
    precio: '$5.000',
    imagen: 'https://via.placeholder.com/300x200?text=Bombillo'
  },
  {
    id: 4,
    nombre: 'Tomacorriente doble',
    descripcion: 'Ideal para oficinas y hogares',
    precio: '$12.000',
    imagen: 'https://via.placeholder.com/300x200?text=Tomacorriente'
  },
  {
    id: 5,
    nombre: 'Sensor de movimiento',
    descripcion: 'Automatiza luces con movimiento',
    precio: '$18.000',
    imagen: 'https://via.placeholder.com/300x200?text=Sensor'
  },
  {
    id: 6,
    nombre: 'Regulador de Voltaje',
    descripcion: 'Protege tus electrodomésticos',
    precio: '$30.000',
    imagen: 'https://via.placeholder.com/300x200?text=Regulador'
  },
  {
    id: 7,
    nombre: 'Timbre inalámbrico',
    descripcion: 'Fácil de instalar',
    precio: '$9.000',
    imagen: 'https://via.placeholder.com/300x200?text=Timbre'
  },
  {
    id: 8,
    nombre: 'Cable canal',
    descripcion: 'Organiza y protege cables',
    precio: '$4.000',
    imagen: 'https://via.placeholder.com/300x200?text=Cable+Canal'
  },
  {
    id: 9,
    nombre: 'Extensión eléctrica',
    descripcion: 'Con 6 entradas y botón de seguridad',
    precio: '$15.000',
    imagen: 'https://via.placeholder.com/300x200?text=Extension'
  },
  {
    id: 10,
    nombre: 'Caja de distribución',
    descripcion: 'Distribuye circuitos de forma segura',
    precio: '$40.000',
    imagen: 'https://via.placeholder.com/300x200?text=Caja'
  }
];

const ProductCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };

  return (
    <div style={styles.carouselWrapper}>
      <Slider {...settings}>
        {productosMock.map((producto) => (
          <div key={producto.id} style={styles.productoCard}>
            <img src={producto.imagen} alt={producto.nombre} style={styles.imagen} />
            <h3 style={styles.titulo}>{producto.nombre}</h3>
            <p style={styles.descripcion}>{producto.descripcion}</p>
            <span style={styles.precio}>{producto.precio}</span>
          </div>
        ))}
      </Slider>
    </div>
  );
};

const styles = {
  carouselWrapper: {
    margin: '40px auto',
    maxWidth: '1100px',
    padding: '10px'
  },
  productoCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1rem',
    margin: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '240px',
    textAlign: 'center',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  },
  imagen: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  titulo: {
    color: '#2c3e50',
    margin: '10px 0 5px 0'
  },
  descripcion: {
    fontSize: '14px',
    color: '#333'
  },
  precio: {
    display: 'block',
    marginTop: '8px',
    fontWeight: 'bold',
    color: '#27ae60'
  }
};

export default ProductCarousel;
