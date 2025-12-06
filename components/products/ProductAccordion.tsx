"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ProductAccordionProps } from "@/types/products";

export default function ProductAccordion({
  title,
  children,
  defaultOpen = false,
}: ProductAccordionProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left group"
      >
        <span className="text-sm font-bold uppercase tracking-wider text-gray-900 group-hover:text-primary-600 transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        }`}
      >
        <div className="text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
