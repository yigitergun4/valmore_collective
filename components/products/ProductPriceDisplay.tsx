import { useLanguage } from "@/contexts/LanguageContext";
import type { ProductPriceDisplayProps } from "@/types/components/products";

export default function ProductPriceDisplay({
  productName,
  productId,
  finalPrice,
  originalPrice,
  hasDiscount,
  discountPercentage,
}: ProductPriceDisplayProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
        REF. {productId.substring(0, 8).toUpperCase()}
      </p>
      <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
        {productName}
      </h1>
      
      {/* Price */}
      <div className="flex items-baseline gap-3 mt-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl font-bold text-black">
              {finalPrice.toFixed(2)} {t("products.currency")}
            </span>
            <span className="text-gray-400 line-through text-sm">
              {originalPrice.toFixed(2)} {t("products.currency")}
            </span>
            <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5">
              -{discountPercentage}%
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold text-black">
            {finalPrice.toFixed(2)} {t("products.currency")}
          </span>
        )}
      </div>
    </div>
  );
}
