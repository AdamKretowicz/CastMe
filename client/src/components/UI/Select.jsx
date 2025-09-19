// src/components/UI/Select.jsx

import React from 'react';

const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  required = false,
  className = "",
  placeholder = "Wybierz opcję...",
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-[#2b2628] mb-2">
          {label}
          {required && <span className="text-[#EA1A62] ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-transparent bg-white ${className}`}
        {...props}
      >
        {!required && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;