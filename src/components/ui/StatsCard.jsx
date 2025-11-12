const StatsCard = ({ title, value, icon, trend, trendValue, color = "indigo" }) => {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  const bgColorClasses = {
    indigo: "from-indigo-50 to-indigo-100",
    green: "from-green-50 to-green-100",
    blue: "from-blue-50 to-blue-100",
    purple: "from-purple-50 to-purple-100",
    orange: "from-orange-50 to-orange-100",
    red: "from-red-50 to-red-100",
  };

  return (
    <div className={`bg-gradient-to-br ${bgColorClasses[color]} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50`}>
      <div className="p-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              {title}
            </p>
            <p className="mt-3 text-4xl font-black text-gray-900">{value}</p>
            
            {trend && (
              <div className="mt-3 flex items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    trend === "up" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {trend === "up" ? "↑" : "↓"} {trendValue}
                </span>
                <span className="text-xs text-gray-600 ml-2 font-medium">vs mes anterior</span>
              </div>
            )}
          </div>
          
          <div
            className={`p-5 bg-gradient-to-br ${colorClasses[color]} rounded-2xl shadow-xl transform transition-transform hover:rotate-6`}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

