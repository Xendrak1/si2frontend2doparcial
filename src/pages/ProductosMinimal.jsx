import { useState, useEffect } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getProductos, createProducto, updateProducto, deleteProducto, createProductoImagen, uploadImage, getProductoImagenes, getCategorias } from "../api";
import { API_URL } from "../config/constants";

// Productos - Usa Layout compartido
const ProductosMinimal = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    imagen_url: "",
  });
  const [dragActive, setDragActive] = useState(false);
  const [productoImagenes, setProductoImagenes] = useState([]);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetchProductos();
    fetchImagenes();
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const data = await getCategorias();
      setCategorias(data || []);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const fetchImagenes = async () => {
    try {
      const data = await getProductoImagenes();
      setProductoImagenes(data || []);
    } catch (error) {
      console.error("Error cargando imágenes:", error);
    }
  };

  const getProductoImagen = (productoId) => {
    const imagenes = productoImagenes.filter(img => {
      const prodId = img.producto || img.producto_id || img.productoId;
      return String(prodId) === String(productoId);
    });
    if (imagenes.length > 0) {
      const url = imagenes[0].url || imagenes[0].imagen_url || imagenes[0].imagen;
      if (url) {
        // Si es una URL relativa, agregar el base URL
        if (url.startsWith('/media/') || url.startsWith('media/')) {
          return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        return url;
      }
    }
    return null;
  };

  const handlePreview = (productoId) => {
    const imagenUrl = getProductoImagen(productoId);
    if (imagenUrl) {
      setPreviewImagen(imagenUrl);
      setShowPreview(true);
    } else {
      alert("Este producto no tiene imagen asociada.");
    }
  };

  const fetchProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const { imagen_url, ...payload } = formData;
        await updateProducto(editingProduct.id, payload);
        if (imagen_url) {
          try { await createProductoImagen({ producto: editingProduct.id, url: imagen_url }); } catch {}
        }
      } else {
        const { imagen_url, ...payload } = formData;
        const created = await createProducto(payload);
        if (imagen_url && created?.id) {
          try { await createProductoImagen({ producto: created.id, url: imagen_url }); } catch {}
        }
      }
      fetchProductos();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este producto?")) {
      try {
        await deleteProducto(id);
        fetchProductos();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", descripcion: "", precio: "", categoria: "", imagen_url: "" });
    setEditingProduct(null);
  };

  const filteredProductos = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-3xl font-light tracking-wide">Productos</h2>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal((v) => !v);
            }}
            className="px-6 py-3 btn-accent transition font-medium"
          >
            + Nuevo Producto
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-12 max-w-[1600px] mx-auto">
            
            {/* Búsqueda */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 border border-gray-300 focus-accent transition"
              />
            </div>

            {/* Tabla */}
            <div className="bg-white border border-gray-200">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No hay productos
                      </td>
                    </tr>
                  ) : (
                    filteredProductos.map((producto) => (
                      <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium">{producto.id}</td>
                        <td className="px-6 py-4 font-semibold">{producto.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {producto.categoria?.nombre || producto.categoria_nombre || producto.categoria || '-'}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          Bs. {parseFloat(producto.precio || producto.precio_base || producto.precio_min || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePreview(producto.id)}
                              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 transition text-sm font-medium"
                              title="Ver imagen"
                            >
                              👁️ Preview
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(producto);
                                // Asegurar que categoria sea el ID (puede venir como objeto o ID)
                                const categoriaId = producto.categoria?.id || producto.categoria || "";
                                setFormData({
                                  nombre: producto.nombre || "",
                                  descripcion: producto.descripcion || "",
                                  precio: producto.precio || producto.precio_base || "",
                                  categoria: categoriaId,
                                  imagen_url: "",
                                });
                                setShowModal(true);
                              }}
                              className="px-4 py-2 border border-black hover:bg-black hover:text-white transition text-sm font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(producto.id)}
                              className="px-4 py-2 btn-accent transition text-sm font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-transparent z-50"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            className="fixed top-[72px] right-12 bg-white border border-gray-200 rounded-xl shadow-strong w-full max-w-xl mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-2xl hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-300 focus:outline-none focus:border-black bg-white"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id || cat.pk} value={cat.id || cat.pk}>
                      {cat.nombre || `Categoría ${cat.id || cat.pk}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Imagen (URL)</label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="https://.../foto.jpg"
                />
                {/* Drag & Drop + Preview en el mismo recuadro */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (!file) return;
                    try {
                      const { url } = await uploadImage(file);
                      setFormData((f) => ({ ...f, imagen_url: url }));
                    } catch {}
                  }}
                  className="mt-3 flex justify-center"
                >
                  <div
                    className={`relative w-full max-w-[280px] aspect-square rounded-md overflow-hidden transition ${
                      dragActive ? "border-2 border-[var(--accent)] ring-2 ring-[var(--accent)]" : "border-2 border-dashed border-gray-300"
                    }`}
                  >
                    {formData.imagen_url ? (
                      <>
                        <img
                          src={formData.imagen_url}
                          alt="preview"
                          className="absolute inset-0 w-full h-full object-contain bg-gray-50"
                        />
                        <div className="absolute bottom-2 right-2">
                          <button
                            type="button"
                            onClick={() => setFormData((f) => ({ ...f, imagen_url: "" }))}
                            className="text-xs btn-accent-outline px-2 py-1"
                          >
                            Cambiar
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 grid place-content-center text-sm text-gray-600 p-3 text-center">
                        Arrastra una imagen aquí o{" "}
                        <label className="underline cursor-pointer">
                          selecciónala
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const { url } = await uploadImage(file);
                                setFormData((f) => ({ ...f, imagen_url: url }));
                              } catch {}
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 hover:border-black transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 btn-accent transition font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Preview de Imagen */}
      {showPreview && previewImagen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] p-6 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Preview de Imagen</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-2xl hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={previewImagen}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.src = `https://placehold.co/800x600?text=Error+al+cargar+imagen`;
                }}
              />
            </div>
          </div>
        </div>
      )}
    </LayoutMinimal>
  );
};

export default ProductosMinimal;

