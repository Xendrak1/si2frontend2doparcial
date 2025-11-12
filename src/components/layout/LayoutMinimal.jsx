import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import CartDrawer from "../store/CartDrawer";
import { getCategorias } from "../../api";
import { hasPermission, Permissions } from "../../auth/roles";
import AIFab from "../ai/AIFab";

// Iconos SVG inline compactos - Estilo Heroicons
const DashboardIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ProductosIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ClientesIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const VentasIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const InventarioIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ReportesIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a2 2 0 10-4 0v1.083A6.002 6.002 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m8 0a3 3 0 11-6 0h6z" />
  </svg>
);

const CategoriasIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const RolesIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 11a4 4 0 110-8 4 4 0 010 8zm6 7a4 4 0 10-8 0v2h8v-2zm7-7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BagIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4M5 9h14l-1 10a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z" />
  </svg>
);

const CartIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13l-1.5 8h13L17 13M7 13l-2-8" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M3 7a4 4 0 014-4h6l8 8-10 10L3 17V7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
  </svg>
);

const LoginIcon = () => (
  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h10m-3-4V7a2 2 0 012-2h5a2 2 0 012 2v10a2 2 0 01-2 2h-5a2 2 0 01-2-2v-1" />
  </svg>
);

// Layout con sidebar COLAPSABLE más angosto y suave
const LayoutMinimal = ({ children }) => {
  const location = useLocation();
  const { accent, setAccent, mode, setMode, palettes } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { totalItems = 0 } = useCart();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [storeCategories, setStoreCategories] = useState([]);
  // Persistimos la intención de expansión para evitar parpadeos al navegar
  const setExpanded = (value) => {
    setSidebarExpanded(value);
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("sidebarHover", value ? "1" : "0");
    }
  };

  // Estado inicial desde sessionStorage (si el ratón sigue encima tras navegar)
  if (typeof window !== "undefined" && !sidebarExpanded) {
    const initial = typeof sessionStorage !== "undefined" && sessionStorage.getItem("sidebarHover") === "1";
    if (initial) setSidebarExpanded(true);
  }
  const COLLAPSED_W = 56; // ancho colapsado (px) más compacto
  const EXPANDED_W = 184; // ancho expandido más angosto
  const currentSidebarWidth = sidebarExpanded ? EXPANDED_W : COLLAPSED_W;

  // Menú completo con permisos requeridos
  const allMenuItems = [
    { key: "dashboard", name: "Dashboard", path: "/dashboard", Icon: DashboardIcon, permission: Permissions.DashboardVer },
    { key: "productos", name: "Productos", path: "/productos", Icon: ProductosIcon, permission: Permissions.ProductosLeer },
    { key: "clientes", name: "Clientes", path: "/clientes", Icon: ClientesIcon, permission: Permissions.ClientesAll },
    { key: "ventas", name: "Ventas", path: "/ventas", Icon: VentasIcon, permission: Permissions.VentasPOS }, // Ventas requiere POS o acceso a ventas
    { key: "pos", name: "POS", path: "/pos", Icon: VentasIcon, sub: true, permission: Permissions.VentasPOS },
    { key: "stocks", name: "Inventario", path: "/stocks", Icon: InventarioIcon, permission: Permissions.StockMov },
    { key: "reportes", name: "Reportes", path: "/reportes", Icon: ReportesIcon, permission: Permissions.ReportesVer },
    { key: "notificaciones", name: "Notificaciones", path: "/notificaciones", Icon: BellIcon, permission: Permissions.NotificacionesEnviar },
    { key: "categorias", name: "Categorías", path: "/categorias", Icon: CategoriasIcon, permission: Permissions.CategoriasAll },
    { key: "roles", name: "Roles", path: "/roles", Icon: RolesIcon, permission: Permissions.RolesAll },
    { key: "usuarios", name: "Usuarios", path: "/usuarios", Icon: UsersIcon, permission: Permissions.RolesAll },
  ];

  // Menú base de tienda (siempre visible para clientes/invitados)
  const storeMenuBase = [
    { key: "tienda", name: "Tienda", path: "/tienda", Icon: BagIcon, permission: null },
    { key: "mis-pedidos", name: "Mis Pedidos", path: "/mis-pedidos", Icon: VentasIcon, permission: null, showOnlyIfAuth: true }
  ];
  const storeMenu = [
    ...storeMenuBase.filter(item => {
      // Si requiere autenticación y el usuario no está autenticado, no mostrarlo
      if (item.showOnlyIfAuth && !user) return false;
      return true;
    }),
    ...storeCategories.map((c) => {
      const id = c.id ?? c.pk ?? c.codigo ?? c.value;
      const nombre = c.nombre ?? c.name ?? c.titulo ?? c.label ?? `Cat ${id}`;
      return { key: `cat-${id}`, name: nombre, path: `/tienda?cat=${id}`, Icon: TagIcon, catId: String(id), permission: null };
    }),
  ];

  // Filtrar menú basado en permisos del usuario
  const role = user ? String(user.role).toLowerCase() : "invitado";
  let menuItems = [];
  
  if (role === "admin") {
    // Admin ve todo
    menuItems = allMenuItems;
  } else if (role === "vendedor") {
    // Vendedor ve solo lo que tiene permisos
    menuItems = allMenuItems.filter(item => !item.permission || hasPermission(user, item.permission));
  } else {
    // Cliente/Invitado: ver tienda + elementos con permisos específicos
    // Si tiene permisos adicionales, mostrar también esos elementos del menú admin
    const itemsConPermisos = allMenuItems.filter(item => {
      // Verificar si tiene el permiso específico requerido
      return hasPermission(user, item.permission);
    });
    menuItems = [...storeMenu, ...itemsConPermisos];
  }

  // Forzar modo 'store' para usuarios no admin, a menos que tengan permisos de admin
  useEffect(() => {
    if (!user || (user && String(user.role).toLowerCase() !== "admin")) {
      // Si el usuario tiene permisos de admin (como "*"), permitir modo admin
      const tienePermisosAdmin = user && (hasPermission(user, Permissions.RolesAll) || 
        (user.permissions && (user.permissions.includes("*") || user.permissions.length > 5)));
      if (!tienePermisosAdmin && mode !== "store") {
        setMode("store");
      }
    }
  }, [user, mode, setMode]);

  // Cargar categorías al entrar en modo store
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mode !== "store") return;
      try {
        const data = await getCategorias();
        if (mounted) setStoreCategories(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setStoreCategories([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [mode]);

  return (
    <div
      className="grid h-screen bg-white overflow-hidden gap-x-6 lg:gap-x-8"
      style={{ gridTemplateColumns: `${currentSidebarWidth}px 1fr` }}
    >
      {/* Sidebar STICKY que SIEMPRE empuja el contenido */}
      <aside
        className="sticky top-0 h-screen bg-black text-white flex flex-col z-40 transition-all duration-200 ease-out shadow-2xl rounded-r-2xl overflow-hidden ring-1 ring-white/10"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onPointerEnter={() => setExpanded(true)}
        onPointerMove={() => setExpanded(true)}
        style={{ width: `${currentSidebarWidth}px` }}
      >
        {/* Header fijo (logo + preferencias) con altura constante para evitar saltos */}
        <div className="w-full border-b border-gray-800 shrink-0">
          {/* Logo: 'B' colapsado, 'Boutique' expandido (misma tipografía) */}
          <div className="h-12 flex items-center justify-center">
            <h1 className={`font-bold tracking-wider text-2xl`}>
              {sidebarExpanded ? "Boutique" : "B"}
            </h1>
          </div>
          <div className="w-full px-3">
            {sidebarExpanded ? (
              <div className="w-full flex flex-col items-center gap-2 h-28">
                {/* Toggle solo visible para ADMIN */}
                {user && String(user.role).toLowerCase() === "admin" ? (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      onClick={() => {
                        setMode("admin");
                        navigate("/dashboard");
                      }}
                      className={`h-8 rounded-md text-xs font-medium ${mode === "admin" ? "bg-white text-black" : "bg-gray-800"}`}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => {
                        setMode("store");
                        navigate("/tienda");
                      }}
                      className={`h-8 rounded-md text-xs font-medium ${mode === "store" ? "bg-white text-black" : "bg-gray-800"}`}
                    >
                      Store
                    </button>
                  </div>
                ) : null}
                {/* Dots de acento: VERTICALES y centrados */}
                <div className="flex flex-col items-center gap-2">
                  {Object.keys(palettes).map((key) => (
                    <button
                      key={key}
                      aria-label={`accent-${key}`}
                      onClick={() => setAccent(key)}
                      className={`rounded-full border-2 ${accent === key ? "border-white" : "border-gray-700"}`}
                      style={{ width: 16, height: 16, background: palettes[key].accent }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-2 h-28 justify-center">
                {Object.keys(palettes).map((key) => (
                  <button
                    key={key}
                    aria-label={`accent-${key}`}
                    onClick={() => setAccent(key)}
                    className={`rounded-full border-2 ${accent === key ? "border-white" : "border-gray-700"}`}
                    style={{ width: 12, height: 12, background: palettes[key].accent }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navegación alineada arriba, bajo el header */}
        <nav className="flex-1 flex flex-col justify-start gap-3 overflow-auto px-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.Icon;
            const searchParams = new URLSearchParams(location.search);
            const catParam = searchParams.get("cat");
            const isActive =
              mode === "store"
                ? item.key === "tienda"
                  ? location.pathname === "/tienda" && (!catParam || catParam === "all")
                  : item.key.startsWith("cat-")
                  ? location.pathname === "/tienda" && String(catParam) === String(item.catId)
                  : location.pathname === item.path
                : location.pathname === item.path;
            const adminClasses = isActive
              ? "bg-white text-black font-medium"
              : "hover:bg-gray-900";
            const storeClasses = isActive ? "font-semibold" : "hover:bg-gray-800/60";
            const linkStyle =
              mode === "store" && isActive
                ? { backgroundColor: palettes[accent].accent, color: "#FFFFFF" }
                : undefined;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={linkStyle}
                className={`relative flex items-center transition-all duration-200 rounded-xl w-[94%] mx-auto ${
                  sidebarExpanded
                    ? `gap-3 justify-start ${item.sub ? "pl-36 pr-6 py-3" : "px-6 py-3.5"}`
                    : "justify-center py-3.5"
                } ${mode === "admin" ? adminClasses : storeClasses}`}
              >
                {sidebarExpanded && item.sub && (
                  <span
                    className="absolute top-0 bottom-0 w-px"
                    style={{ left: 24, backgroundColor: "var(--accent)", opacity: 0.6 }}
                  />
                )}
                <div className="flex-shrink-0 w-6 h-6">
                  <Icon />
                </div>
                {sidebarExpanded && (
                  <span className={`text-base font-medium`}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth action */}
        <div className="px-1 pb-3">
          {isAuthenticated ? (
            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className={`flex items-center transition-all duration-200 rounded-xl w-[94%] mx-auto ${
                sidebarExpanded ? "gap-3 justify-start px-6 py-3.5" : "justify-center py-3.5"
              } ${mode === "admin" ? "hover:bg-gray-900" : "hover:bg-gray-800/60"}`}
            >
              <div className="flex-shrink-0 w-6 h-6">
                <LogoutIcon />
              </div>
              {sidebarExpanded && <span className="text-base font-medium">Cerrar sesión</span>}
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className={`flex items-center transition-all duration-200 rounded-xl w-[94%] mx-auto ${
                sidebarExpanded ? "gap-3 justify-start px-6 py-3.5" : "justify-center py-3.5"
              } ${mode === "admin" ? "hover:bg-gray-900" : "hover:bg-gray-800/60"}`}
            >
              <div className="flex-shrink-0 w-6 h-6">
                <LoginIcon />
              </div>
              {sidebarExpanded && <span className="text-base font-medium">Iniciar sesión</span>}
            </button>
          )}
        </div>

        {/* Footer más grande */}
        <div className={`border-t border-gray-800 text-xs text-gray-500 rounded-b-2xl ${
          sidebarExpanded ? "px-8 py-3" : "py-3"
        }`}>
          <p className="text-center text-sm">{sidebarExpanded ? "© 2025" : "©"}</p>
        </div>
      </aside>

      {/* Contenido principal: empujado por el grid y con contenedor centrado */}
      <div className="overflow-x-hidden overflow-y-auto mt-8 mb-8">
        <div
          className="max-w-[1400px] mx-auto w-full pl-6 sm:pl-8 lg:pl-12 xl:pl-16 2xl:pl-20 pr-12 sm:pr-20 lg:pr-24 xl:pr-28 2xl:pr-40 transition-transform duration-200 ease-out"
          style={{ accentColor: "var(--accent)" }}
        >
          {/* Barra sutil de acento arriba en modo store */}
          {mode === "store" ? (
            <div className="h-1 w-full mb-4 rounded" style={{ background: "var(--accent)" }} />
          ) : null}
          {children}
        </div>
        {/* Botón flotante de carrito en modo store (no en POS) */}
        {mode === "store" && location.pathname !== "/pos" && (
          <>
            <button
              onClick={() => setOpenCart(true)}
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full btn-accent shadow-strong grid place-items-center"
              aria-label="Abrir carrito"
            >
              <span className="text-lg">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs px-2 py-0.5">
                  {totalItems}
                </span>
              )}
            </button>
            <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
          </>
        )}
      </div>
      {/* Menú flotante de IA (solo para admin y vendedor) */}
      {user && (user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "vendedor") && (
        <AIFab />
      )}
    </div>
  );
};

export default LayoutMinimal;

