import React from "react";

type SelectProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  name?: string;
  className?: string;
};

export default function Select({
  label,
  value,
  onChange,
  options,
  name,
  className = "",
}: SelectProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        name={name}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
