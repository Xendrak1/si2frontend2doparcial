import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[380px] max-w-[90vw] bg-white border-l border-gray-200 shadow-strong transform transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Carrito"
      >
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
          <h3 className="text-lg font-semibold">Carrito</h3>
          <button className="text-xl" onClick={onClose}>×</button>
        </div>
        <div className="h-[calc(100%-160px)] overflow-auto p-4">
          {items.length === 0 ? (
            <div className="text-gray-600">Tu carrito está vacío.</div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.productId} className="border border-gray-200 p-3 rounded-lg">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {it.imagen ? (
                        <img src={it.imagen} alt={it.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1 truncate">{it.nombre}</div>
                      <div className="text-sm text-gray-600 mb-3">{formatCurrency(it.precio)} c/u</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newQty = it.quantity - 1;
                            if (newQty <= 0) {
                              removeItem(it.productId);
                            } else {
                              updateQuantity(it.productId, newQty);
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition font-semibold text-lg"
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-semibold">{it.quantity}</span>
                        <button
                          onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition font-semibold text-lg"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                        <button
                          className="ml-auto px-3 py-1 text-xs btn-accent-outline"
                          onClick={() => removeItem(it.productId)}
                          aria-label="Eliminar producto"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="h-auto border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span>Total</span>
            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
          </div>
          {items.length === 0 && (
            <div className="mb-3 text-sm text-red-600 font-medium">
              El carrito está vacío. Agrega productos para continuar.
            </div>
          )}
          <button
            className={`w-full py-2 transition ${
              items.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "btn-accent"
            }`}
            onClick={() => {
              if (items.length === 0) {
                return;
              }
              onClose();
              navigate("/checkout");
            }}
            disabled={items.length === 0}
          >
            {items.length === 0 ? "Carrito vacío" : "Pagar"}
          </button>
        </div>
      </aside>
    </>
  );
}


