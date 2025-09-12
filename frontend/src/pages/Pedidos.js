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

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
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
              onClick={() => toggleOpen(pedido.id)}
            >
              <div className="pedido-header">
                <strong>{pedido.cliente || "Cliente desconocido"}</strong>
                <span>{pedido.fecha ? new Date(pedido.fecha).toLocaleString() : "Sin fecha"}</span>
              </div>

              {openId === pedido.id && (
                <div className="pedido-detalle">
                  <p><strong>Email:</strong> {pedido.email || "No registrado"}</p>
                  <p><strong>Total:</strong> ${pedido.total?.toLocaleString() || 0}</p>
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
