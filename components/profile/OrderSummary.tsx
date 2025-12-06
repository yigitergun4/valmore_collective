"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { OrderSummaryProps } from "@/types/profile";

export default function OrderSummary({
  subtotal,
  shippingCost,
  discountTotal,
  total,
  compact = false,
}: OrderSummaryProps) {
  const { t, language } = useLanguage();

  const formatPrice: (price: number) => string = (price: number) => {
    return new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  if (compact) {
    return (
      <div className="text-xs space-y-1 pt-2 border-t border-gray-200">
        <div className="flex justify-between text-gray-500">
          <span>{t("orders.detail.subtotal")}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>{t("orders.detail.shipping")}</span>
          <span>{formatPrice(shippingCost)}</span>
        </div>
        {discountTotal && discountTotal > 0 && (
          <div className="flex justify-between text-green-600">
            <span>{t("orders.detail.discount")}</span>
            <span>-{formatPrice(discountTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-900 font-semibold pt-1">
          <span>{t("orders.detail.total")}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-sm font-medium uppercase tracking-wider text-gray-900 mb-6">
        {t("orders.detail.summary")}
      </h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>{t("orders.detail.subtotal")}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>{t("orders.detail.shipping")}</span>
          <span>{formatPrice(shippingCost)}</span>
        </div>
        {discountTotal && discountTotal > 0 && (
          <div className="flex justify-between text-green-600">
            <span>{t("orders.detail.discount")}</span>
            <span>-{formatPrice(discountTotal)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between font-medium text-gray-900 text-base">
            <span>{t("orders.detail.total")}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
