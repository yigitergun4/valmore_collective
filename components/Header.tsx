"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut, Globe } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-primary-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-primary-700">
              Valmoré Collective
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t("nav.products")}
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t("nav.about")}
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t("nav.contact")}
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors p-2"
                aria-label="Change language"
              >
                <Globe className="w-5 h-5" />
                <span className="hidden md:block text-sm font-medium uppercase">
                  {language}
                </span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setLanguage("tr");
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      language === "tr"
                        ? "bg-primary-50 text-primary-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    🇹🇷 Türkçe
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("en");
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      language === "en"
                        ? "bg-primary-50 text-primary-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user.name}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        router.push("/");
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block text-sm font-medium">
                  {t("nav.login")}
                </span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-600"
            aria-label="Menüyü aç/kapat"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-4 border-t border-primary-200">
            <Link
              href="/"
              className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/products"
              className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.products")}
            </Link>
            <Link
              href="/about"
              className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.about")}
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.contact")}
            </Link>

            {/* Language Switcher Mobile */}
            <div className="pt-4 border-t border-primary-200">
              <p className="px-2 text-xs font-semibold text-gray-500 mb-2 uppercase">
                Dil / Language
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setLanguage("tr");
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-2 text-sm rounded transition-colors ${
                    language === "tr"
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  🇹🇷 Türkçe
                </button>
                <button
                  onClick={() => {
                    setLanguage("en");
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-2 text-sm rounded transition-colors ${
                    language === "en"
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {user ? (
              <div className="pt-4 border-t border-primary-200">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    router.push("/");
                  }}
                  className="w-full flex items-center px-2 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-primary-200 space-y-2">
                <Link
                  href="/login"
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
