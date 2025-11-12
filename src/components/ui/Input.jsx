const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  icon,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`block w-full px-4 py-2 ${
            icon ? "pl-10" : ""
          } border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
            error
              ? "border-red-500"
              : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;

