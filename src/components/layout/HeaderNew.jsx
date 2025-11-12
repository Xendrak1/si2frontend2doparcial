import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Header minimalista y elegante
const HeaderNew = ({ toggleSidebar, sidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center justify-between h-20 px-6 md:px-8 lg:px-12">
        
        {/* Lado izquierdo - Toggle y Búsqueda */}
        <div className="flex items-center gap-6 flex-1 max-w-2xl">
          {/* Botón de menú */}
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Barra de búsqueda */}
          <div className="hidden md:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar productos, clientes, pedidos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Lado derecho - Notificaciones y Perfil */}
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => navigate("/perfil")}
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-semibold shadow-md">
              A
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderNew;

