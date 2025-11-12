import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "../config/constants";

// Carrito basado en sessionStorage para modo tienda (cliente)
const CartContext = createContext(null);

const STORAGE_KEY = "cart_items";

// Función helper para obtener la URL completa de una imagen
function getImageUrl(url) {
  if (!url) return null;
  // Si es una URL relativa (media/), agregar el base URL
  if (url.startsWith('/media/') || url.startsWith('media/')) {
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  // Si ya es una URL completa, retornarla tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (product, quantity = 1, imagenUrl = null) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.productId === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
        return copy;
      }
      // Obtener imagen del producto
      const imagen = imagenUrl || 
                    getImageUrl(product.imagen_url || product.image || product.imagen) ||
                    null;
      return [
        ...prev,
        {
          productId: product.id,
          nombre: product.nombre,
          precio: parseFloat(product.precio || product.precio_base || product.precio_min || 0),
          quantity,
          imagen,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev
        .map((it) => (it.productId === productId ? { ...it, quantity } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
    const totalAmount = items.reduce((sum, it) => sum + it.precio * it.quantity, 0);
    return { totalItems, totalAmount };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      ...totals,
    }),
    [items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}


