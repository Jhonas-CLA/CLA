import React, { useEffect, useState } from "react";
import api from "../api";
import "./Home.css";
import { useNavigate } from 'react-router-dom';
import ProductCarousel from "../components/ProductCarousel";

function Home() {
  const navigate = useNavigate(); 
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔄 Iniciando carga de productos...");
    console.log("🌐 URL base:", api.defaults.baseURL);
    console.log("🔗 URL completa:", `${api.defaults.baseURL}/api/products/`);
    
    api
      .get("/api/productos/")
      .then((res) => {
        console.log("✅ Response status:", res.status);
        console.log("🔍 Response headers:", res.headers);
        console.log("📦 Productos recibidos (raw):", res.data);
        console.log("📦 Productos recibidos (tipo):", typeof res.data);
        console.log("📦 Productos recibidos (es array):", Array.isArray(res.data));
        console.log("📊 Cantidad de productos:", res.data?.length || 0);
        
        // Verificar si la respuesta es un string que necesita parsing
        let productos = res.data;
        if (typeof res.data === 'string') {
          console.log("🔄 Parseando string como JSON...");
          try {
            productos = JSON.parse(res.data);
            console.log("✅ JSON parseado:", productos);
          } catch (e) {
            console.error("❌ Error parseando JSON:", e);
          }
        }
        
        setProductos(productos);
      })
      .catch((err) => {
        console.error("❌ Error cargando productos:", err);
        console.error("❌ Error response:", err.response);
        console.error("❌ Error status:", err.response?.status);
        console.error("❌ Error data:", err.response?.data);
        setError(err.message);
      })
      .finally(() => {
        console.log("🏁 Carga finalizada");
        setLoading(false);
      });
  }, []);

  const handleSolicitarEnvio = () => {
    navigate('/carrito');
  };

  return (
    <div>
      {/* Hero con torres eléctricas */}
      <section className="hero-electric">
        <div className="hero-text">
          Les brindamos variedad y soluciones eléctricas a todos sus proyectos
        </div>

        <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid meet">
          <rect className="ground" x="0" y="370" width="1200" height="40" />
          {/* Torres */}
          <polyline className="tower" points="100,370 120,280 140,370" />
          <line className="tower-line" x1="120" y1="280" x2="120" y2="200" />
          <polyline className="tower-line" points="100,370 120,200 140,370" />
          <rect className="tower-base" x="110" y="365" width="20" height="15" />

          <polyline className="tower" points="400,370 420,260 440,370" />
          <line className="tower-line" x1="420" y1="260" x2="420" y2="180" />
          <polyline className="tower-line" points="400,370 420,180 440,370" />
          <rect className="tower-base" x="410" y="365" width="20" height="15" />

          <polyline className="tower" points="700,370 720,240 740,370" />
          <line className="tower-line" x1="720" y1="240" x2="720" y2="160" />
          <polyline className="tower-line" points="700,370 720,160 740,370" />
          <rect className="tower-base" x="710" y="365" width="20" height="15" />

          <polyline className="tower" points="950,370 980,180 1010,370" />
          <polyline className="tower-line" points="950,370 980,140 1010,370" />
          <line className="tower-line" x1="980" y1="140" x2="980" y2="100" />
          <rect className="tower-base" x="965" y="365" width="30" height="20" />

          <line className="power-line" x1="140" y1="200" x2="420" y2="180" />
          <line className="power-line" x1="440" y1="180" x2="720" y2="160" />
          <line className="power-line" x1="740" y1="160" x2="980" y2="140" />
          <line className="spark" x1="980" y1="140" x2="980" y2="100" />
        </svg>
      </section>

      {/* Sección productos */}
      <div className="container py-5">
        <h2 className="text-center mb-4">Nuestros Productos</h2>

        {loading && <p className="text-center">⏳ Cargando productos...</p>}
        {error && <p className="text-center text-danger">Error: {error}</p>}
        {!loading && productos.length === 0 && (
          <p className="text-center">⚠️ No hay productos disponibles.</p>
        )}
        {!loading && productos.length > 0 && (
          <ProductCarousel 
            productos={productos} 
            limite={20} 
            useProp={true} 
          />
        )}
      </div>

      {/* Sección de Envíos */}
      <section className="envios-section py-5">
        <div className="container-fluid p-0">
          <div className="row g-0 align-items-center envio-bg">
            <div className="envio-overlay"></div>
            <div className="col-md-6 envio-text text-white px-5 py-4 text-center text-md-start">
              <h2 className="display-5 fw-bold mb-3">
                Envíos disponibles <br />
                para todo el departamento <br />
                del Tolima
              </h2>
              <button
                className="btn btn-solicitar-envio"
                onClick={handleSolicitarEnvio}
              >
                📦 Solicitar envío
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;