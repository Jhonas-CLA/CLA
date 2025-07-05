import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Categorias.css';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/categorias/')
      .then(response => setCategorias(response.data))
      .catch(error => console.error('Error cargando las categorías:', error));
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 titulo-categorias">Categorías de Productos</h2>
      <div className="row">
        {categorias.map((cat) => (
          <div className="col-md-4 mb-4" key={cat.id}>
            <div className="card categoria-card h-100 text-center p-3 shadow-sm">
              <img 
                src={cat.imagen || 'https://cdn-icons-png.flaticon.com/512/3132/3132693.png'} 
                alt={cat.nombre}
                className="card-img-top mx-auto mt-3"
                style={{ width: '80px', height: '80px' }}
              />
              <div className="card-body">
                <h5 className="card-title">{cat.nombre}</h5>
                <p className="card-text">{cat.descripcion}</p>
                <Link to={`/categorias/${cat.nombre.toLowerCase()}`} className="btn btn-success mt-3">
                  Ver productos
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categorias;