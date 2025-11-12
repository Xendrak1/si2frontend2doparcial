// Tarjeta estilo minimalista
const Card = ({ children, className = "", title, action }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;

