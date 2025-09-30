// src/components/Documentos.js
import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "../api";  // 👈 reutilizamos api.js
import "./Documentos.css";

const ITEMS_PER_PAGE = 10;

const Documentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});

  // Estados para filtros de fecha
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para subida de archivos
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  // Cargar documentos iniciales
  useEffect(() => {
    fetchDocumentos();
  }, []);

  // Filtros (texto y fecha)
  useEffect(() => {
    let filtered = documentos;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (doc) =>
          doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();
      let startDate = null;
      let endDate = null;

      switch (dateFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "week":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          startDate = weekStart;
          endDate = new Date(weekStart);
          endDate.setDate(weekStart.getDate() + 7);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case "3months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case "6months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
        case "custom":
          if (customStartDate) {
            startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
          }
          if (customEndDate) {
            endDate = new Date(customEndDate);
            endDate.setDate(endDate.getDate() + 1);
            endDate.setHours(0, 0, 0, 0);
          }
          break;
        default:
          break;
      }

      if (startDate || endDate) {
        filtered = filtered.filter((doc) => {
          const docDate = new Date(doc.fecha_subida);
          if (startDate && endDate) {
            return docDate >= startDate && docDate < endDate;
          } else if (startDate) {
            return docDate >= startDate;
          } else if (endDate) {
            return docDate < endDate;
          }
          return true;
        });
      }
    }

    setFilteredDocs(filtered);
    setCurrentPage(1);
  }, [searchTerm, documentos, dateFilter, customStartDate, customEndDate]);

  // Calcular páginas
  useEffect(() => {
    setTotalPages(Math.ceil(filteredDocs.length / ITEMS_PER_PAGE));
  }, [filteredDocs]);

  // === PETICIONES API ===
  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/documentos/");
      setDocumentos(response.data);
      setFilteredDocs(response.data);
    } catch (error) {
      setError("No se pudieron cargar los documentos.");
      console.error("Error obteniendo documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documento) => {
    try {
      const response = await api.get(`/api/documentos/${documento.id}/descargar/`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", documento.nombre);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando documento:", error);
      alert("Error al descargar el documento");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Por favor selecciona un archivo");
      return;
    }

    // Validación peso máx 10MB
    if (uploadFile.size > 10 * 1024 * 1024) {
      alert("El archivo supera el tamaño máximo permitido (10MB).");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", uploadFile);
    if (uploadName.trim() !== "") formData.append("nombre", uploadName.trim());
    if (uploadDescription.trim() !== "")
      formData.append("descripcion", uploadDescription.trim());

    try {
      setUploading(true);
      const response = await api.post("/api/documentos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Actualización instantánea
      setDocumentos((prev) => [response.data, ...prev]);

      // Resetear formulario
      setUploadFile(null);
      setUploadName("");
      setUploadDescription("");
      setShowUploadModal(false);

      alert("Documento subido exitosamente");
    } catch (error) {
      console.error("Error completo:", error);
      let errorMessage = "Error al subir el documento";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          const errors = Object.values(error.response.data).flat();
          if (errors.length > 0) errorMessage = errors.join(", ");
        }
      }
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documento) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${documento.nombre}"?`)) return;

    try {
      await api.delete(`/api/documentos/${documento.id}/`);
      // Actualización instantánea
      setDocumentos((prev) => prev.filter((doc) => doc.id !== documento.id));
      alert("Documento eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando documento:", error);
      alert("Error al eliminar el documento");
    }
  };

  // === UTILIDADES ===
  const getFileIcon = (tipo) => {
    const iconMap = {
      excel: "xlsx",
      xlsx: "xlsx",
      xls: "xlsx",
      word: "doc",
      doc: "doc",
      docx: "doc",
      pdf: "pdf",
      image: "img",
      png: "img",
      jpg: "img",
      jpeg: "img",
    };
    return iconMap[tipo.toLowerCase()] || "file";
  };

  const groupDocsByMonth = (docs) => {
    const grouped = {};
    docs.forEach((doc) => {
      const fecha = new Date(doc.fecha_subida);
      const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      const monthName = fecha.toLocaleDateString("es-ES", { year: "numeric", month: "long" });

      if (!grouped[monthKey]) grouped[monthKey] = { monthName, days: {} };

      const dayKey = fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped[monthKey].days[dayKey]) grouped[monthKey].days[dayKey] = [];
      grouped[monthKey].days[dayKey].push(doc);
    });
    return grouped;
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  // Paginación
  const getPaginatedDocs = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredDocs.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      pages.push(
        <button key="prev" className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)}>
          ‹
        </button>
      );
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} className="pagination-btn" onClick={() => handlePageChange(1)}>
          1
        </button>
      );
      if (startPage > 2) pages.push(<span key="dots1" className="pagination-dots">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots2" className="pagination-dots">...</span>);
      pages.push(
        <button key={totalPages} className="pagination-btn" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button key="next" className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)}>
          ›
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredDocs.length)} -{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocs.length)} de {filteredDocs.length} documentos
        </div>
        <div className="pagination">{pages}</div>
      </div>
    );
  };

  const groupedDocs = groupDocsByMonth(getPaginatedDocs());

  // === RENDER ===
  return (
    <div className="documentos-container">
      <div className="documentos-header">
        <h2 className="titulo-documentos">📁 Gestión de Documentos</h2>
        <button className="btn-upload-main" onClick={() => setShowUploadModal(true)}>
          + Subir Documento
        </button>
      </div>

      {/* ... filtros, modal y resto de tu JSX (igual que tenías) ... */}

      {loading ? (
        <p className="mensaje-cargando">Cargando documentos...</p>
      ) : error ? (
        <p className="mensaje-error">{error}</p>
      ) : filteredDocs.length === 0 ? (
        <p className="mensaje-vacio">{searchTerm ? "No se encontraron documentos" : "No hay documentos disponibles"}</p>
      ) : (
        <>
          <div className="documentos-timeline">
            {Object.entries(groupedDocs).map(([monthKey, monthData]) => (
              <div key={monthKey} className="month-block">
                <div className="month-header" onClick={() => toggleMonth(monthKey)}>
                  <span className="calendar-icon">📅</span>
                  <h3>{monthData.monthName}</h3>
                  <span className="chevron-icon">{expandedMonths[monthKey] ? "▲" : "▼"}</span>
                </div>

                {expandedMonths[monthKey] && (
                  <div className="month-content">
                    {Object.entries(monthData.days).map(([dayKey, docs]) => (
                      <div key={dayKey} className="day-block">
                        <h4 className="day-header">{dayKey}</h4>
                        <div className="documentos-list">
                          {docs.map((doc) => (
                            <div key={doc.id} className="documento-card">
                              <div className="documento-icon">
                                <span className={`file-icon file-icon-${getFileIcon(doc.tipo)}`}></span>
                              </div>
                              <div className="documento-info">
                                <h5 className="documento-nombre">{doc.nombre}</h5>
                                {doc.descripcion && <p className="documento-descripcion">{doc.descripcion}</p>}
                                <span className="documento-tipo">{doc.tipo.toUpperCase()}</span>
                              </div>
                              <div className="documento-actions">
                                <button
                                  className="btn-download"
                                  onClick={() => handleDownload(doc)}
                                  title="Descargar documento"
                                >
                                  ↓
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDelete(doc)}
                                  title="Eliminar documento"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default Documentos;
