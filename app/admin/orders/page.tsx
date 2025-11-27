"use client";

import React, { useEffect, useState } from "react";
import { Package, Calendar, DollarSign, User, Loader2 } from "lucide-react";
import { Order } from "@/types/admin/orders";
import { fetchAllOrders } from "@/lib/orderService";

export default function AdminOrdersPage(): React.JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from Firestore
  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedOrders = await fetchAllOrders();
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Error loading orders:", err);
        setError("Siparişler yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  const getStatusBadgeColor: (status: Order["status"]) => string = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText: (status: Order["status"]) => string = (status: Order["status"]) => {
    const statusMap = {
      pending: "Beklemede",
      processing: "İşleniyor",
      shipped: "Kargoda",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
      returned: "İade Edildi",
    };
    return statusMap[status];
  };

  const filteredOrders: Order[] =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Siparişler</h2>
          <p className="text-gray-500">Tüm siparişleri görüntüleyin ve yönetin.</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500 font-medium">Siparişler yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Main Content (only show if not loading and no error) */}
      {!isLoading && !error && (
        <>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tümü ({orders.length})
          </button>
          <button
            onClick={() => setSelectedStatus("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "pending"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Beklemede ({orders.filter((o) => o.status === "pending").length})
          </button>
          <button
            onClick={() => setSelectedStatus("processing")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "processing"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            İşleniyor ({orders.filter((o) => o.status === "processing").length})
          </button>
          <button
            onClick={() => setSelectedStatus("shipped")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "shipped"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Kargoda ({orders.filter((o) => o.status === "shipped").length})
          </button>
          <button
            onClick={() => setSelectedStatus("delivered")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "delivered"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Teslim Edildi ({orders.filter((o) => o.status === "delivered").length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Order Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold">{order.id}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {order.customer.fullName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    📧 {order.customer.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    📱 {order.customer.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    ₺{order.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {order.paymentMethod === "credit_card" && "💳 Kredi Kartı"}
                    {order.paymentMethod === "iyzico" && "💳 Iyzico"}
                    {order.paymentMethod === "stripe" && "💳 Stripe"}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-sm font-bold uppercase text-gray-500 mb-3">
                Ürünler
              </h4>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 ml-6">
                        Beden: {item.selectedSize} • Renk: {item.selectedColor} • Adet: {item.quantity}
                      </div>
                    </div>
                    <span className="text-sm font-bold">
                      ₺{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-medium">₺{Number(order.subtotal).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo:</span>
                  <span className="font-medium">
                    {order.shippingCost === 0 ? (
                      <span className="text-green-600">Ücretsiz</span>
                    ) : (
                      `₺${Number(order.shippingCost).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    )}
                  </span>
                </div>
                {order.discountTotal && order.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">İndirim:</span>
                    <span className="font-medium text-red-600">-₺{Number(order.discountTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span>Toplam:</span>
                  <span className="text-primary-600">₺{Number(order.total).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div>
                  <h4 className="text-sm font-bold uppercase text-gray-500 mb-2">
                    Teslimat Adresi
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium">{order.shippingAddress.title}</span>
                    <br />
                    {order.shippingAddress.fullName}
                    <br />
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.district}, {order.shippingAddress.city} {order.shippingAddress.zipCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>

                {/* Tracking Info (if available) */}
                {(order.trackingNumber || order.carrier) && (
                  <div>
                    <h4 className="text-sm font-bold uppercase text-gray-500 mb-2">
                      Kargo Takip
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                      {order.carrier && (
                        <div className="text-sm">
                          <span className="text-gray-600">Kargo Firması:</span>{" "}
                          <span className="font-medium text-blue-900">{order.carrier}</span>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div className="text-sm">
                          <span className="text-gray-600">Takip No:</span>{" "}
                          <span className="font-mono font-medium text-blue-900">{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Bu kategoride sipariş bulunamadı.</p>
          </div>
        )}
       </div>
      </>
      )}
    </div>
  );
}
