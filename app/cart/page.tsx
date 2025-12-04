"use client";

import Link from "next/link";
import Image from "next/image";
import { useShop } from "@/contexts/ShopContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartItem } from "@/types";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function CartPage(): React.JSX.Element {
  const {
    cart: items,
    removeFromCart,
    updateQuantity,
  } = useShop();
  
  const getTotalPrice: () => number = () => {
    return items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
  };

  const { t } = useLanguage();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <div className="text-center px-4">
          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold uppercase tracking-tighter mb-3">
            {t("cart.empty.title")}
          </h2>
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-8">
            {t("cart.empty.description")}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-colors"
          >
            {t("cart.empty.browse")}
            <ArrowRight className="ml-3 w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 className="text-4xl lg:text-6xl font-bold uppercase tracking-tighter mb-10 lg:mb-16">
          {t("cart.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {[...items]
              .sort((a, b) => b.updatedAt - a.updatedAt) // Most recent first
              .map((item, index) => (
              <div
                key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${index}`}
                className="border-b border-gray-100 pb-6 flex gap-4 lg:gap-6"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${item.productId}?size=${item.selectedSize}&color=${item.selectedColor}`}
                  className="relative w-24 h-32 lg:w-32 lg:h-40 bg-gray-50 overflow-hidden flex-shrink-0 block"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] uppercase font-bold">
                      No Image
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.productId}?size=${item.selectedSize}&color=${item.selectedColor}`}
                    >
                      <h3 className="text-sm lg:text-base font-bold uppercase tracking-wider hover:opacity-60 transition-opacity mb-2">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {t("cart.size")}:{" "}
                        <span className="text-black font-bold">
                          {item.selectedSize}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {t("cart.color")}:{" "}
                        <span className="text-black font-bold">
                          {item.selectedColor}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    {/* Quantity Control */}
                    <div className="flex items-center border border-primary-600">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity - 1
                          )
                        }
                        className="p-2 hover:bg-primary-600 hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 text-sm font-bold">
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
                        className="p-2 hover:bg-primary-600 hover:text-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex items-center gap-4">
                      <p className="text-base lg:text-lg font-bold">
                        ₺{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() =>
                          removeFromCart(item.productId, item.selectedSize, item.selectedColor)
                        }
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="border border-primary-600 p-6 lg:p-8 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold uppercase tracking-tighter mb-8">
                {t("cart.orderSummary")}
              </h2>

              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                <div className="flex justify-between text-sm uppercase tracking-wider">
                  <span className="text-gray-600">{t("cart.subtotal")}</span>
                  <span className="font-bold">
                    ₺{getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm uppercase tracking-wider">
                  <span className="text-gray-600">{t("cart.shipping")}</span>
                  <span className="text-xs font-bold text-primary-600">
                    {getTotalPrice() >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="text-green-600">{t("products.freeShipping")}</span>
                    ) : (
                      `₺${SHIPPING_COST.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-base lg:text-lg font-bold uppercase tracking-wider mb-8">
                <span>{t("cart.total")}</span>
                <span>
                  ₺{(getTotalPrice() + (getTotalPrice() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST)).toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-4 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-colors mb-4"
              >
                {t("cart.proceed")}
              </button>

              <Link
                href="/products"
                className="block w-full text-center py-3 text-xs font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 transition-all"
              >
                {t("cart.continue")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
