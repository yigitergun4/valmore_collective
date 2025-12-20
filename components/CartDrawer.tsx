"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useShop } from "@/contexts/ShopContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "@/types";

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cart,
    removeFromCart,
    updateQuantity,
    cartCount,
  } = useShop();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isMounted) return null;

  const subtotal: number = cart.reduce(
    (total: number, item: CartItem) => total + item.price * item.quantity,
    0
  );

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isCartOpen ? "visible" : "invisible delay-300"
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
            {t("cart.title")} ({cartCount})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                {t("cart.empty.title")}
              </p>
              <p className="text-xs text-gray-400 max-w-xs">
                {t("cart.empty.description")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {[...cart]
                .sort((a, b) => b.updatedAt - a.updatedAt) // Most recent first
                .map((item, index) => (
                <div
                  key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className="flex gap-4 pb-6 border-b border-gray-100 last:border-0"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.productId}?size=${item.selectedSize}&color=${item.selectedColor}`}
                    className="relative w-20 h-28 flex-shrink-0 bg-gray-50 overflow-hidden group"
                    onClick={closeCart}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/products/${item.productId}?size=${item.selectedSize}&color=${item.selectedColor}`}
                          onClick={closeCart}
                          className="hover:opacity-60 transition-opacity"
                        >
                          <h3 className="text-xs font-bold uppercase tracking-wide text-black line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        <button
                          onClick={() =>
                            removeFromCart(
                              item.productId,
                              item.selectedSize,
                              item.selectedColor
                            )
                          }
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-bold text-black">
                          {formatPrice(item.price)}
                        </p>
                        <span className="text-[10px] text-gray-400">
                          × {item.quantity}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-500 uppercase tracking-wide space-x-3">
                        <span>
                          {t("cart.size")}: {item.selectedSize}
                        </span>
                        <span>
                          {t("cart.color")}: {item.selectedColor}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-0 border border-gray-300 w-fit">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity - 1
                          )
                        }
                        className="p-2 hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity + 1
                          )
                        }
                        className="p-2 hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-200 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                {t("cart.subtotal")}
              </span>
              <span className="text-lg font-bold text-black">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="text-[10px] text-gray-400 text-center uppercase tracking-wide">
              {t("cart.shippingNote")}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex items-center justify-center py-3.5 border-2 border-primary-600 text-primary-600 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary-600 hover:text-white transition-colors"
              >
                {t("cart.viewCart")}
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex items-center justify-center py-3.5 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary-700 transition-colors"
              >
                {t("cart.checkout")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
