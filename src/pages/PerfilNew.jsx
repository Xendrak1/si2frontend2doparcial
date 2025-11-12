import { useState } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

const PerfilNew = () => {
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");

  const [perfilData, setPerfilData] = useState({
    nombre: "Admin",
    apellido: "Administrador",
    email: "admin@boutique.com",
    telefono: "+591 12345678",
    documento: "1234567",
    direccion: "Santa Cruz, Bolivia",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handlePerfilSubmit = (e) => {
    e.preventDefault();
    showAlert("success", "Perfil actualizado exitosamente");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert("error", "Las contraseñas no coinciden");
      return;
    }
    showAlert("success", "Contraseña actualizada exitosamente");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in p-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100 shadow-sm">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi Perfil
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Configura tu información personal y preferencias
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{perfilData.nombre} {perfilData.apellido}</p>
              <p className="text-xs text-gray-500">{perfilData.email}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              A
            </div>
          </div>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "perfil"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
Información Personal
          </button>
          <button
            onClick={() => setActiveTab("seguridad")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "seguridad"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
Seguridad
          </button>
          <button
            onClick={() => setActiveTab("preferencias")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "preferencias"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
Preferencias
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "perfil" && (
              <Card title="Información Personal">
                <form onSubmit={handlePerfilSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      name="nombre"
                      value={perfilData.nombre}
                      onChange={(e) =>
                        setPerfilData({ ...perfilData, nombre: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Apellido"
                      name="apellido"
                      value={perfilData.apellido}
                      onChange={(e) =>
                        setPerfilData({ ...perfilData, apellido: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Input
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={perfilData.email}
                    onChange={(e) =>
                      setPerfilData({ ...perfilData, email: e.target.value })
                    }
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Teléfono"
                      name="telefono"
                      value={perfilData.telefono}
                      onChange={(e) =>
                        setPerfilData({ ...perfilData, telefono: e.target.value })
                      }
                    />
                    <Input
                      label="Documento"
                      name="documento"
                      value={perfilData.documento}
                      onChange={(e) =>
                        setPerfilData({ ...perfilData, documento: e.target.value })
                      }
                    />
                  </div>

                  <Input
                    label="Dirección"
                    name="direccion"
                    value={perfilData.direccion}
                    onChange={(e) =>
                      setPerfilData({ ...perfilData, direccion: e.target.value })
                    }
                  />

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="submit" variant="primary">
  Guardar Cambios
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === "seguridad" && (
              <Card title="Cambiar Contraseña">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <Input
                    label="Contraseña Actual"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />

                  <Input
                    label="Nueva Contraseña"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />

                  <Input
                    label="Confirmar Nueva Contraseña"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Requisitos de la contraseña:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Mínimo 8 caracteres</li>
                          <li>Al menos una letra mayúscula</li>
                          <li>Al menos un número</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="submit" variant="primary">
  Actualizar Contraseña
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === "preferencias" && (
              <Card title="Preferencias del Sistema">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Notificaciones por Email</p>
                      <p className="text-sm text-gray-500">Recibe alertas importantes en tu correo</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Modo Oscuro</p>
                      <p className="text-sm text-gray-500">Activa el tema oscuro</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Sonidos del Sistema</p>
                      <p className="text-sm text-gray-500">Reproducir sonidos en acciones</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block font-medium text-gray-900 mb-2">Idioma</label>
                    <select className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                      <option>Español</option>
                      <option>English</option>
                      <option>Português</option>
                    </select>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button variant="primary">
  Guardar Preferencias
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card title="Acceso Rápido">
              <div className="space-y-3">
                <button className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors border border-indigo-200">
                  <p className="font-medium text-indigo-900">Ver Actividad</p>
                  <p className="text-xs text-indigo-600">Últimas acciones</p>
                </button>
                <button className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors border border-green-200">
                  <p className="font-medium text-green-900">Exportar Datos</p>
                  <p className="text-xs text-green-600">Descargar información</p>
                </button>
                <button className="w-full p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors border border-orange-200">
                  <p className="font-medium text-orange-900">Sincronizar</p>
                  <p className="text-xs text-orange-600">Actualizar datos</p>
                </button>
              </div>
            </Card>

            <Card title="Estadísticas">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sesiones Activas</span>
                  <span className="font-semibold text-indigo-600">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Último Acceso</span>
                  <span className="font-semibold text-gray-900">Hoy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cuenta Creada</span>
                  <span className="font-semibold text-gray-900">Ene 2025</span>
                </div>
              </div>
            </Card>

            <Card title="Zona de Peligro">
              <div className="space-y-3">
                <button className="w-full p-3 bg-red-50 hover:bg-red-100 rounded-lg text-left transition-colors border-2 border-red-200">
                  <p className="font-medium text-red-900">Cerrar Sesión</p>
                  <p className="text-xs text-red-600">Salir del sistema</p>
                </button>
                <button className="w-full p-3 bg-red-100 hover:bg-red-200 rounded-lg text-left transition-colors border-2 border-red-300">
                  <p className="font-medium text-red-900">Eliminar Cuenta</p>
                  <p className="text-xs text-red-600">Acción permanente</p>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PerfilNew;

