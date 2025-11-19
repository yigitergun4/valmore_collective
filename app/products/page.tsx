"use client";

import { useState, useMemo } from "react";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">(
    "name"
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Category mapping from Turkish product categories to translation keys
  const categoryMapping: { [key: string]: string } = useMemo(
    () => ({
      Gömlekler: "shirts",
      Pantolonlar: "pants",
      "Dış Giyim": "outerwear",
      "Üst Giyim": "tops",
      Tişörtler: "tshirts",
      Sweatshirt: "sweatshirts",
      Aksesuar: "accessories",
      Ayakkabı: "shoes",
      Elbise: "dresses",
      Şort: "shorts",
    }),
    []
  );

  // Get unique categories from products and convert to translation keys
  const categoryKeys = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.category))
    );
    return ["all", ...uniqueCategories.map((cat) => categoryMapping[cat])];
  }, [categoryMapping]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Convert product category to key and match with selected category
      const productCategoryKey = categoryMapping[product.category];
      const matchesCategory =
        selectedCategory === "all" || productCategoryKey === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, categoryMapping]);

  const hasActiveFilters = searchQuery || selectedCategory !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  return (
    <div className="min-h-screen bg-white pt-16 lg:pt-20">
      <div className="max-w-[1920px] mx-auto">
        {/* Top Bar - Mobile Filter Button & Sort */}
        <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-gray-200">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-primary-600 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Results Count */}
            <div className="flex items-center gap-4">
              <p className="text-[10px] lg:text-xs uppercase tracking-wider text-gray-500">
                <span className="font-bold text-black">
                  {filteredAndSortedProducts.length}
                </span>{" "}
                {t("products.count")}
              </p>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "name" | "price-low" | "price-high"
                  )
                }
                className="text-[10px] lg:text-xs font-bold uppercase tracking-wider border-none outline-none bg-transparent cursor-pointer appearance-none pr-6 hover:text-primary-600 transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundPosition: "right center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <option value="name">{t("products.sort.name")}</option>
                <option value="price-low">{t("products.sort.priceLow")}</option>
                <option value="price-high">
                  {t("products.sort.priceHigh")}
                </option>
              </select>
            </div>
          </div>

          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <div className="px-4 lg:px-8 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-3 overflow-x-auto">
              {searchQuery && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[9px] lg:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                  {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:opacity-60"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[9px] lg:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                  {t(`products.categories.${selectedCategory}`)}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="hover:opacity-60"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors whitespace-nowrap ml-auto"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 border-r border-gray-200 min-h-screen sticky top-36 self-start">
            <div className="p-6 xl:p-8">
              {/* Search */}
              <div className="mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                  Search
                </h3>
                <div className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={t("products.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 text-xs border-0 border-b border-gray-200 focus:border-primary-600 outline-none bg-transparent transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                  Categories
                </h3>
                <ul className="space-y-2">
                  {categoryKeys.map((categoryKey) => (
                    <li key={categoryKey}>
                      <button
                        onClick={() => setSelectedCategory(categoryKey)}
                        className={`text-left text-xs uppercase tracking-wider transition-colors w-full py-1.5 ${
                          selectedCategory === categoryKey
                            ? "font-bold text-primary-600"
                            : "text-gray-700 hover:text-primary-600"
                        }`}
                      >
                        {t(`products.categories.${categoryKey}`)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-6 lg:gap-x-4 lg:gap-y-10">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4 lg:mb-6" />
                <h3 className="text-xl lg:text-2xl font-bold uppercase tracking-tighter mb-2 lg:mb-3">
                  No Products Found
                </h3>
                <p className="text-xs lg:text-sm text-gray-500 uppercase tracking-wider mb-6 lg:mb-8">
                  {t("products.noResults")}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 lg:px-8 py-3 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Mobile Filter Drawer */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
            isMobileFilterOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white transition-transform duration-300 ${
              isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold uppercase tracking-tighter">
                  Filters
                </h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Search */}
                <div className="mb-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                    Search
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-6 pr-2 py-2 text-sm border-0 border-b border-gray-200 focus:border-primary-600 outline-none bg-transparent transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                    Categories
                  </h3>
                  <ul className="space-y-3">
                    {categoryKeys.map((categoryKey) => (
                      <li key={categoryKey}>
                        <button
                          onClick={() => {
                            setSelectedCategory(categoryKey);
                            setIsMobileFilterOpen(false);
                          }}
                          className={`text-left text-sm uppercase tracking-wider transition-colors w-full py-2 ${
                            selectedCategory === categoryKey
                              ? "font-bold text-primary-600"
                              : "text-gray-700"
                          }`}
                        >
                          {t(`products.categories.${categoryKey}`)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              {hasActiveFilters && (
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      clearFilters();
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
