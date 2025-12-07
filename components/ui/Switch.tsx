import * as React from "react";
import { cn } from "@/lib/utils";
import { SwitchProps } from "@/types";


const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  label,
  labelPosition = "left",
  className,
  disabled = false,
}) => {
  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        checked ? "bg-primary-600" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );

  if (!label) return toggle;

  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {labelPosition === "left" && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      {toggle}
      {labelPosition === "right" && (
        <span className="text-sm font-medium text-gray-700 ml-2">{label}</span>
      )}
    </div>
  );
};
Switch.displayName = "Switch";

export { Switch };
