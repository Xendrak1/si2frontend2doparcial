import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getProductos, getVentas, getClientes, getStocks, getTopProductos, getProductoImagenes, getStockBajo } from "../api";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../config/constants";

// Dashboard MINIMALISTA - Con más detalles
const DashboardMinimal = () => {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalVentas: 0,
    totalClientes: 0,
    stockTotal: 0,
  });
  const [recentData, setRecentData] = useState({
    ventas: [],
    productos: [],
  });
  const [topProductos, setTopProductos] = useState([]);
  const [productoImagenes, setProductoImagenes] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [ventasPendientes, setVentasPendientes] = useState([]);
  const [ventasCompletadas, setVentasCompletadas] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productos, ventas, clientes, stocks, topProductosData, imagenesData, stockBajoData] = await Promise.all([
        getProductos(),
        getVentas(),
        getClientes(),
        getStocks(),
        getTopProductos(3, "unidades", {}),
        getProductoImagenes(),
        getStockBajo(10, 20), // Stock bajo con umbral de 10 unidades
      ]);

      // Filtrar ventas pendientes de pago
      const pendientes = ventas.filter(v => 
        String(v.estado_pago || '').toLowerCase() === 'pendiente' ||
        (String(v.estado || '').toLowerCase() === 'pendiente' && String(v.estado_pago || '').toLowerCase() !== 'pagado')
      );
      
      // Solo contar ventas confirmadas y pagadas para el total
      const ventasConfirmadas = ventas.filter(v => 
        String(v.estado_pago || '').toLowerCase() === 'pagado' &&
        String(v.estado || '').toLowerCase() === 'completado'
      );
      
      const ventasTotal = ventasConfirmadas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
      const stockTotal = stocks.reduce((sum, s) => sum + (s.cantidad || 0), 0);
      
      // Contar ventas completadas
      const completadas = ventasConfirmadas.length;

      setStats({
        totalProductos: productos.length,
        totalVentas: ventasTotal,
        totalClientes: clientes.length,
        stockTotal: stockTotal,
      });

      setRecentData({
        ventas: ventas.slice(0, 5),
        productos: productos.slice(0, 3),
      });

      setTopProductos(topProductosData || []);
      setProductoImagenes(imagenesData || []);
      setStocks(stocks);
      setStockBajo(stockBajoData || []);
      setVentasPendientes(pendientes);
      setVentasCompletadas(completadas);
      setTotalVentas(ventas.length);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener la imagen de un producto
  const getProductoImagen = (productoId) => {
    const imagenes = productoImagenes.filter(img => {
      const prodId = img.producto || img.producto_id || img.productoId;
      return String(prodId) === String(productoId);
    });
    if (imagenes.length > 0) {
      const url = imagenes[0].url || imagenes[0].imagen_url || imagenes[0].imagen;
      if (url) {
        // Si es una URL relativa, agregar el base URL
        if (url.startsWith('/media/') || url.startsWith('media/')) {
          return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        return url;
      }
    }
    return null;
  };

  // Función para obtener el stock total de un producto
  const getStockProducto = (productoId) => {
    // Necesitamos obtener el stock a través de producto_variante
    // Por ahora, retornamos 0 si no tenemos los datos de variantes
    return 0; // TODO: calcular stock real por producto
  };

  if (loading) {
    return (
      <LayoutMinimal>
        <div className="flex h-full items-center justify-center bg-white">
          <div className="text-xl font-light text-gray-600">Cargando...</div>
        </div>
      </LayoutMinimal>
    );
  }

  return (
    <LayoutMinimal>
        {/* Header minimalista */}
        <header className="h-20 flex items-center justify-between pl-16 pr-14 sm:pr-18 lg:pr-22 xl:pr-26 2xl:pr-32 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-3xl font-light tracking-wide">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-6 py-2 border border-gray-300 focus-accent transition w-80"
            />
            <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
              A
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-[1600px] mx-auto pl-12 pr-14 sm:pr-18 lg:pr-22 xl:pr-26 2xl:pr-32 py-12">
            
            {/* Métricas principales - Distribución HORIZONTAL */}
            <div className="grid grid-cols-4 gap-0 bg-white border border-gray-200 mb-12">
              <div className="p-8 border-r border-gray-200">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Productos
                </div>
                <div className="text-5xl font-bold text-black mb-2">
                  {stats.totalProductos}
                </div>
                <div className="text-xs text-gray-500">Total registrados</div>
              </div>

              <div className="p-8 border-r border-gray-200">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Ventas
                </div>
                <div className="text-5xl font-bold text-black mb-2">
                  Bs. {stats.totalVentas.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Monto total</div>
              </div>

              <div className="p-8 border-r border-gray-200">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Clientes
                </div>
                <div className="text-5xl font-bold text-black mb-2">
                  {stats.totalClientes}
                </div>
                <div className="text-xs text-gray-500">Total registrados</div>
              </div>

              <div className="p-8">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Stock
                </div>
                <div className="text-5xl font-bold text-black mb-2">
                  {stats.stockTotal}
                </div>
                <div className="text-xs text-gray-500">Unidades totales</div>
              </div>
            </div>

            {/* Grid de 2 columnas */}
            <div className="grid grid-cols-2 gap-8">
              
              {/* Acciones */}
              <div className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold uppercase tracking-wide">Acciones Rápidas</h3>
                </div>
                <div className="p-6 space-y-3">
                  <button 
                    onClick={() => navigate('/pos')}
                    className="w-full px-6 py-4 btn-accent transition text-left font-medium"
                  >
                    + Nueva Venta
                  </button>
                  <button 
                    onClick={() => navigate('/productos')}
                    className="w-full px-6 py-4 btn-accent transition text-left font-medium"
                  >
                    + Nuevo Producto
                  </button>
                  <button 
                    onClick={() => navigate('/clientes')}
                    className="w-full px-6 py-4 btn-accent-outline transition text-left font-medium"
                  >
                    + Nuevo Cliente
                  </button>
                  {mode === 'admin' && (
                    <button 
                      onClick={() => navigate('/reportes')}
                      className="w-full px-6 py-4 btn-accent-outline transition text-left font-medium"
                    >
                      Ver Reportes
                    </button>
                  )}
                </div>
              </div>

              {/* Top Productos */}
              <div className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold uppercase tracking-wide">Top Productos</h3>
                </div>
                <div className="p-6 space-y-4">
                  {topProductos.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No hay datos disponibles</div>
                  ) : (
                    topProductos.map((item, index) => {
                      const productoId = item.producto_variante__producto__id || item.producto_id;
                      const nombre = item.producto_variante__producto__nombre || item.producto_nombre || 'Sin nombre';
                      const ventas = item.valor || 0;
                      const imagenUrl = getProductoImagen(productoId);
                      // Calcular stock total del producto (suma de todas las sucursales)
                      // Por ahora mostramos 0, se puede mejorar obteniendo variantes y stocks
                      const stockTotal = getStockProducto(productoId);
                      
                      const bgColors = ['bg-black', 'bg-gray-700', 'bg-gray-400'];
                      const bgColor = bgColors[index] || 'bg-gray-300';
                      
                      return (
                        <div key={productoId || index} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-center gap-4">
                            {imagenUrl ? (
                              <img 
                                src={imagenUrl} 
                                alt={nombre}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentElement.querySelector('.fallback-number');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 ${bgColor} text-white flex items-center justify-center font-bold text-lg ${imagenUrl ? 'hidden fallback-number' : ''}`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold">{nombre}</div>
                              <div className="text-sm text-gray-500">{Math.round(ventas)} {item.metric === 'monto' ? 'Bs.' : 'ventas'}</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">Stock: {stockTotal}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Estado de Ventas */}
              <div className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold uppercase tracking-wide">Estado de Ventas</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <span className="font-medium">Pendientes</span>
                    <span className="text-3xl font-bold">{ventasPendientes.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <span className="font-medium">Completadas</span>
                    <span className="text-3xl font-bold">{ventasCompletadas}</span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <span className="font-medium">Total</span>
                    <span className="text-3xl font-bold">{totalVentas}</span>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              <div className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold uppercase tracking-wide">Alertas</h3>
                </div>
                <div className="p-6 space-y-4">
                  {stockBajo.length > 0 && (
                    <div className="p-4 badge-accent">
                      <div className="font-semibold mb-1">Stock Crítico</div>
                      <div className="text-sm opacity-80">
                        {stockBajo.length} {stockBajo.length === 1 ? 'producto necesita' : 'productos necesitan'} reabastecimiento
                      </div>
                    </div>
                  )}
                  {ventasPendientes.length > 0 && (
                    <div className="p-4 badge-accent-outline">
                      <div className="font-semibold mb-1">Pagos Pendientes</div>
                      <div className="text-sm">
                        {ventasPendientes.length} {ventasPendientes.length === 1 ? 'factura por cobrar' : 'facturas por cobrar'}
                      </div>
                    </div>
                  )}
                  {stockBajo.length === 0 && ventasPendientes.length === 0 && (
                    <div className="p-4 border border-gray-300">
                      <div className="font-semibold mb-1">Sistema OK</div>
                      <div className="text-sm text-gray-600">Todo funcionando correctamente</div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Ventas Recientes - Datos reales del backend */}
            {recentData.ventas.length > 0 && (
              <div className="bg-white border border-gray-200 mt-8">
                <div className="border-b border-gray-200 px-8 py-6">
                  <h3 className="text-xl font-bold uppercase tracking-wide">Ventas Recientes</h3>
                </div>
                <div className="p-8">
                  <table className="w-full">
                    <thead className="border-b-2 border-black">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentData.ventas
                        .filter((venta) => {
                          if (!search) return true;
                          const q = search.toLowerCase().trim();
                          const id = String(venta.id).toLowerCase();
                          const fecha = new Date(venta.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }).toLowerCase();
                          const cliente = String(venta.cliente || '').toLowerCase();
                          const total = String(venta.total || '').toLowerCase();
                          return id.includes(q) || fecha.includes(q) || cliente.includes(q) || total.includes(q);
                        })
                        .map((venta, index) => (
                        <tr key={venta.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 py-4 text-sm font-bold">#{venta.id}</td>
                          <td className="px-4 py-4 text-sm">
                            {new Date(venta.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-4 text-sm">{venta.cliente || 'Cliente N/A'}</td>
                          <td className="px-4 py-4 text-right font-bold text-lg">
                            Bs. {parseFloat(venta.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Información adicional del sistema */}
            <div className="grid grid-cols-3 gap-0 bg-white border border-gray-200 mt-8">
              <div className="p-6 border-r border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Categorías
                </div>
                <div className="text-2xl font-bold">
                  {new Set(recentData.productos.map(p => p.categoria)).size}
                </div>
                <div className="text-xs text-gray-500 mt-1">Diferentes</div>
              </div>
              <div className="p-6 border-r border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Transacciones Hoy
                </div>
                <div className="text-2xl font-bold">
                  {recentData.ventas.filter(v => {
                    const hoy = new Date().toDateString();
                    const fechaVenta = new Date(v.fecha).toDateString();
                    return hoy === fechaVenta;
                  }).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Del día actual</div>
              </div>
              <div className="p-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Valor Promedio
                </div>
                <div className="text-2xl font-bold">
                  Bs. {recentData.ventas.length > 0 
                    ? (recentData.ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0) / recentData.ventas.length).toFixed(2)
                    : '0.00'
                  }
                </div>
                <div className="text-xs text-gray-500 mt-1">Por venta</div>
              </div>
            </div>

          </div>
        </main>
      </LayoutMinimal>
    );
};

export default DashboardMinimal;

