import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductosList = ({ agregarAlCarrito }) => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/productos/')
      .then(res => setProductos(res.data))
      .catch(err => console.error('Error al cargar productos:', err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {productos.map(producto => (
        <div key={producto.id} className="bg-white p-4 shadow rounded">
          <h2 className="font-bold text-lg">{producto.nombre}</h2>
          <p className="text-gray-600 text-sm mb-1">Código: {producto.codigo}</p>
          <p className="text-green-700 font-semibold text-sm mb-1">
            Precio: ${producto.precio.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mb-2">Stock: {producto.cantidad}</p>
          <button 
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
            onClick={() => agregarAlCarrito(producto)}
            disabled={producto.cantidad === 0}
          >
            Agregar al carrito
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductosList;
