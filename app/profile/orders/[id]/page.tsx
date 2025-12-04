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
  Package, 
  Truck, 
  MapPin, 
  CreditCard,
  Calendar,
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
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{t("orders.detail.notFound")}</p>
        <Link href="/profile/orders" className="text-primary-600 underline mt-2 inline-block">
          {t("orders.detail.backToOrders")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{t("orders.detail.title")}</h1>
          <p className="text-sm text-gray-500">
            {t("orders.detail.orderId")}: {order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Order Date */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg w-fit">
        <p>{t("orders.detail.orderDate")}</p>
        <Calendar className="w-4 h-4 text-primary-600" />
        <span>{formatDate(order.createdAt)}</span>
      </div>

      {/* Tracking Info */}
      {order.status === "shipped" && order.trackingNumber && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">{t("orders.detail.tracking")}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">{order.carrier}</p>
              <p className="font-mono font-medium text-purple-900">{order.trackingNumber}</p>
            </div>
            <button
              onClick={copyTrackingNumber}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
            >
              {copiedTracking ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-purple-600" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">{t("orders.detail.products")}</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-4 p-4">
              <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                <div className="flex gap-2 mt-1 text-sm text-gray-500">
                  {item.selectedSize && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{item.selectedSize}</span>
                  )}
                  {item.selectedColor && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{item.selectedColor}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">x{item.quantity}</span>
                  <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">{t("orders.detail.summary")}</h2>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t("orders.detail.subtotal")}</span>
            <span className="text-gray-700">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t("orders.detail.shipping")}</span>
            <span className="text-gray-700">{formatPrice(order.shippingCost)}</span>
          </div>
          {order.discountTotal && order.discountTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t("orders.detail.discount")}</span>
              <span className="text-green-600">-{formatPrice(order.discountTotal)}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">{t("orders.detail.total")}</span>
              <span className="font-bold text-lg text-gray-900">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-700">{t("orders.detail.shippingAddress")}</h2>
        </div>
        <div className="p-4 space-y-1 text-sm">
          <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
          <p className="text-gray-600">{order.shippingAddress.address}</p>
          <p className="text-gray-600">
            {order.shippingAddress.district} / {order.shippingAddress.city}
          </p>
          {order.shippingAddress.zipCode && (
            <p className="text-gray-500">{order.shippingAddress.zipCode}</p>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-700">{t("orders.detail.customerInfo")}</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{order.customer.fullName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{order.customer.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{order.customer.phone}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-700">{t("orders.detail.payment")}</h2>
        </div>
        <div className="p-4">
          <span className="text-sm text-gray-700 capitalize">{order.paymentMethod.replace("_", " ")}</span>
        </div>
      </div>
    </div>
  );
}
