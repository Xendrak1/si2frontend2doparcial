import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getProductos, getProductoImagenes } from "../api";
import { useCart } from "../context/CartContext";
import { getLocalProductImage } from "../utils/images";
import { formatCurrency } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const ProductoDetalle = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { showWarning } = useNotification();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [prods, imgs] = await Promise.allSettled([getProductos(), getProductoImagenes()]);
      const productos = prods.status === "fulfilled" ? prods.value : [];
      const p = productos.find((x) => String(x.id) === String(id));
      setProducto(p || null);

      const imagenesData = imgs.status === "fulfilled" ? imgs.value : [];
      const list = [];
      for (const img of imagenesData || []) {
        const productId = img.producto || img.producto_id || img.productoId || img.producto_variante?.producto || img.producto_variante_id || img.producto_variante?.producto_id;
        if (String(productId) === String(id)) {
          const url = img.url || img.imagen_url || img.imagen || img.image_url || img.path || img.src;
          if (url) list.push(url);
        }
      }
      setImagenes(list);
    } finally {
      setLoading(false);
    }
  };
  const requiereRegistro = () => {
    showWarning("Para realizar compras necesitas registrarte o iniciar sesión.");
    navigate("/login");
  };


  const cover = useMemo(() => {
    if (!producto) return null;
    return imagenes[0] || getLocalProductImage(producto) || `https://placehold.co/800x1000?text=${encodeURIComponent(producto.nombre || "Producto")}`;
  }, [producto, imagenes]);

  if (loading) {
    return (
      <LayoutMinimal>
        <div className="flex h-full items-center justify-center bg-white">
          <div className="text-xl font-light text-gray-600">Cargando producto...</div>
        </div>
      </LayoutMinimal>
    );
  }

  if (!producto) {
    return (
      <LayoutMinimal>
        <main className="flex-1 bg-gray-50">
          <div className="p-12 max-w-[1200px] mx-auto">Producto no encontrado.</div>
        </main>
      </LayoutMinimal>
    );
  }

  return (
    <LayoutMinimal>
      <main className="flex-1 bg-gray-50">
        <div className="p-12 max-w-[1200px] mx-auto grid grid-cols-2 gap-12">
          <div className="bg-white border border-gray-200">
            <div className="aspect-[3/4]">
              <img src={cover} alt={producto.nombre} className="w-full h-full object-cover" />
            </div>
            {imagenes.length > 1 && (
              <div className="grid grid-cols-5 gap-2 p-2 border-t border-gray-200">
                {imagenes.slice(0, 10).map((src, idx) => (
                  <img key={idx} src={src} className="aspect-square object-cover border border-gray-200" />
                ))}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-light mb-2">{producto.nombre}</h1>
            <div className="text-xl font-bold mb-6">
              {producto.precio_min && producto.precio_max && producto.precio_min !== producto.precio_max
                ? `${formatCurrency(producto.precio_min)} - ${formatCurrency(producto.precio_max)}`
                : formatCurrency(producto.precio || producto.precio_base || producto.precio_min || 0)}
            </div>
            <p className="text-gray-600 mb-8">{producto.descripcion || "Prenda de vestir"}</p>
            <div className="flex gap-3">
              <button 
                className="px-6 py-3 btn-accent" 
                onClick={() => {
                  if (!isAuthenticated) {
                    requiereRegistro();
                    return;
                  }
                  const imagenUrl = cover && cover.startsWith('data:') ? null : cover;
                  addItem(producto, 1, imagenUrl);
                }}
              >
                Añadir al carrito
              </button>
            </div>
          </div>
        </div>
      </main>
    </LayoutMinimal>
  );
};

export default ProductoDetalle;


