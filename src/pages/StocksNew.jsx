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
  getStocks,
  createStock,
  updateStock,
  deleteStock,
  getProductoVariantes,
  getSucursales,
} from "../api";

const StocksNew = () => {
  const [stocks, setStocks] = useState([]);
  const [productoVariantes, setProductoVariantes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    producto_variante: "",
    sucursal: "",
    cantidad: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stocksData, variantesData, sucursalesData] = await Promise.all([
        getStocks(),
        getProductoVariantes(),
        getSucursales(),
      ]);
      setStocks(stocksData);
      setProductoVariantes(variantesData);
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

  const handleOpenModal = (stock = null) => {
    if (stock) {
      setEditingStock(stock);
      setFormData({
        producto_variante: stock.producto_variante,
        sucursal: stock.sucursal,
        cantidad: stock.cantidad,
      });
    } else {
      setEditingStock(null);
      setFormData({
        producto_variante: "",
        sucursal: "",
        cantidad: 0,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingStock(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStock) {
        await updateStock(editingStock.id, formData);
        showAlert("success", "Stock actualizado exitosamente");
      } else {
        await createStock(formData);
        showAlert("success", "Stock creado exitosamente");
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      showAlert("error", "Error al guardar el stock");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro de stock?")) {
      try {
        await deleteStock(id);
        showAlert("success", "Stock eliminado exitosamente");
        fetchData();
      } catch (error) {
        showAlert("error", "Error al eliminar el stock");
      }
    }
  };

  const getVarianteName = (varianteId) => {
    const variante = productoVariantes.find((v) => v.id === varianteId);
    return variante ? variante.codigo : "N/A";
  };

  const getSucursalName = (sucursalId) => {
    const sucursal = sucursales.find((s) => s.id === sucursalId);
    return sucursal ? sucursal.nombre : "N/A";
  };

  const columns = [
    { header: "ID", field: "id" },
    {
      header: "Producto Variante",
      render: (row) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          {getVarianteName(row.producto_variante)}
        </span>
      ),
    },
    {
      header: "Sucursal",
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {getSucursalName(row.sucursal)}
        </span>
      ),
    },
    {
      header: "Cantidad",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            row.cantidad > 50
              ? "bg-green-100 text-green-800"
              : row.cantidad > 10
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.cantidad}
        </span>
      ),
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 rounded-2xl border border-red-100">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Stock
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Control de inventario por sucursal
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
            Nuevo Stock
          </Button>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Total Items</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {stocks.reduce((sum, s) => sum + (s.cantidad || 0), 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Stock Bajo</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stocks.filter((s) => s.cantidad < 10).length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Sucursales</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {sucursales.length}
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <Table
            columns={columns}
            data={stocks}
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
          title={editingStock ? "Editar Stock" : "Nuevo Stock"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Producto Variante"
              name="producto_variante"
              value={formData.producto_variante}
              onChange={(e) =>
                setFormData({ ...formData, producto_variante: e.target.value })
              }
              options={productoVariantes.map((variante) => ({
                value: variante.id,
                label: variante.codigo,
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

            <Input
              label="Cantidad"
              name="cantidad"
              type="number"
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: parseInt(e.target.value) })
              }
              required
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingStock ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default StocksNew;

