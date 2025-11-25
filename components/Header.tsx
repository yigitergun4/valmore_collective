"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

import { auth } from "@/lib/firebase";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const pathname = usePathname();

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const token = await auth.currentUser?.getIdTokenResult();
          setIsAdmin(!!token?.claims.admin);
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide header on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMenuOpen ? "bg-white shadow-sm" : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 -ml-2 hover:opacity-60 transition-opacity"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo - Centered on Mobile, Left on Desktop */}
            <Link 
              href="/" 
              className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 flex items-center"
            >
              <span className="text-2xl lg:text-3xl font-bold tracking-tighter uppercase text-primary-600">
                VALMORÉ
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2">
              <Link
                href="/products"
                className="text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-60 transition-opacity text-primary-600"
              >
                {t("nav.products")}
              </Link>
              <Link
                href="/about"
                className="text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-60 transition-opacity text-primary-600"
              >
                {t("nav.about")}
              </Link>
              <Link
                href="/contact"
                className="text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-60 transition-opacity text-primary-600"
              >
                {t("nav.contact")}
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              
              {/* Language Selector - Desktop Only */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="text-[11px] font-bold uppercase tracking-wider hover:opacity-60 transition-opacity text-primary-600 "
                >
                  {language}
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 mt-4 w-24 bg-white border border-primary-600 shadow-lg">
                    <button
                      onClick={() => {
                        setLanguage("tr");
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider hover:bg-primary-600 hover:text-white transition-all ${
                        language === "tr" ? "bg-primary-600 text-white" : ""
                      }`}
                    >
                      TR
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("en");
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider hover:bg-primary-600 hover:text-white transition-all ${
                        language === "en" ? "bg-primary-600 text-white" : ""
                      }`}
                    >
                      EN
                    </button>
                  </div>
                )}
              </div>

              {/* Search */}
              <button className="hover:opacity-60 transition-opacity">
                <Search className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="hover:opacity-60 transition-opacity"
                  >
                    <User className="w-5 h-5" />
                  </button>
                ) : (
                  <Link href="/login" className="hover:opacity-60 transition-opacity">
                    <User className="w-5 h-5" />
                  </Link>
                )}
                
                {user && isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-56 bg-white border border-primary-600 shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="w-full flex items-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-all border-b border-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        ⚡ Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                        router.push("/");
                      }}
                      className="w-full flex items-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider hover:bg-primary-600 hover:text-white transition-all"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative hover:opacity-60 transition-opacity"
              >
                <ShoppingBag className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white z-40 transition-transform duration-500 ease-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: "64px" }}
      >
        <nav className="flex flex-col p-8 space-y-8 h-full">
          <Link
            href="/"
            className="text-3xl font-bold uppercase tracking-tighter hover:opacity-60 transition-opacity text-primary-600"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/products"
            className="text-3xl font-bold uppercase tracking-tighter hover:opacity-60 transition-opacity text-primary-600"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("nav.products")}
          </Link>
          <Link
            href="/about"
            className="text-3xl font-bold uppercase tracking-tighter hover:opacity-60 transition-opacity text-primary-600"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("nav.about")}
          </Link>
          <Link
            href="/contact"
            className="text-3xl font-bold uppercase tracking-tighter hover:opacity-60 transition-opacity text-primary-600"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("nav.contact")}
          </Link>
          
          <div className="pt-8 mt-auto border-t border-gray-200">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Language</p>
            <div className="flex space-x-6">
              <button
                onClick={() => {
                  setLanguage("tr");
                  setIsMenuOpen(false);
                }}
                className={`text-xl font-bold uppercase tracking-tighter ${
                  language === "tr" ? "text-primary-600 underline underline-offset-4" : "text-gray-400"
                }`}
              >
                TR
              </button>
              <button
                onClick={() => {
                  setLanguage("en");
                  setIsMenuOpen(false);
                }}
                className={`text-xl font-bold uppercase tracking-tighter ${
                  language === "en" ? "text-primary-600 underline underline-offset-4" : "text-gray-400"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
