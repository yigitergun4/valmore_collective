import * as React from "react";
import { PremiumSelect } from "./PremiumSelect";
import { SelectProps } from "@/types";

const Select: React.FC<SelectProps> = ({ 
  label, 
  options = [], 
  placeholder, 
  value, 
  onChange,
  className,
  error,
  ...props 
}) => {
  // Map standard HTML change event to value-only change if needed, 
  // but for our internal PremiumSelect it expects value directly.
  const handleChange: (newValue: string) => void = (newValue: string) => {
    if (onChange) {
      // Create a mock event for backward compatibility if necessary
      const mockEvent = {
        target: { value: newValue, name: props.name },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(mockEvent);
    }
  };

  return (
    <PremiumSelect
      label={label}
      options={options}
      value={value as string || ""}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      error={error as string}
      disabled={props.disabled}
    />
  );
};

Select.displayName = "Select";

export { Select };
