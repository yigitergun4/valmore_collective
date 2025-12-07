import * as React from "react";
import { cn } from "@/lib/utils";
import { SelectProps } from "@/types";


const Select: React.FC<SelectProps> = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, placeholder, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
