"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchUserOrders } from "@/lib/firestore/orders";
import { Order } from "@/types/admin/orders";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";
import OrderCard from "@/components/profile/OrderCard";
import Pagination from "@/components/ui/Pagination";

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 5;

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

  // Pagination Logic
  const indexOfLastItem: number = currentPage * itemsPerPage;
  const indexOfFirstItem: number = indexOfLastItem - itemsPerPage;
  const currentOrders: Order[] = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages: number = Math.ceil(orders.length / itemsPerPage);

  const handlePageChange: (pageNumber: number) => void = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="space-y-6">
          {currentOrders.map((order: Order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

