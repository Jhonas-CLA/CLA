// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('access_token'));

    // Función para hacer peticiones con token
    const apiCall = async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Si el token expiró, intentar refrescar
            if (response.status === 401 && token) {
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Reintentar la petición con el nuevo token
                    headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
                    return fetch(url, { ...options, headers });
                } else {
                    // Si no se pudo refrescar, hacer logout
                    logout();
                    return response;
                }
            }

            return response;
        } catch (error) {
            console.error('Error en API call:', error);
            throw error;
        }
    };

    // Función de login
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar tokens en localStorage
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                
                // Actualizar estado
                setToken(data.access);
                setUser(data.user);
                
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error || 'Error al iniciar sesión' };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: 'Error de conexión' };
        }
    };

    // Función de logout
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                await apiCall('http://localhost:8000/api/auth/logout/', {
                    method: 'POST',
                    body: JSON.stringify({ refresh: refreshToken }),
                });
            }
        } catch (error) {
            console.error('Error en logout:', error);
        }

        // Limpiar todo
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setUser(null);
    };

    // Función para refrescar token
    const refreshToken = async () => {
        try {
            const refreshTokenValue = localStorage.getItem('refresh_token');
            if (!refreshTokenValue) return false;

            const response = await fetch('http://localhost:8000/api/auth/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshTokenValue }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('access_token', data.access);
                setToken(data.access);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error al refrescar token:', error);
            return false;
        }
    };

    // Cargar usuario al inicio
    useEffect(() => {
        const loadUser = async () => {
            const savedToken = localStorage.getItem('access_token');
            if (savedToken) {
                setToken(savedToken);
                try {
                    const response = await fetch('http://localhost:8000/api/auth/profile/', {
                        headers: {
                            'Authorization': `Bearer ${savedToken}`,
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        // Token inválido, limpiar
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Error cargando usuario:', error);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        apiCall,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};