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
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../api";

const ClientesNew = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    documento: "",
    direccion: "",
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      showAlert("error", "Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenModal = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        apellido: cliente.apellido || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        documento: cliente.documento || "",
        direccion: cliente.direccion || "",
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        documento: "",
        direccion: "",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCliente(null);
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      documento: "",
      direccion: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData);
        showAlert("success", "Cliente actualizado exitosamente");
      } else {
        await createCliente(formData);
        showAlert("success", "Cliente creado exitosamente");
      }
      fetchClientes();
      handleCloseModal();
    } catch (error) {
      showAlert("error", "Error al guardar el cliente");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      try {
        await deleteCliente(id);
        showAlert("success", "Cliente eliminado exitosamente");
        fetchClientes();
      } catch (error) {
        showAlert("error", "Error al eliminar el cliente");
      }
    }
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.apellido &&
        cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { header: "ID", field: "id" },
    {
      header: "Nombre Completo",
      render: (row) => `${row.nombre} ${row.apellido || ""}`,
    },
    { header: "Email", field: "email" },
    { header: "Teléfono", field: "telefono" },
    { header: "Documento", field: "documento" },
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 rounded-2xl border border-blue-100">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Clientes
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona tu base completa de clientes
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
            Nuevo Cliente
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
              placeholder="Buscar clientes..."
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
            data={filteredClientes}
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
          title={editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <Input
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </div>

            <Input
              label="Documento"
              name="documento"
              value={formData.documento}
              onChange={(e) =>
                setFormData({ ...formData, documento: e.target.value })
              }
            />

            <Input
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingCliente ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ClientesNew;

