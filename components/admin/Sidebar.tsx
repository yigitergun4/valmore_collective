"use client";

import React,{useState} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MenuItem from "@/types/admin/index";


const menuItems: MenuItem[] = [
  {
    title: "Panel",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Ürünler",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Siparişler",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
];

export default function Sidebar(): React.JSX.Element {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300 ease-in-out relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-colors shadow-sm z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <div className="p-6 border-b border-gray-200 h-[88px] flex items-center justify-center overflow-hidden">
        <h1
          className={`font-bold uppercase tracking-tighter text-center transition-all duration-300 whitespace-nowrap ${
            isCollapsed ? "text-xs opacity-0 hidden" : "text-xl opacity-100"
          }`}
        >
          Valmoré Admin
        </h1>
        {isCollapsed && (
          <span className="font-bold text-xl tracking-tighter text-primary-600">
            V
          </span>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive: boolean = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } ${isCollapsed ? "justify-center px-2" : ""}`}
              title={isCollapsed ? item.title : ""}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={`transition-all duration-300 ${
                  isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                }`}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1 overflow-x-hidden">
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors whitespace-nowrap ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
          title={isCollapsed ? "Anasayfaya Dön" : ""}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          <span
            className={`transition-all duration-300 ${
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
            }`}
          >
            Anasayfaya Dön
          </span>
        </Link>
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
          title={isCollapsed ? "Çıkış Yap" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span
            className={`transition-all duration-300 ${
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
            }`}
          >
            Çıkış Yap
          </span>
        </button>
      </div>
    </aside>
  );
}
