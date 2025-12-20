"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, Package, Loader2 } from "lucide-react";
import { AdminStats } from "@/types";
import { fetchAllOrders } from "@/lib/firestore/orders";
import { getAllProducts } from "@/lib/productService";
import { Order } from "@/types/admin/orders";
import { Product } from "@/types";
import KPICard from "@/components/admin/KPICard";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import { formatPrice } from "@/lib/utils";


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
        const totalSales: number = orders.reduce((sum, order) => sum + order.total, 0);
        const totalSalesNotReturn: number = orders.reduce((sum, order) => 
          order.status !== "returned" ? sum + order.total : sum, 0);

        setStats({
          totalSales,
          totalSalesNotReturn,
          totalOrdersLength: orders.length,
          totalProducts: products.length,
          orders,
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
        <KPICard
          title="Toplam Satış"
          value={formatPrice(stats.totalSalesNotReturn)}
          icon={<span>₺</span>}
        />
        <KPICard
          title="Toplam Sipariş"
          value={stats.totalOrdersLength}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <KPICard
          title="Toplam Ürün"
          value={stats.totalProducts}
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable orders={stats.orders} itemsPerPage={5} />
    </div>
  );
}
