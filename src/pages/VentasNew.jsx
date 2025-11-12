import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import Loading from "../components/ui/Loading";
import {
  getVentas,
  createVenta,
  updateVenta,
  deleteVenta,
  getClientes,
  getSucursales,
} from "../api";

const VentasNew = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenta, setEditingVenta] = useState(null);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    cliente: "",
    sucursal: "",
    total: "",
    tipo_pago: "contado",
    canal_venta: "tienda",
    estado: "pendiente",
    estado_pago: "pendiente",
    fecha: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ventasData, clientesData, sucursalesData] = await Promise.all([
        getVentas(),
        getClientes(),
        getSucursales(),
      ]);
      setVentas(ventasData);
      setClientes(clientesData);
      setSucursales(sucursalesData);
    } catch (error) {
      showAlert("error", "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenModal = (venta = null) => {
    if (venta) {
      setEditingVenta(venta);
      setFormData({
        cliente: venta.cliente,
        sucursal: venta.sucursal,
        total: venta.total,
        tipo_pago: venta.tipo_pago,
        canal_venta: venta.canal_venta || "tienda",
        estado: venta.estado,
        estado_pago: venta.estado_pago,
        fecha: venta.fecha.split("T")[0],
      });
    } else {
      setEditingVenta(null);
      setFormData({
        cliente: "",
        sucursal: "",
        total: "",
        tipo_pago: "contado",
        canal_venta: "tienda",
        estado: "pendiente",
        estado_pago: "pendiente",
        fecha: new Date().toISOString().split("T")[0],
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingVenta(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        fecha: formData.fecha + "T00:00:00Z",
      };

      if (editingVenta) {
        await updateVenta(editingVenta.id, dataToSend);
        showAlert("success", "Venta actualizada exitosamente");
      } else {
        await createVenta(dataToSend);
        showAlert("success", "Venta creada exitosamente");
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      showAlert("error", "Error al guardar la venta");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta venta?")) {
      try {
        await deleteVenta(id);
        showAlert("success", "Venta eliminada exitosamente");
        fetchData();
      } catch (error) {
        showAlert("error", "Error al eliminar la venta");
      }
    }
  };

  const getClienteName = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido || ""}` : "N/A";
  };

  const getSucursalName = (sucursalId) => {
    const sucursal = sucursales.find((s) => s.id === sucursalId);
    return sucursal ? sucursal.nombre : "N/A";
  };

  const columns = [
    { header: "ID", field: "id" },
    {
      header: "Cliente",
      render: (row) => getClienteName(row.cliente),
    },
    {
      header: "Sucursal",
      render: (row) => getSucursalName(row.sucursal),
    },
    {
      header: "Total",
      render: (row) => `Bs. ${parseFloat(row.total).toFixed(2)}`,
    },
    {
      header: "Tipo Pago",
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {row.tipo_pago}
        </span>
      ),
    },
    {
      header: "Estado",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.estado === "completado"
              ? "bg-green-100 text-green-800"
              : row.estado === "pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.estado}
        </span>
      ),
    },
    {
      header: "Fecha",
      render: (row) => new Date(row.fecha).toLocaleDateString(),
    },
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl border border-green-100">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Ventas
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona todas las ventas del negocio
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
            Nueva Venta
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
          <Table
            columns={columns}
            data={ventas}
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
          title={editingVenta ? "Editar Venta" : "Nueva Venta"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Cliente"
                name="cliente"
                value={formData.cliente}
                onChange={(e) =>
                  setFormData({ ...formData, cliente: e.target.value })
                }
                options={clientes.map((cliente) => ({
                  value: cliente.id,
                  label: `${cliente.nombre} ${cliente.apellido || ""}`,
                }))}
                required
              />

              <Select
                label="Sucursal"
                name="sucursal"
                value={formData.sucursal}
                onChange={(e) =>
                  setFormData({ ...formData, sucursal: e.target.value })
                }
                options={sucursales.map((sucursal) => ({
                  value: sucursal.id,
                  label: sucursal.nombre,
                }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total"
                name="total"
                type="number"
                step="0.01"
                value={formData.total}
                onChange={(e) =>
                  setFormData({ ...formData, total: e.target.value })
                }
                required
              />

              <Input
                label="Fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Tipo de Pago"
                name="tipo_pago"
                value={formData.tipo_pago}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_pago: e.target.value })
                }
                options={[
                  { value: "contado", label: "Contado" },
                  { value: "credito", label: "Crédito" },
                ]}
                required
              />

              <Select
                label="Canal de Venta"
                name="canal_venta"
                value={formData.canal_venta}
                onChange={(e) =>
                  setFormData({ ...formData, canal_venta: e.target.value })
                }
                options={[
                  { value: "tienda", label: "Tienda" },
                  { value: "online", label: "Online" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                options={[
                  { value: "pendiente", label: "Pendiente" },
                  { value: "completado", label: "Completado" },
                  { value: "cancelado", label: "Cancelado" },
                ]}
                required
              />

              <Select
                label="Estado de Pago"
                name="estado_pago"
                value={formData.estado_pago}
                onChange={(e) =>
                  setFormData({ ...formData, estado_pago: e.target.value })
                }
                options={[
                  { value: "pendiente", label: "Pendiente" },
                  { value: "pagado", label: "Pagado" },
                  { value: "parcial", label: "Parcial" },
                ]}
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingVenta ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default VentasNew;

