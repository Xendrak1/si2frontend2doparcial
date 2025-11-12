// Tarjeta de estado de pedidos
const OrderStatusCard = ({ icon, title, description, count, color = "yellow" }) => {
  const colorConfig = {
    yellow: {
      bg: "bg-amber-50",
      iconBg: "bg-amber-500",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    blue: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    green: {
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      border: "border-emerald-200",
      text: "text-emerald-700",
    },
  };

  const styles = colorConfig[color] || colorConfig.yellow;

  return (
    <div className={`flex items-center justify-between p-6 ${styles.bg} rounded-xl border-2 ${styles.border} hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center gap-4">
        {/* Icono */}
        <div className={`w-12 h-12 ${styles.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
          {icon}
        </div>
        
        {/* Información */}
        <div>
          <p className="font-semibold text-gray-900 mb-0.5">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      {/* Contador */}
      <span className={`text-3xl font-bold ${styles.text}`}>
        {count}
      </span>
    </div>
  );
};

export default OrderStatusCard;

