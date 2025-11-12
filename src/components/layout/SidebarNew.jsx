import { Link, useLocation } from "react-router-dom";

// Sidebar minimalista con navegación clara
const SidebarNew = ({ isOpen }) => {
  const location = useLocation();

  // Elementos del menú
  const menuItems = [
    {
      title: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: "/",
    },
    {
      title: "Productos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      path: "/productos",
      submenu: [
        { title: "Lista de Productos", path: "/productos" },
        { title: "Categorías", path: "/categorias" },
      ],
    },
    {
      title: "Inventario",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      path: "/stocks",
      submenu: [
        { title: "Stock Actual", path: "/stocks" },
        { title: "Sucursales", path: "/sucursales" },
      ],
    },
    {
      title: "Ventas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: "/ventas",
    },
    {
      title: "Clientes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: "/clientes",
    },
    {
      title: "Reportes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: "/reportes",
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 ${
        isOpen ? "w-72" : "w-0"
      } overflow-hidden`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-gray-200 px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Boutique
            </h1>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item, index) => (
            <div key={index}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>

              {/* Submenú */}
              {item.submenu && (
                <div className="mt-1 ml-4 space-y-1">
                  {item.submenu.map((subitem, subindex) => (
                    <Link
                      key={subindex}
                      to={subitem.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        location.pathname === subitem.path
                          ? "text-pink-600 bg-pink-50 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {subitem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>© 2025 Boutique System</p>
            <p className="mt-1">Versión 1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNew;

