import React from "react";
import { StatusFilterButtonProps } from "@/types/admin";

export default function StatusFilterButton({
  label,
  count,
  status,
  selectedStatus,
  onClick,
}: StatusFilterButtonProps): React.JSX.Element {
  const isActive = selectedStatus === status;

  return (
    <button
      onClick={() => onClick(status)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label} ({count})
    </button>
  );
}
