import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

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
      className={`bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transition-all duration-300 ${
        isOpen ? "w-72" : "w-0"
      } overflow-hidden`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 bg-indigo-950/30 border-b border-indigo-700/30">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Boutique
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-5 space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-indigo-700 shadow-lg"
                    : "hover:bg-indigo-800/50"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </Link>

              {/* Submenu */}
              {item.submenu && (
                <div className="mt-1 ml-4 space-y-1">
                  {item.submenu.map((subitem, subindex) => (
                    <Link
                      key={subindex}
                      to={subitem.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        location.pathname === subitem.path
                          ? "bg-indigo-700/70 text-white"
                          : "text-indigo-200 hover:bg-indigo-800/30 hover:text-white"
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
        <div className="p-6 border-t border-indigo-700/30 bg-indigo-950/30">
          <div className="text-xs text-indigo-300 text-center">
            <p>© 2025 Boutique System</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

