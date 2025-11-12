import { useState, useEffect } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "../api";

// Categorías - Blanco y Negro
const CategoriasMinimal = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const data = await getCategorias();
      setCategorias(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (categoria = null) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombre: categoria.nombre || "",
        descripcion: categoria.descripcion || "",
      });
    } else {
      setEditingCategoria(null);
      setFormData({ nombre: "", descripcion: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({ nombre: "", descripcion: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, formData);
      } else {
        await createCategoria(formData);
      }
      fetchCategorias();
      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar la categoría");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar esta categoría?")) {
      try {
        await deleteCategoria(id);
        fetchCategorias();
      } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar la categoría");
      }
    }
  };

  const filteredCategorias = categorias.filter((categoria) =>
    categoria.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-3xl font-light tracking-wide">Categorías</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 btn-accent transition font-medium"
        >
          + Nueva Categoría
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-12 max-w-[1600px] mx-auto">
          
          {/* Búsqueda */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Buscar categorías..."
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategorias.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No hay categorías
                    </td>
                  </tr>
                ) : (
                  filteredCategorias.map((categoria) => (
                    <tr key={categoria.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium">{categoria.id}</td>
                      <td className="px-6 py-4 font-semibold">{categoria.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{categoria.descripcion || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(categoria)}
                            className="px-4 py-2 border border-black hover:bg-black hover:text-white transition text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(categoria.id)}
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
          onClick={handleCloseModal}
        >
          <div
            className="fixed top-[72px] right-12 bg-white border border-gray-200 rounded-xl shadow-strong w-full max-w-xl mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
              </h3>
              <button
                onClick={handleCloseModal}
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
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 hover:border-black transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 btn-accent transition font-medium"
                >
                  {editingCategoria ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutMinimal>
  );
};

export default CategoriasMinimal;

