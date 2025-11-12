import axios from "axios";
import { API_URL } from "./config/constants";

// Configurar axios con interceptores
axios.defaults.baseURL = API_URL;
axios.interceptors.request.use(
  (config) => {
  try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Token ${token}`;
      }
    } catch (e) { void e; }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo global de errores
    if (error.response) {
      console.error("Error de respuesta:", error.response.data);
    } else if (error.request) {
      console.error("Error de red:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ================= AUTH =================
export const login = async (email, password) => {
  const res = await axios.post(`/auth/login/`, { email, password });
  return res.data;
};

export const register = async (data) => {
  const res = await axios.post(`/auth/register/`, data);
  return res.data;
};

export const me = async () => {
  const res = await axios.get(`/auth/me/`);
  return res.data;
};

export const logout = async () => {
  const res = await axios.post(`/auth/logout/`);
  return res.data;
};

export const sendGlobalNotification = async (payload) => {
  const res = await axios.post(`/notificaciones/enviar/`, payload);
  return res.data;
};

// ================= CATEGORIAS =================
export const getCategorias = async () => {
  const res = await axios.get(`/categorias/`);
  return res.data;
};

export const createCategoria = async (data) => {
  const res = await axios.post(`/categorias/`, data);
  return res.data;
};

export const updateCategoria = async (id, data) => {
  const res = await axios.put(`/categorias/${id}/`, data);
  return res.data;
};

export const deleteCategoria = async (id) => {
  const res = await axios.delete(`/categorias/${id}/`);
  return res.data;
};

// ================= PRODUCTOS =================
export const getProductos = async () => {
  const res = await axios.get(`/productos/`);
  return res.data;
};

export const createProducto = async (data) => {
  const res = await axios.post(`/productos/`, data);
  return res.data;
};

export const updateProducto = async (id, data) => {
  const res = await axios.put(`/productos/${id}/`, data);
  return res.data;
};

export const deleteProducto = async (id) => {
  const res = await axios.delete(`/productos/${id}/`);
  return res.data;
};

// ================= PRODUCTO VARIANTES =================
export const getProductoVariantes = async () => {
  const res = await axios.get(`/producto_variantes/`);
  return res.data;
};

export const createProductoVariante = async (data) => {
  const res = await axios.post(`/producto_variantes/`, data);
  return res.data;
};

export const updateProductoVariante = async (id, data) => {
  const res = await axios.put(`/producto_variantes/${id}/`, data);
  return res.data;
};

export const deleteProductoVariante = async (id) => {
  const res = await axios.delete(`/producto_variantes/${id}/`);
  return res.data;
};

// ================= PRODUCTO IMAGENES =================
export const getProductoImagenes = async () => {
  const res = await axios.get(`/producto_imagenes/`);
  return res.data;
};

export const createProductoImagen = async (data) => {
  const res = await axios.post(`/producto_imagenes/`, data);
  return res.data;
};

// Upload de imagen (multipart)
export const uploadImage = async (file) => {
  const form = new FormData();
  form.append("image", file);
  const res = await axios.post(`/upload/image/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { url }
};

export const updateProductoImagen = async (id, data) => {
  const res = await axios.put(`/producto_imagenes/${id}/`, data);
  return res.data;
};

export const deleteProductoImagen = async (id) => {
  const res = await axios.delete(`/producto_imagenes/${id}/`);
  return res.data;
};

// ================= SUCURSALES =================
export const getSucursales = async () => {
  const res = await axios.get(`/sucursales/`);
  return res.data;
};

export const createSucursal = async (data) => {
  const res = await axios.post(`/sucursales/`, data);
  return res.data;
};

export const updateSucursal = async (id, data) => {
  const res = await axios.put(`/sucursales/${id}/`, data);
  return res.data;
};

export const deleteSucursal = async (id) => {
  const res = await axios.delete(`/sucursales/${id}/`);
  return res.data;
};

// ================= STOCK =================
export const getStocks = async () => {
  const res = await axios.get(`/stocks/`);
  return res.data;
};

export const createStock = async (data) => {
  const res = await axios.post(`/stocks/`, data);
  return res.data;
};

export const updateStock = async (id, data) => {
  const res = await axios.put(`/stocks/${id}/`, data);
  return res.data;
};

export const deleteStock = async (id) => {
  const res = await axios.delete(`/stocks/${id}/`);
  return res.data;
};

// ================= MOVIMIENTOS STOCK =================
export const getMovimientosStock = async () => {
  const res = await axios.get(`/movimientos_stock/`);
  return res.data;
};

export const createMovimientoStock = async (data) => {
  const res = await axios.post(`/movimientos_stock/`, data);
  return res.data;
};

export const updateMovimientoStock = async (id, data) => {
  const res = await axios.put(`/movimientos_stock/${id}/`, data);
  return res.data;
};

export const deleteMovimientoStock = async (id) => {
  const res = await axios.delete(`/movimientos_stock/${id}/`);
  return res.data;
};

// ================= CLIENTES =================
export const getClientes = async () => {
  const res = await axios.get(`/clientes/`);
  return res.data;
};

export const createCliente = async (data) => {
  const res = await axios.post(`/clientes/`, data);
  return res.data;
};

export const updateCliente = async (id, data) => {
  const res = await axios.put(`/clientes/${id}/`, data);
  return res.data;
};

export const deleteCliente = async (id) => {
  const res = await axios.delete(`/clientes/${id}/`);
  return res.data;
};

// ================= VENTAS =================
export const getVentas = async () => {
  const res = await axios.get(`/ventas/`);
  return res.data;
};

export const createVenta = async (data) => {
  const res = await axios.post(`/ventas/`, data);
  return res.data;
};

export const updateVenta = async (id, data) => {
  const res = await axios.put(`/ventas/${id}/`, data);
  return res.data;
};

export const deleteVenta = async (id) => {
  const res = await axios.delete(`/ventas/${id}/`);
  return res.data;
};

// ================= VENTA DETALLES =================
export const getVentaDetalles = async (ventaId = null) => {
  const params = ventaId ? { venta: ventaId } : {};
  const res = await axios.get(`/venta_detalles/`, { params });
  return res.data;
};

export const createVentaDetalle = async (data) => {
  const res = await axios.post(`/venta_detalles/`, data);
  return res.data;
};

export const updateVentaDetalle = async (id, data) => {
  const res = await axios.put(`/venta_detalles/${id}/`, data);
  return res.data;
};

export const deleteVentaDetalle = async (id) => {
  const res = await axios.delete(`/venta_detalles/${id}/`);
  return res.data;
};

// ================= PAGOS =================
export const getPagos = async () => {
  const res = await axios.get(`/pagos/`);
  return res.data;
};

export const createPago = async (data) => {
  const res = await axios.post(`/pagos/`, data);
  return res.data;
};

export const updatePago = async (id, data) => {
  const res = await axios.put(`/pagos/${id}/`, data);
  return res.data;
};

export const deletePago = async (id) => {
  const res = await axios.delete(`/pagos/${id}/`);
  return res.data;
};

// ================= ROLES =================
export const getRoles = async () => {
  const res = await axios.get(`/roles/`);
  return res.data;
};

export const createRol = async (data) => {
  const res = await axios.post(`/roles/`, data);
  return res.data;
};

export const updateRol = async (id, data) => {
  const res = await axios.put(`/roles/${id}/`, data);
  return res.data;
};

export const deleteRol = async (id) => {
  const res = await axios.delete(`/roles/${id}/`);
  return res.data;
};

// ================= USUARIOS =================
export const getUsuarios = async () => {
  const res = await axios.get(`/usuarios/`);
  return res.data;
};

export const createUsuario = async (data) => {
  const res = await axios.post(`/usuarios/`, data);
  return res.data;
};

export const updateUsuario = async (id, data) => {
  const res = await axios.put(`/usuarios/${id}/`, data);
  return res.data;
};

export const deleteUsuario = async (id) => {
  const res = await axios.delete(`/usuarios/${id}/`);
  return res.data;
};

// ================= CARRITO =================
export const getCarrito = async () => {
  const res = await axios.get(`/carrito/`);
  return res.data;
};

export const addCarritoItem = async (item) => {
  const res = await axios.post(`/carrito/items/`, item);
  return res.data;
};

export const updateCarritoItem = async (id, payload) => {
  const res = await axios.put(`/carrito/items/${id}/`, payload);
  return res.data;
};

export const deleteCarritoItem = async (id) => {
  const res = await axios.delete(`/carrito/items/${id}/`);
  return res.data;
};

export const clearCarrito = async () => {
  const res = await axios.post(`/carrito/clear/`);
  return res.data;
};

// ================= CHECKOUT (ONLINE) =================
export const checkoutVentaOnline = async (payload) => {
  // payload: { carrito_id | items[], cliente, direccion_envio, tipo_pago, canal_venta:'online' }
  const res = await axios.post(`/ventas/checkout/`, payload);
  return res.data;
};

// ================= POS =================
export const posCheckout = async (payload) => {
  // payload: { cliente?, cliente_email?, sucursal?, tipo_pago?, items:[{producto, cantidad, precio}] }
  const res = await axios.post(`/ventas/pos_checkout/`, payload);
  return res.data;
};

export const onlineCheckout = async (payload) => {
  const res = await axios.post(`/ventas/online_checkout/`, payload);
  return res.data;
};

export const confirmarPagoVenta = async (ventaId) => {
  const res = await axios.post(`/ventas/confirmar_pago/`, { venta_id: ventaId });
  return res.data;
};

// ================= DIRECCIONES (cliente) =================
export const getDirecciones = async (clienteId) => {
  const res = await axios.get(`/clientes/${clienteId}/direcciones/`);
  return res.data;
};

export const createDireccion = async (clienteId, data) => {
  const res = await axios.post(`/clientes/${clienteId}/direcciones/`, data);
  return res.data;
};

// ================= REPORTES (AGREGADOS) =================
export const getReporteResumen = async () => {
  const res = await axios.get(`/reportes/resumen/`);
  return res.data;
};

export const getVentasPorDia = async (dias = 30, opts = {}) => {
  const params = {};
  // Si hay start/end, usarlos; sino usar dias
  if (opts.start && opts.end) {
    params.start = opts.start;
    params.end = opts.end;
  } else {
    params.dias = dias;
  }
  const res = await axios.get(`/reportes/ventas-por-dia/`, { params });
  return res.data;
};

export const getPronosticoVentas = async (fecha = null) => {
  const params = fecha ? { fecha } : {};
  const res = await axios.get(`/reportes/pronostico/`, { params });
  return res.data;
};

export const getTopProductos = async (limit = 5, metric = "unidades", opts = {}) => {
  const params = { limit, metric };
  // filtros opcionales: start, end, season, year, month, canal, categoria, order, exclude, min_monto, max_monto, min_precio_unitario, max_precio_unitario
  ["start", "end", "season", "year", "month", "canal", "categoria", "order", "exclude", "min_monto", "max_monto", "min_precio_unitario", "max_precio_unitario"].forEach((k) => {
    if (opts && opts[k] !== undefined && opts[k] !== null && opts[k] !== "") params[k] = opts[k];
  });
  const res = await axios.get(`/reportes/top-productos/`, { params });
  return res.data;
};

export const getMixPago = async () => {
  const res = await axios.get(`/reportes/mix-pago/`);
  return res.data;
};

export const getStockBajo = async (umbral = 5, limit = 20) => {
  const res = await axios.get(`/reportes/stock-bajo/`, { params: { umbral, limit } });
  return res.data;
};

// Exportes de reportes
export const exportReportePDF = async (recurso = "resumen", params = {}) => {
  const queryParams = { recurso };
  // Agregar filtros de fecha y otros parámetros
  ["start", "end", "dias", "metric", "umbral", "season", "year", "month"].forEach((k) => {
    if (params && params[k] !== undefined && params[k] !== null && params[k] !== "") {
      queryParams[k] = params[k];
    }
  });
  const res = await axios.get(`/reportes/export/pdf/`, { params: queryParams, responseType: "blob" });
  return res;
};

export const exportReporteExcel = async (recurso = "resumen", params = {}) => {
  const queryParams = { recurso };
  // Agregar filtros de fecha y otros parámetros
  ["start", "end", "dias", "metric", "umbral", "season", "year", "month"].forEach((k) => {
    if (params && params[k] !== undefined && params[k] !== null && params[k] !== "") {
      queryParams[k] = params[k];
    }
  });
  const res = await axios.get(`/reportes/export/excel/`, { params: queryParams, responseType: "blob" });
  return res;
};
