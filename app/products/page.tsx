"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, Suspense, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { getAllProducts } from "@/lib/productService";
import ProductCard from "@/components/ProductCard";
import FilterDrawer from "@/components/FilterDrawer";
import { SlidersHorizontal, ChevronDown, Loader2, Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product, ProductGender, GENDER_OPTIONS } from "@/types";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/lib/constants";

const ITEMS_PER_PAGE: number = 12;

function ProductsContent(): React.JSX.Element {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [products, setProducts]: [Product[], (products: Product[]) => void] = useState<Product[]>([]);
  const [loading, setLoading]: [boolean, (loading: boolean) => void] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen]: [boolean, (isFilterOpen: boolean) => void] = useState<boolean>(false);

  // Pagination State
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [activeGender, setActiveGender]: [ProductGender | "ALL", (activeGender: ProductGender | "ALL") => void] = useState<ProductGender | "ALL">("ALL");
  const [searchQuery, setSearchQuery]: [string, (searchQuery: string) => void] = useState<string>("");
  const [selectedCategory, setSelectedCategory]: [string, (selectedCategory: string) => void] = useState<string>("all");
  const [selectedSizes, setSelectedSizes]: [string[], (selectedSizes: string[]) => void] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showDiscountedOnly, setShowDiscountedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy]: ["newest" | "price-low" | "price-high", (sortBy: "newest" | "price-low" | "price-high") => void] = useState<"newest" | "price-low" | "price-high">("newest");
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  
  const debouncedSearchQuery: string = useDebounce(searchQuery, 300);
  
  // Handle URL params
  useEffect(() => {
    const genderParam: string | null = searchParams.get("gender");
    const queryParam: string | null = searchParams.get("q");
    
    if (genderParam) {
      const isValidGender: boolean = GENDER_OPTIONS.some(option => option.value === genderParam);
      if (isValidGender) {
        setActiveGender(genderParam as ProductGender);
      }
    }

    if (queryParam) {
      setSearchQuery(queryParam);
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
    const filtered: Product[] = products.filter((product: Product) => {
      // 1. Gender Filter
      const matchesGender: boolean = 
        activeGender === "ALL" || 
        !product.gender ||
        product.gender === "Unisex" ||
        product.gender === activeGender;

       // 2. Search Filter
      const matchesSearch: boolean =
        debouncedSearchQuery === "" ||
        product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      // 3. Category Filter
      const productCategory: ProductCategory | undefined = PRODUCT_CATEGORIES.find(c => c.value === product.category);
      const matchesCategory: boolean =
        selectedCategory === "all" || 
        product.category === selectedCategory || 
        (!!productCategory && productCategory.translationKey === selectedCategory);

      // 4. Size Filter - Check variants for accurate size availability and stock
      let matchesSize: boolean = selectedSizes.length === 0;
      if (!matchesSize) {
        // If product has variants, check their sizes and stock
        if (product.hasVariants && product.variants && product.variants.length > 0) {
          // Get sizes only from variants that are in stock
          const inStockVariantSizes: string[] = product.variants
            .filter((v: any) => v.inStock)
            .flatMap((v: any) => v.sizes || []);
          
          matchesSize = selectedSizes.some((selectedSize: string) => 
            inStockVariantSizes.includes(selectedSize)
          );
        } else if (product.sizes && product.sizes.length > 0 && product.inStock) {
          // Fallback to product.sizes for products without variants, only if in stock
          matchesSize = product.sizes.some((size: string) => 
            selectedSizes.includes(String(size))
          );
        } else {
          // If no variants and no sizes, or out of stock
          matchesSize = false;
        }
      }


      // 5. Price Filter
      const price = product.price;
      const matchesPrice: boolean = price >= priceRange[0] && price <= priceRange[1];

      // 6. Discount Filter
      const matchesDiscount: boolean = !showDiscountedOnly || product.isDiscounted;

      return matchesGender && matchesSearch && matchesCategory && matchesSize && matchesPrice && matchesDiscount;
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
  }, [products, activeGender, debouncedSearchQuery, selectedCategory, selectedSizes, priceRange, showDiscountedOnly, sortBy]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeGender, debouncedSearchQuery, selectedCategory, selectedSizes, priceRange, showDiscountedOnly, sortBy]);

  // Derived pagination data
  const currentProducts: Product[] = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

  const hasMore: boolean = visibleCount < filteredAndSortedProducts.length;

  // Load More Handler
  const handleLoadMore: () => void = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredAndSortedProducts.length));
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, filteredAndSortedProducts.length]);

  // Infinite Scroll for Mobile (IntersectionObserver)
  useEffect(() => {
    if (!loadMoreTriggerRef.current) return;
    
    const observer: IntersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Only trigger on mobile (viewport width < 1024px)
        if (entry.isIntersecting && hasMore && window.innerWidth < 1024) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(loadMoreTriggerRef.current);

    return () => {
      if (loadMoreTriggerRef.current) {
        observer.unobserve(loadMoreTriggerRef.current);
      }
    };
  }, [hasMore, handleLoadMore]);

  const clearFilters: () => void = () => {
    setSelectedCategory("all");
    setSelectedSizes([]);
    setPriceRange([0, 10000]);
    setShowDiscountedOnly(false);
    setSearchQuery("");
  };

  const handleApplyFilters: (filters: {
    category: string;
    sizes: string[];
    priceRange: [number, number];
    showDiscountedOnly: boolean;
  }) => void = (filters: {
    category: string;
    sizes: string[];
    priceRange: [number, number];
    showDiscountedOnly: boolean;
  }) => {
    setSelectedCategory(filters.category);
    setSelectedSizes(filters.sizes);
    setPriceRange(filters.priceRange);
    setShowDiscountedOnly(filters.showDiscountedOnly);
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-white pt-16 lg:pt-20">
      {/* Sticky Top Bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col gap-4 py-4">
            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-60 transition-opacity whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("products.filter")}
                  {(selectedCategory !== "all" || selectedSizes.length > 0) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                  )}
                </button>

                {/* Inline Search Input */}
                <div className="hidden md:flex items-center relative group">
                  <Search className="w-3.5 h-3.5 absolute left-0 text-gray-400 group-focus-within:text-black transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("products.search")}
                    className="pl-6 pr-8 py-1 text-[10px] font-bold uppercase tracking-widest border-b border-transparent focus:border-black outline-none w-32 focus:w-64 transition-all duration-300 bg-transparent"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-0 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-1 text-xs px-2 py-1 font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
                >
                  {sortBy === "newest" ? t("products.sort.newest") : sortBy === "price-low" ? t("products.sort.priceLow") : t("products.sort.priceHigh")}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsSortOpen(false)} 
                    />
                    <div className="absolute right-0 top-full pt-2 z-40">
                      <div className="bg-white border border-gray-100 shadow-lg py-2 min-w-[160px]">
                        <button
                          onClick={() => {
                            setSortBy("newest");
                            setIsSortOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 ${
                            sortBy === "newest" ? "text-primary-600" : "text-black"
                          }`}
                        >
                          {t("products.sort.newest")}
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("price-low");
                            setIsSortOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 ${
                            sortBy === "price-low" ? "text-primary-600" : "text-black"
                          }`}
                        >
                          {t("products.sort.priceLow")}
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("price-high");
                            setIsSortOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 ${
                            sortBy === "price-high" ? "text-primary-600" : "text-black"
                          }`}
                        >
                          {t("products.sort.priceHigh")}
                        </button>
                      </div>
                    </div>
                  </>
                )}
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
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-8 lg:gap-x-4 lg:gap-y-12">
              {currentProducts.map((product:Product) => (
                <ProductCard key={product.id} product={product} filterGender={activeGender} />
              ))}
            </div>
            {/* Load More Section */}
            {hasMore && (
              <div className="mt-12 lg:mt-16">
                {/* Desktop: Load More Button */}
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="hidden lg:flex w-full items-center justify-center px-8 py-4 border-2 border-black text-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("products.loading")}
                    </>
                  ) : (
                    t("products.loadMore")
                  )}
                </button>
                {/* Mobile: Infinite Scroll Trigger + Loading Indicator */}
                <div 
                  ref={loadMoreTriggerRef} 
                  className="lg:hidden flex items-center justify-center py-8"
                >
                  {isLoadingMore && (
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  )}
                </div>
              </div>
            )}
          </>
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
        currentCategory={selectedCategory}
        currentSizes={selectedSizes}
        currentPriceRange={priceRange}
        currentShowDiscountedOnly={showDiscountedOnly}
        onApply={handleApplyFilters}
        onClear={clearFilters}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
