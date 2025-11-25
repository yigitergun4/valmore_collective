import React from "react";

interface MobileSelectionButtonProps {
  value: string;
  isSelected: boolean;
  onClick: (value: string) => void;
  type?: "color" | "size";
  className?: string;
}

/**
 * Reusable mobile selection button component optimized for touch interfaces
 * @param value - The display value of the button
 * @param isSelected - Whether this option is currently selected
 * @param onClick - Click handler function that receives the button value
 * @param type - Button type: "color" (px-6 py-3) or "size" (py-3)
 * @param className - Additional custom classes to merge with base styles
 */
export default function MobileSelectionButton({
  value,
  isSelected,
  onClick,
  type = "size",
  className = "",
}: MobileSelectionButtonProps) {
  const baseClasses = "text-sm font-bold uppercase border transition-all";
  const paddingClass = type === "color" ? "px-6 py-3" : "py-3";
  const stateClasses = isSelected
    ? "border-primary-600 bg-primary-600 text-white"
    : "border-gray-200 text-black hover:border-primary-600";

  return (
    <button
      onClick={() => onClick(value)}
      className={`${baseClasses} ${paddingClass} ${stateClasses} ${className}`}
    >
      {value}
    </button>
  );
}
