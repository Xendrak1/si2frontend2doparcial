import { useState, useEffect } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getRoles, createRol, updateRol, deleteRol } from "../api";
import { Permissions } from "../auth/roles";

// Roles y Permisos - Blanco y Negro
const RolesMinimal = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    permisos: [],
  });

  // Lista de todos los permisos disponibles
  const todosLosPermisos = [
    { key: Permissions.DashboardVer, label: "Ver Dashboard" },
    { key: Permissions.ProductosLeer, label: "Leer Productos" },
    { key: Permissions.ProductosEditar, label: "Editar Productos" },
    { key: Permissions.CategoriasAll, label: "Gestionar Categorías" },
    { key: Permissions.VentasPOS, label: "Ventas POS" },
    { key: Permissions.VentasOnline, label: "Ventas Online" },
    { key: Permissions.ClientesAll, label: "Gestionar Clientes" },
    { key: Permissions.StockMov, label: "Gestionar Stock" },
    { key: Permissions.ReportesVer, label: "Ver Reportes" },
    { key: Permissions.SucursalesAll, label: "Gestionar Sucursales" },
    { key: Permissions.RolesAll, label: "Gestionar Roles" },
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rol = null) => {
    if (rol) {
      setEditingRol(rol);
      const permisos = Array.isArray(rol.permisos) ? rol.permisos : [];
      setFormData({
        nombre: rol.nombre || "",
        permisos: permisos.includes("*") ? ["*"] : permisos,
      });
    } else {
      setEditingRol(null);
      setFormData({ nombre: "", permisos: [] });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRol(null);
    setFormData({ nombre: "", permisos: [] });
  };

  const handleTogglePermiso = (permiso) => {
    if (permiso === "*") {
      // Si se selecciona "*", deseleccionar todo lo demás
      setFormData({ ...formData, permisos: formData.permisos.includes("*") ? [] : ["*"] });
    } else {
      // Si se selecciona un permiso específico, quitar "*" si está
      const nuevosPermisos = formData.permisos.includes("*") 
        ? [permiso]
        : formData.permisos.includes(permiso)
        ? formData.permisos.filter(p => p !== permiso)
        : [...formData.permisos, permiso];
      setFormData({ ...formData, permisos: nuevosPermisos });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        permisos: formData.permisos,
      };
      if (editingRol) {
        await updateRol(editingRol.id, payload);
      } else {
        await createRol(payload);
      }
      fetchRoles();
      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar el rol");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este rol? Esto puede afectar a los usuarios que lo usan.")) {
      try {
        await deleteRol(id);
        fetchRoles();
      } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar el rol");
      }
    }
  };

  const filteredRoles = roles.filter((rol) =>
    rol.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-3xl font-light tracking-wide">Roles y Permisos</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 btn-accent transition font-medium"
        >
          + Nuevo Rol
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-12 max-w-[1600px] mx-auto">
          
          {/* Búsqueda */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Buscar roles..."
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Permisos</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No hay roles
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((rol) => {
                    const permisos = Array.isArray(rol.permisos) ? rol.permisos : [];
                    const tieneTodos = permisos.includes("*");
                    return (
                      <tr key={rol.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium">{rol.id}</td>
                        <td className="px-6 py-4 font-semibold">{rol.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tieneTodos ? (
                            <span className="badge-accent">Todos los permisos (*)</span>
                          ) : permisos.length > 0 ? (
                            <span>{permisos.length} permiso{permisos.length !== 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-gray-400">Sin permisos</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal(rol)}
                              className="px-4 py-2 border border-black hover:bg-black hover:text-white transition text-sm font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(rol.id)}
                              className="px-4 py-2 btn-accent transition text-sm font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
            className="fixed top-[72px] right-12 bg-white border border-gray-200 rounded-xl shadow-strong w-full max-w-2xl mx-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingRol ? "Editar Rol" : "Nuevo Rol"}
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
                <label className="block text-sm font-semibold mb-2">Nombre del Rol</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-5 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  required
                  placeholder="Ej: admin, vendedor, cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 mb-4">Permisos</label>
                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 p-4 rounded">
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permisos.includes("*")}
                      onChange={() => handleTogglePermiso("*")}
                      className="w-4 h-4"
                    />
                    <span className="font-semibold">Todos los permisos (*)</span>
                  </label>
                  <div className="border-t border-gray-200 my-2"></div>
                  {todosLosPermisos.map((permiso) => (
                    <label key={permiso.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permisos.includes(permiso.key) && !formData.permisos.includes("*")}
                        onChange={() => handleTogglePermiso(permiso.key)}
                        disabled={formData.permisos.includes("*")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{permiso.label}</span>
                    </label>
                  ))}
                </div>
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
                  {editingRol ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutMinimal>
  );
};

export default RolesMinimal;

