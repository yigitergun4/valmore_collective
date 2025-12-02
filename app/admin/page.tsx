"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, Package, Loader2 } from "lucide-react";
import { AdminStats } from "@/types";
import { fetchAllOrders } from "@/lib/firestore/orders";
import { getAllProducts } from "@/lib/productService";
import { Order } from "@/types/admin/orders";
import { Product } from "@/types";
import { getStatusBadgeColor, getStatusText } from "@/types/admin/orders";

export default function AdminDashboard(): React.JSX.Element {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch orders and products in parallel
        const [orders, products]: [Order[], Product[]] = await Promise.all([
          fetchAllOrders(),
          getAllProducts(),
        ]);

        // Calculate total sales
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

        // Get recent 5 orders
        const recentOrders = orders.slice(0, 5).map((order) => ({
          id: order.id,
          customer: order.customer.fullName,
          total: order.total,
          status: order.status,
          date: new Date(order.createdAt).toLocaleDateString("tr-TR"),
        }));

        setStats({
          totalSales,
          totalOrders: orders.length,
          totalProducts: products.length,
          recentOrders,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("İstatistikler yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500 font-medium">İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500 font-medium">İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Yönetim Paneli</h2>
        <p className="text-gray-500">Mağazanızın performans özeti.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">
              Toplam Satış
            </h3>
            <span>
              ₺
            </span>
          </div>
          <div className="text-2xl font-bold">
            ₺{stats.totalSales.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">
              Toplam Sipariş
            </h3>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">
              Toplam Ürün
            </h3>
            <Package className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold">Son Siparişler</h3>
        </div>
        {stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Sipariş No</th>
                  <th className="px-6 py-3">Müşteri</th>
                  <th className="px-6 py-3">Tarih</th>
                  <th className="px-6 py-3">Durum</th>
                  <th className="px-6 py-3 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4">{order.date}</td>
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
                  </tr>
                ))}
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
    </div>
  );
}
