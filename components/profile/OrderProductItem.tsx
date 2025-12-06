"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { OrderProductItemProps } from "@/types/profile";


export default function OrderProductItem({
  image,
  name,
  selectedSize,
  selectedColor,
  quantity,
  price,
  compact = false,
}: OrderProductItemProps) {
  const { t, language } = useLanguage();

  const formatPrice: (price: number) => string = (price: number) => {
    return new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  if (compact) {
    return (
      <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
        <div className="relative w-14 aspect-[3/4] bg-gray-100 rounded overflow-hidden flex-shrink-0">
          <Image
            src={image || "/placeholder.png"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-gray-900 truncate">{name}</h4>
          <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-gray-500">
            {selectedSize && (
              <span>{t("orders.size")}: <span className="text-gray-700">{selectedSize}</span></span>
            )}
            {selectedColor && (
              <span>{t("orders.color")}: <span className="text-gray-700">{selectedColor}</span></span>
            )}
            <span>{t("orders.quantity")}: <span className="text-gray-700">{quantity}</span></span>
          </div>
          <p className="text-xs font-semibold text-gray-900 mt-1">{formatPrice(price * quantity)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
      <div className="relative w-16 sm:w-20 aspect-[3/4] bg-gray-100 rounded overflow-hidden flex-shrink-0">
        <Image
          src={image || "/placeholder.png"}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm truncate">{name}</h3>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
              {selectedSize && (
                <span>{t("orders.size")}: <span className="text-gray-700">{selectedSize}</span></span>
              )}
              {selectedColor && (
                <span>{t("orders.color")}: <span className="text-gray-700">{selectedColor}</span></span>
              )}
              <span>{t("orders.quantity")}: <span className="text-gray-700">{quantity}</span></span>
            </div>
          </div>
          <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
            {formatPrice(price * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
