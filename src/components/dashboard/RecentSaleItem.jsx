// Item de venta reciente
const RecentSaleItem = ({ id, date, total, status }) => {
  const statusConfig = {
    completado: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      label: "Completado"
    },
    pendiente: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      label: "Pendiente"
    },
    cancelado: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      label: "Cancelado"
    }
  };

  const config = statusConfig[status] || statusConfig.pendiente;

  return (
    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
      <div>
        <p className="font-semibold text-gray-900 mb-1">
          Venta #{id}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-lg text-gray-900 mb-1">
          Bs. {parseFloat(total || 0).toFixed(2)}
        </p>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
};

export default RecentSaleItem;

