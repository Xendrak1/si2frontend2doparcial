import { useState, useEffect } from "react";
import LayoutMinimal from "../components/layout/LayoutMinimal";
import { getStocks, createStock, updateStock, deleteStock, getProductoVariantes, getSucursales } from "../api";

// Stocks - Blanco y Negro
const StocksMinimal = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [productoVariantes, setProductoVariantes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productoSearch, setProductoSearch] = useState('');
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [showProductoDropdown, setShowProductoDropdown] = useState(false);
  const [formData, setFormData] = useState({
    producto_variante: '',
    producto_nombre: '',
    sucursal: '',
    cantidad: 0 // Puede ser 0 o string vacío temporalmente
  });
  const [isSelectingText, setIsSelectingText] = useState(false);

  useEffect(() => {
    fetchStocks();
    fetchProductoVariantes();
    fetchSucursales();
  }, []);

  // Filtrar productos cuando el usuario escribe
  useEffect(() => {
    if (productoSearch.trim() === '') {
      setFilteredProductos([]);
      setShowProductoDropdown(false);
      return;
    }
    
    const filtered = productoVariantes.filter((pv) => {
      const searchLower = productoSearch.toLowerCase();
      const nombre = (pv.producto_nombre || '').toLowerCase();
      const codigo = (pv.codigo || '').toLowerCase();
      const talla = (pv.talla || '').toLowerCase();
      const color = (pv.color || '').toLowerCase();
      
      return nombre.includes(searchLower) || 
             codigo.includes(searchLower) || 
             talla.includes(searchLower) || 
             color.includes(searchLower);
    });
    
    setFilteredProductos(filtered);
    setShowProductoDropdown(filtered.length > 0);
  }, [productoSearch, productoVariantes]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProductoDropdown && !e.target.closest('.producto-search-container')) {
        setShowProductoDropdown(false);
      }
    };
    
    if (showProductoDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProductoDropdown]);

  const fetchStocks = async () => {
    try {
      const data = await getStocks();
      setStocks(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductoVariantes = async () => {
    try {
      const data = await getProductoVariantes();
      setProductoVariantes(data);
    } catch (error) {
      console.error("Error cargando variantes:", error);
    }
  };

  const fetchSucursales = async () => {
    try {
      const data = await getSucursales();
      setSucursales(data);
    } catch (error) {
      console.error("Error cargando sucursales:", error);
    }
  };

  const handleOpenModal = (stock = null) => {
    if (stock) {
      setEditingStock(stock);
      const pv = productoVariantes.find(p => p.id === (stock.producto_variante || stock.producto_variante_id));
      // Asegurar que usamos el ID de sucursal, no el nombre
      const sucursalId = stock.sucursal_id || stock.sucursal || '';
      setFormData({
        producto_variante: stock.producto_variante || stock.producto_variante_id || '',
        producto_nombre: pv ? `${pv.producto_nombre || 'Producto'} - ${pv.codigo} ${pv.talla ? `(${pv.talla})` : ''} ${pv.color ? `- ${pv.color}` : ''}` : '',
        sucursal: sucursalId.toString(),
        cantidad: stock.cantidad || 0
      });
      setProductoSearch(pv ? `${pv.producto_nombre || 'Producto'} - ${pv.codigo} ${pv.talla ? `(${pv.talla})` : ''} ${pv.color ? `- ${pv.color}` : ''}` : '');
    } else {
      setEditingStock(null);
      setFormData({
        producto_variante: '',
        producto_nombre: '',
        sucursal: '',
        cantidad: 0
      });
      setProductoSearch('');
    }
    setShowProductoDropdown(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStock(null);
    setFormData({
      producto_variante: '',
      producto_nombre: '',
      sucursal: '',
      cantidad: 0
    });
    setProductoSearch('');
    setShowProductoDropdown(false);
  };

  const handleSelectProducto = (pv) => {
    setFormData({
      ...formData,
      producto_variante: pv.id,
      producto_nombre: `${pv.producto_nombre || 'Producto'} - ${pv.codigo} ${pv.talla ? `(${pv.talla})` : ''} ${pv.color ? `- ${pv.color}` : ''}`
    });
    setProductoSearch(`${pv.producto_nombre || 'Producto'} - ${pv.codigo} ${pv.talla ? `(${pv.talla})` : ''} ${pv.color ? `- ${pv.color}` : ''}`);
    setShowProductoDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un producto
    if (!formData.producto_variante) {
      alert("Por favor, selecciona un producto de la lista.");
      return;
    }
    
    // Validar que la sucursal sea un número válido
    const sucursalId = parseInt(formData.sucursal);
    if (isNaN(sucursalId) || sucursalId <= 0) {
      alert("Por favor, ingresa un ID de sucursal válido (número).");
      return;
    }
    
    // Validar cantidad
    const cantidad = typeof formData.cantidad === 'string' && formData.cantidad === '' 
      ? 0 
      : parseInt(formData.cantidad) || 0;
    
    try {
      const dataToSend = {
        producto_variante: parseInt(formData.producto_variante),
        sucursal: sucursalId,
        cantidad: cantidad
      };
      
      if (editingStock) {
        await updateStock(editingStock.id, dataToSend);
      } else {
        await createStock(dataToSend);
      }
      await fetchStocks();
      handleCloseModal();
    } catch (error) {
      console.error("Error guardando stock:", error);
      alert("Error al guardar el stock. Verifica los datos.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro de stock?")) {
      return;
    }
    try {
      await deleteStock(id);
      await fetchStocks();
    } catch (error) {
      console.error("Error eliminando stock:", error);
      alert("Error al eliminar el stock.");
    }
  };

  if (loading) {
    return (
      <LayoutMinimal>
        <div className="flex h-full items-center justify-center bg-white">
          <div className="text-xl font-light text-gray-600">Cargando...</div>
        </div>
      </LayoutMinimal>
    );
  }

  const stockTotal = stocks.reduce((sum, s) => sum + (s.cantidad || 0), 0);
  const stockBajo = stocks.filter(s => s.cantidad < 10).length;

  // Ordenar stocks: primero por cantidad (descendente), luego por nombre de producto
  const sortedStocks = [...stocks].sort((a, b) => {
    // Primero por cantidad (mayor a menor)
    const cantidadDiff = (b.cantidad || 0) - (a.cantidad || 0);
    if (cantidadDiff !== 0) return cantidadDiff;
    
    // Si tienen la misma cantidad, ordenar por nombre de producto
    const nombreA = (a.producto || '').toLowerCase();
    const nombreB = (b.producto || '').toLowerCase();
    return nombreA.localeCompare(nombreB);
  });

  return (
    <LayoutMinimal>
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-12 border-b border-gray-200 bg-white">
          <h2 className="text-3xl font-light tracking-wide">Inventario</h2>
          <button
            onClick={() => handleOpenModal()}
            className="btn-accent px-6 py-2 rounded-md text-sm font-medium"
          >
            Nuevo Stock
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-12 max-w-[1600px] mx-auto">
            
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-0 bg-white border border-gray-200 mb-8">
              <div className="p-8 border-r border-gray-200">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Stock Total
                </div>
                <div className="text-5xl font-bold">{stockTotal}</div>
                <div className="text-sm text-gray-500 mt-2">Unidades totales</div>
              </div>
              <div className="p-8">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Stock Bajo
                </div>
                <div className="text-5xl font-bold">{stockBajo}</div>
                <div className="text-sm text-gray-500 mt-2">Productos con menos de 10 unidades</div>
              </div>
            </div>

            {/* Tabla */}
            <div className="bg-white border border-gray-200">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sucursal</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStocks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No hay datos de stock
                      </td>
                    </tr>
                  ) : (
                    sortedStocks.map((stock) => (
                      <tr key={stock.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium">{stock.id}</td>
                        <td className="px-6 py-4 font-semibold">{stock.producto || 'Sin nombre'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{stock.sucursal_nombre || stock.sucursal_id || 'N/A'}</td>
                        <td className="px-6 py-4 font-bold text-2xl">{stock.cantidad || 0}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold ${
                            stock.cantidad < 10 
                              ? 'badge-accent'
                              : 'badge-accent-outline'
                          }`}>
                            {stock.cantidad < 10 ? 'Bajo' : stock.cantidad >= 20 ? 'OK' : 'Medio'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(stock)}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(stock.id)}
                              className="btn-accent px-3 py-1 text-sm rounded"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Modal para crear/editar stock */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center"
            onMouseDown={(e) => {
              // Detectar si el mousedown es fuera del modal
              if (e.target === e.currentTarget) {
                setIsSelectingText(false);
              }
            }}
            onMouseUp={(e) => {
              // Solo cerrar si se hizo click (no drag) fuera del modal
              if (e.target === e.currentTarget && !isSelectingText) {
                // Verificar si hay texto seleccionado
                const selection = window.getSelection();
                if (selection && selection.toString().length > 0) {
                  setIsSelectingText(true);
                  return;
                }
                handleCloseModal();
              }
            }}
            onClick={(e) => {
              // Prevenir cierre si hay texto seleccionado
              const selection = window.getSelection();
              if (selection && selection.toString().length > 0) {
                return;
              }
              // Solo cerrar si se hace clic fuera del modal
              if (e.target === e.currentTarget && !isSelectingText) {
                handleCloseModal();
              }
            }}
          >
            <div 
              className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold">
                  {editingStock ? 'Editar Stock' : 'Nuevo Stock'}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="relative producto-search-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producto
                  </label>
                  <input
                    type="text"
                    value={productoSearch}
                    onChange={(e) => {
                      setProductoSearch(e.target.value);
                      if (!e.target.value) {
                        setFormData({ ...formData, producto_variante: '', producto_nombre: '' });
                      }
                    }}
                    onFocus={() => {
                      if (productoSearch && filteredProductos.length > 0) {
                        setShowProductoDropdown(true);
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Busca por nombre, código, talla o color..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus-accent"
                    required
                  />
                  {showProductoDropdown && filteredProductos.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredProductos.map((pv) => (
                        <div
                          key={pv.id}
                          onClick={() => handleSelectProducto(pv)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{pv.producto_nombre || 'Producto'}</div>
                          <div className="text-sm text-gray-500">
                            {pv.codigo} {pv.talla ? `(${pv.talla})` : ''} {pv.color ? `- ${pv.color}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.producto_variante && (
                    <input type="hidden" value={formData.producto_variante} />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sucursal (ID o Nombre)
                  </label>
                  <input
                    type="text"
                    value={formData.sucursal}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, sucursal: value });
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      // Al perder el foco, intentar encontrar la sucursal y convertir a ID
                      const value = e.target.value.trim();
                      if (value) {
                        // Si es un número puro, validar que existe
                        if (/^\d+$/.test(value)) {
                          const sucursal = sucursales.find(s => s.id.toString() === value);
                          if (sucursal) {
                            setFormData({ ...formData, sucursal: value });
                          } else {
                            // Si no existe, mantener el valor pero mostrar advertencia
                            alert(`La sucursal con ID ${value} no existe.`);
                          }
                        } else {
                          // Buscar por nombre
                          const sucursal = sucursales.find(s => 
                            s.nombre.toLowerCase().includes(value.toLowerCase())
                          );
                          if (sucursal) {
                            setFormData({ ...formData, sucursal: sucursal.id.toString() });
                          } else {
                            // Si no se encuentra, intentar extraer ID de formato "ID - Nombre"
                            const match = value.match(/^(\d+)\s*-\s*/);
                            if (match) {
                              const sucursalById = sucursales.find(s => s.id.toString() === match[1]);
                              if (sucursalById) {
                                setFormData({ ...formData, sucursal: match[1] });
                              }
                            }
                          }
                        }
                      }
                    }}
                    placeholder="Escribe el ID (1, 2, 3) o nombre de la sucursal"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus-accent"
                    required
                  />
                  {formData.sucursal && /^\d+$/.test(formData.sucursal) && (
                    <div className="mt-1 text-xs text-gray-600">
                      {(() => {
                        const sucursal = sucursales.find(s => s.id.toString() === formData.sucursal);
                        return sucursal ? `✓ ${sucursal.nombre}` : '';
                      })()}
                    </div>
                  )}
                  {sucursales.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      Disponibles: {sucursales.map(s => `${s.id} - ${s.nombre}`).join(', ')}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cantidad === 0 ? '' : formData.cantidad}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Permitir campo vacío temporalmente, convertir a número solo si hay valor
                      if (value === '') {
                        setFormData({ ...formData, cantidad: '' });
                      } else {
                        const numValue = parseInt(value);
                        if (!isNaN(numValue) && numValue >= 0) {
                          setFormData({ ...formData, cantidad: numValue });
                        }
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      // Al perder el foco, si está vacío, poner 0
                      if (e.target.value === '') {
                        setFormData({ ...formData, cantidad: 0 });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus-accent"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-accent px-4 py-2 rounded-md"
                  >
                    {editingStock ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </LayoutMinimal>
  );
};

export default StocksMinimal;

