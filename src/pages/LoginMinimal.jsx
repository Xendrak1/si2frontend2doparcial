import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// Login SIMULADO: no llama al backend, solo asigna rol y permisos
const LoginMinimal = () => {
  const { loginWithCredentials } = useAuth();
  const { setMode } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const u = await loginWithCredentials(email, password);
      if (u.role === "cliente") {
        setMode("store");
        navigate("/tienda");
      } else {
        setMode("admin");
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-white grid place-items-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-2 border border-black text-2xl font-bold tracking-wider">
            Boutique
          </div>
          <p className="mt-2 text-sm text-gray-600">Panel y Tienda</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 p-8">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus-accent"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-semibold mb-2">Contraseña</label>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus-accent"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white border border-gray-300 hover:bg-gray-100 rounded"
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                <circle cx="12" cy="12" r="3"/>
                {showPass ? <line x1="4" y1="20" x2="20" y2="4"/> : null}
              </svg>
            </button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 px-4 py-3 btn-accent font-medium">
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                // Invitado entra directo a la tienda
                setMode("store");
                navigate("/tienda");
              }}
              className="flex-1 px-4 py-3 btn-accent-outline font-medium"
            >
              Invitado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginMinimal;


