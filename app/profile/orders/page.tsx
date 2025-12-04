"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchUserOrders } from "@/lib/firestore/orders";
import { Order, getStatusBadgeColor } from "@/types/admin/orders";
import { Loader2, Package, ChevronRight, Truck, MapPin, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OrdersPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders: () => Promise<void> = async () => {
      if (user?.uid) {
        try {
          const userOrders: Order[] = await fetchUserOrders(user.uid);
          setOrders(userOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const formatDate: (dateString: string) => string = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice: (price: number) => string = (price: number) => {
    return new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: "TRY",
    }).format(price);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">{t("orders.title")}</h1>
        <p className="text-sm text-gray-500">{t("orders.subtitle")}</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">{t("orders.empty")}</h3>
          <p className="text-gray-500 mt-1 mb-6">{t("orders.emptyDesc")}</p>
          <Link
            href="/"
            className="text-sm font-medium text-primary-600 underline hover:text-primary-700"
          >
            {t("orders.startShopping")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-gray-700">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Order Items */}
              <div className="p-4">
                <div className="flex flex-wrap gap-3">
                  {order.items.slice(0, 4).map((item, index) => (
                    <div
                      key={index}
                      className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute bottom-0 right-0 bg-black text-white text-xs px-1.5 py-0.5 rounded-tl">
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500 font-medium">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Tracking Info */}
                {order.status === "shipped" && order.trackingNumber && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-purple-50 px-3 py-2 rounded-lg">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>
                      {order.carrier}: <span className="font-medium">{order.trackingNumber}</span>
                    </span>
                  </div>
                )}

                {/* Delivery Info */}
                {order.status === "delivered" && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <MapPin className="w-4 h-4" />
                    <span>{t("orders.deliveredTo")}: {order.shippingAddress.city}</span>
                  </div>
                )}
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {order.items.length} {t("orders.items")}
                </span>
                <Link
                  href={`/profile/orders/${order.id}`}
                  className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  {t("orders.viewDetails")}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
