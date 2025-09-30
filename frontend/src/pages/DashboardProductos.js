import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardProductos.css";

const BASE_URL = "http://localhost:8000";

const DashboardProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filtro y paginación ---
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 20;

  // --- Modal creación ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    codigo: "",
    categoria: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    imagen: null,
  });

  // --- Modal edición ---
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [imagenEditando, setImagenEditando] = useState(null);

  // --- Cargar productos ---
  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/productos/`);
      setProductos(response.data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error("Error al obtener productos:", err);
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  // --- Cargar categorías ---
  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/categorias/`);
      setCategorias(response.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  // --- Filtrar productos ---
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  // --- Paginación ---
  const indexInicio = (paginaActual - 1) * productosPorPagina;
  const indexFin = indexInicio + productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  // --- Cambiar estado activo/inactivo ---
  const toggleActivo = async (id, isActive) => {
    try {
      await axios.patch(`${BASE_URL}/api/productos/${id}/`, {
        is_active: !isActive,
      });
      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !isActive } : p))
      );
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo cambiar el estado del producto");
    }
  };

  // --- Obtener nombre categoría ---
  const getCategoriaNombre = (id) => {
    const cat = categorias.find((c) => c.id === id);
    return cat ? cat.name : "-";
  };

  // --- Preparar FormData ---
  const prepararFormData = (data, imagenExtra = null) => {
    const formData = new FormData();
    formData.append("nombre", data.nombre.trim());
    formData.append("descripcion", data.descripcion || "");
    formData.append("precio", parseFloat(data.precio.toString().replace(",", ".")));
    formData.append("cantidad", parseInt(data.cantidad || 0, 10));
    formData.append("is_active", true);

    if (data.codigo) formData.append("codigo", data.codigo.trim());
    if (data.categoria) formData.append("categoria", parseInt(data.categoria, 10));
    if (data.imagen) formData.append("imagen", data.imagen);
    if (imagenExtra) formData.append("imagen", imagenExtra);

    return formData;
  };

  // --- Crear producto ---
  const handleCrearProducto = async () => {
    if (!nuevoProducto.nombre.trim() || !nuevoProducto.precio) {
      alert("Debe ingresar un nombre y un precio válido");
      return;
    }

    try {
      const formData = prepararFormData(nuevoProducto);
      const response = await axios.post(`${BASE_URL}/api/productos/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProductos((prev) => [response.data, ...prev]);
      setMostrarModal(false);
      setNuevoProducto({
        nombre: "",
        codigo: "",
        categoria: "",
        descripcion: "",
        precio: "",
        cantidad: "",
        imagen: null,
      });
    } catch (err) {
      console.error("Error al crear producto:", err);
      alert("No se pudo crear el producto");
    }
  };

  // --- Abrir modal edición ---
  const abrirModalEditar = (producto) => {
    setProductoEditando({ ...producto });
    setImagenEditando(null);
    setMostrarModalEditar(true);
  };

  // --- Editar producto ---
  const handleEditarProducto = async () => {
    if (!productoEditando.nombre || isNaN(productoEditando.precio)) {
      alert("Debe ingresar un nombre y un precio válido");
      return;
    }

    try {
      const formData = prepararFormData(productoEditando, imagenEditando);
      const response = await axios.put(
        `${BASE_URL}/api/productos/${productoEditando.id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProductos((prev) =>
        prev.map((p) => (p.id === productoEditando.id ? response.data : p))
      );
      setMostrarModalEditar(false);
      setProductoEditando(null);
      setImagenEditando(null);
    } catch (err) {
      console.error("Error al editar producto:", err);
      alert("No se pudo editar el producto");
    }
  };

  if (loading) return <div className="loading-container">Cargando productos...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="dashboard-productos">
      <h2>Lista de Productos</h2>

      {/* Filtro */}
      <input
        className="search-input"
        type="text"
        placeholder="Buscar por nombre..."
        value={filtro}
        onChange={(e) => {
          setFiltro(e.target.value);
          setPaginaActual(1);
        }}
      />

      {/* Botón agregar producto */}
      <button className="add-button" onClick={() => setMostrarModal(true)}>
        Agregar producto
      </button>

      {/* Tabla de productos */}
      <table className="productos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Categoría</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosPaginados.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.codigo || "-"}</td>
              <td>{getCategoriaNombre(producto.categoria)}</td>
              <td>{producto.nombre}</td>
              <td>{producto.descripcion || "-"}</td>
              <td>${producto.precio}</td>
              <td>{producto.cantidad}</td>
              <td>
                <span className={producto.is_active ? "status-active" : "status-inactive"}>
                  {producto.is_active ? "Activo" : "Inhabilitado"}
                </span>
              </td>
              <td>
                <button onClick={() => toggleActivo(producto.id, producto.is_active)}>
                  {producto.is_active ? "Inhabilitar" : "Habilitar"}
                </button>
                <button onClick={() => abrirModalEditar(producto)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="pagination">
        <button onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))} disabled={paginaActual === 1}>
          Anterior
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            className={paginaActual === i + 1 ? "active" : ""}
            onClick={() => setPaginaActual(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </button>
      </div>

      {/* Modal crear producto */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <h3>Nuevo producto</h3>
            <div className="modal-form">
              <input
                type="text"
                placeholder="Nombre"
                value={nuevoProducto.nombre}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
              />
              <input
                type="text"
                placeholder="Código"
                value={nuevoProducto.codigo}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, codigo: e.target.value })}
              />
              <select
                value={nuevoProducto.categoria}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Descripción"
                value={nuevoProducto.descripcion}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
              />
              <input
                type="text"
                placeholder="Precio"
                value={nuevoProducto.precio}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
              />
              <input
                type="number"
                placeholder="Cantidad"
                value={nuevoProducto.cantidad}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, cantidad: e.target.value })}
              />
              <input type="file" onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagen: e.target.files[0] })} />
            </div>
            <div className="modal-buttons">
              <button onClick={handleCrearProducto}>Guardar</button>
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar producto */}
      {mostrarModalEditar && productoEditando && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <h3>Editar producto</h3>
            <div className="modal-form">
              <input
                type="text"
                placeholder="Nombre"
                value={productoEditando.nombre}
                onChange={(e) => setProductoEditando({ ...productoEditando, nombre: e.target.value })}
              />
              <input
                type="text"
                placeholder="Código"
                value={productoEditando.codigo || ""}
                onChange={(e) => setProductoEditando({ ...productoEditando, codigo: e.target.value })}
              />
              <select
                value={productoEditando.categoria || ""}
                onChange={(e) => setProductoEditando({ ...productoEditando, categoria: e.target.value })}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Descripción"
                value={productoEditando.descripcion || ""}
                onChange={(e) => setProductoEditando({ ...productoEditando, descripcion: e.target.value })}
              />
              <input
                type="text"
                placeholder="Precio"
                value={productoEditando.precio}
                onChange={(e) => setProductoEditando({ ...productoEditando, precio: e.target.value })}
              />
              <input
                type="number"
                placeholder="Cantidad"
                value={productoEditando.cantidad}
                onChange={(e) => setProductoEditando({ ...productoEditando, cantidad: e.target.value })}
              />
              <input type="file" onChange={(e) => setImagenEditando(e.target.files[0])} />
            </div>
            <div className="modal-buttons">
              <button onClick={handleEditarProducto}>Guardar cambios</button>
              <button onClick={() => setMostrarModalEditar(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProductos;
