import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Categorias.css";

const CategoriasDetalle = () => {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nombre) {
      console.log("Buscando productos para categoría:", nombre);
      setLoading(true);
      axios
        .get(`http://127.0.0.1:8000/api/productos/?categoria=${nombre}`)
        .then((response) => {
          console.log("Productos encontrados:", response.data.length);
          setProductos(response.data);
        })
        .catch((error) => {
          console.error("Error cargando productos:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [nombre]);

  const formatearNombre = (nombre) => {
    return nombre
      .replace(/-/g, " ")
      .split(" ")
      .map(
        (palabra) =>
          palabra.charAt(0).toUpperCase() + palabra.slice(1)
      )
      .join(" ");
  };

  if (loading) {
    return (
      <div className="carrito-container">
        <div
          className="page-wrapper"
          style={{ textAlign: "center", padding: "50px" }}
        >
          <p style={{ color: "#666", fontSize: "1.2rem" }}>
            Cargando productos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="page-wrapper" style={{ position: "relative" }}>
        {/* Cuadro flotante dentro del área blanca */}
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "30px",
            width: "300px",
            background: "#fff8e1",
            padding: "18px",
            borderRadius: "14px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <h4
            style={{
              color: "#7a5a00",
              fontSize: "1rem",
              margin: "0 0 8px",
            }}
          >
            ¿Te gustó algo?
          </h4>
          <button
            onClick={() => navigate("/carrito")}
            style={{
              background: "#FFD700",
              color: "#000",
              border: "none",
              padding: "10px 20px",
              fontSize: "1rem",
              borderRadius: "8px",
              cursor: "pointer",
              transition:
                "transform 0.14s ease, background 0.14s ease",
              fontWeight: "700",
              width: "100%",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e6c200";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#FFD700";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Ir al carrito
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ color: "#FFD700", fontSize: "2.5rem" }}>
            {formatearNombre(nombre)}
          </h1>
          <p style={{ color: "#666" }}>
            {productos.length} producto
            {productos.length !== 1 ? "s" : ""} encontrado
            {productos.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Productos */}
        <div className="contenedor-productos">
          {productos.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <p
                style={{
                  color: "#666",
                  fontSize: "1.3rem",
                  marginBottom: "10px",
                }}
              >
                No se encontraron productos en esta categoría.
              </p>
            </div>
          ) : (
            productos.map((prod) => (
              <div key={prod.id} className="producto-card">
                {prod.imagen && (
                  <div>
                    <img
                      src={prod.imagen}
                      alt={prod.nombre || prod.name}
                    />
                  </div>
                )}
                <div>
                  <h3>{prod.nombre || prod.name}</h3>
                  {prod.descripcion && <p>{prod.descripcion}</p>}
                  <div>
                    <span>
                      ${(
                        prod.precio || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  {prod.cantidad !== undefined && (
                    <p>
                      {prod.cantidad > 0
                        ? `Stock: ${prod.cantidad}`
                        : "Agotado"}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriasDetalle;
