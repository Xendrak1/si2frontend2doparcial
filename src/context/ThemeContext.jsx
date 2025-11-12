import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Paletas propuestas: camel, burdeos, oliva
const palettes = {
  camel: {
    accent: "#C39A6B",
    accentHover: "#A17848",
    text: "#111111",
    bg: "#FFFFFF",
  },
  burdeos: {
    accent: "#7A1E2E",
    accentHover: "#611925",
    text: "#0F172A",
    bg: "#FFFFFF",
  },
  oliva: {
    accent: "#556B2F",
    accentHover: "#445725",
    text: "#111827",
    bg: "#FFFFFF",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [accent, setAccent] = useState(() => {
    try {
      return localStorage.getItem("accent") || "camel";
    } catch {
      return "camel";
    }
  });
  const [mode, setMode] = useState(() => {
    // admin = blanco/negro estricto; store = BN + acento
    try {
      return localStorage.getItem("mode") || "admin"; // "admin" | "store"
    } catch {
      return "admin";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("accent", accent);
      localStorage.setItem("mode", mode);
    } catch {}
    // Exponer como CSS variables (sirve para aplicar en contenido)
    const p = palettes[accent];
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--accent", p.accent);
      root.style.setProperty("--accent-hover", p.accentHover);
      root.style.setProperty("--accent-text", p.text);
      root.style.setProperty("--bg", p.bg);
    }
  }, [accent, mode]);

  const value = useMemo(
    () => ({
      accent,
      setAccent,
      mode,
      setMode,
      palette: palettes[accent],
      palettes,
    }),
    [accent, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}


