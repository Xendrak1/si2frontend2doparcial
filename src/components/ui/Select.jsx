const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  disabled = false,
  placeholder = "Seleccionar...",
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
          error
            ? "border-red-500"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;

