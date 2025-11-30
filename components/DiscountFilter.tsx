"use client";

import { DiscountFilterProps } from "@/types";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DiscountFilter({
  showDiscountedOnly,
  setShowDiscountedOnly,
}: DiscountFilterProps) {
    const { t } = useLanguage();
  return (
    <div className="py-4">
      <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm font-medium text-gray-900 group-hover:text-black">
            {t("products.discountFilter")}
        </span>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only" // Varsayılan checkbox'ı gizle
            checked={showDiscountedOnly}
            onChange={() => setShowDiscountedOnly(!showDiscountedOnly)}
          />
          <div
            className={`w-5 h-5 border transition-all duration-200 flex items-center justify-center ${
              showDiscountedOnly
                ? "bg-primary border-primary"
                : "bg-white border-gray-300 group-hover:border-gray-400"
            }`}
          >
            <Check 
              className={`w-3.5 h-3.5 text-white transition-opacity duration-200 ${
                showDiscountedOnly ? "opacity-100" : "opacity-0"
              }`} 
              strokeWidth={3}
            />
          </div>
        </div>
      </label>
    </div>
  );
}