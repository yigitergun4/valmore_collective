"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { OrderSummaryProps } from "@/types/checkout";
import { ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";

export default function OrderSummary({
  items,
  totalItems,
  totalPrice,
  isProcessing,
}: OrderSummaryProps): React.JSX.Element {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  const shippingCost: number = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal: number = totalPrice + shippingCost;

  return (
    <>
      {/* Desktop View - Full Summary */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm p-6 sticky top-8">
        <h2 className="text-2xl font-bold text-primary-800 mb-6">
          {t("checkout.orderSummary")}
        </h2>
        
        <div className="space-y-2 mb-6">
          {/* Items List */}
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 right-0 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-medium">
                    x{item.quantity}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-1">
                      {item.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {item.selectedColor && (
                        <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                          {t("products.color")}: {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                          {t("products.size")}: {item.selectedSize}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end flex-col items-end">
                    <span className="text-[10px] text-gray-400 mb-0.5">{t("products.price")}</span>
                    <p className="text-sm font-semibold text-primary-700">
                      ₺{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>{t("cart.items")} ({totalItems})</span>
              <span>₺{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t("cart.shipping")}</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-medium">{t("products.freeShipping")}</span>
                ) : (
                  `₺${shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold text-primary-800">
                <span>{t("cart.total")}</span>
                <span>₺{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-4 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isProcessing ? t("checkout.processing") : t("checkout.placeOrder")}
        </button>
      </div>

      {/* Mobile View - Collapsible Summary */}
      <div className="lg:hidden">
        {/* Collapsible Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">{t("checkout.orderSummary")}</p>
                <p className="text-lg font-bold text-primary-800">₺{grandTotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {totalItems} {t("cart.items").toLowerCase()}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {/* Expandable Content */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="p-4 border-t border-gray-100">
              {/* Items List */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={`mobile-${item.productId}-${index}`} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="relative w-12 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 right-0 bg-black text-white text-[9px] px-1 py-0.5 rounded-tl-md font-medium">
                        x{item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="flex gap-1 text-[10px] text-gray-500">
                          {item.selectedSize && <span>{item.selectedSize}</span>}
                          {item.selectedSize && item.selectedColor && <span>•</span>}
                          {item.selectedColor && <span>{item.selectedColor}</span>}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-primary-700">
                        ₺{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ara Toplam</span>
                  <span>₺{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t("cart.shipping")}</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">{t("products.freeShipping")}</span>
                    ) : (
                      `₺${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">{t("cart.total")}</p>
            <p className="text-xl font-bold text-primary-800">₺{grandTotal.toFixed(2)}</p>
          </div>
          {shippingCost === 0 && (
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
              {t("products.freeShipping")}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-3.5 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isProcessing ? t("checkout.processing") : t("checkout.placeOrder")}
        </button>
      </div>

    </>
  );
}
