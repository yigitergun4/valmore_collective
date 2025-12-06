"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Order, getStatusBadgeColor } from "@/types/admin/orders";
import { Button } from "@/components/ui/button";
import OrderProductItem from "./OrderProductItem";
import OrderSummary from "./OrderSummary";
import { OrderCardProps } from "@/types/profile";

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const { t, language } = useLanguage();

  const formatDate: (dateString: string) => string = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusText: (status: Order["status"]) => string = (status: Order["status"]) => {
    const statusMap: Record<Order["status"], string> = {
      pending: t("orders.status.pending"),
      processing: t("orders.status.processing"),
      shipped: t("orders.status.shipped"),
      delivered: t("orders.status.delivered"),
      cancelled: t("orders.status.cancelled"),
      returned: t("orders.status.returned"),
    };
    return statusMap[status];
  };

  const formatPrice: (price: number) => string = (price: number) => {
    return new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wide ${getStatusBadgeColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{formatDate(order.createdAt)}</span>
          <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Order Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Products List */}
        <div className="flex-1 space-y-2">
          {order.items.slice(0, 3).map((item, index) => (
            <OrderProductItem
              key={index}
              image={item.image}
              name={item.name}
              selectedSize={item.selectedSize}
              selectedColor={item.selectedColor}
              quantity={item.quantity}
              price={item.price}
              compact
            />
          ))}
          {order.items.length > 3 && (
            <p className="text-xs text-gray-400 pt-1">
              + {order.items.length - 3} {t("orders.moreItems")}
            </p>
          )}
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="flex flex-col justify-between lg:w-56 mt-4 lg:mt-0">
          {/* Order Summary */}
          <OrderSummary
            subtotal={order.subtotal}
            shippingCost={order.shippingCost}
            discountTotal={order.discountTotal}
            total={order.total}
            compact
          />

          {/* Tracking/Delivery Info */}
          {order.status === "shipped" && order.trackingNumber && (
            <div className="bg-purple-50 rounded-lg p-3 mt-3">
              <p className="text-[10px] text-purple-600 uppercase tracking-wider font-medium">{t("orders.detail.tracking")}</p>
              <p className="text-xs text-purple-900 font-mono mt-0.5">{order.trackingNumber}</p>
            </div>
          )}
          
          {order.status === "delivered" && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 mt-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t("orders.deliveredTo")}: {order.shippingAddress.city}</span>
            </div>
          )}

          <Button
            className="w-full bg-black text-white hover:bg-gray-800 uppercase tracking-wider text-xs h-10 mt-4"
            onClick={() => router.push(`/profile/orders/${order.id}`)}
          >
            {t("orders.viewDetails")}
          </Button>
        </div>
      </div>
    </div>
  );
}
