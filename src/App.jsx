import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import NotFound from "./components/common/NotFound";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Permissions } from "./auth/roles";

// TODO MINIMALISTA - Blanco y Negro estricto
import DashboardMinimal from "./pages/DashboardMinimal";
import ProductosMinimal from "./pages/ProductosMinimal";
import ClientesMinimal from "./pages/ClientesMinimal";
import VentasMinimal from "./pages/VentasMinimal";
import StocksMinimal from "./pages/StocksMinimal";
import ReportesMinimal from "./pages/ReportesMinimal";
import LoginMinimal from "./pages/LoginMinimal";
import TiendaMinimal from "./pages/TiendaMinimal";
import ProductoDetalle from "./pages/ProductoDetalle";
import CarritoMinimal from "./pages/CarritoMinimal";
import CheckoutQR from "./pages/CheckoutQR";
import POSMinimal from "./pages/POSMinimal";
import CategoriasMinimal from "./pages/CategoriasMinimal";
import RolesMinimal from "./pages/RolesMinimal";
import MisPedidos from "./pages/MisPedidos";
import SucursalesNew from "./pages/SucursalesNew";
import PerfilNew from "./pages/PerfilNew";
import NotificacionesMinimal from "./pages/NotificacionesMinimal";

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth (login como pantalla inicial) */}
                <Route path="/" element={<LoginMinimal />} />
                <Route path="/login" element={<LoginMinimal />} />
                
                {/* Páginas principales con diseño minimalista */}
                <Route path="/dashboard" element={<DashboardMinimal />} />
                <Route path="/productos" element={<ProductosMinimal />} />
                <Route path="/clientes" element={<ClientesMinimal />} />
                <Route path="/ventas" element={<VentasMinimal />} />
                <Route path="/stocks" element={<StocksMinimal />} />
                <Route
                  path="/reportes"
                  element={
                    <ProtectedRoute permission={Permissions.ReportesVer}>
                      <ReportesMinimal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notificaciones"
                  element={
                    <ProtectedRoute permission={Permissions.NotificacionesEnviar}>
                      <NotificacionesMinimal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pos"
                  element={
                    <ProtectedRoute permission={Permissions.VentasPOS}>
                      <POSMinimal />
                    </ProtectedRoute>
                  }
                />
                
                {/* Tienda (cliente) */}
                <Route path="/tienda" element={<TiendaMinimal />} />
                <Route path="/producto/:id" element={<ProductoDetalle />} />
                <Route path="/carrito" element={<CarritoMinimal />} />
                <Route path="/checkout" element={<CheckoutQR />} />
                <Route path="/mis-pedidos" element={<MisPedidos />} />
                
                {/* Páginas secundarias */}
                <Route path="/categorias" element={<CategoriasMinimal />} />
                <Route path="/roles" element={<RolesMinimal />} />
                <Route path="/sucursales" element={<SucursalesNew />} />
                <Route path="/perfil" element={<PerfilNew />} />
                
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
