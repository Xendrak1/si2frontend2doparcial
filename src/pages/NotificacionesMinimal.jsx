import { useState } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { sendGlobalNotification } from "../api";
import { useNotification } from "../context/NotificationContext";

const rolesOptions = [
  { value: "cliente", label: "Clientes" },
  { value: "vendedor", label: "Vendedores" },
  { value: "admin", label: "Administradores" },
];

const NotificacionesMinimal = () => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [roles, setRoles] = useState([]);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  const toggleRol = (value) => {
    setRoles((prev) => {
      if (prev.includes(value)) {
        return prev.filter((r) => r !== value);
      }
      return [...prev, value];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!titulo.trim() || !mensaje.trim()) {
      const detail = "Completa título y mensaje para enviar la notificación.";
      setError(detail);
      showWarning(detail);
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
    };

    if (roles.length > 0) {
      payload.roles = roles;
    }

    const dataPayload = {};
    if (link.trim()) {
      dataPayload.url = link.trim();
    }
    if (Object.keys(dataPayload).length > 0) {
      payload.data = dataPayload;
    }

    setLoading(true);
    try {
      const resp = await sendGlobalNotification(payload);
      setResultado(resp);
      if (resp.ok) {
        showSuccess(`Notificación enviada a ${resp.sent} usuarios.`);
      } else {
        const detail = resp.detail || "No se encontraron destinatarios con tokens registrados.";
        showInfo(detail);
      }
    } catch (err) {
      const detail = err?.response?.data?.detail || "No se pudo enviar la notificación.";
      setResultado(null);
      setError(detail);
      showError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutMinimal>
      <header className="h-20 flex items-center justify-between px-12 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-3xl font-light tracking-wide">Notificaciones</h2>
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-1">
            Envío global de avisos push a dispositivos registrados
          </p>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-12 space-y-10">
          <section className="bg-white border border-gray-200 p-8">
            <h3 className="text-lg font-semibold mb-6 tracking-wide uppercase text-gray-800">
              Componer notificación
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <label className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Título
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="mt-2 w-full px-4 py-2 border border-gray-300 focus-accent"
                    placeholder="Ej. Promoción exclusiva de invierno"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Mensaje
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 focus-accent min-h-[120px]"
                    placeholder="Comparte los detalles clave que verán los usuarios en la notificación."
                  />
                </label>
              </div>

              <div className="grid gap-4">
                <span className="text-xs uppercase tracking-[0.3em] text-gray-500">Destinatarios</span>
                <div className="flex flex-wrap gap-3">
                  {rolesOptions.map((rol) => (
                    <label
                      key={rol.value}
                      className={`px-4 py-2 border text-sm cursor-pointer transition ${roles.includes(rol.value) ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={roles.includes(rol.value)}
                        onChange={() => toggleRol(rol.value)}
                      />
                      {rol.label}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Si no seleccionas ningún rol, la notificación se enviará a <strong>todos los usuarios con token activo</strong>.
                </p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Enlace opcional
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="mt-2 w-full px-4 py-2 border border-gray-300 focus-accent"
                    placeholder="https://tutienda.com/promos"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  El enlace se envía como dato adicional y puede usarse desde la app móvil para abrir una sección específica.
                </p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 btn-accent font-medium"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar notificación"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitulo("");
                    setMensaje("");
                    setRoles([]);
                    setLink("");
                    setResultado(null);
                    setError("");
                  }}
                  className="px-6 py-3 btn-accent-outline text-sm"
                  disabled={loading}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </section>

          {resultado && (
            <section className="bg-white border border-gray-200 p-8">
              <h3 className="text-lg font-semibold mb-4 tracking-wide uppercase text-gray-800">
                Resumen del último envío
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Destinatarios</p>
                  <p className="text-3xl font-light mt-2">{resultado.total}</p>
                </div>
                <div className="border border-gray-200 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Enviados</p>
                  <p className="text-3xl font-light mt-2 text-green-600">{resultado.sent}</p>
                </div>
                <div className="border border-gray-200 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Fallidos</p>
                  <p className="text-3xl font-light mt-2 text-red-500">{resultado.failed}</p>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-600">
                <p>
                  Roles aplicados:{" "}
                  <span className="font-medium">
                    {(resultado.roles && resultado.roles.length > 0 ? resultado.roles : ["todos"]).join(", ")}
                  </span>
                </p>
                {resultado.detail && (
                  <p className="mt-2 text-xs text-gray-500">{resultado.detail}</p>
                )}
              </div>
            </section>
          )}

          <section className="bg-white border border-gray-200 p-8">
            <h3 className="text-lg font-semibold mb-4 tracking-wide uppercase text-gray-800">
              Consideraciones
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Solo los dispositivos que hayan enviado su token FCM recibirán las notificaciones.</li>
              <li>• Los clientes registrados desde el login aparecerán con rol cliente y también pueden recibir avisos.</li>
              <li>• Usa mensajes breves y claros; el título se mostrará en grande en el dispositivo.</li>
              <li>• Para segmentar, selecciona uno o varios roles. Si no marcas ninguno, el envío es global.</li>
            </ul>
          </section>
        </div>
      </main>
    </LayoutMinimal>
  );
};

export default NotificacionesMinimal;



