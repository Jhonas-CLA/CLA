import React, { useState, useEffect, useMemo, useCallback } from "react";
import api, { BASE_URL } from "../api";
import FavoriteButton from "../components/FavoriteButton";
import "./Carrito.css";

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
  // Inicializar carrito desde localStorage
  const [carrito, setCarrito] = useState(() => {
    try {
      const carritoGuardado = localStorage.getItem("carrito");
      return carritoGuardado ? JSON.parse(carritoGuardado) : {};
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      return {};
    }
  });
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [numeroWhatsApp, setNumeroWhatsApp] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");

  // NUEVO: Estado para el producto seleccionado desde categorías
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarProductoSeleccionado, setMostrarProductoSeleccionado] =
    useState(false);

  // Estados para la validación de usuario
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Efecto para guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem("carrito", JSON.stringify(carrito));
    } catch (error) {
      console.error("Error al guardar carrito:", error);
    }
  }, [carrito]);

  // MODIFICADO: Verificar si hay un producto seleccionado y categoría guardada al cargar
  useEffect(() => {
    const productoGuardado = localStorage.getItem("productoSeleccionado");
    const categoriaGuardada = localStorage.getItem("categoriaSeleccionada");

    if (productoGuardado) {
      try {
        const producto = JSON.parse(productoGuardado);
        setProductoSeleccionado(producto);
        setMostrarProductoSeleccionado(true);

        // Limpiar localStorage después de usar
        localStorage.removeItem("productoSeleccionado");
      } catch (error) {
        console.error("Error al parsear producto seleccionado:", error);
        localStorage.removeItem("productoSeleccionado");
      }
    }

    // NUEVO: Establecer la categoría si viene de categorías
    if (categoriaGuardada) {
      setCategoriaFiltro(categoriaGuardada);
      // Limpiar localStorage después de usar
      localStorage.removeItem("categoriaSeleccionada");
    }
  }, []);

  // cargar número de WhatsApp desde backend
  useEffect(() => {
    const cargarNumeroWhatsApp = async () => {
      try {
        const response = await api.get("/api/configuracion/whatsapp/");
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
        let url = `/api/productos/?only_active=true`;
        // Usa el slug directamente en la llamada
        url += `&categoria=${encodeURIComponent(categoriaFiltro)}`;
        const response = await api.get(url);
        const productosBack = response.data.map((p) => ({
          id: p.id,
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
      const res = await api.get(`/api/pedidos/cliente/?email=${emailUsuario}`);
      const data = await res.data;
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

  // NUEVO: Función para agregar producto seleccionado al carrito
  const agregarProductoSeleccionado = () => {
    if (productoSeleccionado) {
      // Convertir el producto seleccionado al formato esperado por el carrito
      const productoParaCarrito = {
        id: productoSeleccionado.id,
        codigo:
          productoSeleccionado.codigo || `PROD-${productoSeleccionado.id}`,
        nombre: productoSeleccionado.nombre || productoSeleccionado.name,
        categoria: productoSeleccionado.categoria,
        precio: parseFloat(productoSeleccionado.precio || 0),
        stock: productoSeleccionado.cantidad || productoSeleccionado.stock || 1,
        imagen_url:
          productoSeleccionado.imagen || productoSeleccionado.imagen_url || "",
      };

      agregarAlCarrito(productoParaCarrito);
      setMostrarProductoSeleccionado(false);
      setProductoSeleccionado(null);
    }
  };

  // NUEVO: Función para cerrar el producto seleccionado
  const cerrarProductoSeleccionado = () => {
    setMostrarProductoSeleccionado(false);
    setProductoSeleccionado(null);
  };

  // agregar al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const cantidadActual = prev[producto.codigo]?.cantidad || 0;
      return {
        ...prev,
        [producto.codigo]: { ...producto, cantidad: cantidadActual + 1 },
      };
    });
  };

  // modificar cantidad
  const modificarCantidad = (codigo, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return quitarDelCarrito(codigo);
    setCarrito((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        cantidad: nuevaCantidad,
      },
    }));
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
    localStorage.removeItem("carrito");
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

    if (!email) {
      setShowEmailModal(true);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
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

      await api.post("/api/pedidos/", pedidoData);

      const response = await api.post(
        "/accounts/api/whatsapp/pedido/",
        pedidoData
      );

      const data = response.data;

      if (response.status === 200) {
        setSuccess("✅ ¡Perfecto! Tu pedido está listo");

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
              "❌ Este correo no está registrado en nuestro sistema. Por favor regístrate primero."
            );
            break;
          case "USER_INACTIVE":
            setError("⚠️ Tu cuenta está inactiva. Contacta al administrador.");
            break;
          case "EMAIL_REQUIRED":
            setError("📧 Por favor ingresa tu correo electrónico.");
            break;
          case "PRODUCTS_REQUIRED":
            setError("🛒 Debe incluir al menos un producto en el pedido.");
            break;
          case "ADMIN_NOT_FOUND":
            setError(
              "⚠️ No hay administrador disponible. Contacta al soporte."
            );
            break;
          case "INVALID_JSON":
            setError("❌ Error en el formato de datos. Intenta nuevamente.");
            break;
          case "SERVER_ERROR":
            setError(`❌ Error del servidor: ${data.message}`);
            break;
          default:
            setError(data.message || "❌ Ocurrió un error inesperado");
        }
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError(
        "❌ Error de conexión. Verifica tu internet e intenta nuevamente"
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
      if (localError) setLocalError("");
      if (error) setError("");
    };

    const handleContinuar = async () => {
      if (!localEmail.trim()) {
        setLocalError("📧 Por favor ingresa tu correo electrónico.");
        return;
      }

      setEmail(localEmail);

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

        // Cambia axios y fetch por api
        await api.post("/api/pedidos/", pedidoData);

        const response = await api.post("/accounts/api/whatsapp/pedido/", pedidoData);
        const data = response.data;

        if (response.status === 200) {
          setSuccess("✅ ¡Perfecto! Tu pedido está listo");
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
                "❌ Este correo no está registrado en nuestro sistema. Por favor regístrate primero."
              );
              break;
            case "USER_INACTIVE":
              setError("⚠️ Tu cuenta está inactiva. Contacta al administrador.");
              break;
            case "EMAIL_REQUIRED":
              setError("📧 Por favor ingresa tu correo electrónico.");
              break;
            case "PRODUCTS_REQUIRED":
              setError("🛒 Debe incluir al menos un producto en el pedido.");
              break;
            case "ADMIN_NOT_FOUND":
              setError(
                "⚠️ No hay administrador disponible. Contacta al soporte."
              );
              break;
            case "INVALID_JSON":
              setError("❌ Error en el formato de datos. Intenta nuevamente.");
              break;
            case "SERVER_ERROR":
              setError(`❌ Error del servidor: ${data.message}`);
              break;
            default:
              setError(data.message || "❌ Ocurrió un error inesperado");
          }
        }
      } catch (err) {
        console.error("Error de conexión:", err);
        setError(
          "❌ Error de conexión. Verifica tu internet e intenta nuevamente"
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
            🔐 Verificación Requerida
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
              {loading ? "⏳ Verificando..." : "✅ Continuar"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="carrito-container">
      {/* NUEVO: Banner del producto seleccionado */}
      {mostrarProductoSeleccionado && productoSeleccionado && (
        <div
          style={{
            backgroundColor: "#fff8e1",
            border: "3px solid #FFD700",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "30px",
            position: "relative",
            boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
          }}
        >
          <button
            onClick={cerrarProductoSeleccionado}
            style={{
              position: "absolute",
              top: "10px",
              right: "15px",
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#666",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            ✕
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: "#f5f5f5",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {productoSeleccionado.imagen ||
                productoSeleccionado.imagen_url ? (
                <ProductImage
                  src={
                    productoSeleccionado.imagen ||
                    productoSeleccionado.imagen_url
                  }
                  alt={productoSeleccionado.nombre || productoSeleccionado.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div style={{ color: "#999", fontSize: "2rem" }}>📷</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  color: "#001152",
                  fontSize: "1.4rem",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                ¡Producto seleccionado!
              </h3>
              <h4
                style={{
                  color: "#333",
                  fontSize: "1.2rem",
                  marginBottom: "8px",
                }}
              >
                {productoSeleccionado.nombre || productoSeleccionado.name}
              </h4>
              {productoSeleccionado.codigo && (
                <p
                  style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    marginBottom: "8px",
                  }}
                >
                  Código: {productoSeleccionado.codigo}
                </p>
              )}
              <p
                style={{
                  color: "#001152",
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  marginBottom: "15px",
                }}
              >
                ${(productoSeleccionado.precio || 0).toLocaleString("es-CO")}
              </p>

              <button
                onClick={agregarProductoSeleccionado}
                style={{
                  backgroundColor: "#FFD700",
                  color: "#001152",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#e6c200")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#FFD700")}
              >
                🛒 Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}

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
          placeholder="🔍 Buscar productos..."
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
                style={{ position: "relative" }}
              >
                {/* Botón de favorito */}
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    zIndex: 10,
                  }}
                >
                  <FavoriteButton producto={producto} size="small" />
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
                {/* REMOVIDO: La sección del stock ya no se muestra */}
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
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#FFD700",
                    color: "#001152",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
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
                      {/* Botón restar */}
                      <button
                        onClick={() =>
                          modificarCantidad(item.codigo, item.cantidad - 1)
                        }
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "12px",
                          border: "none",
                          background:
                            "linear-gradient(135deg, #facc15, #fbbf24)",
                          color: "#1e3a8a",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                          transition: "all 0.2s ease-in-out",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        −
                      </button>

                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          minWidth: "20px",
                          textAlign: "center",
                        }}
                      >
                        {item.cantidad}
                      </span>

                      {/* Botón sumar */}
                      <button
                        onClick={() =>
                          modificarCantidad(item.codigo, item.cantidad + 1)
                        }
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "12px",
                          border: "none",
                          background:
                            "linear-gradient(135deg, #facc15, #fbbf24)",
                          color: "#1e3a8a",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                          transition: "all 0.2s ease-in-out",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        +
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#1e3a8a",
                          fontSize: "1rem",
                        }}
                      >
                        ${(item.precio * item.cantidad).toLocaleString()}
                      </span>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => quitarDelCarrito(item.codigo)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "12px",
                          border: "none",
                          background:
                            "linear-gradient(135deg, #1e3a8a, #2563eb)",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                          transition: "all 0.2s ease-in-out",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
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
                  🗑️ Eliminar productos
                </button>

                <button
                  onClick={enviarPedido}
                  disabled={loading}
                  className="btn-enviar"
                >
                  {loading ? "⏳ Enviando..." : "📲 Enviar pedido por WhatsApp"}
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
