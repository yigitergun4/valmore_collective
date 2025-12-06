"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExpandableTextProps } from "@/types/products";

export default function ExpandableText({
  text,
  maxLines = 3,
}: ExpandableTextProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { t } = useLanguage();

  return (
    <div>
      <p
        className={`text-sm text-gray-600 leading-relaxed transition-all duration-300 ${
          !isExpanded ? `line-clamp-${maxLines}` : ""
        }`}
        style={!isExpanded ? { 
          display: "-webkit-box",
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        } : undefined}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-sm font-medium text-black underline underline-offset-2 hover:text-gray-600 transition-colors"
      >
        {isExpanded ? t("products.showLess") : t("products.showMore")}
      </button>
    </div>
  );
}
