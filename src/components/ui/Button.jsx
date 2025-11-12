const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  icon,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md hover:shadow-lg",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg",
    warning:
      "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 shadow-md hover:shadow-lg",
    outline:
      "bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;

