"use client";

import { useState, useMemo, useEffect } from "react";
import { getAllProducts } from "@/lib/productService";
import ProductCard from "@/components/ProductCard";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/types";
import FilterTag from "@/components/FilterTag";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export default function ProductsPage(): React.JSX.Element {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">(
    "name"
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Category mapping from Turkish product categories to translation keys
  const categoryMapping: { [key: string]: string } = useMemo(
    () => {
      const mapping: { [key: string]: string } = {};
      PRODUCT_CATEGORIES.forEach((cat) => {
        // Map Turkish category name to English key for translations
        const key: string = cat.value
          .toLowerCase()
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/\s+/g, '');
        
        // Create translation key mappings
        if (cat.value === "Gömlekler") mapping[cat.value] = "shirts";
        else if (cat.value === "Pantolonlar") mapping[cat.value] = "pants";
        else if (cat.value === "Dış Giyim") mapping[cat.value] = "outerwear";
        else if (cat.value === "Üst Giyim") mapping[cat.value] = "tops";
        else if (cat.value === "Tişörtler") mapping[cat.value] = "tshirts";
        else if (cat.value === "Sweatshirt") mapping[cat.value] = "sweatshirts";
        else if (cat.value === "Aksesuar") mapping[cat.value] = "accessories";
        else if (cat.value === "Ayakkabı") mapping[cat.value] = "shoes";
        else if (cat.value === "Elbise") mapping[cat.value] = "dresses";
        else if (cat.value === "Şort") mapping[cat.value] = "shorts";
        else if (cat.value === "Çanta") mapping[cat.value] = "bags";
        else if (cat.value === "Çorap") mapping[cat.value] = "socks";
        else mapping[cat.value] = key;
      });
      return mapping;
    },
    []
  );

  // Get category keys from centralized PRODUCT_CATEGORIES
  const categoryKeys: string[] = useMemo(() => {
    return ["all", ...PRODUCT_CATEGORIES.map((cat) => categoryMapping[cat.value])];
  }, [categoryMapping]);

  useEffect(() => {
    const fetchProducts: () => Promise<void> = async () => {
      try {
        const data: Product[] = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredAndSortedProducts: Product[] = useMemo(() => {
    
    let filtered: Product[] = products.filter((product: Product) => {
      const matchesSearch: boolean =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Convert product category to key and match with selected category
      const productCategoryKey: string = categoryMapping[product.category];
      const matchesCategory: boolean =
        selectedCategory === "all" || productCategoryKey === selectedCategory;

      return matchesSearch && matchesCategory;
    });
    

    filtered.sort((a: Product, b: Product) => {
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
  }, [searchQuery, selectedCategory, sortBy, categoryMapping, products]);

  const hasActiveFilters = searchQuery || selectedCategory !== "all";

  const clearFilters: () => void = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  return (
    <div className="min-h-screen bg-white pt-16 lg:pt-20">
      <div className="max-w-[1920px] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
        {/* Top Bar - Mobile Filter Button & Sort */}
        <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-gray-200">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-primary-600 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("products.filter")}
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
                <FilterTag
                  label={searchQuery}
                  onRemove={() => setSearchQuery("")}
                />
              )}
              {selectedCategory !== "all" && (
                <FilterTag
                  label={t(`products.categories.${selectedCategory}`)}
                  onRemove={() => setSelectedCategory("all")}
                />
              )}
              <button
                onClick={clearFilters}
                className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors whitespace-nowrap ml-auto"
              >
                {t("products.clearFilter")}
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
                  {t("products.searchLabel")}
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
                  {t("products.categoriesLabel")}
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
                  {t("products.noResults")}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 lg:px-8 py-3 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-colors"
                  >
                    {t("products.clearFilter")}
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
                  {t("products.filter")}
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
                    {t("products.searchLabel")}
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={t("products.search")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-6 pr-2 py-2 text-sm border-0 border-b border-gray-200 focus:border-primary-600 outline-none bg-transparent transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                    {t("products.categoriesLabel")}
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
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
