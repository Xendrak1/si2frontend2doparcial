import LayoutMinimal from "../components/layout/LayoutMinimal";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/helpers";
import { getQrImage } from "../utils/images";
import { onlineCheckout } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const CheckoutQR = () => {
  const { items, totalAmount, clear } = useCart();
  const navigate = useNavigate();
  const qr = getQrImage();
  const { showSuccess, showError, showWarning } = useNotification();
  const { user, isAuthenticated } = useAuth();

  const handleConfirm = async () => {
    try {
      if (items.length === 0) {
        showWarning("El carrito está vacío.");
        navigate("/tienda");
        return;
      }
      if (!isAuthenticated || !user?.email) {
        showWarning("Debes iniciar sesión para completar tu pedido.");
        navigate("/login");
        return;
      }
      const payload = {
        items: items.map((it) => ({
          producto: it.productId,
          cantidad: it.quantity,
          precio: it.precio,
        })),
        tipo_pago: "qr",
        cliente_email: user.email,
        cliente_nombre: user.name,
      };
      await onlineCheckout(payload);
      clear();
      showSuccess("Pedido registrado exitosamente. Confirma el pago desde Panel > Ventas para completar la transacción.");
      setTimeout(() => {
        navigate("/tienda");
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || "No se pudo registrar el pedido.";
      showError(errorMsg);
    }
  };

  return (
    <LayoutMinimal>
      <header className="h-20 flex items-center justify-between px-12 border-b border-gray-200 bg-white">
        <h2 className="text-3xl font-light tracking-wide">Pago por QR</h2>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="p-12 max-w-[1000px] mx-auto grid grid-cols-2 gap-12">
          <div className="bg-white border border-gray-200 p-6">
            <div className="text-lg font-semibold mb-4">Escanea el QR</div>
            <div className="aspect-square border border-gray-200 flex items-center justify-center">
              <img src={qr} alt="QR de pago" className="w-full h-full object-contain" />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Reemplaza la imagen colocando tu archivo en <code>src/assets/qr.png</code>.
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-6 h-fit">
            <div className="text-lg font-semibold mb-4">Resumen</div>
            <ul className="space-y-2 mb-4">
              {items.map((it) => (
                <li key={it.productId} className="flex items-center justify-between">
                  <span className="text-sm">{it.nombre} × {it.quantity}</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(it.precio * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <button className="w-full mt-6 px-4 py-3 btn-accent" onClick={handleConfirm}>
              He pagado
            </button>
          </div>
        </div>
      </main>
    </LayoutMinimal>
  );
};

export default CheckoutQR;


