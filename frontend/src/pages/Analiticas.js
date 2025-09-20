import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Analiticas.css";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const BASE_URL = "http://localhost:8000";

const COLORS = {
    en_proceso: "#facc15",  // Amarillo (En proceso)
    empaquetado: "#3b82f6",  // Azul (Empaquetado)
    entregado: "#22c55e",    // Verde (Entregado)
    cancelado: "#ef4444",    // Rojo (Cancelado)
};

const Analiticas = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/pedidos/analiticas/`);
                const rawData = response.data;

                if (rawData) {
                    const formattedData = [
                        { estado: "en_proceso", porcentaje: rawData.en_proceso.porcentaje, count: rawData.en_proceso.count },
                        { estado: "empaquetado", porcentaje: rawData.empaquetado.porcentaje, count: rawData.empaquetado.count },
                        { estado: "entregado", porcentaje: rawData.entregado.porcentaje, count: rawData.entregado.count },
                        { estado: "cancelado", porcentaje: rawData.cancelado.porcentaje, count: rawData.cancelado.count },
                    ];

                    // ✅ Filtrar estados con porcentaje mayor a 0
                    const filteredData = formattedData.filter(item => item.porcentaje > 0);
                    setData(filteredData);
                }
            } catch (error) {
                setError("No se pudieron cargar los datos de las analíticas.");
                console.error("Error obteniendo datos de analíticas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="analiticas-container">
            <h2 className="titulo-analiticas">📊 Estado de los pedidos</h2>

            {loading ? (
                <p className="mensaje-cargando">Cargando datos...</p>
            ) : error ? (
                <p className="mensaje-error">{error}</p>
            ) : data.length === 0 ? (
                <p className="mensaje-vacio">No hay datos disponibles</p>
            ) : (
                <div className="grafico-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}  // 🔥 Tamaño controlado del círculo
                                dataKey="porcentaje"
                                nameKey="estado"
                                label={({ estado, porcentaje }) => `${estado}: ${porcentaje}%`}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.estado] || "#ccc"} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend
                                payload={data.map((entry) => ({
                                    value: entry.estado,
                                    type: "square",
                                    color: COLORS[entry.estado] || "#ccc",
                                }))}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default Analiticas;
