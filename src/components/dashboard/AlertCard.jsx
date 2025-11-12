// Tarjeta de alerta
const AlertCard = ({ icon, title, description, type = "warning" }) => {
  const typeConfig = {
    error: {
      bg: "from-rose-50 to-red-50",
      iconBg: "bg-rose-500",
      border: "border-rose-200",
      title: "text-rose-900",
      description: "text-rose-700",
    },
    warning: {
      bg: "from-amber-50 to-yellow-50",
      iconBg: "bg-amber-500",
      border: "border-amber-200",
      title: "text-amber-900",
      description: "text-amber-700",
    },
    success: {
      bg: "from-emerald-50 to-green-50",
      iconBg: "bg-emerald-500",
      border: "border-emerald-200",
      title: "text-emerald-900",
      description: "text-emerald-700",
    },
  };

  const styles = typeConfig[type] || typeConfig.warning;

  return (
    <div className={`flex items-start gap-4 p-5 bg-gradient-to-r ${styles.bg} rounded-xl border-2 ${styles.border} hover:shadow-md transition-all duration-200`}>
      {/* Icono */}
      <div className={`w-11 h-11 ${styles.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
        {icon}
      </div>

      {/* Contenido */}
      <div className="flex-1">
        <h4 className={`font-semibold ${styles.title} mb-1`}>
          {title}
        </h4>
        <p className={`text-sm ${styles.description}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default AlertCard;

