// Tarjeta de métricas del dashboard
const MetricCard = ({ title, value, trend, trendValue, icon, color = "primary" }) => {
  const colorClasses = {
    primary: {
      bg: "bg-gradient-to-br from-pink-50 to-rose-50",
      icon: "bg-gradient-to-br from-pink-500 to-rose-500",
      text: "text-pink-600",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      icon: "bg-gradient-to-br from-blue-500 to-cyan-500",
      text: "text-blue-600",
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-50 to-green-50",
      icon: "bg-gradient-to-br from-emerald-500 to-green-500",
      text: "text-emerald-600",
    },
    orange: {
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      icon: "bg-gradient-to-br from-amber-500 to-orange-500",
      text: "text-amber-600",
    },
  };

  const styles = colorClasses[color] || colorClasses.primary;

  return (
    <div className={`${styles.bg} rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between">
        {/* Información principal */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            {title}
          </p>
          <p className="text-4xl font-bold text-gray-900 mb-2">
            {value}
          </p>
          
          {/* Tendencia */}
          {trend && (
            <div className="flex items-center gap-1.5">
              {trend === "up" ? (
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={`text-sm font-medium ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                {trendValue}
              </span>
              <span className="text-xs text-gray-500">vs mes anterior</span>
            </div>
          )}
        </div>

        {/* Icono */}
        <div className={`${styles.icon} p-4 rounded-xl shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;

