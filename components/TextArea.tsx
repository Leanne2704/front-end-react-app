import React from "react";

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  name?: string;
  className?: string;
};

export default function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 3,
  name,
  className = "",
}: TextAreaProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        name={name}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
      />
    </div>
  );
}
