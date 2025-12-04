"use client";

interface OptionSelectorProps {
  label: string;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export default function OptionSelector({
  label,
  options,
  selectedOption,
  onSelect,
  disabled = false,
}: OptionSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            disabled={disabled}
            className={`px-4 py-2.5 text-sm font-medium rounded-md border-2 transition-all duration-200 ${
              selectedOption === option
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:shadow-sm"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
