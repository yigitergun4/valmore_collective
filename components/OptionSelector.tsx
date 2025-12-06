"use client";

import { OptionSelectorProps } from "@/types";

export default function OptionSelector({
  label,
  options,
  selectedOption,
  onSelect,
  disabled = false,
  disabledOptions = [],
  variant = "default",
}: OptionSelectorProps): React.JSX.Element {
  const isCompact: boolean = variant === "compact";

  return (
    <div>
      <h3 className={`font-bold uppercase tracking-wider text-gray-900 ${isCompact ? "text-xs mb-2" : "text-sm mb-3"}`}>
        {label}
        {selectedOption && (
          <span className="font-normal text-gray-500 ml-2 normal-case">
            {selectedOption}
          </span>
        )}
      </h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isOptionDisabled: boolean = disabled || disabledOptions.includes(option);
          const isSelected: boolean = selectedOption === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => !isOptionDisabled && onSelect(option)}
              disabled={isOptionDisabled}
              className={`
                ${isCompact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"}
                font-medium border transition-all duration-200 relative
                ${isSelected
                  ? "border-primary bg-primary text-white"
                  : isOptionDisabled
                    ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                    : "border-gray-300 bg-white text-gray-900 hover:border-primary cursor-pointer"
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

