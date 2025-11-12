// Botón de acción rápida
const QuickAction = ({ title, description, icon, onClick, color = "primary" }) => {
  const colorClasses = {
    primary: "from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",
    blue: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
    green: "from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600",
    purple: "from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600",
  };

  return (
    <button
      onClick={onClick}
      className="group w-full text-left p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
};

export default QuickAction;

