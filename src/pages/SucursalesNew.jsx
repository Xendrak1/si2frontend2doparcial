import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Loading from "../components/ui/Loading";
import {
  getSucursales,
  createSucursal,
  updateSucursal,
  deleteSucursal,
} from "../api";

const SucursalesNew = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
  });

  useEffect(() => {
    fetchSucursales();
  }, []);

  const fetchSucursales = async () => {
    try {
      setLoading(true);
      const data = await getSucursales();
      setSucursales(data);
    } catch (error) {
      showAlert("error", "Error al cargar las sucursales");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenModal = (sucursal = null) => {
    if (sucursal) {
      setEditingSucursal(sucursal);
      setFormData({
        nombre: sucursal.nombre,
        ubicacion: sucursal.ubicacion || "",
      });
    } else {
      setEditingSucursal(null);
      setFormData({ nombre: "", ubicacion: "" });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSucursal(null);
    setFormData({ nombre: "", ubicacion: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSucursal) {
        await updateSucursal(editingSucursal.id, formData);
        showAlert("success", "Sucursal actualizada exitosamente");
      } else {
        await createSucursal(formData);
        showAlert("success", "Sucursal creada exitosamente");
      }
      fetchSucursales();
      handleCloseModal();
    } catch (error) {
      showAlert("error", "Error al guardar la sucursal");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta sucursal?")) {
      try {
        await deleteSucursal(id);
        showAlert("success", "Sucursal eliminada exitosamente");
        fetchSucursales();
      } catch (error) {
        showAlert("error", "Error al eliminar la sucursal");
      }
    }
  };

  const filteredSucursales = sucursales.filter((sucursal) =>
    sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "ID", field: "id" },
    { header: "Nombre", field: "nombre" },
    { header: "Ubicación", field: "ubicacion" },
  ];

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-2xl border border-orange-100">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent flex items-center gap-3">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Sucursales
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Administra las sucursales de tu negocio
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            variant="primary"
            size="lg"
            className="shadow-xl transform hover:scale-105"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Nueva Sucursal
          </Button>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <Card>
          <div className="mb-4">
            <Input
              placeholder="Buscar sucursales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          <Table
            columns={columns}
            data={filteredSucursales}
            actions={(row) => (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenModal(row)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(row.id)}
                >
                  Eliminar
                </Button>
              </>
            )}
          />
        </Card>

        <Modal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          title={editingSucursal ? "Editar Sucursal" : "Nueva Sucursal"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              required
            />

            <Input
              label="Ubicación"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={(e) =>
                setFormData({ ...formData, ubicacion: e.target.value })
              }
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingSucursal ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default SucursalesNew;

