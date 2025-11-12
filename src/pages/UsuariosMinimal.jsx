import { useEffect, useMemo, useState } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getRoles, getUsuarios, updateUsuario } from "../api";
import { useNotification } from "../context/NotificationContext";

const UsuariosMinimal = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // id en proceso
  const { showSuccess, showError, showInfo } = useNotification();

  const rolesMap = useMemo(() => {
    return roles.reduce((acc, rol) => {
      acc[rol.id] = rol;
      return acc;
    }, {});
  }, [roles]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usuariosData, rolesData] = await Promise.all([getUsuarios(), getRoles()]);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      showError("No se pudieron cargar los usuarios. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangeRol = async (usuarioId, nuevoRolId) => {
    const usuario = usuarios.find((u) => u.id === usuarioId);
    if (!usuario) return;
    if (Number(usuario.rol) === Number(nuevoRolId)) {
      showInfo("El usuario ya tiene ese rol.");
      return;
    }

    setSaving(usuarioId);
    try {
      await updateUsuario(usuarioId, { rol: nuevoRolId, rol_id: nuevoRolId });
      showSuccess("Rol actualizado correctamente.");
      await fetchData();
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      const detail = error?.response?.data?.detail || "No se pudo actualizar el rol.";
      showError(detail);
    } finally {
      setSaving(null);
    }
  };

  return (
    <LayoutMinimal>
      <header className="h-20 flex items-center justify-between px-12 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-3xl font-light tracking-wide">Usuarios</h2>
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">
            Administración de roles para el personal y clientes
          </p>
        </div>
      </header>
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-12">
          {loading ? (
            <div className="bg-white border border-gray-200 p-12 text-center text-gray-600">
              Cargando usuarios...
            </div>
          ) : (
            <div className="bg-white border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol actual</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cambiar rol</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No hay usuarios registrados todavía.
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((usuario) => {
                      const rolActual = rolesMap[usuario.rol_id] || rolesMap[usuario.rol];
                      return (
                        <tr key={usuario.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="font-medium">{usuario.nombre}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{usuario.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {rolActual ? rolActual.nombre : (usuario.role || "sin rol")}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <select
                                className="px-3 py-2 border border-gray-300 focus-accent bg-white"
                                value={Number(usuario.rol_id || usuario.rol) || ""}
                                onChange={(e) => handleChangeRol(usuario.id, Number(e.target.value))}
                                disabled={saving === usuario.id}
                              >
                                <option value="">Seleccione rol</option>
                                {roles.map((rol) => (
                                  <option key={rol.id} value={rol.id}>
                                    {rol.nombre}
                                  </option>
                                ))}
                              </select>
                              {saving === usuario.id && (
                                <span className="text-xs text-gray-500">Guardando...</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </LayoutMinimal>
  );
};

export default UsuariosMinimal;


