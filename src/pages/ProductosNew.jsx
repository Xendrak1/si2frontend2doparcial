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
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getCategorias,
} from "../api";

const ProductosNew = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    codigo_base: "",
    precio_base: "",
    estado: "activo",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productosData, categoriasData] = await Promise.all([
        getProductos(),
        getCategorias(),
      ]);
      setProductos(productosData);
      setCategorias(categoriasData);
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

  const handleOpenModal = (producto = null) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        categoria: producto.categoria,
        codigo_base: producto.codigo_base || "",
        precio_base: producto.precio_base,
        estado: producto.estado,
      });
    } else {
      setEditingProducto(null);
      setFormData({
        nombre: "",
        descripcion: "",
        categoria: "",
        codigo_base: "",
        precio_base: "",
        estado: "activo",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProducto(null);
    setFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      codigo_base: "",
      precio_base: "",
      estado: "activo",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProducto) {
        await updateProducto(editingProducto.id, formData);
        showAlert("success", "Producto actualizado exitosamente");
      } else {
        await createProducto(formData);
        showAlert("success", "Producto creado exitosamente");
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      showAlert("error", "Error al guardar el producto");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProducto(id);
        showAlert("success", "Producto eliminado exitosamente");
        fetchData();
      } catch (error) {
        showAlert("error", "Error al eliminar el producto");
      }
    }
  };

  const getCategoriaName = (categoriaId) => {
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria ? categoria.nombre : "Sin categoría";
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "ID", field: "id" },
    { header: "Nombre", field: "nombre" },
    {
      header: "Categoría",
      field: "categoria",
      render: (row) => (
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
          {getCategoriaName(row.categoria)}
        </span>
      ),
    },
    { header: "Código", field: "codigo_base" },
    {
      header: "Precio Base",
      field: "precio_base",
      render: (row) => `Bs. ${parseFloat(row.precio_base).toFixed(2)}`,
    },
    {
      header: "Estado",
      field: "estado",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.estado === "activo"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.estado}
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
        {/* Header Mejorado */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona tu catálogo completo de productos
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
            Nuevo Producto
          </Button>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Search & Table */}
        <Card>
          <div className="mb-4">
            <Input
              placeholder="Buscar productos..."
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
            data={filteredProductos}
            actions={(row) => (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenModal(row)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(row.id)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  Eliminar
                </Button>
              </>
            )}
          />
        </Card>

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          title={editingProducto ? "Editar Producto" : "Nuevo Producto"}
          size="md"
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

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Categoría"
                name="categoria"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                options={categorias.map((cat) => ({
                  value: cat.id,
                  label: cat.nombre,
                }))}
                required
              />

              <Input
                label="Código Base"
                name="codigo_base"
                value={formData.codigo_base}
                onChange={(e) =>
                  setFormData({ ...formData, codigo_base: e.target.value })
                }
              />
            </div>

            <Input
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Precio Base"
                name="precio_base"
                type="number"
                step="0.01"
                value={formData.precio_base}
                onChange={(e) =>
                  setFormData({ ...formData, precio_base: e.target.value })
                }
                required
              />

              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                options={[
                  { value: "activo", label: "Activo" },
                  { value: "inactivo", label: "Inactivo" },
                ]}
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingProducto ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ProductosNew;

