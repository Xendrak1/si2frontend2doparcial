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
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../api";

const CategoriasNew = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [alert, setAlert] = useState(null);
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
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      showAlert("error", "Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenModal = (categoria = null) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || "",
      });
    } else {
      setEditingCategoria(null);
      setFormData({ nombre: "", descripcion: "" });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategoria(null);
    setFormData({ nombre: "", descripcion: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, formData);
        showAlert("success", "Categoría actualizada exitosamente");
      } else {
        await createCategoria(formData);
        showAlert("success", "Categoría creada exitosamente");
      }
      fetchCategorias();
      handleCloseModal();
    } catch (error) {
      showAlert("error", "Error al guardar la categoría");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        await deleteCategoria(id);
        showAlert("success", "Categoría eliminada exitosamente");
        fetchCategorias();
      } catch (error) {
        showAlert("error", "Error al eliminar la categoría");
      }
    }
  };

  const filteredCategorias = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "ID", field: "id" },
    { header: "Nombre", field: "nombre" },
    { header: "Descripción", field: "descripcion" },
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 rounded-2xl border border-purple-100">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Categorías
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Organiza tus productos por categorías
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
            Nueva Categoría
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
              placeholder="Buscar categorías..."
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
            data={filteredCategorias}
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
          title={editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
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
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingCategoria ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CategoriasNew;

