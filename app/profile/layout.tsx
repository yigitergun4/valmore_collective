"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, Package, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useLanguage();

  // Check if we're on an order detail page
  const isOrderDetailPage: boolean = pathname.startsWith("/profile/orders/") && pathname !== "/profile/orders";

  const menuItems: { title: string; href: string; icon: React.ReactNode }[] = [
    {
      title: t("profile.sidebar.profile"),
      href: "/profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      title: t("profile.sidebar.addresses"),
      href: "/profile/addresses",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      title: t("profile.sidebar.orders"),
      href: "/profile/orders",
      icon: <Package className="w-4 h-4" />,
    },
  ];

  // For order detail pages, render without sidebar
  if (isOrderDetailPage) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-12">
        <div className="container mx-auto px-4">
          <main className="w-full">
            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - hidden on mobile */}
          <aside className="hidden lg:block w-full lg:w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-24">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">{t("profile.sidebar.myAccount")}</h2>
                <p className="text-sm text-gray-500">{t("profile.sidebar.manageAccount")}</p>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      }`}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  );
                })}
                
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  {t("profile.sidebar.logout")}
                </button>
              </nav>
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
