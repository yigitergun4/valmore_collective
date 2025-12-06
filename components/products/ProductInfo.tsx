"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import ProductAccordion from "./ProductAccordion";
import { ProductInfoProps } from "@/types/products";

export default function ProductInfo({ product }: ProductInfoProps): React.JSX.Element | null {
  const { t } = useLanguage();

  // Check if we have any product info to display
  const hasInfo: boolean = !!(product.material || product.fit || product.careInstructions);

  if (!hasInfo) return null;

  return (
    <div className="space-y-0">
      {product.material && (
        <ProductAccordion title={t("products.material")}>
          <p>{product.material}</p>
        </ProductAccordion>
      )}

      {product.fit && (
        <ProductAccordion title={t("products.fit")}>
          <p>{product.fit}</p>
        </ProductAccordion>
      )}

      {product.careInstructions && (
        <ProductAccordion title={t("products.careInstructions")}>
          <p>{product.careInstructions}</p>
        </ProductAccordion>
      )}

      {(product.sku || product.barcode) && (
        <ProductAccordion title={t("products.productDetails")}>
          <div className="space-y-2">
            {product.sku && (
              <p><span className="font-medium">SKU:</span> {product.sku}</p>
            )}
            {product.barcode && (
              <p><span className="font-medium">Barcode:</span> {product.barcode}</p>
            )}
          </div>
        </ProductAccordion>
      )}
    </div>
  );
}
