"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Package } from "lucide-react";
import { AdminStats } from "@/types";

// Mock data for now - will replace with real Firestore data
const mockStats: AdminStats = {
  totalSales: 12500,
  totalOrders: 45,
  totalProducts: 12,
  recentOrders: [
    {
      id: "ORD-001",
      customer: "John Doe",
      total: 250,
      status: "Processing",
      date: "2024-03-15",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      total: 120,
      status: "Shipped",
      date: "2024-03-14",
    },
    {
      id: "ORD-003",
      customer: "Mike Johnson",
      total: 450,
      status: "Delivered",
      date: "2024-03-13",
    },
    {
      id: "ORD-004",
      customer: "Emily Davis",
      total: 85,
      status: "Processing",
      date: "2024-03-12",
    },
    {
      id: "ORD-005",
      customer: "Chris Wilson",
      total: 320,
      status: "Cancelled",
      date: "2024-03-11",
    },
  ],
};

export default function AdminDashboard(): React.JSX.Element {
  const [stats, setStats] = useState<AdminStats>(mockStats);

  // TODO: Fetch real stats from Firestore
  useEffect(() => {
    // fetchStats();
  }, []);

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
            <DollarSign className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">
            ₺{stats.totalSales.toLocaleString()}
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "Shipped"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
                    ₺{order.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
