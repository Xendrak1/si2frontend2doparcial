import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import StatsCard from "../components/ui/StatsCard";
import Card from "../components/ui/Card";
import Loading from "../components/ui/Loading";
import { getProductos, getVentas, getClientes, getStocks } from "../api";

const DashboardNew = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalVentas: 0,
    totalClientes: 0,
    totalStock: 0,
  });
  const [recentVentas, setRecentVentas] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productos, ventas, clientes, stocks] = await Promise.all([
        getProductos(),
        getVentas(),
        getClientes(),
        getStocks(),
      ]);

      setStats({
        totalProductos: productos.length,
        totalVentas: ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0),
        totalClientes: clientes.length,
        totalStock: stocks.reduce((sum, s) => sum + (s.cantidad || 0), 0),
      });

      // Últimas 5 ventas
      setRecentVentas(ventas.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
      <div className="space-y-12 animate-fade-in">
        {/* Header Mejorado */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100 shadow-sm">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Bienvenido al sistema de gestión de boutique
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-md hover:shadow-lg border border-indigo-200 flex items-center gap-2 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar Reporte
            </button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatsCard
            title="Total Productos"
            value={stats.totalProductos}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
            color="indigo"
            trend="up"
            trendValue="12%"
          />

          <StatsCard
            title="Total Ventas"
            value={`Bs. ${stats.totalVentas.toFixed(2)}`}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="green"
            trend="up"
            trendValue="8%"
          />

          <StatsCard
            title="Total Clientes"
            value={stats.totalClientes}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            color="blue"
            trend="up"
            trendValue="5%"
          />

          <StatsCard
            title="Stock Total"
            value={stats.totalStock}
            icon={
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            }
            color="purple"
            trend="down"
            trendValue="3%"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sales */}
          <Card title="Ventas Recientes">
            <div className="space-y-4">
              {recentVentas.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay ventas recientes
                </p>
              ) : (
                recentVentas.map((venta) => (
                  <div
                    key={venta.id}
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Venta #{venta.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(venta.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        Bs. {parseFloat(venta.total || 0).toFixed(2)}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          venta.estado === "completado"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {venta.estado}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions - Mejorado */}
          <Card title="Acciones Rápidas">
            <div className="grid grid-cols-2 gap-6">
              <button className="group p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all duration-300 text-left border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-base">Nueva Venta</p>
                <p className="text-xs text-gray-600 mt-1">Registrar venta</p>
              </button>

              <button className="group p-8 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 text-left border-2 border-green-200 hover:border-green-400 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-base">Nuevo Producto</p>
                <p className="text-xs text-gray-600 mt-1">Agregar producto</p>
              </button>

              <button className="group p-8 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 text-left border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-base">Nuevo Cliente</p>
                <p className="text-xs text-gray-600 mt-1">Registrar cliente</p>
              </button>

              <button className="group p-8 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 text-left border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-base">Ver Reportes</p>
                <p className="text-xs text-gray-600 mt-1">Análisis y reportes</p>
              </button>
            </div>
          </Card>
        </div>

        {/* Additional Info - Mejorado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card title="Top Productos">
            <div className="space-y-4">
              {[
                { nombre: "Vestido Elegante", ventas: 24, stock: 12, color: "from-pink-500 to-pink-600" },
                { nombre: "Blusa Casual", ventas: 18, stock: 24, color: "from-purple-500 to-purple-600" },
                { nombre: "Pantalón Formal", ventas: 15, stock: 8, color: "from-blue-500 to-blue-600" },
              ].map((producto, index) => (
                <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-indigo-300">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${producto.color} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{producto.nombre}</p>
                      <p className="text-xs text-gray-500">{producto.ventas} ventas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      producto.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      Stock: {producto.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Estado de Pedidos">
            <div className="space-y-5">
              <div className="flex items-center justify-between p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pendientes</p>
                    <p className="text-xs text-gray-500">En espera</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-700">12</span>
              </div>

              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">En proceso</p>
                    <p className="text-xs text-gray-500">Preparando</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-700">8</span>
              </div>

              <div className="flex items-center justify-between p-6 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Completados</p>
                    <p className="text-xs text-gray-500">Este mes</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-700">45</span>
              </div>
            </div>
          </Card>

          <Card title="Alertas">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-2 border-red-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-900 text-sm">Stock Crítico</p>
                  <p className="text-xs text-red-700 mt-1">3 productos con menos de 5 unidades</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 text-sm">Pagos Pendientes</p>
                  <p className="text-xs text-yellow-700 mt-1">5 facturas por cobrar</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-900 text-sm">Sistema OK</p>
                  <p className="text-xs text-green-700 mt-1">Todo funcionando correctamente</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardNew;

