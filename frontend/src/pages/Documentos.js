// src/components/Documentos.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Documentos.css";
import { BASE_URL } from '../api';

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

    useEffect(() => {
        fetchDocumentos();
    }, []);

    useEffect(() => {
        let filtered = documentos;
        
        // Filtro por texto
        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(doc =>
                doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filtro por fecha
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
                filtered = filtered.filter(doc => {
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
        setCurrentPage(1); // Reset to first page when filtering
    }, [searchTerm, documentos, dateFilter, customStartDate, customEndDate]);

    useEffect(() => {
        const totalItems = filteredDocs.length;
        setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
    }, [filteredDocs]);

    const fetchDocumentos = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/documentos/`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });
            console.log('Documentos cargados:', response.data);
            setDocumentos(response.data);
            setFilteredDocs(response.data);
        } catch (error) {
            console.error("Error completo obteniendo documentos:", error);
            setError("No se pudieron cargar los documentos.");
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (tipo) => {
        const iconMap = {
            'excel': 'xlsx', 'xlsx': 'xlsx', 'xls': 'xlsx',
            'word': 'doc', 'doc': 'doc', 'docx': 'doc',
            'pdf': 'pdf',
            'image': 'img', 'png': 'img', 'jpg': 'img', 'jpeg': 'img',
        };
        return iconMap[tipo.toLowerCase()] || 'file';
    };

    const handleDownload = async (documento) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/api/documentos/${documento.id}/descargar/`,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', documento.nombre);
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

        const formData = new FormData();
        formData.append('archivo', uploadFile);
        
        if (uploadName && uploadName.trim() !== '') {
            formData.append('nombre', uploadName.trim());
        }
        
        if (uploadDescription && uploadDescription.trim() !== '') {
            formData.append('descripcion', uploadDescription.trim());
        }

        try {
            setUploading(true);
            
            const response = await axios.post(`${BASE_URL}/api/documentos/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // Resetear formulario
            setUploadFile(null);
            setUploadName("");
            setUploadDescription("");
            setShowUploadModal(false);
            
            // Recargar documentos
            await fetchDocumentos();
            alert("Documento subido exitosamente");
        } catch (error) {
            console.error("Error completo:", error);
            
            let errorMessage = "Error al subir el documento";
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    const errors = Object.values(error.response.data).flat();
                    if (errors.length > 0) {
                        errorMessage = errors.join(', ');
                    }
                }
            }
            
            alert(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documento) => {
        const confirmDelete = window.confirm(
            `¿Estás seguro de que quieres eliminar "${documento.nombre}"?`
        );
        
        if (!confirmDelete) return;

        try {
            await axios.delete(`${BASE_URL}/api/documentos/${documento.id}/`);
            await fetchDocumentos();
            alert("Documento eliminado exitosamente");
        } catch (error) {
            console.error("Error eliminando documento:", error);
            alert("Error al eliminar el documento");
        }
    };

    const groupDocsByMonth = (docs) => {
        const grouped = {};
        
        docs.forEach(doc => {
            const fecha = new Date(doc.fecha_subida);
            const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            const monthName = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
            
            if (!grouped[monthKey]) {
                grouped[monthKey] = { monthName, days: {} };
            }

            const dayKey = fecha.toLocaleDateString('es-ES', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });

            if (!grouped[monthKey].days[dayKey]) {
                grouped[monthKey].days[dayKey] = [];
            }

            grouped[monthKey].days[dayKey].push(doc);
        });

        return grouped;
    };

    const toggleMonth = (monthKey) => {
        setExpandedMonths(prev => ({
            ...prev,
            [monthKey]: !prev[monthKey]
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

        // Botón anterior
        if (currentPage > 1) {
            pages.push(
                <button
                    key="prev"
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    ‹
                </button>
            );
        }

        // Primera página si no está visible
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    className="pagination-btn"
                    onClick={() => handlePageChange(1)}
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="dots1" className="pagination-dots">...</span>);
            }
        }

        // Páginas visibles
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // Última página si no está visible
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="dots2" className="pagination-dots">...</span>);
            }
            pages.push(
                <button
                    key={totalPages}
                    className="pagination-btn"
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        // Botón siguiente
        if (currentPage < totalPages) {
            pages.push(
                <button
                    key="next"
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    ›
                </button>
            );
        }

        return (
            <div className="pagination-container">
                <div className="pagination-info">
                    Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredDocs.length)} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocs.length)} de {filteredDocs.length} documentos
                </div>
                <div className="pagination">
                    {pages}
                </div>
            </div>
        );
    };

    const groupedDocs = groupDocsByMonth(getPaginatedDocs());

    return (
        <div className="documentos-container">
            <div className="documentos-header">
                <h2 className="titulo-documentos">📁 Gestión de Documentos</h2>
                <button 
                    className="btn-upload-main"
                    onClick={() => setShowUploadModal(true)}
                >
                    + Subir Documento
                </button>
            </div>

            <div className="filters-container">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar documentos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="date-filter-box">
                    <label className="filter-label">Filtrar por fecha:</label>
                    <select
                        value={dateFilter}
                        onChange={(e) => {
                            setDateFilter(e.target.value);
                            setShowCustomDateInputs(e.target.value === "custom");
                            if (e.target.value !== "custom") {
                                setCustomStartDate("");
                                setCustomEndDate("");
                            }
                        }}
                        className="date-filter-select"
                    >
                        <option value="all">Todas las fechas</option>
                        <option value="today">Hoy</option>
                        <option value="week">Esta semana</option>
                        <option value="month">Este mes</option>
                        <option value="3months">Últimos 3 meses</option>
                        <option value="6months">Últimos 6 meses</option>
                        <option value="year">Este año</option>
                        <option value="custom">Rango personalizado</option>
                    </select>
                </div>

                {showCustomDateInputs && (
                    <div className="custom-date-inputs">
                        <div className="date-input-group">
                            <label>Desde:</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                        <div className="date-input-group">
                            <label>Hasta:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Subida */}
            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>📤 Subir Documento</h3>
                            <button 
                                className="btn-close"
                                onClick={() => setShowUploadModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleFileUpload} className="upload-form">
                            <div className="form-group">
                                <label>Archivo *</label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setUploadFile(file);
                                        if (file && !uploadName) {
                                            setUploadName(file.name);
                                        }
                                    }}
                                    required
                                    className="file-input"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                />
                                {uploadFile && (
                                    <div className="file-info">
                                        <small>📎 {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)</small>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Nombre del documento</label>
                                <input
                                    type="text"
                                    value={uploadName}
                                    onChange={(e) => setUploadName(e.target.value)}
                                    placeholder="Nombre del archivo..."
                                    className="text-input"
                                />
                                <small className="form-hint">Dejar vacío para usar el nombre original del archivo</small>
                            </div>

                            <div className="form-group">
                                <label>Descripción (opcional)</label>
                                <textarea
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    placeholder="Descripción del documento..."
                                    className="textarea-input"
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="btn-cancel"
                                    disabled={uploading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={uploading || !uploadFile}
                                >
                                    {uploading ? "Subiendo..." : "Subir Documento"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <p className="mensaje-cargando">Cargando documentos...</p>
            ) : error ? (
                <p className="mensaje-error">{error}</p>
            ) : filteredDocs.length === 0 ? (
                <p className="mensaje-vacio">
                    {searchTerm ? "No se encontraron documentos" : "No hay documentos disponibles"}
                </p>
            ) : (
                <>
                    <div className="documentos-timeline">
                        {Object.entries(groupedDocs).map(([monthKey, monthData]) => (
                            <div key={monthKey} className="month-block">
                                <div 
                                    className="month-header"
                                    onClick={() => toggleMonth(monthKey)}
                                >
                                    <span className="calendar-icon">📅</span>
                                    <h3>{monthData.monthName}</h3>
                                    <span className="chevron-icon">
                                        {expandedMonths[monthKey] ? '▲' : '▼'}
                                    </span>
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
                                                                {doc.descripcion && (
                                                                    <p className="documento-descripcion">
                                                                        {doc.descripcion}
                                                                    </p>
                                                                )}
                                                                <span className="documento-tipo">
                                                                    {doc.tipo.toUpperCase()}
                                                                </span>
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