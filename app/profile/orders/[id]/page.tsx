"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchOrderById } from "@/lib/firestore/orders";
import { Order, getStatusBadgeColor } from "@/types/admin/orders";
import { 
  Loader2, 
  ArrowLeft, 
  Truck, 
  CreditCard,
  Phone,
  Mail,
  User,
  Copy,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  const orderId: string = params.id as string;

  useEffect(() => {
    const loadOrder: () => Promise<void> = async () => {
      if (orderId) {
        try {
          const fetchedOrder: Order | null = await fetchOrderById(orderId);
          
          // Security check: only show order if it belongs to the current user
          if (fetchedOrder && fetchedOrder.userId === user?.uid) {
            setOrder(fetchedOrder);
          } else {
            router.push("/profile/orders");
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          router.push("/profile/orders");
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      loadOrder();
    }
  }, [orderId, user, router]);

  const formatDate: (dateString: string) => string = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const copyTrackingNumber: () => void = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopiedTracking(true);
      toast.success(t("orders.detail.trackingCopied"));
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t("orders.detail.backToOrders")}
          </button>
          <h1 className="text-2xl font-light tracking-wide text-gray-900 uppercase">{t("orders.detail.title")}</h1>
          <p className="text-sm text-gray-500 mt-2 font-mono">
            #{order.id.toUpperCase()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${getStatusBadgeColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Products */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-gray-900 mb-6 pb-2 border-b border-gray-100">
              {t("orders.detail.products")}
            </h2>
            <div className="space-y-8">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="relative w-20 aspect-[3/4] bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 uppercase tracking-wide text-sm">{item.name}</h3>
                        <div className="mt-2 space-y-1">
                          {item.selectedSize && (
                            <p className="text-sm text-gray-500">
                              <span className="uppercase text-xs tracking-wider mr-2">Size:</span>
                              {item.selectedSize}
                            </p>
                          )}
                          {item.selectedColor && (
                            <p className="text-sm text-gray-500">
                              <span className="uppercase text-xs tracking-wider mr-2">Color:</span>
                              {item.selectedColor}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            <span className="uppercase text-xs tracking-wider mr-2">Qty:</span>
                            {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Info */}
          {order.status === "shipped" && order.trackingNumber && (
            <div className="bg-gray-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-900" />
                  <h3 className="text-sm font-medium uppercase tracking-wider text-gray-900">{t("orders.detail.tracking")}</h3>
                </div>
                <button
                  onClick={copyTrackingNumber}
                  className="text-xs text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                >
                  {copiedTracking ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      {t("orders.detail.trackingCopied")}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Kopyala
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 uppercase tracking-wide">{order.carrier}</p>
                <p className="font-mono text-lg text-gray-900 tracking-wider">{order.trackingNumber}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Summary & Info */}
        <div className="space-y-8">
          {/* Order Summary */}
          <div className="bg-gray-50 p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-gray-900 mb-6">
              {t("orders.detail.summary")}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t("orders.detail.subtotal")}</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t("orders.detail.shipping")}</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discountTotal && order.discountTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t("orders.detail.discount")}</span>
                  <span>-{formatPrice(order.discountTotal)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between font-medium text-gray-900 text-base">
                  <span>{t("orders.detail.total")}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-100">
              {t("orders.detail.shippingAddress")}
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900 mb-2">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.district} / {order.shippingAddress.city}
              </p>
              {order.shippingAddress.zipCode && (
                <p>{order.shippingAddress.zipCode}</p>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-100">
              {t("orders.detail.customerInfo")}
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <span>{order.customer.fullName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{order.customer.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{order.customer.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-100">
              {t("orders.detail.payment")}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="capitalize">{order.paymentMethod.replace("_", " ")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
