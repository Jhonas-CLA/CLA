import React from 'react';
import './ProductoCard.css';

function ProductoCard({ producto }) {
  return (
    <div className="producto-card">
      <h3>{producto.nombre}</h3>
      <p>{producto.descripcion}</p>
      <span>${producto.precio}</span>
    </div>
  );
}

export default ProductoCard;
