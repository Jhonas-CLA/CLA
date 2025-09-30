// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) {
throw new Error("useAuth debe ser usado dentro de AuthProvider");
}
return context;
};

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [token, setToken] = useState(localStorage.getItem("access_token"));

// -------- API CALL CON AUTO REFRESH --------
const apiCall = async (url, options = {}) => {
let headers = {
"Content-Type": "application/json",
...options.headers,
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

try {
  let response = await api({
    url,
    method: options.method || "GET",
    headers,
    data: options.body ? JSON.parse(options.body) : undefined,
  });

  // Si el token expiró, intentar refrescar
  if (response.status === 401 && token) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newToken = localStorage.getItem("access_token");
      headers.Authorization = `Bearer ${newToken}`;
      response = await api({
        url,
        method: options.method || "GET",
        headers,
        data: options.body ? JSON.parse(options.body) : undefined,
      });
    } else {
      logout();
    }
  }

  return response;
} catch (error) {
  console.error("Error en API call:", error);
  throw error;
}


};

// -------- LOGIN --------
const login = async (email, password) => {
  try {
    const response = await api.post("/accounts/api/auth/login/", { email, password });
    const data = response.data;

    if (response.status === 200 && data.access) {
      if (!data.user) {
        return { success: false, error: "El servidor no devolvió los datos del usuario." };
      }

      // Guardar tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Guardar usuario
      setToken(data.access);
      setUser(data.user);

      // Guardar datos en localStorage
      localStorage.setItem("userData", JSON.stringify(data.user));

      return { success: true, user: data.user };
    } else {
      return {
        success: false,
        error: data.error || data.detail || "Credenciales inválidas",
      };
    }
  } catch (error) {
    console.error("Error en login:", error);

    let message = "Error en el servidor. Intenta de nuevo.";
    if (error.response?.data) {
      if (typeof error.response.data === "string") {
        message = error.response.data;
      } else if (error.response.data.detail) {
        message = error.response.data.detail;
      } else if (error.response.data.error) {
        message = error.response.data.error;
      } else {
        message = JSON.stringify(error.response.data);
      }
    }

    return { success: false, error: message };
  }
};

// -------- LOGOUT --------
const logout = async () => {
const refreshTokenValue = localStorage.getItem("refresh_token");
if (refreshTokenValue) {
try {
const res = await api.post("/accounts/api/auth/logout/", {
refresh: refreshTokenValue,
});
console.log("Logout response:", res.data);
} catch (error) {
console.error("Error en logout:", error);
}
} else {
console.warn("No hay refresh token, solo limpiando localStorage");
}


// Limpiar localStorage siempre
[
  "access_token",
  "refresh_token",
  "userRole",
  "userEmail",
  "userData",
].forEach((item) => localStorage.removeItem(item));
setToken(null);
setUser(null);


};

// -------- REFRESH TOKEN --------
const refreshToken = async () => {
try {
const refreshTokenValue = localStorage.getItem("refresh_token");
if (!refreshTokenValue) return false;


  const response = await api.post("/accounts/api/auth/refresh/", {
    refresh: refreshTokenValue,
  });
  const data = response.data;

  if (response.status === 200 && data.access) {
    localStorage.setItem("access_token", data.access);
    setToken(data.access);
    return true;
  } else {
    return false;
  }
} catch (error) {
  console.error("Error al refrescar token:", error);
  return false;
}


};

// -------- CARGAR USUARIO AL INICIO --------
useEffect(() => {
const loadUser = async () => {
const savedToken = localStorage.getItem("access_token");
if (!savedToken) {
setLoading(false);
return;
}

  setToken(savedToken);

  const fetchProfile = async (accessToken) => {
    return api.get("/accounts/api/auth/profile/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  };

  try {
    let response = await fetchProfile(savedToken);

    if (response.status === 200 && response.data) {
      const userData = response.data;

      if (userData?.email) {
        setUser(userData);

        const userRole = userData.is_staff ? "admin" : "usuario";
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userData", JSON.stringify(userData));
      } else {
        console.warn("El perfil no contenía datos válidos:", userData);
      }
    } else if (response.status === 401 || response.status === 403) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newToken = localStorage.getItem("access_token");
        response = await fetchProfile(newToken);

        if (response.status === 200 && response.data?.email) {
          const userData = response.data;
          setUser(userData);

          const userRole = userData.is_staff ? "admin" : "usuario";
          localStorage.setItem("userRole", userRole);
          localStorage.setItem("userEmail", userData.email);
          localStorage.setItem("userData", JSON.stringify(userData));
        } else {
          logout();
        }
      } else {
        logout();
      }
    }
  } catch (error) {
    console.error("Error cargando usuario:", error);
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
isAuthenticated: !!token,
userRole: user?.is_staff ? "admin" : "usuario",
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
