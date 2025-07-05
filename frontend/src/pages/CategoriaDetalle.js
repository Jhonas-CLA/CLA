import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Categorias.css';

const CategoriaDetalle = () => {
  const { nombre } = useParams();
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/productos/?categoria=${nombre}`)
      .then(response => setProductos(response.data))
      .catch(error => console.error('Error cargando productos:', error));
  }, [nombre]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 titulo-categorias">
        Productos de {nombre.charAt(0).toUpperCase() + nombre.slice(1)}
      </h2>
      <div className="row">
        {productos.map((prod) => (
          <div className="col-md-4 mb-4" key={prod.id}>
            <div className="card h-100 text-center p-3 shadow-sm">
              <img 
                src={prod.imagen || 'https://cdn-icons-png.flaticon.com/512/1040/1040230.png'} 
                alt={prod.nombre}
                className="card-img-top mx-auto mt-3"
                style={{ width: '100px', height: '100px' }}
              />
              <div className="card-body">
                <h5 className="card-title">{prod.nombre}</h5>
                <p className="card-text">{prod.descripcion}</p>
                <p className="card-text"><strong>${prod.precio}</strong></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriaDetalle;
