import LayoutMinimal from "../components/layout/LayoutMinimal";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/helpers";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const CarritoMinimal = () => {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showWarning } = useNotification();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showWarning("Necesitas registrarte o iniciar sesión para completar la compra.");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <LayoutMinimal>
      <header className="h-20 flex items-center justify-between px-12 border-b border-gray-200 bg-white">
        <h2 className="text-3xl font-light tracking-wide">Carrito</h2>
        {items.length > 0 && (
          <button className="px-6 py-3 btn-accent" onClick={handleCheckout}>
            Ir al pago
          </button>
        )}
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="p-12 max-w-[1200px] mx-auto">
          {items.length === 0 ? (
            <div className="text-gray-600">
              Tu carrito está vacío.{" "}
              <Link to="/tienda" className="link-accent">
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 bg-white border border-gray-200">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.productId} className="border-b border-gray-100">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-100 border border-gray-200 overflow-hidden">
                              {it.imagen ? (
                                <img src={it.imagen} className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div>
                              <div className="font-medium">{it.nombre}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => updateQuantity(it.productId, parseInt(e.target.value || "1"))}
                            className="w-20 text-right px-2 py-1 border border-gray-300 focus-accent"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">{formatCurrency(it.precio)}</td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency((it.precio || 0) * (it.quantity || 0))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="px-3 py-2 btn-accent-outline" onClick={() => removeItem(it.productId)}>
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-white border border-gray-200 p-6 h-fit">
                <div className="text-lg font-semibold mb-4">Resumen</div>
                <div className="flex items-center justify-between mb-2">
                  <span>Total</span>
                  <span className="font-bold">{formatCurrency(totalAmount)}</span>
                </div>
                <button className="w-full mt-4 px-4 py-3 btn-accent" onClick={handleCheckout}>
                  Proceder al pago
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </LayoutMinimal>
  );
};

export default CarritoMinimal;


