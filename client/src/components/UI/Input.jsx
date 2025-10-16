import React from "react";

const Input = ({
  label,
  error,
  className = "",
  type = "text",
  required = false,
  ...props
}) => {
  const inputClasses = `
    block w-full px-3 py-2 border rounded-lg shadow-sm
    focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-[#EA1A62] 
    ${
      error
        ? "border-red-300 text-red-900 placeholder-red-300"
        : "border-gray-300 placeholder-gray-400"
    }
    disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
    read-only:bg-gray-100 read-only:text-gray-600 read-only:border-gray-200
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
