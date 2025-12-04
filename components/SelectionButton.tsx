import React from "react";

interface SelectionButtonProps {
  value: string;
  isSelected: boolean;
  onClick: (value: string) => void;
  variant?: "default" | "compact";
  className?: string;
}

/**
 * Reusable selection button component for size, color, and other option selections
 * @param value - The display value of the button
 * @param isSelected - Whether this option is currently selected
 * @param onClick - Click handler function that receives the button value
 * @param variant - Button size variant: "default" (h-12) or "compact" (h-10)
 * @param className - Additional custom classes to merge with base styles
 */
export default function SelectionButton({
  value,
  isSelected,
  onClick,
  variant = "default",
  className = "",
}: SelectionButtonProps) {
  const baseClasses =
    "text-sm font-bold uppercase transition-all duration-200 border";
  const heightClass = variant === "compact" ? "h-10 px-6" : "h-12";
  const stateClasses = isSelected
    ? "border-primary-600 bg-primary-600 text-white"
    : "border-gray-200 text-black hover:border-primary-600";
  

  return (
    <button
      onClick={() => onClick(value)}
      className={`${baseClasses} ${heightClass} ${stateClasses} ${className}`}
    >
      {value}
    </button>
  );
}
