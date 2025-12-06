"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchUserOrders } from "@/lib/firestore/orders";
import { Order, getStatusBadgeColor } from "@/types/admin/orders";
import { Loader2, Package, Truck, MapPin } from "lucide-react";
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
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-light tracking-wide text-gray-900 uppercase">{t("orders.title")}</h1>
        <p className="text-sm text-gray-500 mt-2 font-light">{t("orders.subtitle")}</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-16 h-16 text-gray-200 mb-6" strokeWidth={1} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("orders.empty")}</h3>
          <p className="text-gray-500 mb-8 font-light">{t("orders.emptyDesc")}</p>
          <Link
            href="/"
            className="px-8 py-3 bg-black text-white text-sm font-medium tracking-wider hover:bg-gray-900 transition-colors uppercase"
          >
            {t("orders.startShopping")}
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {orders.map((order) => (
            <div key={order.id} className="group">
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${getStatusBadgeColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">{t("orders.detail.total")}</p>
                    <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
                  </div>
                  <div className="text-right border-l border-gray-200 pl-6">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">{t("profile.memberSince").replace("Üyelik Tarihi", "Tarih")}</p>
                    <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Images Grid */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {order.items.slice(0, 6).map((item, index) => (
                      <div key={index} className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {item.quantity > 1 && (
                          <div className="absolute top-1 right-1 bg-black/5 text-black text-[9px] font-medium px-1.5 py-0.5 backdrop-blur-sm">
                            x{item.quantity}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {order.items.length > 6 && (
                    <p className="text-xs text-gray-500 mt-2 font-light">
                      + {order.items.length - 6} {t("orders.items")} daha
                    </p>
                  )}
                </div>

                {/* Actions & Info */}
                <div className="flex flex-col justify-between py-2">
                  <div className="space-y-4">
                    {order.status === "shipped" && order.trackingNumber && (
                      <div className="bg-gray-50 p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("orders.detail.tracking")}</p>
                        <p className="text-sm font-medium text-gray-900">{order.carrier}</p>
                        <p className="text-xs text-gray-600 font-mono mt-1">{order.trackingNumber}</p>
                      </div>
                    )}
                    
                    {order.status === "delivered" && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="font-light">
                          {order.shippingAddress.city}, {order.shippingAddress.district}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/profile/orders/${order.id}`}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 border border-black text-black text-sm font-medium tracking-wider hover:bg-black hover:text-white transition-all uppercase"
                  >
                    {t("orders.viewDetails")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
