import React, { useEffect, useState } from 'react';
import './Pedidos.css';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/pedidos/');
      const data = await response.json();

      console.log("📦 Respuesta pedidos:", data);

      if (Array.isArray(data)) {
        setPedidos(data);
      } else if (data.results && Array.isArray(data.results)) {
        setPedidos(data.results);
      } else {
        setPedidos([]);
      }
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      setError('Error al cargar pedidos');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = (e, id) => {
    // Evita que el click en elementos internos cierre el desglose
    if (e.target.tagName === "SELECT" || e.target.tagName === "OPTION") {
      return;
    }
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

      {loading && <p>Cargando pedidos...</p>}
      {error && <p className="error">{error}</p>}

      <div className="pedidos-list">
        {(!Array.isArray(pedidos) || pedidos.length === 0) ? (
          <p>No hay pedidos aún</p>
        ) : (
          pedidos.map((pedido) => (
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
                      onClick={(e) => e.stopPropagation()} // 👈 Esto evita que el select cierre el desglose
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
    </div>
  );
}

export default Pedidos;
