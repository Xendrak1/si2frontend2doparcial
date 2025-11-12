import { useState, useEffect } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getClientes, createCliente, updateCliente, deleteCliente } from "../api";

// Clientes - Usa Layout compartido
const ClientesMinimal = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      // Ordenar por nombre (por si acaso el backend no lo hace)
      const sorted = [...(data || [])].sort((a, b) => {
        const nombreA = (a.nombre || "").toLowerCase();
        const nombreB = (b.nombre || "").toLowerCase();
        return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
      });
      setClientes(sorted);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData);
      } else {
        await createCliente(formData);
      }
      fetchClientes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este cliente?")) {
      try {
        await deleteCliente(id);
        fetchClientes();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", email: "", telefono: "", direccion: "" });
    setEditingCliente(null);
  };

  const filteredClientes = clientes.filter((c) =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-3xl font-light tracking-wide">Clientes</h2>
          <button
            onClick={() => {
              setEditingCliente(null);
              setShowModal((v) => !v);
            }}
            className="px-6 py-3 btn-accent transition font-medium"
          >
            + Nuevo Cliente
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-12 max-w-[1600px] mx-auto">
            
            {/* Búsqueda */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Buscar clientes..."
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No hay clientes
                      </td>
                    </tr>
                  ) : (
                    filteredClientes.map((cliente) => (
                      <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium">{cliente.id}</td>
                        <td className="px-6 py-4 font-semibold">{cliente.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{cliente.email}</td>
                        <td className="px-6 py-4 text-sm">{cliente.telefono}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingCliente(cliente);
                                setFormData(cliente);
                                setShowModal(true);
                              }}
                              className="px-4 py-2 border border-black hover:bg-black hover:text-white transition text-sm font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(cliente.id)}
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
                {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
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
                  className="w-full px-5 py-3 border border-gray-300 focus-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-300 focus-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-300 focus-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Dirección</label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-300 focus-accent"
                  rows="2"
                />
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
    </LayoutMinimal>
  );
};

export default ClientesMinimal;

