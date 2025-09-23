import React, { useEffect, useState } from 'react';
import './Pedidos.css';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 5;

  // Filtro único (por nombre y/o fecha)
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/pedidos/');
      const data = await response.json();

      if (Array.isArray(data)) {
        setPedidos(data);
      } else if (data.results && Array.isArray(data.results)) {
        setPedidos(data.results);
      } else {
        setPedidos([]);
      }
    } catch (err) {
      setError('Error al cargar pedidos');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para detectar si un texto es fecha en formato yyyy-mm-dd
  const esFecha = (texto) => {
    // Regex simple para fecha ISO yyyy-mm-dd
    return /^\d{4}-\d{2}-\d{2}$/.test(texto);
  };

  // Filtrar pedidos usando el filtro único
  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (!filtro.trim()) return true; // si filtro vacío, mostrar todo

    // Dividir el filtro en palabras para permitir que se pase "Juan 2023-09-22"
    const partesFiltro = filtro.trim().toLowerCase().split(/\s+/);

    // Verificamos que cada parte coincida ya sea en el nombre o en la fecha
    return partesFiltro.every((parte) => {
      if (esFecha(parte)) {
        // Parte parece una fecha: comparar con fecha del pedido
        const fechaPedido = pedido.fecha ? pedido.fecha.split('T')[0] : '';
        return fechaPedido === parte;
      } else {
        // Parte texto normal: buscar en nombre cliente
        return pedido.cliente?.toLowerCase().includes(parte);
      }
    });
  });

  // Paginación con pedidos filtrados
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);
  const indexInicio = (paginaActual - 1) * pedidosPorPagina;
  const indexFin = indexInicio + pedidosPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indexInicio, indexFin);

  // Resetear página cuando cambia filtro
  React.useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const toggleOpen = (e, id) => {
    if (e.target.tagName === "SELECT" || e.target.tagName === "OPTION") return;
    setOpenId(openId === id ? null : id);
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetch(`http://localhost:8000/api/pedidos/${id}/estado/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) throw new Error("Error al actualizar estado");

      const data = await response.json();

      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: data.estado } : p))
      );
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("No se pudo actualizar el estado");
    }
  };

  const renderEstadoBadge = (estado) => {
    const estados = {
      en_proceso: { texto: "En proceso", color: "#facc15" },
      empaquetado: { texto: "Empaquetado", color: "#3b82f6" },
      entregado: { texto: "Entregado", color: "#22c55e" },
      cancelado: { texto: "Cancelado", color: "#ef4444" },
    };

    const info = estados[estado] || estados["en_proceso"];
    return (
      <span
        style={{
          background: info.color,
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "8px",
          fontSize: "0.8rem",
          fontWeight: "bold",
          textTransform: "capitalize",
        }}
      >
        {info.texto}
      </span>
    );
  };

  return (
    <div className="pedidos-section">
      <h2>📦 Pedidos</h2>

      {/* Filtro único */}
      <div
        className="filtros-container"
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Filtrar por nombre y/o fecha (yyyy-mm-dd)"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            flex: '1 1 300px',
            minWidth: '200px',
          }}
        />
        <button
          onClick={() => setFiltro('')}
          style={{
            padding: '8px 12px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#ef4444',
            color: 'white',
            cursor: 'pointer',
            height: '38px',
          }}
        >
          Limpiar filtro
        </button>
      </div>

      {loading && <p>Cargando pedidos...</p>}
      {error && <p className="error">{error}</p>}

      <div className="pedidos-list">
        {(!Array.isArray(pedidosPaginados) || pedidosPaginados.length === 0) ? (
          <p>No hay pedidos aún</p>
        ) : (
          pedidosPaginados.map((pedido) => (
            <div
              key={pedido.id}
              className={`pedido-card ${openId === pedido.id ? 'open' : ''}`}
              data-estado={pedido.estado}
              onClick={(e) => toggleOpen(e, pedido.id)}
            >
              <div className="pedido-header">
                <strong>{pedido.cliente || "Cliente desconocido"}</strong>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {renderEstadoBadge(pedido.estado)}
                  <span>{pedido.fecha ? new Date(pedido.fecha).toLocaleString() : "Sin fecha"}</span>
                </div>
              </div>

              {openId === pedido.id && (
                <div className="pedido-detalle">
                  <p><strong>Email:</strong> {pedido.email || "No registrado"}</p>
                  <p><strong>Total:</strong> ${pedido.total?.toLocaleString() || 0}</p>

                  <div className="estado-container">
                    <label><strong>Estado:</strong></label>
                    <select
                      value={pedido.estado || "en_proceso"}
                      onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="en_proceso">En proceso</option>
                      <option value="empaquetado">Empaquetado</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  <h4>Productos:</h4>
                  <ul>
                    {Array.isArray(pedido.productos) ? (
                      pedido.productos.map((prod, index) => (
                        <li key={index}>
                          {prod.nombre} (x{prod.cantidad}) - ${prod.precio}
                        </li>
                      ))
                    ) : (
                      <li>No hay productos</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="pagination">
          <button
            className={`pagination-nav ${paginaActual === 1 ? 'disabled' : ''}`}
            onClick={irAPaginaAnterior}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              className={`pagination-button ${paginaActual === i + 1 ? 'active' : ''}`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className={`pagination-nav ${paginaActual === totalPaginas ? 'disabled' : ''}`}
            onClick={irAPaginaSiguiente}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default Pedidos;
