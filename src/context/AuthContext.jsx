import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout, me as apiMe, register as apiRegister } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
    } catch {}
  }, [user]);

  // Recuperar sesión si hay token
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const u = await apiMe();
          setUser(u);
        } else {
          // Si no hay token, limpiar usuario
          setUser(null);
        }
      } catch (error) {
        // Si el token es inválido, limpiar todo
        console.log("Token inválido, limpiando sesión:", error);
        setUser(null);
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch {}
      }
    })();
  }, []);

  const value = useMemo(
    () => {
      const isAuth = !!user;
      console.log("AuthContext - user:", user, "isAuthenticated:", isAuth);
      return {
        user,
        setUser,
        isAuthenticated: isAuth,
        login: (u) => setUser(u),
      logout: async () => {
        try {
          await apiLogout();
        } catch {}
        try {
          localStorage.removeItem("token");
        } catch {}
        setUser(null);
      },
      loginWithCredentials: async (email, password) => {
        const res = await apiLogin(email, password); // { token, user }
        try {
          localStorage.setItem("token", res.token);
        } catch {}
        setUser(res.user);
        return res.user;
      },
      registerCustomer: async ({ nombre, email, password }) => {
        const payload = {
          nombre: nombre || "",
          email,
          password,
          rol: "cliente",
        };
        await apiRegister(payload);
        // Tras registrar, iniciar sesión automáticamente
        const res = await apiLogin(email, password);
        try {
          localStorage.setItem("token", res.token);
        } catch {}
        setUser(res.user);
        return res.user;
      },
      };
    },
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}


