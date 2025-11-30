"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { getAllProducts } from "@/lib/productService";
import ProductCard from "@/components/ProductCard";
import FilterDrawer from "@/components/FilterDrawer";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product, ProductGender } from "@/types";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/lib/constants";

export default function ProductsPage(): React.JSX.Element {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [products, setProducts]: [Product[], (products: Product[]) => void] = useState<Product[]>([]);
  const [loading, setLoading]: [boolean, (loading: boolean) => void] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen]: [boolean, (isFilterOpen: boolean) => void] = useState<boolean>(false);

  // Filter States
  const [activeGender, setActiveGender]: [ProductGender | "ALL", (activeGender: ProductGender | "ALL") => void] = useState<ProductGender | "ALL">("Female");
  const [searchQuery, setSearchQuery]: [string, (searchQuery: string) => void] = useState<string>("");
  const [selectedCategory, setSelectedCategory]: [string, (selectedCategory: string) => void] = useState<string>("all");
  const [selectedSizes, setSelectedSizes]: [string[], (selectedSizes: string[]) => void] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy]: ["newest" | "price-low" | "price-high", (sortBy: "newest" | "price-low" | "price-high") => void] = useState<"newest" | "price-low" | "price-high">("newest");
  
  // Handle URL params
  useEffect(() => {
    const genderParam = searchParams.get("gender");
    if (genderParam === "Male" || genderParam === "Female") {
      setActiveGender(genderParam);
    }
  }, [searchParams]);

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
      // 1. Gender Filter
      const matchesGender: boolean = 
        activeGender === "ALL" || 
        !product.gender ||
        product.gender === "Unisex" ||
        product.gender === activeGender;

      // 2. Search Filter
      const matchesSearch: boolean =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 3. Category Filter
      const productCategory: ProductCategory | undefined = PRODUCT_CATEGORIES.find(c => c.value === product.category);
      const matchesCategory: boolean =
        selectedCategory === "all" || 
        product.category === selectedCategory || 
        (!!productCategory && productCategory.translationKey === selectedCategory);

      // 4. Size Filter
      const matchesSize: boolean =
        selectedSizes.length === 0 ||
        (product.sizes && product.sizes.some(size => selectedSizes.includes(String(size))));

      // 5. Price Filter
      const price = product.price;
      const matchesPrice: boolean = price >= priceRange[0] && price <= priceRange[1];

      return matchesGender && matchesSearch && matchesCategory && matchesSize && matchesPrice;
    });

    // Sorting
    filtered.sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, activeGender, searchQuery, selectedCategory, selectedSizes, priceRange, sortBy]);

  const clearFilters: () => void = () => {
    setSelectedCategory("all");
    setSelectedSizes([]);
    setPriceRange([0, 10000]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white pt-16 lg:pt-20">
      {/* Sticky Top Bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col gap-4 py-4">
            {/* Controls Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t("products.filter")}
                {(selectedCategory !== "all" || selectedSizes.length > 0) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                )}
              </button>

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {filteredAndSortedProducts.length} {t("products.count")}
              </span>

              <div className="relative group">
                <button className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity">
                  {sortBy === "newest" ? t("products.sort.newest") : sortBy === "price-low" ? t("products.sort.priceLow") : t("products.sort.priceHigh")}
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-40">
                  <div className="bg-white border border-gray-100 shadow-lg py-2 min-w-[160px]">
                    <button
                      onClick={() => setSortBy("newest")}
                      className={`block w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 ${
                        sortBy === "newest" ? "text-primary-600" : "text-black"
                      }`}
                    >
                      {t("products.sort.newest")}
                    </button>
                    <button
                      onClick={() => setSortBy("price-low")}
                      className={`block w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 ${
                        sortBy === "price-low" ? "text-primary-600" : "text-black"
                      }`}
                    >
                      {t("products.sort.priceLow")}
                    </button>
                    <button
                      onClick={() => setSortBy("price-high")}
                      className={`block w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 ${
                        sortBy === "price-high" ? "text-primary-600" : "text-black"
                      }`}
                    >
                      {t("products.sort.priceHigh")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-[1920px] mx-auto px-4 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-8 lg:gap-x-4 lg:gap-y-12">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
              {t("products.noResults")}
            </p>
            <button
              onClick={clearFilters}
              className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-60 transition-opacity"
            >
              {t("products.clearFilter")}
            </button>
          </div>
        )}
      </main>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        onApply={() => setIsFilterOpen(false)}
        onClear={clearFilters}
      />
    </div>
  );
}
