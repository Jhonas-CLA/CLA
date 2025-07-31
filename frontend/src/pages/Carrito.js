import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Carrito.css';

const CarritoCompras = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  useEffect(() => {
    axios.get('http://localhost:8000/api/productos/')
      .then(res => {
        const productosBack = res.data.map(p => ({
          codigo: p.codigo,
          nombre: p.nombre,
          categoria: p.categoria.nombre || p.categoria,
          precio: parseFloat(p.precio),
          stock: p.cantidad,
          disponible: p.disponible
        }));
        setProductos(productosBack);
      })
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  const categorias = useMemo(() => ['Todas', ...new Set(productos.map(p => p.categoria))], [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter(producto => {
      const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoriaFiltro === 'Todas' || producto.categoria === categoriaFiltro;
      return coincideBusqueda && coincideCategoria;
    });
  }, [busqueda, categoriaFiltro, productos]);

  const totalItems = Object.values(carrito).reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrecio = Object.values(carrito).reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const cantidadActual = prev[producto.codigo]?.cantidad || 0;
      if (cantidadActual < producto.stock) {
        return {
          ...prev,
          [producto.codigo]: {
            ...producto,
            cantidad: cantidadActual + 1
          }
        };
      }
      return prev;
    });
  };

  const modificarCantidad = (codigo, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return eliminarDelCarrito(codigo);
    const producto = productos.find(p => p.codigo === codigo);
    if (producto && nuevaCantidad <= producto.stock) {
      setCarrito(prev => ({
        ...prev,
        [codigo]: {
          ...prev[codigo],
          cantidad: nuevaCantidad
        }
      }));
    }
  };

  const eliminarDelCarrito = (codigo) => {
    setCarrito(prev => {
      const nuevo = { ...prev };
      delete nuevo[codigo];
      return nuevo;
    });
  };

  const vaciarCarrito = () => setCarrito({});

  const enviarPedido = () => {
    if (totalItems === 0) {
      alert('El carrito está vacío');
      return;
    }

    const detallesPedido = Object.values(carrito).map(item =>
      `${item.nombre} (${item.codigo}) - Cantidad: ${item.cantidad} - Total: $${(item.precio * item.cantidad).toLocaleString()}`
    ).join('\n');

    const mensaje = `NUEVO PEDIDO%0A%0A${encodeURIComponent(detallesPedido)}%0A%0ATOTAL: $${totalPrecio.toLocaleString()}%0AProductos: ${totalItems}`;
    window.open(`https://wa.me/3022560604?text=${mensaje}`, '_blank');
    vaciarCarrito();
  };

  return (
    <div className="carrito-container">
      <div className="page-wrapper">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#FFD700', fontSize: '2.5rem' }}>Catálogo de Productos</h1>
          <p style={{ color: '#000' }}>Encuentra todos los productos eléctricos que necesitas</p>
          {totalItems > 0 && (
            <div style={{
              marginTop: '20px',
              backgroundColor: '#FFD700',
              color: '#001152',
              padding: '12px 24px',
              borderRadius: '25px',
              display: 'inline-block',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              {totalItems} productos • ${totalPrecio.toLocaleString()}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' }}>
          {/* Productos */}
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="🔍 Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ flex: 1 }}
              />
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="contenedor-productos">
              {productosFiltrados.map(producto => (
                <div key={producto.codigo} className="producto-card">
                  <div>
                    <h3 style={{ color: '#001152' }}>{producto.nombre}</h3>
                    <p style={{ color: '#666' }}>{producto.codigo} • {producto.categoria}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#001152' }}>
                        ${producto.precio.toLocaleString()}
                      </span>
                      <span style={{
                        backgroundColor: producto.stock > 0 ? '#22c55e' : '#ef4444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        Stock: {producto.stock}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock === 0}
                    style={{
                      marginTop: '15px',
                      backgroundColor: producto.stock === 0 ? '#ccc' : '#FFD700',
                      color: '#001152',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      cursor: producto.stock === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    + Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Carrito */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            height: '80vh',
            overflowY: 'auto',
            maxHeight: '600px',
            boxShadow: '0 0 12px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: '20px'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <h3 style={{ color: '#001152', fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Tu Carrito</h3>
            </div>

            {totalItems === 0 ? (
              <p style={{ color: '#666' }}>El carrito está vacío.</p>
            ) : (
              <>
                {Object.values(carrito).map(item => (
                  <div key={item.codigo} className="carrito-item">
                    <div style={{ fontWeight: 'bold', color: '#001152' }}>{item.nombre}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{item.codigo}</div>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', marginTop: '5px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => modificarCantidad(item.codigo, item.cantidad - 1)} className="cantidad-btn amarilla">
                          -
                        </button>
                        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.cantidad}</span>
                        <button onClick={() => modificarCantidad(item.codigo, item.cantidad + 1)} className="cantidad-btn amarilla">
                          +
                        </button>
                      </div>
                      <span style={{ fontWeight: 'bold' }}>${(item.precio * item.cantidad).toLocaleString()}</span>
                      <button onClick={() => eliminarDelCarrito(item.codigo)} style={{
                        border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer'
                      }}>
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
                <hr />
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#001152' }}>Total: ${totalPrecio.toLocaleString()}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={vaciarCarrito} style={{
                    backgroundColor: '#ef4444', color: 'white', padding: '10px 20px',
                    borderRadius: '8px', fontWeight: 'bold'
                  }}>
                    🗑 Eliminar producto
                  </button>

                  <button onClick={enviarPedido} className="whatsapp-btn">
                    📲 Enviar pedido por WhatsApp
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarritoCompras;
