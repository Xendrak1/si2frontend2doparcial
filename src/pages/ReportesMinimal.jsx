import { useState, useEffect } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import {
  getReporteResumen,
  getVentasPorDia,
  getTopProductos,
  getMixPago,
  getStockBajo,
  exportReportePDF,
  exportReporteExcel,
} from "../api";

// Reportes - Blanco y Negro
const ReportesMinimal = () => {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [serieVentas, setSerieVentas] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [mixPago, setMixPago] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [res, serie, top, mix, bajo] = await Promise.all([
        getReporteResumen(),
        getVentasPorDia(30),
        getTopProductos(5, "unidades"),
        getMixPago(),
        getStockBajo(5, 10),
      ]);
      setResumen(res);
      setSerieVentas(serie);
      setTopProductos(top);
      setMixPago(mix);
      setStockBajo(bajo);
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
          <h2 className="text-3xl font-light tracking-wide">Reportes y Análisis</h2>
          <div className="flex gap-3">
            <button
              className="px-6 py-3 btn-accent-outline transition font-medium"
              onClick={async () => {
                try {
                  const res = await exportReportePDF();
                  const ctype = (res.headers && res.headers["content-type"]) || "";
                  const blob = new Blob([res.data], { type: ctype || "application/octet-stream" });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  const disp = res.headers && res.headers["content-disposition"];
                  const match = disp && disp.match(/filename=\"?([^\";]+)\"?/i);
                  let fallback = "reporte_resumen.pdf";
                  if (ctype.includes("text/plain")) fallback = "reporte_resumen.txt";
                  link.download = match ? match[1] : fallback;
                  link.click();
                  window.URL.revokeObjectURL(url);
                } catch {}
              }}
            >
              Exportar PDF
            </button>
            <button
              className="px-6 py-3 btn-accent transition font-medium"
              onClick={async () => {
                try {
                  const res = await exportReporteExcel();
                  const ctype = (res.headers && res.headers["content-type"]) || "";
                  const blob = new Blob([res.data], { type: ctype || "application/octet-stream" });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  const disp = res.headers && res.headers["content-disposition"];
                  const match = disp && disp.match(/filename=\"?([^\";]+)\"?/i);
                  let fallback = "reporte_resumen.xlsx";
                  if (ctype.includes("text/csv")) fallback = "reporte_resumen.csv";
                  link.download = match ? match[1] : fallback;
                  link.click();
                  window.URL.revokeObjectURL(url);
                } catch {}
              }}
            >
              Exportar Excel
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-12 max-w-[1600px] mx-auto space-y-8">
            
            {/* Métricas Principales */}
            <div className="grid grid-cols-3 gap-0 bg-white border border-gray-200">
              <div className="p-8 border-r border-gray-200">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Ventas Totales
                </div>
                <div className="text-5xl font-bold mb-2">
                  Bs. {(resumen?.ventas?.total || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {resumen?.ventas?.count || 0} transacciones · Ticket promedio Bs.{" "}
                  {(resumen?.ventas?.promedio || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-8 border-r border-gray-200">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Últimos 30 días
                </div>
                <div className="text-5xl font-bold mb-2">
                  Bs. {(resumen?.ventas?.ultimos_30?.total || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {resumen?.ventas?.ultimos_30?.count || 0} ventas
                </div>
              </div>
              <div className="p-8">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Variantes y Productos
                </div>
                <div className="text-5xl font-bold mb-2">{resumen?.conteos?.variantes || 0}</div>
                <div className="text-sm text-gray-500">{resumen?.conteos?.productos || 0} productos</div>
              </div>
            </div>

            {/* Ventas por Día (últimos 30) */}
            <div className="bg-white border border-gray-200">
              <div className="border-b border-gray-200 px-8 py-6">
                <h3 className="text-xl font-bold uppercase tracking-wide">Ventas por Día</h3>
              </div>
              <div className="p-8 grid grid-cols-2 gap-4">
                {serieVentas.map((d) => (
                  <div key={d.dia} className="flex items-center justify-between border-b border-gray-100 py-2">
                    <span className="text-sm font-medium">{new Date(d.dia).toLocaleDateString()}</span>
                    <span className="font-bold">Bs. {(d.total || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid 2 columnas */}
            <div className="grid grid-cols-2 gap-8">
              
              {/* Top Productos */}
              <div className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold uppercase tracking-wide">Top 5 Productos</h3>
                </div>
                <div className="p-6 space-y-4">
                  {topProductos.map((p, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="font-semibold">{p.producto_variante__producto__nombre}</span>
                      </div>
                      <span className="font-bold text-lg">{p.valor} uds.</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mix de Pago y Stock Bajo */}
              <div className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold uppercase tracking-wide">Métodos de Pago</h3>
                </div>
                <div className="p-6 space-y-4">
                  {mixPago.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="font-medium capitalize">{m.tipo_pago}</span>
                      <span className="font-bold">Bs. {(m.total || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold uppercase tracking-wide">Stock Bajo</h3>
                </div>
                <div className="p-6 space-y-3">
                  {stockBajo.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">{s.producto_variante__producto__nombre}</span>
                      <span className="font-bold">{s.total_unidades} u.</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
    </LayoutMinimal>
  );
};

export default ReportesMinimal;

