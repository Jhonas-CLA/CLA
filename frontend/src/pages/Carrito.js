import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import FavoriteButton from '../components/FavoriteButton';
import "./Carrito.css";

const BASE_URL = "http://localhost:8000";

// Mapeo slug → nombre exacto
const categoriasMap = {
  "automaticos-breakers": "Automáticos / Breakers",
  "alambres-cables": "Alambres y Cables",
  "abrazaderas-amarres": "Abrazaderas y Amarres",
  "accesorios-canaletas-emt-pvc": "Accesorios para Canaletas / EMT / PVC",
  "bornas-conectores": "Bornas y Conectores",
  "herramientas-accesorios-especiales": "Herramientas y Accesorios Especiales",
  boquillas: "Boquillas",
  cajas: "Cajas",
  canaletas: "Canaletas",
  "capacetes-chazos": "Capacetes y Chazos",
  "cintas-aislantes": "Cintas Aislantes",
  clavijas: "Clavijas",
  conectores: "Conectores",
  "contactores-contadores": "Contactores y Contadores",
  "curvas-accesorios-tuberia": "Curvas y Accesorios de Tubería",
  "discos-pulidora": "Discos para Pulidora",
  duchas: "Duchas",
  "extensiones-multitomas": "Extensiones y Multitomas",
  "hebillas-grapas-perchas": "Hebillas, Grapas y Perchas",
  iluminacion: "Iluminación",
  "instrumentos-medicion": "Instrumentos de Medición",
  "interruptores-programadores": "Interruptores y Programadores",
  "otros-miscelaneos": "Otros / Misceláneos",
  "portalamparas-plafones": "Portalamparas y Plafones",
  "reflectores-fotoceldas": "Reflectores y Fotoceldas",
  reles: "Relés",
  rosetas: "Rosetas",
  "sensores-temporizadores": "Sensores y Temporizadores",
  soldaduras: "Soldaduras",
  "soportes-pernos-herrajes": "Soportes, Pernos y Herrajes",
  "tableros-electricos": "Tableros Eléctricos",
  "tapas-accesorios-superficie": "Tapas y Accesorios de Superficie",
  tensores: "Tensores",
  "terminales-uniones": "Terminales y Uniones",
  timbres: "Timbres",
  "tomas-enchufes": "Tomas y Enchufes",
  tuberia: "Tuberia",
};

// Helper imágenes
const getImageUrl = (imagenUrl) => {
  if (!imagenUrl) return "/images/default-product.jpg";
  if (imagenUrl.startsWith("http")) return imagenUrl;
  if (imagenUrl.startsWith("/media/")) return `${BASE_URL}${imagenUrl}`;
  if (imagenUrl.startsWith("media/")) return `${BASE_URL}/${imagenUrl}`;
  return `${BASE_URL}/media/${imagenUrl}`;
};

const ProductImage = ({ src, alt, style, className }) => {
  const [imgSrc, setImgSrc] = useState(getImageUrl(src));
  return (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      className={className}
      onError={() => setImgSrc("/images/default-product.jpg")}
      loading="lazy"
    />
  );
};

const CarritoCompras = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [numeroWhatsApp, setNumeroWhatsApp] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");

  // Estados para la validación de usuario
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // cargar número de WhatsApp desde backend
  useEffect(() => {
    const cargarNumeroWhatsApp = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/configuracion/whatsapp/`
        );
        if (response.data && response.data.numero) {
          setNumeroWhatsApp(response.data.numero);
        }
      } catch (err) {
        console.error("Error cargando número de WhatsApp:", err);
      }
    };
    cargarNumeroWhatsApp();
  }, []);

  // cargar productos solo si hay categoría seleccionada
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        if (!categoriaFiltro) {
          setProductos([]);
          return;
        }
        let url = `${BASE_URL}/api/productos/?only_active=true`;
        const categoriaExacta = categoriasMap[categoriaFiltro];
        if (categoriaExacta) {
          url += `&categoria=${encodeURIComponent(categoriaExacta)}`;
        }
        const response = await axios.get(url);
        const productosBack = response.data.map((p) => ({
          id: p.id, // Asegurar que el ID esté presente para FavoriteButton
          codigo: p.codigo,
          nombre: p.nombre,
          categoria: p.categoria?.nombre || "Otra",
          precio: parseFloat(p.precio),
          stock: p.cantidad,
          imagen_url: p.imagen_url || p.imagen || "",
          is_active: p.is_active,
        }));
        setProductos(productosBack);
      } catch (err) {
        console.error("Error cargando productos:", err);
      }
    };
    cargarProductos();
  }, [categoriaFiltro]);

  // Obtener nombre del cliente según el email
  const obtenerNombreCliente = async (emailUsuario) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/pedidos/cliente/?email=${emailUsuario}`
      );
      const data = await res.json();
      if (data.nombre) {
        setNombreCliente(data.nombre);
      }
    } catch (err) {
      console.error("Error obteniendo nombre del cliente:", err);
    }
  };

  useEffect(() => {
    if (email) {
      obtenerNombreCliente(email);
    }
  }, [email]);

  // Filtro búsqueda + categoría
  const productosFiltrados = useMemo(() => {
    return productos.filter(
      (prod) =>
        busqueda === "" ||
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.codigo.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [productos, busqueda]);

  // agregar al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const cantidadActual = prev[producto.codigo]?.cantidad || 0;
      if (cantidadActual < producto.stock) {
        return {
          ...prev,
          [producto.codigo]: { ...producto, cantidad: cantidadActual + 1 },
        };
      }
      return prev;
    });
  };

  // modificar cantidad
  const modificarCantidad = (codigo, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return quitarDelCarrito(codigo);
    const producto = productos.find((p) => p.codigo === codigo);
    if (producto && nuevaCantidad <= producto.stock) {
      setCarrito((prev) => ({
        ...prev,
        [codigo]: {
          ...prev[codigo],
          cantidad: nuevaCantidad,
        },
      }));
    }
  };

  // quitar del carrito
  const quitarDelCarrito = (codigo) => {
    setCarrito((prev) => {
      const nuevo = { ...prev };
      delete nuevo[codigo];
      return nuevo;
    });
  };

  // limpiar carrito
  const limpiarCarrito = () => {
    setCarrito({});
  };

  const totalItems = Object.values(carrito).reduce(
    (sum, item) => sum + item.cantidad,
    0
  );
  const totalCarrito = Object.values(carrito).reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  // Función para enviar pedido con manejo de errores mejorado
  const enviarPedido = async () => {
    if (totalItems === 0) {
      alert("El carrito está vacío");
      return;
    }

    // Si no hay email, mostrar modal
    if (!email) {
      setShowEmailModal(true);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Preparar datos del pedido
      const pedidoData = {
        email: email,
        cliente: nombreCliente || "Cliente desconocido",
        productos: Object.values(carrito).map((item) => ({
          nombre: item.nombre,
          codigo: item.codigo,
          cantidad: Number(item.cantidad),
          precio: Number(item.precio),
        })),
        total: Number(totalCarrito),
        total_productos: Object.values(carrito).reduce(
          (acc, item) => acc + item.cantidad,
          0
        ),
      };

      console.log("Enviando pedido:", pedidoData);

      // Guardar pedido en backend
      await axios.post("http://localhost:8000/api/pedidos/", pedidoData);

      const response = await fetch(
        "http://localhost:8000/accounts/api/whatsapp/pedido/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pedidoData),
        }
      );

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        setSuccess("¡Perfecto! Tu pedido está listo");

        // Si el backend devuelve un link de WhatsApp, lo abrimos:
        if (data.whatsapp_url) {
          window.open(data.whatsapp_url, "_blank");
        }

        limpiarCarrito();
        setShowEmailModal(false);
        setTimeout(() => setSuccess(""), 5000);
      } else {
        // Manejo de errores específicos
        console.error("Error del servidor:", data);

        switch (data.error) {
          case "USER_NOT_REGISTERED":
            setError(
              "Este correo no está registrado en nuestro sistema. Por favor regístrate primero."
            );
            break;
          case "USER_INACTIVE":
            setError("Tu cuenta está inactiva. Contacta al administrador.");
            break;
          case "EMAIL_REQUIRED":
            setError("Por favor ingresa tu correo electrónico.");
            break;
          case "PRODUCTS_REQUIRED":
            setError("Debe incluir al menos un producto en el pedido.");
            break;
          case "ADMIN_NOT_FOUND":
            setError(
              "No hay administrador disponible. Contacta al soporte."
            );
            break;
          case "INVALID_JSON":
            setError("Error en el formato de datos. Intenta nuevamente.");
            break;
          case "SERVER_ERROR":
            setError(`Error del servidor: ${data.message}`);
            break;
          default:
            setError(data.message || "Ocurrió un error inesperado");
        }
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError(
        "Error de conexión. Verifica tu internet e intenta nuevamente"
      );
    } finally {
      setLoading(false);
    }
  };

  // Función separada para manejar el cambio del email con useCallback
  const handleEmailChange = useCallback(
    (e) => {
      const newEmail = e.target.value;
      setEmail(newEmail);
      if (error) {
        setError("");
      }
    },
    [error]
  );

  // Función para cerrar modal con useCallback
  const cerrarModal = useCallback(() => {
    setShowEmailModal(false);
    setError("");
    setEmail("");
  }, []);

  // Componente Modal para solicitar email
  const EmailModal = () => {
    const [localEmail, setLocalEmail] = useState(email);
    const [localError, setLocalError] = useState("");

    const handleLocalEmailChange = (e) => {
      setLocalEmail(e.target.value);
      if (localError) {
        setLocalError("");
      }
      if (error) {
        setError("");
      }
    };

    const handleContinuar = async () => {
      if (!localEmail.trim()) {
        setLocalError("Por favor ingresa tu correo electrónico.");
        return;
      }

      // Actualizar el estado principal
      setEmail(localEmail);

      // Proceder con el envío
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const pedidoData = {
          email: localEmail,
          cliente: nombreCliente || "Cliente desconocido",
          productos: Object.values(carrito).map((item) => ({
            nombre: item.nombre,
            codigo: item.codigo,
            cantidad: Number(item.cantidad),
            precio: Number(item.precio),
          })),
          total: Number(totalCarrito),
          total_productos: Object.values(carrito).reduce(
            (acc, item) => acc + item.cantidad,
            0
          ),
        };

        // Guardar pedido en backend
        await axios.post("http://localhost:8000/api/pedidos/", pedidoData);

        const response = await fetch(
          "http://localhost:8000/accounts/api/whatsapp/pedido/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(pedidoData),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setSuccess("¡Perfecto! Tu pedido está listo");
          if (data.whatsapp_url) {
            window.open(data.whatsapp_url, "_blank");
          }
          limpiarCarrito();
          setShowEmailModal(false);
          setTimeout(() => setSuccess(""), 5000);
        } else {
          switch (data.error) {
            case "USER_NOT_REGISTERED":
              setError(
                "Este correo no está registrado en nuestro sistema. Por favor regístrate primero."
              );
              break;
            case "USER_INACTIVE":
              setError(
                "Tu cuenta está inactiva. Contacta al administrador."
              );
              break;
            case "EMAIL_REQUIRED":
              setError("Por favor ingresa tu correo electrónico.");
              break;
            case "PRODUCTS_REQUIRED":
              setError("Debe incluir al menos un producto en el pedido.");
              break;
            case "ADMIN_NOT_FOUND":
              setError(
                "No hay administrador disponible. Contacta al soporte."
              );
              break;
            case "INVALID_JSON":
              setError("Error en el formato de datos. Intenta nuevamente.");
              break;
            case "SERVER_ERROR":
              setError(`Error del servidor: ${data.message}`);
              break;
            default:
              setError(data.message || "Ocurrió un error inesperado");
          }
        }
      } catch (err) {
        console.error("Error de conexión:", err);
        setError(
          "Error de conexión. Verifica tu internet e intenta nuevamente"
        );
      } finally {
        setLoading(false);
      }
    };

    const handleCerrar = () => {
      setShowEmailModal(false);
      setError("");
      setLocalError("");
      setLocalEmail("");
      setEmail("");
    };

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "15px",
            padding: "30px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <h3
            style={{
              color: "#001152",
              fontSize: "1.5rem",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            Verificación Requerida
          </h3>
          <p
            style={{
              color: "#666",
              marginBottom: "20px",
              textAlign: "center",
              lineHeight: "1.5",
            }}
          >
            Para enviar tu pedido por WhatsApp, necesitamos verificar que tienes
            una cuenta registrada en nuestro sistema.
          </p>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                color: "#001152",
                marginBottom: "8px",
              }}
            >
              Correo Electrónico Registrado
            </label>
            <input
              type="email"
              value={localEmail}
              onChange={handleLocalEmailChange}
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              style={{
                width: "100%",
                padding: "12px",
                border: localError ? "2px solid #ef4444" : "2px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#FFD700")}
              onBlur={(e) =>
                (e.target.style.borderColor = localError ? "#ef4444" : "#ddd")
              }
            />
          </div>

          {(localError || error) && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "20px",
                color: "#dc2626",
                fontSize: "0.9rem",
              }}
            >
              {localError || error}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleCerrar}
              style={{
                flex: 1,
                padding: "12px 20px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleContinuar}
              disabled={loading || !localEmail.trim()}
              style={{
                flex: 1,
                padding: "12px 20px",
                backgroundColor:
                  loading || !localEmail.trim() ? "#ccc" : "#FFD700",
                color: "#001152",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor:
                  loading || !localEmail.trim() ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              {loading ? "Verificando..." : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="carrito-container">
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ color: "#FFD700", fontSize: "2.5rem" }}>
          Catálogo de Productos
        </h1>
        <p style={{ color: "#000" }}>
          Selecciona una categoría para ver los productos
        </p>
        {/* Mensaje de éxito */}
        {success && (
          <div
            style={{
              backgroundColor: "#d1fae5",
              border: "2px solid #22c55e",
              borderRadius: "10px",
              padding: "15px",
              marginTop: "15px",
              color: "#065f46",
              fontWeight: "bold",
            }}
          >
            {success}
          </div>
        )}
        {totalItems > 0 && (
          <div
            style={{
              marginTop: "20px",
              backgroundColor: "#FFD700",
              color: "#001152",
              padding: "12px 24px",
              borderRadius: "25px",
              display: "inline-block",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            {totalItems} productos • ${totalCarrito.toLocaleString()}
          </div>
        )}
      </div>

      {/* filtros */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Selecciona una categoría</option>
          {Object.entries(categoriasMap).map(([slug, nombre]) => (
            <option key={slug} value={slug}>
              {nombre}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* productos */}
        <div className="contenedor-productos" style={{ flex: 1 }}>
          {categoriaFiltro && productosFiltrados.length === 0 ? (
            <p style={{ color: "#666" }}>
              No hay productos en esta categoría o búsqueda.
            </p>
          ) : (
            productosFiltrados.map((producto) => (
              <div 
                key={producto.codigo} 
                className="producto-card" 
                style={{ position: 'relative' }}
              >
                {/* Botón de favorito en la esquina superior derecha */}
                <div style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '8px', 
                  zIndex: 10 
                }}>
                  <FavoriteButton 
                    producto={producto} 
                    size="small"
                  />
                </div>

                <ProductImage
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #ddd",
                  }}
                />
                <h3 style={{ color: "#001152", marginTop: "10px" }}>
                  {producto.nombre}
                </h3>
                <p style={{ color: "#666" }}>
                  {producto.codigo} • {producto.categoria}
                </p>
                <div style={{ marginTop: "5px", fontSize: "0.9rem" }}>
                  <span
                    style={{
                      backgroundColor:
                        producto.stock > 0 ? "#22c55e" : "#ef4444",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      marginRight: "8px",
                    }}
                  >
                    Stock: {producto.stock}
                  </span>
                </div>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    color: "#001152",
                    marginTop: "8px",
                  }}
                >
                  ${producto.precio.toLocaleString()}
                </span>
                <button
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={producto.stock === 0}
                  style={{
                    marginTop: "10px",
                    backgroundColor: producto.stock === 0 ? "#ccc" : "#FFD700",
                    color: "#001152",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: producto.stock === 0 ? "not-allowed" : "pointer",
                    border: "none",
                  }}
                >
                  + Agregar
                </button>
              </div>
            ))
          )}
        </div>

        {/* carrito lateral */}
        <div
          style={{
            width: "400px",
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            position: "sticky",
            top: "20px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              color: "#1e3a8a",
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Tu Carrito
          </h2>

          {Object.values(carrito).length === 0 ? (
            <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>
              No hay productos en el carrito.
            </p>
          ) : (
            <>
              {Object.values(carrito).map((item) => (
                <div
                  key={item.codigo}
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "#1e3a8a",
                      fontSize: "1rem",
                      marginBottom: "4px",
                    }}
                  >
                    {item.nombre}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      marginBottom: "10px",
                    }}
                  >
                    {item.codigo}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() =>
                          modificarCantidad(item.codigo, item.cantidad - 1)
                        }
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: "#fbbf24",
                          color: "#1e3a8a",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div
                style={{
                  borderTop: "2px solid #e2e8f0",
                  paddingTop: "15px",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#1e3a8a",
                    textAlign: "center",
                    marginBottom: "15px",
                  }}
                >
                  Total: ${totalCarrito.toLocaleString()}
                </div>
                <button onClick={limpiarCarrito} className="btn-eliminar">
                  Eliminar productos
                </button>

                <button
                  onClick={enviarPedido}
                  disabled={loading}
                  className="btn-enviar"
                >
                  {loading ? "Enviando..." : "Enviar pedido por WhatsApp"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de email */}
      {showEmailModal && <EmailModal />}
    </div>
  );
};

export default CarritoCompras;