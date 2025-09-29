import React, { useEffect, useState } from "react";
import api from "../api";
import "./DashboardProductos.css";

const DashboardProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- para filtro y paginación ---
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 20;

  // --- para modal de creación ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState("");
  const [nuevaImagen, setNuevaImagen] = useState(null);

  // --- para modal de edición ---
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [imagenEditando, setImagenEditando] = useState(null);

  // --- para editar cantidad rápida ---
  const [cantidadesTemp, setCantidadesTemp] = useState({});

  // --- cargar productos ---
  useEffect(() => {
    api
      .get("/productos/")
      .then((res) => {
        const productosOrdenados = res.data.sort((a, b) => a.id - b.id);
        setProductos(productosOrdenados);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Error al obtener productos:",
          err.response ? err.response.data : err
        );
        setError("No se pudieron cargar los productos");
        setLoading(false);
      });
  }, []);

  // --- cargar categorías ---
  useEffect(() => {
    api
      .get("/categorias/")
      .then((res) => setCategorias(res.data))
      .catch((err) =>
        console.error(
          "Error al cargar categorías:",
          err.response ? err.response.data : err
        )
      );
  }, []);

  // --- filtrar productos ---
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  // --- paginar productos ---
  const indexInicio = (paginaActual - 1) * productosPorPagina;
  const indexFin = indexInicio + productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(
    productosFiltrados.length / productosPorPagina
  );

  // --- funciones de paginación ---
  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  // --- función para obtener URL completa de imagen ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.REACT_APP_BASE_URL || "https://electricosandsoluciones.onrender.com"}${imagePath}`;
  };

  // --- habilitar / deshabilitar producto ---
  const toggleActivo = (id, isActive) => {
    api
      .patch(`/productos/${id}/`, { is_active: !isActive })
      .then((res) => {
        setProductos((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      })
      .catch((err) => {
        console.error(
          "Error al cambiar estado:",
          err.response ? err.response.data : err
        );
        alert("No se pudo cambiar el estado del producto");
      });
  };

  // --- actualizar cantidad rápida ---
  const handleCantidadChange = (id, value) => {
    setCantidadesTemp((prev) => ({ ...prev, [id]: value }));
  };

  const actualizarCantidad = (id) => {
    const nuevaCantidad = Number(cantidadesTemp[id]);
    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
      alert("Cantidad inválida");
      return;
    }
    api
      .patch(`/productos/${id}/`, { cantidad: nuevaCantidad })
      .then((res) => {
        setProductos((prev) => prev.map((p) => (p.id === id ? res.data : p)));
        setCantidadesTemp((prev) => {
          const temp = { ...prev };
          delete temp[id];
          return temp;
        });
      })
      .catch((err) => {
        console.error(
          "Error al actualizar cantidad:",
          err.response ? err.response.data : err
        );
        alert("No se pudo actualizar la cantidad");
      });
  };

  // --- obtener nombre de categoría ---
  const getCategoriaNombre = (id) => {
    const cat = categorias.find((c) => c.id === id);
    return cat ? cat.name : "-";
  };

  // --- preparar datos para crear producto ---
  const prepararProducto = () => {
    const formData = new FormData();
    formData.append("nombre", nuevoNombre.trim());
    formData.append("descripcion", nuevaDescripcion.trim());
    formData.append(
      "precio",
      parseFloat(nuevoPrecio.toString().replace(",", "."))
    );
    formData.append("cantidad", parseInt(nuevaCantidad || 0, 10));
    formData.append("is_active", true);

    if (nuevoCodigo.trim()) {
      formData.append("codigo", nuevoCodigo.trim());
    }

    if (nuevaCategoria) {
      formData.append("categoria", parseInt(nuevaCategoria, 10));
    }

    if (nuevaImagen) {
      formData.append("imagen", nuevaImagen);
    }

    return formData;
  };

  // --- crear producto ---
  const handleCrearProducto = () => {
    if (
      !nuevoNombre.trim() ||
      !nuevoPrecio ||
      isNaN(parseFloat(nuevoPrecio.toString().replace(",", ".")))
    ) {
      alert("Debe ingresar un nombre y un precio válido");
      return;
    }

    const formData = prepararProducto();

    api
      .post("/productos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setProductos((prev) => [res.data, ...prev]);
        setMostrarModal(false);
        // Limpiar formulario
        setNuevoNombre("");
        setNuevoCodigo("");
        setNuevaCategoria("");
        setNuevaDescripcion("");
        setNuevoPrecio("");
        setNuevaCantidad("");
        setNuevaImagen(null);
      })
      .catch((err) => {
        console.error(
          "Error al crear producto:",
          err.response ? err.response.data : err
        );
        alert("No se pudo crear el producto");
      });
  };

  // --- abrir modal de edición ---
  const abrirModalEditar = (producto) => {
    setProductoEditando({ ...producto });
    setImagenEditando(null);
    setMostrarModalEditar(true);
  };

  // --- editar producto ---
  const handleEditarProducto = () => {
    if (
      !productoEditando.nombre ||
      isNaN(productoEditando.precio) ||
      productoEditando.precio <= 0
    ) {
      alert("Debe ingresar un nombre y un precio válido");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", productoEditando.nombre);
    formData.append("descripcion", productoEditando.descripcion || "");
    formData.append(
      "precio",
      parseFloat(productoEditando.precio.toString().replace(",", "."))
    );
    formData.append("cantidad", parseInt(productoEditando.cantidad, 10));
    formData.append("is_active", productoEditando.is_active);

    if (productoEditando.codigo) {
      formData.append("codigo", productoEditando.codigo);
    }

    if (productoEditando.categoria) {
      formData.append("categoria", parseInt(productoEditando.categoria, 10));
    }

    if (imagenEditando) {
      formData.append("imagen", imagenEditando);
    }

    api
      .put(`/productos/${productoEditando.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setProductos((prev) =>
          prev.map((p) => (p.id === productoEditando.id ? res.data : p))
        );
        setMostrarModalEditar(false);
        setProductoEditando(null);
        setImagenEditando(null);
      })
      .catch((err) => {
        console.error(
          "Error al editar producto:",
          err.response ? err.response.data : err
        );
        alert("No se pudo editar el producto");
      });
  };

  // --- manejar selección de imagen ---
  const handleImagenChange = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Solo se permiten archivos de imagen (JPG, JPEG, PNG, GIF)");
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no puede ser mayor a 5MB");
        return;
      }

      if (isEditing) {
        setImagenEditando(file);
      } else {
        setNuevaImagen(file);
      }
    }
  };

  if (loading)
    return <div className="loading-container">Cargando productos...</div>;
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
      <button
        className="add-button"
        onClick={() => {
          setMostrarModal(true);
          setNuevoNombre("");
          setNuevoCodigo("");
          setNuevaCategoria("");
          setNuevaDescripcion("");
          setNuevoPrecio("");
          setNuevaCantidad("");
          setNuevaImagen(null);
        }}
      >
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
              <td data-label="ID">{producto.id}</td>
              <td data-label="Código">{producto.codigo || "-"}</td>
              <td data-label="Categoría">
                {getCategoriaNombre(producto.categoria)}
              </td>
              <td data-label="Nombre">{producto.nombre}</td>
              <td data-label="Descripción">{producto.descripcion || "-"}</td>
              <td data-label="Precio">${producto.precio}</td>
              <td data-label="Cantidad">{producto.cantidad}</td>
              <td data-label="Estado">
                <span
                  className={
                    producto.is_active ? "status-active" : "status-inactive"
                  }
                >
                  {producto.is_active ? "Activo" : "Inhabilitado"}
                </span>
              </td>
              <td data-label="Acciones">
                <button
                  className="toggle-button"
                  onClick={() => toggleActivo(producto.id, producto.is_active)}
                >
                  {producto.is_active ? "Inhabilitar" : "Habilitar"}
                </button>
                <button
                  className="edit-button"
                  onClick={() => abrirModalEditar(producto)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación mejorada */}
      <div className="pagination">
        <button
          className={`pagination-nav ${paginaActual === 1 ? "disabled" : ""}`}
          onClick={irAPaginaAnterior}
          disabled={paginaActual === 1}
        >
          Anterior
        </button>

        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            className={`pagination-button ${
              paginaActual === i + 1 ? "active" : ""
            }`}
            onClick={() => setPaginaActual(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className={`pagination-nav ${
            paginaActual === totalPaginas ? "disabled" : ""
          }`}
          onClick={irAPaginaSiguiente}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </button>
      </div>

      {/* Modal para crear producto - TAMAÑO GRANDE */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <h3>Nuevo producto</h3>

            <div className="modal-form">
              <input
                className="modal-input"
                type="text"
                placeholder="Nombre del producto"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />

              <input
                className="modal-input"
                type="text"
                placeholder="Código del producto"
                value={nuevoCodigo}
                onChange={(e) => setNuevoCodigo(e.target.value)}
              />

              <select
                className="modal-select"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <textarea
                className="modal-textarea"
                placeholder="Descripción del producto (opcional)"
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                rows="4"
              />

              <input
                className="modal-input"
                type="text"
                placeholder="Precio (usar coma o punto decimal)"
                value={nuevoPrecio}
                onChange={(e) => setNuevoPrecio(e.target.value)}
              />

              <input
                className="modal-input"
                type="number"
                placeholder="Cantidad inicial"
                value={nuevaCantidad}
                onChange={(e) => setNuevaCantidad(e.target.value)}
                min="0"
              />
            </div>

            <div className="modal-buttons">
              <button className="save-button" onClick={handleCrearProducto}>
                Guardar producto
              </button>
              <button
                className="cancel-button"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar producto - TAMAÑO GRANDE */}
      {mostrarModalEditar && productoEditando && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <h3>Editar producto</h3>

            <div className="modal-form">
              <input
                className="modal-input"
                type="text"
                placeholder="Nombre del producto"
                value={productoEditando.nombre}
                onChange={(e) =>
                  setProductoEditando({
                    ...productoEditando,
                    nombre: e.target.value,
                  })
                }
              />

              <input
                className="modal-input"
                type="text"
                placeholder="Código del producto"
                value={productoEditando.codigo || ""}
                onChange={(e) =>
                  setProductoEditando({
                    ...productoEditando,
                    codigo: e.target.value,
                  })
                }
              />

              <select
                className="modal-select"
                value={productoEditando.categoria || ""}
                onChange={(e) =>
                  setProductoEditando({
                    ...productoEditando,
                    categoria: e.target.value,
                  })
                }
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <textarea
                className="modal-textarea"
                placeholder="Descripción del producto (opcional)"
                value={productoEditando.descripcion || ""}
                onChange={(e) =>
                  setProductoEditando({
                    ...productoEditando,
                    descripcion: e.target.value,
                  })
                }
                rows="4"
              />

              <input
                className="modal-input"
                type="text"
                placeholder="Precio (usar coma o punto decimal)"
                value={productoEditando.precio}
                onChange={(e) =>
                  setProductoEditando({
                    ...productoEditando,
                    precio: e.target.value,
                  })
                }
              />

              <input
                className="modal-input"
                type="number"
                placeholder="Cantidad"
                value={productoEditando.cantidad}
                onChange={(e) =>
                  setProductoEditando({
                    ...productoEditando,
                    cantidad: e.target.value,
                  })
                }
                min="0"
              />
            </div>

            <div className="modal-buttons">
              <button className="save-button" onClick={handleEditarProducto}>
                Guardar cambios
              </button>
              <button
                className="cancel-button"
                onClick={() => setMostrarModalEditar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProductos;
