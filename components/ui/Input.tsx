import * as React from "react";
import { cn } from "@/lib/utils";
import { InputProps } from "@/types";


const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, onWheel, ...props }, ref) => {
    // Prevent scroll from changing number input values
    const handleWheel: (e: React.WheelEvent<HTMLInputElement>) => void = (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === "number") {
        e.currentTarget.blur();
      }
      onWheel?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          onWheel={handleWheel}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
