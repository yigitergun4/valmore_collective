"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut, Search, Heart, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, JSX } from "react";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { auth } from "@/lib/firebase";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProductsOpen, setIsProductsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { favorites, cartCount } = useShop();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname: string = usePathname();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAdmin: () => void = async () => {
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
    const handleScroll: () => void = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown: (e: KeyboardEvent) => void = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside: (event: MouseEvent) => void = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hide header on admin pages
  if (pathname.startsWith("/admin")) {
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
              <div className="relative group">
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-60 transition-opacity text-primary-600 py-4 cursor-default"
                >
                  {t("nav.products")}
                </span>
                
                {/* Dropdown Menu */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-white border border-gray-100 shadow-lg py-2 min-w-[160px] flex flex-col items-center">
                    <Link
                      href="/products?gender=Female"
                      className="w-full text-center px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:text-primary-600 transition-colors"
                    >
                      {t("products.genders.female")}
                    </Link>
                    <Link
                      href="/products?gender=Male"
                      className="w-full text-center px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:text-primary-600 transition-colors"
                    >
                      {t("products.genders.male")}
                    </Link>
                  </div>
                </div>
              </div>
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
              <div className="relative hidden lg:block" ref={langMenuRef}>
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
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hover:opacity-60 transition-opacity"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative" ref={profileMenuRef}>
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
                  <div className="absolute right-0 mt-4 w-56 bg-white border border-primary-600 shadow-lg z-50 ">
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)}>
                      <div className="px-4 py-3 border-b border-gray-100 hover:bg-primary-600 hover:text-white transition-all">
                        <p className="text-sm font-bold truncate ">{user.fullName}</p>
                        <p className="text-[10px] truncate ">{user.email}</p>
                      </div>
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="w-full flex items-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-all border-b border-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        ⚡ Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                        router.push("/login");
                      }}
                      className="w-full flex items-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider hover:bg-primary-600 hover:text-white transition-all"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>

                {/* Favorites */}
              <Link
                href="/favorites"
                className="relative hover:opacity-60 transition-opacity"
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative hover:opacity-60 transition-opacity"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Search Overlay */}
      <div 
        className={`fixed inset-0 z-[60] transition-all duration-700 ease-in-out ${
          isSearchOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Glassmorphism Background */}
        <div 
          className="absolute inset-0 bg-white/70 backdrop-blur-3xl"
          onClick={() => setIsSearchOpen(false)}
        />
        
        <div className="relative max-w-5xl mx-auto px-6 h-full flex flex-col pt-20 lg:pt-24">
          <div className="flex justify-between items-end mb-12 lg:mb-16">
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-primary-600/60">
                {t("common.search") || "Arama"}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold uppercase tracking-tighter text-primary-600">
                {t("products.searchLabel")}
              </h2>
            </div>
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="group p-3 hover:bg-primary-600 rounded-full transition-all duration-500 hover:rotate-90"
            >
              <X className="w-6 h-6 lg:w-7 h-7 group-hover:text-white transition-colors" />
            </button>
          </div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
                setIsSearchOpen(false);
                setSearchQuery("");
              }
            }}
            className="relative group"
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("products.search")}
              className="w-full text-2xl lg:text-3xl font-light bg-transparent border-b border-primary-600/20 pb-4 focus:border-primary-600 outline-none transition-all duration-500 placeholder:text-primary-600/10"
            />
            
            <div className="absolute right-0 bottom-4 flex items-center gap-3">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button 
                type="submit"
                className="p-2.5 bg-primary-600 text-white rounded-full hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl shadow-primary-600/20"
              >
                <Search className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
          </form>
          
          <div className="mt-12 lg:mt-16">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary-600/40 mb-6 lg:mb-8 ml-1">
              {t("search.popular") || "Popüler Aramalar"}
            </p>
            <div className="flex flex-wrap gap-2 lg:gap-3">
              {["T-shirt", "Kemer", "Pantolon", "Ceket", "Aksesuar"].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    router.push(`/products?q=${encodeURIComponent(term)}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-6 py-2 bg-white/50 border border-primary-600/10 text-[10px] font-bold uppercase tracking-widest hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:translate-y-[-2px] transition-all duration-300 rounded-full shadow-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
          
          {/* Products with Gender Options */}
          <div>
            <button
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="flex items-center gap-3 text-3xl font-bold uppercase tracking-tighter text-primary-600"
            >
              {t("nav.products")}
              <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isProductsOpen ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col space-y-3 pl-4 border-l-2 border-primary-200">
                <Link
                  href="/products?gender=Female"
                  className="text-xl font-medium uppercase tracking-wide hover:text-primary-600 transition-colors text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("products.genders.female")}
                </Link>
                <Link
                  href="/products?gender=Male"
                  className="text-xl font-medium uppercase tracking-wide hover:text-primary-600 transition-colors text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("products.genders.male")}
                </Link>
              </div>
            </div>
          </div>
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
