import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-10 py-5">
        {/* Left side - Menu Toggle & Search */}
        <div className="flex items-center gap-6 flex-1">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
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

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl ml-8 mr-12">
            <div className="relative w-full">
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
              <input
                type="text"
                placeholder="Buscar productos, clientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white text-base"
              />
            </div>
          </div>
        </div>

        {/* Right side - Notifications & Profile */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative text-gray-600 hover:text-gray-900 focus:outline-none transition-colors">
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
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate("/perfil")}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 transition-all duration-200"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200">
              A
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

