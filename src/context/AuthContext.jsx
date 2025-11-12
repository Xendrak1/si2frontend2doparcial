import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout, me as apiMe } from "../api";

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
        if (token && !user) {
          const u = await apiMe();
          setUser(u);
        }
      } catch {}
    })();
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated: !!user,
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
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}


