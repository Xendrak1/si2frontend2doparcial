import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getProductos, getProductoImagenes, getCategorias } from "../api";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getLocalProductImage } from "../utils/images";
import { formatCurrency } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

// Tienda Minimal: grilla de productos con búsqueda y agregar al carrito
const TiendaMinimal = () => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { showWarning } = useNotification();
  const [productos, setProductos] = useState([]);
  const [imagenes, setImagenes] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prods, imgs, cats] = await Promise.allSettled([getProductos(), getProductoImagenes(), getCategorias()]);
      const productosData = prods.status === "fulfilled" ? prods.value : [];
      const imagenesData = imgs.status === "fulfilled" ? imgs.value : [];
      const categoriasData = cats.status === "fulfilled" ? cats.value : [];
      // Mapear imágenes por productoId
      const map = {};
      for (const img of imagenesData || []) {
        const productId = img.producto || img.producto_id || img.productoId || img.producto_variante?.producto || img.producto_variante_id || img.producto_variante?.producto_id;
        const url = img.url || img.imagen_url || img.imagen || img.image_url || img.path || img.src;
        if (!productId || !url) continue;
        if (!map[productId]) map[productId] = [];
        map[productId].push(url);
      }
      setProductos(productosData);
      setImagenes(map);
      setCategorias(categoriasData);
    } catch (e) {
      setProductos([]);
      setImagenes({});
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const catMap = useMemo(() => {
    const map = {};
    for (const c of categorias || []) {
      const id = c.id ?? c.pk ?? c.codigo ?? c.value;
      const nombre = c.nombre ?? c.name ?? c.titulo ?? c.label ?? `Cat ${id}`;
      if (id != null) map[id] = nombre;
    }
    return map;
  }, [categorias]);

  // Sincronizar con el sidebar mediante query ?cat=
  useEffect(() => {
    const qp = searchParams.get("cat");
    setCategoriaSel(qp || "all");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const bySearch = !q
      ? productos
      : productos.filter((p) => String(p.nombre || "").toLowerCase().includes(q));
    if (categoriaSel === "all") return bySearch;
    return bySearch.filter((p) => {
      const cat = p.categoria || p.categoria_id || p.categoriaId || p.category;
      return String(cat) === String(categoriaSel) || String(catMap[cat]) === String(catMap[categoriaSel]);
    });
  }, [productos, search, categoriaSel, catMap]);

  const getCover = (p) => {
  const requiereRegistro = () => {
    showWarning("Para realizar compras necesitas registrarte o iniciar sesión.");
    navigate("/login");
  };

    const list = imagenes[p.id] || [];
    const fromApi = list[0];
    // Solo imágenes reales (DB). Sin placeholders externos.
    return fromApi || null;
  };

  if (loading) {
    return (
      <LayoutMinimal>
        <div className="flex h-full items-center justify-center bg-white">
          <div className="text-xl font-light text-gray-600">Cargando tienda...</div>
        </div>
      </LayoutMinimal>
    );
  }

  const currentCatName = categoriaSel !== "all" ? (catMap[categoriaSel] || "") : "";
  const resultsCount = filtered.length;

  return (
    <LayoutMinimal>
      <header className="h-20 flex items-center justify-between px-12 border-b border-gray-200 bg-white">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-light tracking-wide">Tienda{currentCatName ? " / " : ""}</h2>
          {currentCatName && <span className="text-xl font-semibold">{currentCatName}</span>}
          <span className="ml-2 text-sm text-gray-500">{resultsCount} resultados</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-6 py-2 border border-gray-300 focus-accent"
          />
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="p-12 max-w-[1600px] mx-auto">
          {/* Secciones por categoría */}
          {categoriaSel === "all" && categorias.length > 0 ? (
            categorias.map((c) => {
              const id = c.id ?? c.pk ?? c.codigo ?? c.value;
              const nombre = c.nombre ?? c.name ?? c.titulo ?? c.label ?? `Cat ${id}`;
              const items = filtered.filter((p) => String(p.categoria || p.categoria_id || p.category) === String(id));
              if (items.length === 0) return null;
              return (
                <section key={id} className="mb-12">
                  <h3 className="text-xl font-semibold mb-4">{nombre}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {items.map((p) => (
                      <div key={p.id} className="bg-white border border-gray-200 hover-lift group rounded-xl overflow-hidden">
                        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 grid place-content-center">
                          <Link to={`/producto/${p.id}`}>
                            {getCover(p) ? (
                              <img
                                src={getCover(p)}
                                alt={p.nombre}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition rounded-xl"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">Sin imagen</span>
                            )}
                          </Link>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                          <Link to={`/producto/${p.id}`} className="font-semibold mb-1 truncate block">
                            {p.nombre}
                          </Link>
                          <div className="text-sm text-gray-600 mb-3">
                            {p.precio_min && p.precio_max && p.precio_min !== p.precio_max
                              ? `${formatCurrency(p.precio_min)} - ${formatCurrency(p.precio_max)}`
                              : formatCurrency(p.precio || p.precio_base || p.precio_min || 0)}
                          </div>
                          <button
                            onClick={() => {
                              if (!isAuthenticated) {
                                requiereRegistro();
                                return;
                              }
                              const imagenUrl = getCover(p);
                              addItem(p, 1, imagenUrl);
                            }}
                            className="w-full px-4 py-2 btn-accent"
                          >
                            Añadir al carrito
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 hover-lift group rounded-xl overflow-hidden">
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 grid place-content-center">
                  <Link to={`/producto/${p.id}`}>
                    {getCover(p) ? (
                      <img
                        src={getCover(p)}
                        alt={p.nombre}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition rounded-xl"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">Sin imagen</span>
                    )}
                  </Link>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <Link to={`/producto/${p.id}`} className="font-semibold mb-1 truncate block">
                    {p.nombre}
                  </Link>
                  <div className="text-sm text-gray-600 mb-3">{formatCurrency(p.precio)}</div>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        requiereRegistro();
                        return;
                      }
                      addItem(p, 1);
                    }}
                    className="w-full px-4 py-2 btn-accent"
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </main>
    </LayoutMinimal>
  );
};

export default TiendaMinimal;


