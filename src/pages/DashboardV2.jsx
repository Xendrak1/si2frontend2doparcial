import { useState, useEffect } from "react";
import LayoutNew from "../components/layout/LayoutNew";
import Card from "../components/ui/Card";
import Loading from "../components/ui/Loading";
import MetricCard from "../components/dashboard/MetricCard";
import QuickAction from "../components/dashboard/QuickAction";
import RecentSaleItem from "../components/dashboard/RecentSaleItem";
import TopProductItem from "../components/dashboard/TopProductItem";
import OrderStatusCard from "../components/dashboard/OrderStatusCard";
import AlertCard from "../components/dashboard/AlertCard";
import { getProductos, getVentas, getClientes, getStocks } from "../api";

// Dashboard principal con diseño minimalista y moderno
const DashboardV2 = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalVentas: 0,
    totalClientes: 0,
    stockTotal: 0,
  });
  const [recentVentas, setRecentVentas] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productos, ventas, clientes, stocks] = await Promise.all([
        getProductos(),
        getVentas(),
        getClientes(),
        getStocks(),
      ]);

      const ventasTotal = ventas.reduce(
        (sum, venta) => sum + parseFloat(venta.total || 0),
        0
      );
      const stockTotal = stocks.reduce(
        (sum, stock) => sum + (stock.cantidad || 0),
        0
      );

      setStats({
        totalProductos: productos.length,
        totalVentas: ventasTotal,
        totalClientes: clientes.length,
        stockTotal: stockTotal,
      });

      setRecentVentas(ventas.slice(0, 5));
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LayoutNew>
        <Loading fullScreen />
      </LayoutNew>
    );
  }

  return (
    <LayoutNew>
      <div className="space-y-8">
        
        {/* Encabezado del dashboard */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Resumen general de tu boutique
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-2 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
            <button className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar Reporte
            </button>
          </div>
        </div>

        {/* Tarjetas de métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Productos"
            value={stats.totalProductos}
            trend="up"
            trendValue="12%"
            color="primary"
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />

          <MetricCard
            title="Total Ventas"
            value={`Bs. ${stats.totalVentas.toFixed(2)}`}
            trend="up"
            trendValue="8%"
            color="green"
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <MetricCard
            title="Total Clientes"
            value={stats.totalClientes}
            trend="up"
            trendValue="5%"
            color="blue"
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />

          <MetricCard
            title="Stock Total"
            value={stats.stockTotal}
            trend="down"
            trendValue="3%"
            color="orange"
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            }
          />
        </div>

        {/* Sección de contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna izquierda - 2/3 del ancho */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ventas recientes */}
            <Card title="Ventas Recientes">
              <div className="space-y-3">
                {recentVentas.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No hay ventas recientes
                  </p>
                ) : (
                  recentVentas.map((venta) => (
                    <RecentSaleItem
                      key={venta.id}
                      id={venta.id}
                      date={venta.fecha}
                      total={venta.total}
                      status={venta.estado || "completado"}
                    />
                  ))
                )}
              </div>
            </Card>

            {/* Top productos */}
            <Card title="Productos Más Vendidos">
              <div className="space-y-3">
                <TopProductItem
                  rank={1}
                  name="Vestido Elegante"
                  sales={24}
                  stock={12}
                />
                <TopProductItem
                  rank={2}
                  name="Blusa Casual"
                  sales={18}
                  stock={24}
                />
                <TopProductItem
                  rank={3}
                  name="Pantalón Formal"
                  sales={15}
                  stock={8}
                />
              </div>
            </Card>

          </div>

          {/* Columna derecha - 1/3 del ancho */}
          <div className="space-y-6">
            
            {/* Acciones rápidas */}
            <Card title="Acciones Rápidas">
              <div className="grid grid-cols-1 gap-3">
                <QuickAction
                  title="Nueva Venta"
                  description="Registrar venta"
                  color="primary"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                />
                <QuickAction
                  title="Nuevo Producto"
                  description="Agregar al inventario"
                  color="green"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  }
                />
                <QuickAction
                  title="Nuevo Cliente"
                  description="Registrar cliente"
                  color="blue"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <QuickAction
                  title="Ver Reportes"
                  description="Análisis y estadísticas"
                  color="purple"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
              </div>
            </Card>

            {/* Estado de pedidos */}
            <Card title="Estado de Pedidos">
              <div className="space-y-3">
                <OrderStatusCard
                  title="Pendientes"
                  description="En espera"
                  count={12}
                  color="yellow"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <OrderStatusCard
                  title="En Proceso"
                  description="Preparando"
                  count={8}
                  color="blue"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                />
                <OrderStatusCard
                  title="Completados"
                  description="Este mes"
                  count={45}
                  color="green"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                />
              </div>
            </Card>

            {/* Alertas */}
            <Card title="Alertas del Sistema">
              <div className="space-y-3">
                <AlertCard
                  type="error"
                  title="Stock Crítico"
                  description="3 productos necesitan reabastecimiento"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                />
                <AlertCard
                  type="warning"
                  title="Pagos Pendientes"
                  description="5 facturas pendientes de cobro"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <AlertCard
                  type="success"
                  title="Sistema OK"
                  description="Funcionando correctamente"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </LayoutNew>
  );
};

export default DashboardV2;

