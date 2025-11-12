import { useEffect, useMemo, useState } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getProductoVariantes, getStocks, getSucursales, posCheckout } from "../api";
import { formatCurrency } from "../utils/helpers";
import { getQrImage } from "../utils/images";
import { useNotification } from "../context/NotificationContext";

// POS Minimal: búsqueda rápida, carrito temporal y total con stock disponible
const POSMinimal = () => {
  const [productoVariantes, setProductoVariantes] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalActual, setSucursalActual] = useState(null); // ID de la sucursal actual
  const [tipoPago, setTipoPago] = useState("contado"); // Tipo de pago: "contado" o "qr"
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, showWarning } = useNotification();

  useEffect(() => {
    (async () => {
      try {
        const [variantes, stockData, sucursalesData] = await Promise.all([
          getProductoVariantes(),
          getStocks(),
          getSucursales()
        ]);
        setProductoVariantes(variantes);
        setStocks(stockData);
        setSucursales(sucursalesData);
        // Establecer la primera sucursal como predeterminada si hay sucursales
        if (sucursalesData && sucursalesData.length > 0) {
          setSucursalActual(sucursalesData[0].id || sucursalesData[0].pk);
        }
      } catch {
        setProductoVariantes([]);
        setStocks([]);
        setSucursales([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Función para obtener el stock disponible de una variante en la sucursal actual
  const getStockDisponible = (varianteId) => {
    if (!sucursalActual) return 0;
    const stockEnSucursal = stocks.find(
      s => (s.producto_variante_id === varianteId || s.producto_variante === varianteId) &&
           (s.sucursal_id === sucursalActual || s.sucursal === sucursalActual || s.sucursal_id === sucursalActual)
    );
    return stockEnSucursal ? (stockEnSucursal.cantidad || 0) : 0;
  };

  // Obtener el nombre de la sucursal actual
  const nombreSucursalActual = useMemo(() => {
    if (!sucursalActual) return "Sin sucursal";
    const sucursal = sucursales.find(s => (s.id || s.pk) === sucursalActual);
    return sucursal ? (sucursal.nombre || `Sucursal ${sucursalActual}`) : "Sin sucursal";
  }, [sucursalActual, sucursales]);

  const results = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return productoVariantes;
    return productoVariantes.filter((pv) => {
      const nombre = (pv.producto_nombre || pv.producto?.nombre || "").toLowerCase();
      const codigo = (pv.codigo || "").toLowerCase();
      const talla = (pv.talla || "").toLowerCase();
      const color = (pv.color || "").toLowerCase();
      return nombre.includes(q) || codigo.includes(q) || talla.includes(q) || color.includes(q);
    });
  }, [productoVariantes, search]);

  const addToCart = (pv) => {
    const stockDisponible = getStockDisponible(pv.id);
    if (stockDisponible <= 0) {
      showWarning("No hay stock disponible para este producto.");
      return;
    }
    
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.id === pv.id);
      if (idx >= 0) {
        const copy = [...prev];
        const nuevaCantidad = copy[idx].qty + 1;
        if (nuevaCantidad > stockDisponible) {
          showWarning(`Solo hay ${stockDisponible} unidades disponibles.`);
          return copy;
        }
        copy[idx] = { ...copy[idx], qty: nuevaCantidad };
        return copy;
      }
      const nombreCompleto = `${pv.producto_nombre || pv.producto?.nombre || 'Producto'}${pv.talla ? ` - ${pv.talla}` : ''}${pv.color ? ` ${pv.color}` : ''}`;
      return [...prev, { 
        id: pv.id, 
        nombre: nombreCompleto, 
        precio: parseFloat(pv.precio || 0), 
        qty: 1,
        stockDisponible: stockDisponible
      }];
    });
  };

  const changeQty = (id, qty) => {
    setCart((prev) => {
      const item = prev.find(it => it.id === id);
      if (!item) return prev;
      
      const stockDisponible = item.stockDisponible || getStockDisponible(id);
      const nuevaCantidad = Math.max(1, Math.min(qty, stockDisponible));
      
      if (qty > stockDisponible) {
        showWarning(`Solo hay ${stockDisponible} unidades disponibles.`);
      }
      
      return prev
        .map((it) => (it.id === id ? { ...it, qty: nuevaCantidad } : it))
        .filter((it) => it.qty > 0);
    });
  };

  const removeItem = (id) => setCart((prev) => prev.filter((it) => it.id !== id));
  const clearCart = () => setCart([]);

  const total = cart.reduce((s, it) => s + it.precio * it.qty, 0);

  const cobrar = async () => {
    if (cart.length === 0) {
      showWarning("El carrito está vacío. Agrega productos antes de cobrar.");
      return;
    }
    if (!sucursalActual) {
      showWarning("Por favor, selecciona una sucursal antes de cobrar.");
      return;
    }
    try {
      const payload = {
        sucursal: sucursalActual,
        tipo_pago: tipoPago, // Usar el tipo de pago seleccionado (contado o qr)
        items: cart.map((it) => ({
          producto_variante: it.id, // Usar producto_variante_id
          cantidad: it.qty,
          precio: it.precio,
        })),
      };
      const data = await posCheckout(payload);
      showSuccess(`Venta registrada (ID ${data.venta_id}) - Total: ${formatCurrency(data.total)}`);
      clearCart();
      // Recargar stocks y variantes después de la venta para reflejar cambios
      const [stockData, variantesData] = await Promise.all([
        getStocks(),
        getProductoVariantes()
      ]);
      setStocks(stockData);
      setProductoVariantes(variantesData);
    } catch (e) {
      const errorMsg = e.response?.data?.detail || e.message || "Error al cobrar. Revisa el backend.";
      showError(errorMsg);
      console.error("Error al cobrar:", e);
    }
  };

  return (
    <LayoutMinimal>
      <header className="h-20 flex items-center justify-between px-12 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-light tracking-wide">POS</h2>
          {sucursalActual && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Sucursal:</span>
              <select
                value={sucursalActual}
                onChange={(e) => {
                  const nuevaSucursal = parseInt(e.target.value);
                  setSucursalActual(nuevaSucursal);
                  // Limpiar el carrito al cambiar de sucursal para evitar inconsistencias
                  clearCart();
                }}
                className="px-4 py-2 border border-gray-300 focus-accent bg-white"
              >
                {sucursales.map((suc) => {
                  const id = suc.id || suc.pk;
                  const nombre = suc.nombre || `Sucursal ${id}`;
                  return (
                    <option key={id} value={id}>
                      {nombre}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-80 px-6 py-2 border border-gray-300 focus-accent"
          />
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="p-12 max-w-[1600px] mx-auto grid grid-cols-3 gap-8">
          {/* Resultados */}
          <div className="col-span-2 bg-white border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold uppercase tracking-wide">Productos</h3>
                {sucursalActual && (
                  <span className="text-sm text-gray-500">
                    (Stock de {nombreSucursalActual})
                  </span>
                )}
              </div>
              {loading && <span className="text-sm text-gray-500">Cargando...</span>}
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((pv) => {
                const stockDisponible = getStockDisponible(pv.id);
                const nombreCompleto = `${pv.producto_nombre || pv.producto?.nombre || 'Producto'}${pv.talla ? ` - ${pv.talla}` : ''}${pv.color ? ` ${pv.color}` : ''}`;
                const sinStock = stockDisponible <= 0;
                
                return (
                  <button
                    key={pv.id}
                    onClick={() => addToCart(pv)}
                    disabled={sinStock}
                    className={`border border-gray-200 p-3 text-left transition ${
                      sinStock 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <div className="font-medium truncate">{nombreCompleto}</div>
                    <div className="text-sm text-gray-600">{formatCurrency(pv.precio || 0)}</div>
                    <div className={`text-xs mt-1 ${
                      sinStock 
                        ? 'text-red-600 font-semibold' 
                        : stockDisponible < 10 
                        ? 'text-orange-600' 
                        : 'text-gray-500'
                    }`}>
                      {sinStock ? 'Sin stock' : `Stock: ${stockDisponible}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Ticket de venta */}
          <div className="bg-white border border-gray-200 p-6 h-fit">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold uppercase tracking-wide">Ticket</h3>
              <button onClick={clearCart} className="text-xs btn-accent-outline px-2 py-1">Limpiar</button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {cart.length === 0 ? (
                <div className="text-gray-600">Sin productos.</div>
              ) : (
                cart.map((it) => (
                  <div key={it.id} className="border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate mr-2">{it.nombre}</div>
                      <button className="text-xs btn-accent-outline px-2 py-1" onClick={() => removeItem(it.id)}>Quitar</button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <input
                        type="number"
                        min={1}
                        max={it.stockDisponible || 999}
                        value={it.qty}
                        onChange={(e) => changeQty(it.id, parseInt(e.target.value || "1"))}
                        className="w-20 text-right px-2 py-1 border border-gray-300 focus-accent"
                      />
                      <div className="text-sm">{formatCurrency(it.precio)} c/u</div>
                      <div className="font-semibold">{formatCurrency(it.precio * it.qty)}</div>
                    </div>
                    {it.stockDisponible && (
                      <div className="mt-1 text-xs text-gray-500">
                        Disponible: {it.stockDisponible}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span>Total</span>
              <span className="text-xl font-bold">{formatCurrency(total)}</span>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2">Tipo de Pago</label>
              <select
                value={tipoPago}
                onChange={(e) => setTipoPago(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus-accent bg-white"
              >
                <option value="contado">Contado (Efectivo)</option>
                <option value="qr">QR (Pendiente de verificación)</option>
              </select>
            </div>
            {tipoPago === "qr" && cart.length > 0 && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="text-sm font-semibold mb-3 text-center">Escanea el QR para pagar</div>
                <div className="aspect-square max-w-[350px] mx-auto border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <img src={getQrImage()} alt="QR de pago" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
            {cart.length === 0 && (
              <div className="mt-4 text-sm text-red-600 font-medium">
                El ticket está vacío. Agrega productos para continuar.
              </div>
            )}
            <button 
              className={`w-full mt-4 py-3 transition ${
                cart.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "btn-accent"
              }`}
              onClick={cobrar} 
              disabled={cart.length === 0}
            >
              {cart.length === 0 
                ? "Ticket vacío" 
                : tipoPago === "qr" 
                  ? "Registrar Venta QR" 
                  : "Cobrar"}
            </button>
          </div>
        </div>
      </main>
    </LayoutMinimal>
  );
};

export default POSMinimal;


