import { useState, useEffect } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getVentas, getVentaDetalles } from "../api";
import { useAuth } from "../context/AuthContext";

// Mis Pedidos - Para clientes
const MisPedidos = () => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [detalles, setDetalles] = useState({}); // { ventaId: [detalles] }
  const [loading, setLoading] = useState(true);
  const [ventaExpandida, setVentaExpandida] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ventasData = await getVentas();
      // Ordenar por fecha descendente
      const ventasOrdenadas = [...(ventasData || [])].sort((a, b) => {
        const fechaA = new Date(a.fecha || 0);
        const fechaB = new Date(b.fecha || 0);
        return fechaB.getTime() - fechaA.getTime();
      });
      setVentas(ventasOrdenadas);
      
      // Cargar detalles para todas las ventas
      const detallesMap = {};
      try {
        const todosDetalles = await getVentaDetalles();
        for (const venta of ventasOrdenadas) {
          detallesMap[venta.id] = todosDetalles.filter(d => d.venta === venta.id);
        }
      } catch (e) {
        console.error("Error cargando detalles:", e);
      }
      setDetalles(detallesMap);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetalles = (ventaId) => {
    setVentaExpandida(ventaId === ventaExpandida ? null : ventaId);
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
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-12 border-b border-gray-200 bg-white">
        <h2 className="text-3xl font-light tracking-wide">Mis Pedidos</h2>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-12 max-w-[1600px] mx-auto">
          
          {ventas.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <p className="text-gray-600 text-lg">No tienes pedidos registrados aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ventas.map((venta) => {
                const ventaDetalles = detalles[venta.id] || [];
                const isExpanded = ventaExpandida === venta.id;
                
                return (
                  <div key={venta.id} className="bg-white border border-gray-200">
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => toggleDetalles(venta.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm font-medium text-gray-500">Pedido #{venta.id}</span>
                            <span className="text-sm text-gray-600">
                              {new Date(venta.fecha).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              venta.estado?.toLowerCase() === 'completado'
                                ? 'bg-green-100 text-green-800'
                                : venta.estado?.toLowerCase() === 'pendiente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {venta.estado || 'N/A'}
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              venta.estado_pago?.toLowerCase() === 'pagado'
                                ? 'bg-green-100 text-green-800'
                                : venta.estado_pago?.toLowerCase() === 'pendiente'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {venta.estado_pago || 'N/A'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold">Bs. {parseFloat(venta.total || 0).toFixed(2)}</div>
                        </div>
                        <div className="text-gray-400">
                          {isExpanded ? '▼' : '▶'}
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && ventaDetalles.length > 0 && (
                      <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <h4 className="font-semibold mb-4">Productos:</h4>
                        <div className="space-y-2">
                          {ventaDetalles.map((detalle) => (
                            <div key={detalle.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                              <div>
                                <span className="font-medium">
                                  {detalle.producto_variante?.producto?.nombre || 
                                   detalle.producto_variante?.nombre || 
                                   `Producto #${detalle.producto_variante || detalle.producto || 'N/A'}`}
                                </span>
                                {detalle.producto_variante?.talla && (
                                  <span className="text-sm text-gray-600 ml-2">Talla: {detalle.producto_variante.talla}</span>
                                )}
                                {detalle.producto_variante?.color && (
                                  <span className="text-sm text-gray-600 ml-2">Color: {detalle.producto_variante.color}</span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Cantidad: {detalle.cantidad}</div>
                                <div className="font-semibold">Bs. {parseFloat(detalle.precio || 0).toFixed(2)} c/u</div>
                                <div className="text-sm text-gray-500">Subtotal: Bs. {parseFloat((detalle.precio || 0) * (detalle.cantidad || 0)).toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </LayoutMinimal>
  );
};

export default MisPedidos;

