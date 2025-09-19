import React from 'react';

const Textarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  rows = 4,
  className = "",
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
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA1A62] focus:border-transparent resize-vertical ${className}`}
        {...props}
      />
    </div>
  );
};

export default Textarea;