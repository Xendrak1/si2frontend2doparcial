import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Loading from "../components/ui/Loading";
import Button from "../components/ui/Button";
import { getProductos, getVentas, getClientes, getStocks } from "../api";

const ReportesNew = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("ventas");
  const [timeRange, setTimeRange] = useState("mes");
  const [reportData, setReportData] = useState({
    ventas: { total: 0, count: 0, promedio: 0 },
    productos: { total: 0, stock: 0, categorias: 0 },
    clientes: { total: 0, activos: 0, nuevos: 0 },
    resumen: [],
  });

  useEffect(() => {
    fetchReportData();
  }, [reportType, timeRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [productos, ventas, clientes, stocks] = await Promise.all([
        getProductos(),
        getVentas(),
        getClientes(),
        getStocks(),
      ]);

      // Procesar datos para reportes
      const ventasTotal = ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
      const stockTotal = stocks.reduce((sum, s) => sum + (s.cantidad || 0), 0);

      setReportData({
        ventas: {
          total: ventasTotal,
          count: ventas.length,
          promedio: ventas.length > 0 ? ventasTotal / ventas.length : 0,
        },
        productos: {
          total: productos.length,
          stock: stockTotal,
          categorias: new Set(productos.map(p => p.categoria)).size,
        },
        clientes: {
          total: clientes.length,
          activos: clientes.filter(c => c.activo).length,
          nuevos: clientes.filter(c => {
            const fecha = new Date(c.fecha_registro);
            const hoy = new Date();
            const diferencia = (hoy - fecha) / (1000 * 60 * 60 * 24);
            return diferencia <= 30;
          }).length,
        },
        resumen: ventas.slice(0, 10),
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format) => {
    alert(`Exportando reporte en formato ${format}...`);
  };

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header con filtros */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reportes y Análisis
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Visualiza estadísticas detalladas de tu negocio
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="ventas">Ventas</option>
                <option value="productos">Productos</option>
                <option value="clientes">Clientes</option>
                <option value="inventario">Inventario</option>
              </select>
            </div>

            <div className="w-32">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
                <option value="año">Año</option>
              </select>
            </div>

            <Button
              onClick={() => exportReport("PDF")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF
            </Button>

            <Button
              onClick={() => exportReport("Excel")}
              variant="primary"
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Ventas */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase">Total Ventas</p>
                <p className="text-4xl font-bold mt-2">Bs. {reportData.ventas.total.toFixed(2)}</p>
                <p className="text-green-100 text-sm mt-2">
                  {reportData.ventas.count} transacciones
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card Productos */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase">Productos</p>
                <p className="text-4xl font-bold mt-2">{reportData.productos.total}</p>
                <p className="text-blue-100 text-sm mt-2">
                  Stock: {reportData.productos.stock} unidades
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card Clientes */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase">Clientes</p>
                <p className="text-4xl font-bold mt-2">{reportData.clientes.total}</p>
                <p className="text-purple-100 text-sm mt-2">
                  {reportData.clientes.nuevos} nuevos este mes
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card Promedio */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase">Ticket Promedio</p>
                <p className="text-4xl font-bold mt-2">
                  Bs. {reportData.ventas.promedio.toFixed(2)}
                </p>
                <p className="text-orange-100 text-sm mt-2">
                  por transacción
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos y Tablas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Ventas Mensuales */}
          <Card title="Ventas del Mes">
            <div className="space-y-4">
              {[
                { mes: "Enero", ventas: 12500, color: "bg-blue-500", porcentaje: 85 },
                { mes: "Febrero", ventas: 15200, color: "bg-green-500", porcentaje: 95 },
                { mes: "Marzo", ventas: 18900, color: "bg-purple-500", porcentaje: 100 },
                { mes: "Abril", ventas: 14300, color: "bg-orange-500", porcentaje: 88 },
                { mes: "Mayo", ventas: 16700, color: "bg-pink-500", porcentaje: 92 },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.mes}</span>
                    <span className="font-semibold text-gray-900">Bs. {item.ventas.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${item.porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Productos */}
          <Card title="Top 5 Productos">
            <div className="space-y-3">
              {[
                { nombre: "Vestido Elegante", ventas: 45, ingresos: 4500, tendencia: "up" },
                { nombre: "Blusa Casual", ventas: 38, ingresos: 3800, tendencia: "up" },
                { nombre: "Pantalón Formal", ventas: 32, ingresos: 3200, tendencia: "down" },
                { nombre: "Zapatos Premium", ventas: 28, ingresos: 5600, tendencia: "up" },
                { nombre: "Accesorios Varios", ventas: 25, ingresos: 2500, tendencia: "up" },
              ].map((producto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">{producto.ventas} ventas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      Bs. {producto.ingresos.toLocaleString()}
                    </p>
                    <span
                      className={`inline-flex items-center text-xs font-medium ${
                        producto.tendencia === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {producto.tendencia === "up" ? "↑" : "↓"} Trending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Distribución por Categoría */}
          <Card title="Ventas por Categoría">
            <div className="space-y-4">
              {[
                { categoria: "Vestidos", porcentaje: 35, ventas: 6650, color: "from-pink-500 to-pink-600" },
                { categoria: "Blusas", porcentaje: 25, ventas: 4750, color: "from-purple-500 to-purple-600" },
                { categoria: "Pantalones", porcentaje: 20, ventas: 3800, color: "from-blue-500 to-blue-600" },
                { categoria: "Accesorios", porcentaje: 15, ventas: 2850, color: "from-green-500 to-green-600" },
                { categoria: "Otros", porcentaje: 5, ventas: 950, color: "from-gray-400 to-gray-500" },
              ].map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${cat.color}`}></div>
                      <span className="font-medium text-gray-700">{cat.categoria}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{cat.porcentaje}%</span>
                      <span className="text-sm text-gray-500 ml-2">
                        (Bs. {cat.ventas.toLocaleString()})
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${cat.color} h-full rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${cat.porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Métricas Adicionales */}
          <Card title="Métricas de Rendimiento">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-medium">Crecimiento</span>
                </div>
                <p className="text-3xl font-bold text-indigo-700">+18%</p>
                <p className="text-xs text-indigo-600 mt-1">vs mes anterior</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Tasa Conv.</span>
                </div>
                <p className="text-3xl font-bold text-green-700">68%</p>
                <p className="text-xs text-green-600 mt-1">clientes activos</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Rotación</span>
                </div>
                <p className="text-3xl font-bold text-orange-700">12d</p>
                <p className="text-xs text-orange-600 mt-1">promedio stock</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-sm font-medium">Satisfacción</span>
                </div>
                <p className="text-3xl font-bold text-purple-700">4.8</p>
                <p className="text-xs text-purple-600 mt-1">de 5 estrellas</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Alertas y Recomendaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Alertas del Sistema">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-red-800">Stock crítico</p>
                  <p className="text-sm text-red-600">3 productos con menos de 5 unidades</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800">Pagos pendientes</p>
                  <p className="text-sm text-yellow-600">5 facturas por cobrar (Bs. 12,500)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-blue-800">Actualización disponible</p>
                  <p className="text-sm text-blue-600">Nueva versión del sistema v1.1.0</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Recomendaciones">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-900">Aumentar stock de productos populares</p>
                  <p className="text-sm text-gray-600">Los productos top tienen alta rotación</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-900">Promoción de productos con bajo movimiento</p>
                  <p className="text-sm text-gray-600">12 productos sin ventas en 30 días</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-900">Campaña de fidelización</p>
                  <p className="text-sm text-gray-600">28% de clientes inactivos recuperables</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ReportesNew;

