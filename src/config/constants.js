// Configuración de constantes de la aplicación

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
// Modelos disponibles (noviembre 2025): gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash-exp, gemini-2.0-pro-exp
// Todos usan v1beta
export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

export const APP_NAME = "Boutique System";
export const APP_VERSION = "1.0.0";

// Estados de productos
export const PRODUCT_STATES = {
  ACTIVE: "activo",
  INACTIVE: "inactivo",
};

// Tipos de pago
export const PAYMENT_TYPES = {
  CASH: "contado",
  CREDIT: "credito",
};

// Canales de venta
export const SALES_CHANNELS = {
  STORE: "tienda",
  ONLINE: "online",
};

// Estados de venta
export const SALE_STATES = {
  PENDING: "pendiente",
  COMPLETED: "completado",
  CANCELLED: "cancelado",
};

// Estados de pago
export const PAYMENT_STATES = {
  PENDING: "pendiente",
  PAID: "pagado",
  PARTIAL: "parcial",
};

// Tipos de movimiento de stock
export const STOCK_MOVEMENT_TYPES = {
  ENTRY: "entrada",
  EXIT: "salida",
  ADJUSTMENT: "ajuste",
  TRANSFER: "transferencia",
};

// Colores del tema
export const COLORS = {
  PRIMARY: "#667eea",
  SECONDARY: "#764ba2",
  SUCCESS: "#10b981",
  DANGER: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#3b82f6",
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Formatos de fecha
export const DATE_FORMATS = {
  SHORT: "DD/MM/YYYY",
  LONG: "DD de MMMM de YYYY",
  WITH_TIME: "DD/MM/YYYY HH:mm",
};

