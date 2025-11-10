import React from "react";

type InputProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  className?: string;
};

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  name,
  className = "",
}: InputProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        name={name}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
      />
    </div>
  );
}
