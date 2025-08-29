import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './Carrito.css';

const CATEGORIAS_NOMBRES = {
  '1': 'Alambres y Cables',
  '2': 'Bornas y Conectores',
  '3': 'Conectores',
  '4': 'Terminales y Uniones',
  '5': 'Automáticos / Breakers',
  '6': 'Tableros Eléctricos',
  '7': 'Contactores y Contadores',
  '8': 'Relés',
  '9': 'Cajas',
  '10': 'Iluminación',
  '11': 'Portalámparas y Plafones',
  '12': 'Reflectores y Fotoceldas',
  '13': 'Boquillas',
  '14': 'Tubería EMT / IMC / PVC / LED',
  '15': 'Curvas y Accesorios de Tubería',
  '16': 'Canaletas',
  '17': 'Accesorios para Canaletas',
};

const CarritoCompras = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  
  // Estados para la validación de usuario
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/productos/')
      .then(res => {
        const productosBack = res.data.map(p => {
          const idCategoria = String(p.categoria.id || p.categoria);
          return {
            codigo: p.codigo,
            nombre: p.nombre,
            categoria: CATEGORIAS_NOMBRES[idCategoria] || 'Otra',
            categoriaId: idCategoria,
            precio: parseFloat(p.precio),
            stock: p.cantidad,
            disponible: p.disponible
          };
        });
        setProductos(productosBack);
      })
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  const categorias = useMemo(() => Object.entries(CATEGORIAS_NOMBRES), []);

  const productosFiltrados = useMemo(() => {
    if (!categoriaFiltro && !busqueda) {
      return [];
    }

    return productos
      .filter(producto => {
        const coincideCategoria = categoriaFiltro === '' || String(producto.categoriaId) === String(categoriaFiltro);
        const coincideBusqueda =
          busqueda === '' ||
          producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.codigo.toLowerCase().includes(busqueda.toLowerCase());
        return coincideCategoria && coincideBusqueda;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [productos, busqueda, categoriaFiltro]);

  const totalItems = Object.values(carrito).reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrecio = Object.values(carrito).reduce((sum, item) => sum + item.precio * item.cantidad, 0);

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

  // FIXED: Función para enviar pedido con manejo de errores mejorado
  const enviarPedido = async () => {
    if (totalItems === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Si no hay email, mostrar modal
    if (!email) {
      setShowEmailModal(true);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Preparar datos del pedido
      const pedidoData = {
        productos: Object.values(carrito).map(item => ({
          nombre: item.nombre,
          codigo: item.codigo,
          cantidad: item.cantidad,
          precio: item.precio
        })),
        total: totalPrecio,
        email: email
      };

      console.log('Enviando pedido:', pedidoData); // Debug

      // FIXED: URL corregida
      const response = await fetch("http://localhost:8000/accounts/api/whatsapp/pedido/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedidoData),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data); // Debug

      if (response.ok) {
        setSuccess("✅ ¡Perfecto! Tu pedido está listo");

        // Si el backend devuelve un link de WhatsApp, lo abrimos:
        if (data.whatsapp_url) {
          window.open(data.whatsapp_url, "_blank");
        }

        vaciarCarrito();
        setShowEmailModal(false);
        setTimeout(() => setSuccess(""), 5000);
      } else {
        // FIXED: Manejo de errores específicos
        console.error('Error del servidor:', data);
        
        switch (data.error) {
          case 'USER_NOT_REGISTERED':
            setError('❌ Este correo no está registrado en nuestro sistema. Por favor regístrate primero.');
            break;
          case 'USER_INACTIVE':
            setError('⚠️ Tu cuenta está inactiva. Contacta al administrador.');
            break;
          case 'EMAIL_REQUIRED':
            setError('📧 Por favor ingresa tu correo electrónico.');
            break;
          case 'PRODUCTS_REQUIRED':
            setError('🛒 Debe incluir al menos un producto en el pedido.');
            break;
          case 'ADMIN_NOT_FOUND':
            setError('⚠️ No hay administrador disponible. Contacta al soporte.');
            break;
          case 'INVALID_JSON':
            setError('❌ Error en el formato de datos. Intenta nuevamente.');
            break;
          case 'SERVER_ERROR':
            setError(`❌ Error del servidor: ${data.message}`);
            break;
          default:
            setError(data.message || '❌ Ocurrió un error inesperado');
        }
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError("❌ Error de conexión. Verifica tu internet e intenta nuevamente");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Función separada para manejar el cambio del email con useCallback
  const handleEmailChange = useCallback((e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (error) {
      setError('');
    }
  }, [error]);

  // FIXED: Función para cerrar modal con useCallback
  const cerrarModal = useCallback(() => {
    setShowEmailModal(false);
    setError('');
    setEmail('');
  }, []);

  // Componente Modal para solicitar email - FIXED con estado local
  const EmailModal = () => {
    const [localEmail, setLocalEmail] = useState(email);
    const [localError, setLocalError] = useState('');

    const handleLocalEmailChange = (e) => {
      setLocalEmail(e.target.value);
      if (localError) {
        setLocalError('');
      }
      if (error) {
        setError('');
      }
    };

    const handleContinuar = async () => {
      if (!localEmail.trim()) {
        setLocalError('📧 Por favor ingresa tu correo electrónico.');
        return;
      }

      // Actualizar el estado principal
      setEmail(localEmail);
      
      // Proceder con el envío
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const pedidoData = {
          productos: Object.values(carrito).map(item => ({
            nombre: item.nombre,
            codigo: item.codigo,
            cantidad: item.cantidad,
            precio: item.precio
          })),
          total: totalPrecio,
          email: localEmail
        };

        const response = await fetch("http://localhost:8000/accounts/api/whatsapp/pedido/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pedidoData),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess("✅ ¡Perfecto! Tu pedido está listo");
          if (data.whatsapp_url) {
            window.open(data.whatsapp_url, "_blank");
          }
          vaciarCarrito();
          setShowEmailModal(false);
          setTimeout(() => setSuccess(""), 5000);
        } else {
          switch (data.error) {
            case 'USER_NOT_REGISTERED':
              setError('❌ Este correo no está registrado en nuestro sistema. Por favor regístrate primero.');
              break;
            case 'USER_INACTIVE':
              setError('⚠️ Tu cuenta está inactiva. Contacta al administrador.');
              break;
            case 'EMAIL_REQUIRED':
              setError('📧 Por favor ingresa tu correo electrónico.');
              break;
            case 'PRODUCTS_REQUIRED':
              setError('🛒 Debe incluir al menos un producto en el pedido.');
              break;
            case 'ADMIN_NOT_FOUND':
              setError('⚠️ No hay administrador disponible. Contacta al soporte.');
              break;
            case 'INVALID_JSON':
              setError('❌ Error en el formato de datos. Intenta nuevamente.');
              break;
            case 'SERVER_ERROR':
              setError(`❌ Error del servidor: ${data.message}`);
              break;
            default:
              setError(data.message || '❌ Ocurrió un error inesperado');
          }
        }
      } catch (err) {
        console.error('Error de conexión:', err);
        setError("❌ Error de conexión. Verifica tu internet e intenta nuevamente");
      } finally {
        setLoading(false);
      }
    };

    const handleCerrar = () => {
      setShowEmailModal(false);
      setError('');
      setLocalError('');
      setLocalEmail('');
      setEmail('');
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{
            color: '#001152',
            fontSize: '1.5rem',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            🔐 Verificación Requerida
          </h3>
          <p style={{
            color: '#666',
            marginBottom: '20px',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            Para enviar tu pedido por WhatsApp, necesitamos verificar que tienes una cuenta registrada en nuestro sistema.
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              color: '#001152',
              marginBottom: '8px'
            }}>
              Correo Electrónico Registrado
            </label>
            <input
              type="email"
              value={localEmail}
              onChange={handleLocalEmailChange}
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px',
                border: localError ? '2px solid #ef4444' : '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FFD700'}
              onBlur={(e) => e.target.style.borderColor = localError ? '#ef4444' : '#ddd'}
            />
          </div>

          {(localError || error) && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#dc2626',
              fontSize: '0.9rem'
            }}>
              {localError || error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCerrar}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleContinuar}
              disabled={loading || !localEmail.trim()}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: loading || !localEmail.trim() ? '#ccc' : '#FFD700',
                color: '#001152',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: loading || !localEmail.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? '⏳ Verificando...' : '✅ Continuar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="carrito-container">
      <div className="page-wrapper">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#FFD700', fontSize: '2.5rem' }}>Catálogo de Productos</h1>
          <p style={{ color: '#000' }}>Selecciona una categoría para ver los productos</p>
          
          {/* Mensaje de éxito */}
          {success && (
            <div style={{
              backgroundColor: '#d1fae5',
              border: '2px solid #22c55e',
              borderRadius: '10px',
              padding: '15px',
              marginTop: '15px',
              color: '#065f46',
              fontWeight: 'bold'
            }}>
              {success}
            </div>
          )}
          
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
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(([id, nombre]) => (
                  <option key={id} value={id}>{nombre}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="🔍 Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="contenedor-productos">
              {productosFiltrados.length === 0 ? (
                <p style={{ color: '#666' }}>
                  {categoriaFiltro || busqueda ? 'No hay productos que coincidan.' : 'Selecciona una categoría o busca un producto.'}
                </p>
              ) : (
                productosFiltrados.map(producto => (
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
                ))
              )}
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
            <h3 style={{ color: '#001152', fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Tu Carrito</h3>
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
                        <button onClick={() => modificarCantidad(item.codigo, item.cantidad - 1)} className="cantidad-btn amarilla">-</button>
                        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.cantidad}</span>
                        <button onClick={() => modificarCantidad(item.codigo, item.cantidad + 1)} className="cantidad-btn amarilla">+</button>
                      </div>
                      <span style={{ fontWeight: 'bold' }}>${(item.precio * item.cantidad).toLocaleString()}</span>
                      <button onClick={() => eliminarDelCarrito(item.codigo)} style={{
                        border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer'
                      }}>❌</button>
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
                    🗑 Eliminar productos
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
      
      {/* Modal de email */}
      {showEmailModal && <EmailModal />}
    </div>
  );
};

export default CarritoCompras;