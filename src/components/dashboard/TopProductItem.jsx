// Item de producto más vendido
const TopProductItem = ({ rank, name, sales, stock }) => {
  const rankColors = {
    1: "from-pink-500 to-rose-500",
    2: "from-purple-500 to-indigo-500",
    3: "from-blue-500 to-cyan-500",
  };

  const gradientColor = rankColors[rank] || "from-gray-400 to-gray-500";

  return (
    <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
      {/* Número de ranking */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <span className="text-white font-bold text-lg">#{rank}</span>
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate mb-1">
          {name}
        </h4>
        <p className="text-sm text-gray-500">
          {sales} ventas
        </p>
      </div>

      {/* Estado de stock */}
      <div className="text-right">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          stock > 10 
            ? 'bg-emerald-50 text-emerald-700' 
            : stock > 5 
            ? 'bg-amber-50 text-amber-700' 
            : 'bg-rose-50 text-rose-700'
        }`}>
          Stock: {stock}
        </span>
      </div>
    </div>
  );
};

export default TopProductItem;

