import React from "react";
import { Package, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getStatusBadgeColor, getStatusText, Order } from "@/types/admin/orders";
import { RecentOrdersTableProps } from "@/types/admin";


export default function RecentOrdersTable({ orders, showActions = false, isExpandable = false, itemsPerPage = 10 }: RecentOrdersTableProps): React.JSX.Element {
  const [expandedOrderIds, setExpandedOrderIds] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Pagination Logic
  const totalPages: number = Math.ceil(orders.length / itemsPerPage);
  const startIndex: number = (currentPage - 1) * itemsPerPage;
  const endIndex: number = startIndex + itemsPerPage;
  const currentOrders: Order[] = orders.slice(startIndex, endIndex);

  const toggleOrder: (orderId: string) => void = (orderId: string) => {
    if (!isExpandable) return;
    setExpandedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handlePageChange: (newPage: number) => void = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Reset expanded rows when changing page
      setExpandedOrderIds([]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-bold">Son Siparişler</h3>
      </div>
      <div className="flex-grow overflow-auto">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {isExpandable && <th className="w-12 px-6 py-3"></th>}
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sipariş No</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Oluşturma Tarihi</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Son Güncelleme</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Tutar</th>
                  {showActions && <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">İşlemler</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order: Order) => {
                  const isExpanded: boolean = expandedOrderIds.includes(order.id);
                  return (
                    <React.Fragment key={order.id}>
                      <tr 
                        className={`hover:bg-gray-50 transition-colors ${isExpandable ? "cursor-pointer" : ""}`}
                        onClick={() => isExpandable && toggleOrder(order.id)}
                      >
                        {isExpandable && (
                          <td className="px-6 py-4">
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                toggleOrder(order.id);
                              }}
                              className="p-1 transition-colors"
                            >
                              <ChevronDown
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{order.customer.fullName}</div>
                            <div className="text-gray-500 text-xs">{order.customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</td>
                        <td className="px-6 py-4">{new Date(order.updatedAt).toLocaleDateString("tr-TR")}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold">
                          ₺{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </td>
                        {showActions && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium"
                            >
                              Yönet
                            </Link>
                          </td>
                        )}
                      </tr>
                      {isExpandable && isExpanded && (
                        <tr>
                          <td colSpan={showActions ? 8 : 7} className="px-6 py-0">
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
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Henüz sipariş bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 flex-shrink-0">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Önceki
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Sayfa {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
