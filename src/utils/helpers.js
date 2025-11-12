// Funciones auxiliares de utilidad

/**
 * Formatea un número como moneda boliviana
 */
export const formatCurrency = (amount) => {
  return `Bs. ${parseFloat(amount || 0).toFixed(2)}`;
};

/**
 * Formatea una fecha
 */
export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Formatea una fecha con hora
 */
export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Capitaliza la primera letra de un string
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Trunca un texto a una longitud específica
 */
export const truncate = (str, length = 50) => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + "...";
};

/**
 * Genera un color aleatorio en hexadecimal
 */
export const randomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Valida un email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Calcula el porcentaje de cambio entre dos valores
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Ordena un array de objetos por una propiedad
 */
export const sortByProperty = (array, property, ascending = true) => {
  return [...array].sort((a, b) => {
    if (a[property] < b[property]) return ascending ? -1 : 1;
    if (a[property] > b[property]) return ascending ? 1 : -1;
    return 0;
  });
};

/**
 * Filtra un array de objetos por múltiples propiedades
 */
export const filterByMultipleProperties = (array, searchTerm, properties) => {
  if (!searchTerm) return array;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return array.filter((item) =>
    properties.some((property) =>
      String(item[property]).toLowerCase().includes(lowerSearchTerm)
    )
  );
};

/**
 * Debounce function para optimizar búsquedas
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Descarga un archivo desde un blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
};

/**
 * Copia texto al portapapeles
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Error al copiar al portapapeles:", err);
    return false;
  }
};

/**
 * Valida si un objeto está vacío
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Obtiene valores únicos de un array
 */
export const getUniqueValues = (array, property) => {
  return [...new Set(array.map((item) => item[property]))];
};

