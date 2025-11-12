import { useState, useEffect } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getVentas, getClientes, confirmarPagoVenta } from "../api";

// Ventas - Blanco y Negro
const VentasMinimal = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ventasData, clientesData] = await Promise.all([
        getVentas(),
        getClientes(),
      ]);
      // Ordenar por fecha y hora descendente (más reciente primero) y luego por ID descendente
      const ventasOrdenadas = [...(ventasData || [])].sort((a, b) => {
        const fechaA = new Date(a.fecha || 0);
        const fechaB = new Date(b.fecha || 0);
        // Ordenar por fecha completa (incluye hora) descendente
        const diffTiempo = fechaB.getTime() - fechaA.getTime();
        if (diffTiempo !== 0) {
          return diffTiempo;
        }
        // Si tienen la misma fecha/hora, ordenar por ID descendente
        return (b.id || 0) - (a.id || 0);
      });
      setVentas(ventasOrdenadas);
      setClientes(clientesData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-light tracking-wide">Ventas</h2>
          <button onClick={() => window.location.assign('/pos')} className="px-6 py-3 btn-accent transition font-medium">
            + Nueva Venta
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-12 max-w-[1600px] mx-auto">
            
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-0 bg-white border border-gray-200 mb-8">
              {(() => {
                // Solo contar ventas confirmadas y pagadas
                const ventasConfirmadas = ventas.filter(v => 
                  String(v.estado_pago || '').toLowerCase() === 'pagado' &&
                  String(v.estado || '').toLowerCase() === 'completado'
                );
                const totalConfirmadas = ventasConfirmadas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
                const cantidadConfirmadas = ventasConfirmadas.length;
                const promedio = cantidadConfirmadas > 0 ? totalConfirmadas / cantidadConfirmadas : 0;
                
                return (
                  <>
                    <div className="p-6 border-r border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                        Total Ventas
                      </div>
                      <div className="text-3xl font-bold">
                        Bs. {totalConfirmadas.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-6 border-r border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                        Cantidad
                      </div>
                      <div className="text-3xl font-bold">{cantidadConfirmadas}</div>
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                        Promedio
                      </div>
                      <div className="text-3xl font-bold">
                        Bs. {promedio.toFixed(2)}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Tabla */}
            <div className="bg-white border border-gray-200">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No hay ventas registradas
                      </td>
                    </tr>
                  ) : (
                    ventas.map((venta) => (
                      <tr key={venta.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium">{venta.id}</td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(venta.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })} {new Date(venta.fecha).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 font-semibold">{venta.cliente_nombre || venta.cliente || 'N/A'}</td>
                        <td className="px-6 py-4 font-bold">Bs. {parseFloat(venta.total || 0).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold ${
                            venta.estado?.toLowerCase() === 'completado'
                              ? 'badge-accent'
                              : 'badge-accent-outline'
                          }`}>
                            {venta.estado || 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {String(venta.estado_pago || '').toLowerCase() === 'pendiente' ? (
                            <button
                              className="px-3 py-1 btn-accent text-xs"
                              onClick={async () => {
                                try {
                                  await confirmarPagoVenta(venta.id);
                                  fetchData(); // Recargar datos para actualizar totales
                                } catch (error) {
                                  console.error("Error confirmando pago:", error);
                                  alert("Error al confirmar el pago. Intenta nuevamente.");
                                }
                              }}
                            >
                              Confirmar pago
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500">OK</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </LayoutMinimal>
  );
};

export default VentasMinimal;

