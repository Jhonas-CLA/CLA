import React, { useState, useEffect } from 'react';
import './proveedores.css';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // estado para formulario
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    email: '',
    telefono: '',
    representante: '' // ✅ Nuevo campo
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // búsqueda
  const [search, setSearch] = useState('');

  // 🔹 Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [proveedoresPorPagina] = useState(1);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8000/api/proveedores/');
      if (!response.ok) throw new Error('Error al obtener proveedores');

      const data = await response.json();
      setProveedores(data);
    } catch (err) {
      setError('Error al cargar proveedores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `http://localhost:8000/api/proveedores/${formData.id}/`
        : 'http://localhost:8000/api/proveedores/';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) // ✅ Ahora incluye representante
      });

      if (!response.ok) throw new Error('Error al guardar proveedor');

      await fetchProveedores();
      setFormData({ id: null, nombre: '', email: '', telefono: '', representante: '' });
      setIsEditing(false);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al guardar');
    }
  };

  const handleEdit = (proveedor) => {
    setFormData(proveedor); // ✅ Ya trae representante del backend
    setIsEditing(true);
    setShowForm(true);
  };

  // 🔹 filtrar proveedores por búsqueda
  const proveedoresFiltrados = proveedores.filter((p) =>
    [p.nombre, p.email, p.telefono, p.representante]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🔹 Calcular paginación
  const indiceUltimo = paginaActual * proveedoresPorPagina;
  const indicePrimero = indiceUltimo - proveedoresPorPagina;
  const proveedoresActuales = proveedoresFiltrados.slice(indicePrimero, indiceUltimo);

  const totalPaginas = Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  if (loading) {
    return (
      <div className="proveedores-loading">
        <div className="spinner"></div>
        <span>Cargando proveedores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="proveedores-error">
        <p>{error}</p>
        <button onClick={fetchProveedores} className="retry-btn">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="proveedores-section">
      <div className="proveedores-header">
        <h2>Lista de Proveedores</h2>
        <span>Total: {proveedores.length}</span>
      </div>

      {/* Barra de acciones */}
      <div className="acciones">
        <input
          type="text"
          placeholder="Buscar proveedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setShowForm(true)}>+ Agregar proveedor</button>
      </div>

      {/* Overlay pantalla completa */}
      {showForm && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>{isEditing ? 'Editar Proveedor' : 'Agregar Proveedor'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono || ''}
                onChange={handleChange}
              />
              <input
                type="text"
                name="representante"
                placeholder="Nombre del Representante"
                value={formData.representante || ''}
                onChange={handleChange}
              />
              <div className="form-buttons">
                <button type="submit">{isEditing ? 'Actualizar' : 'Guardar'}</button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ id: null, nombre: '', email: '', telefono: '', representante: '' });
                    setIsEditing(false);
                    setShowForm(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="tabla-container">
        <table className="tabla-proveedores">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Representante</th> {/* ✅ Nueva columna */}
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresActuales.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.email}</td>
                <td>{p.telefono || 'No especificado'}</td>
                <td>{p.representante || 'No asignado'}</td> {/* ✅ Mostrar en tabla */}
                <td>{new Date(p.creado_en).toLocaleDateString('es-ES')}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {proveedoresFiltrados.length === 0 && (
          <div className="empty-state">
            <h3>No hay proveedores</h3>
            <p>Agrega proveedores usando el botón arriba.</p>
          </div>
        )}

        {/* 🔹 Controles de paginación */}
        {totalPaginas > 1 && (
          <div className="paginacion">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ⬅️ Anterior
            </button>

            {[...Array(totalPaginas)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => cambiarPagina(index + 1)}
                className={paginaActual === index + 1 ? 'activo' : ''}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}