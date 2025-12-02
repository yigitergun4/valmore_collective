"use client";

import React, { useEffect, useState } from "react";
import { Package, Calendar, User, Loader2, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Order, getStatusText, getStatusBadgeColor } from "@/types/admin/orders";
import { fetchAllOrders } from "@/lib/firestore";
import StatusFilterButton from "@/components/admin/StatusFilterButton";

export default function AdminOrdersPage(): React.JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);

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

  const toggleOrder: (orderId: string) => void = (orderId: string) => {
    setExpandedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
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
              <StatusFilterButton
                label="Tümü"
                count={orders.length}
                status="all"
                selectedStatus={selectedStatus}
                onClick={setSelectedStatus}
              />
              <StatusFilterButton
                label="Beklemede"
                count={orders.filter((o) => o.status === "pending").length}
                status="pending"
                selectedStatus={selectedStatus}
                onClick={setSelectedStatus}
              />
              <StatusFilterButton
                label="Hazırlanıyor"
                count={orders.filter((o) => o.status === "processing").length}
                status="processing"
                selectedStatus={selectedStatus}
                onClick={setSelectedStatus}
              />
              <StatusFilterButton
                label="Kargoda"
                count={orders.filter((o) => o.status === "shipped").length}
                status="shipped"
                selectedStatus={selectedStatus}
                onClick={setSelectedStatus}
              />
              <StatusFilterButton
                label="Teslim Edildi"
                count={orders.filter((o) => o.status === "delivered").length}
                status="delivered"
                selectedStatus={selectedStatus}
                onClick={setSelectedStatus}
              />
              <StatusFilterButton
                label="İptal Edildi"
                count={orders.filter((o) => o.status === "cancelled").length}
                status="cancelled"
                selectedStatus={selectedStatus}
                onClick={setSelectedStatus}
              />
              <StatusFilterButton
                label="İade Edildi"
                count={orders.filter((o) => o.status === "returned").length}
                status="returned"
                selectedStatus={selectedStatus}
                onClick={setSelectedStatus}
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3"></th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Sipariş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Toplam
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderIds.includes(order.id);
                  
                  return (
                    <React.Fragment key={order.id}>
                      {/* Summary Row */}
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleOrder(order.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{order.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{order.customer.fullName}</div>
                            <div className="text-gray-500 text-xs">{order.customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-primary-600">
                            ₺{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium"
                          >
                            Yönet
                          </Link>
                        </td>
                      </tr>

                      {/* Detail Row (Expandable) */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-0">
                            <div className="bg-gray-50 border-t border-gray-200 p-6 animate-in slide-in-from-top-2 fade-in duration-200">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Products */}
                                <div>
                                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Ürünler
                                  </h4>
                                  <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200"
                                      >
                                        {item.image && (
                                          <div className="relative w-10 h-10 flex-shrink-0">
                                            <Image
                                              src={item.image}
                                              alt={item.name}
                                              fill
                                              className="object-cover rounded"
                                              sizes="40px"
                                            />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 truncate">
                                            {item.name}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {item.selectedSize} • {item.selectedColor} • Adet: {item.quantity}
                                          </div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 flex-shrink-0">
                                          ₺{(item.price * item.quantity).toLocaleString("tr-TR")}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Right: Shipping Info */}
                                <div>
                                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Teslimat Bilgileri
                                  </h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Adres Başlığı</div>
                                      <div className="text-sm font-medium">{order.shippingAddress.title}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Alıcı</div>
                                      <div className="text-sm font-medium">{order.shippingAddress.fullName}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Telefon</div>
                                      <div className="text-sm font-medium">{order.customer.phone}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Adres</div>
                                      <div className="text-sm leading-relaxed">
                                        {order.shippingAddress.address}
                                        <br />
                                        {order.shippingAddress.district}, {order.shippingAddress.city}{" "}
                                        {order.shippingAddress.zipCode}
                                        <br />
                                        {order.shippingAddress.country}
                                      </div>
                                    </div>
                                    {(order.trackingNumber || order.carrier) && (
                                      <div className="pt-3 border-t border-gray-200">
                                        <div className="text-xs text-gray-500 mb-2">Kargo Takip</div>
                                        {order.carrier && (
                                          <div className="text-sm">
                                            <span className="font-medium">Kargo: </span>
                                            {order.carrier}
                                          </div>
                                        )}
                                        {order.trackingNumber && (
                                          <div className="text-sm">
                                            <span className="font-medium">Takip No: </span>
                                            <span className="font-mono">{order.trackingNumber}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="p-12 text-center">
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
