// context/AuthContext.js
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

  // -------- API CALL CON AUTO REFRESH --------
  const apiCall = async (url, options = {}) => {
    let headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      let response = await fetch(url, { ...options, headers });

      // Si el token expiró, intentar refrescar
      if (response.status === 401 && token) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem('access_token');
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers }); // 👈 reintento
        } else {
          logout();
        }
      }

      return response;
    } catch (error) {
      console.error('Error en API call:', error);
      throw error;
    }
  };

  // -------- LOGIN --------
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/accounts/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.access) {
        // Guardar tokens
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        setToken(data.access);
        setUser(data.user);

        const userRole = data.user.is_staff ? 'admin' : 'usuario';
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userData', JSON.stringify(data.user));

        return { success: true, user: data.user, role: userRole };
      } else {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };

  // -------- LOGOUT --------

  const logout = async () => {
  const refreshTokenValue = localStorage.getItem('refresh_token');
  console.log('Refresh token en logout:', refreshTokenValue);

  if (refreshTokenValue) {
    try {
      const res = await fetch('http://localhost:8000/accounts/api/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshTokenValue }),
      });
      const data = await res.json();
      console.log('Logout response:', data);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  } else {
    console.warn('No hay refresh token, solo limpiando localStorage');
  }

  // Limpiar localStorage siempre
  ['access_token', 'refresh_token', 'userRole', 'userEmail', 'userData'].forEach(item =>
    localStorage.removeItem(item)
  );
  setToken(null);
  setUser(null);
};


  // -------- REFRESH TOKEN --------
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) return false;

      const response = await fetch('http://localhost:8000/accounts/api/auth/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshTokenValue }),
      });

      const data = await response.json();

      if (response.ok && data.access) {
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

  // -------- CARGAR USUARIO AL INICIO --------
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('access_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      setToken(savedToken);

      const fetchProfile = async (accessToken) => {
        return fetch('http://localhost:8000/accounts/api/auth/profile/', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
      };

      try {
        let response = await fetchProfile(savedToken);

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);

          const userRole = userData.is_staff ? 'admin' : 'usuario';
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userData', JSON.stringify(userData));
        } else if (response.status === 401 || response.status === 403) {
          // Token inválido, intentar refrescar
          const refreshed = await refreshToken();
          if (refreshed) {
            const newToken = localStorage.getItem('access_token');
            response = await fetchProfile(newToken);

            if (response.ok) {
              const userData = await response.json();
              setUser(userData);

              const userRole = userData.is_staff ? 'admin' : 'usuario';
              localStorage.setItem('userRole', userRole);
              localStorage.setItem('userEmail', userData.email);
              localStorage.setItem('userData', JSON.stringify(userData));
            } else {
              logout();
            }
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
      } finally {
        setLoading(false);
      }
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
    userRole: user?.is_staff ? 'admin' : 'usuario',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
