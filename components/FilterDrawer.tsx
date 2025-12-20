"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PRODUCT_CATEGORIES, getCategoryType } from "@/lib/constants";
import { clothingSizes, shoeSizes } from "@/lib/constants";
import { FilterDrawerProps } from "@/types";
import DiscountFilter from "./DiscountFilter";

export default function FilterDrawer({
  isOpen,
  onClose,
  onApply,
  onClear,
  currentCategory = "all",
  currentSizes = [],
  currentPriceRange = [0, 10000],
  currentShowDiscountedOnly = false,
}: FilterDrawerProps) {
  const { t } = useLanguage();
  const [activeSection, setActiveSection]: [string | null, (activeSection: string | null) => void] = useState<string | null>("category");
  
  // Local states for pending changes
  const [localCategory, setLocalCategory] = useState<string>(currentCategory || "all");
  const [localSizes, setLocalSizes] = useState<string[]>(currentSizes || []);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(currentPriceRange || [0, 10000]);
  const [localShowDiscountedOnly, setLocalShowDiscountedOnly] = useState<boolean>(currentShowDiscountedOnly || false);

  const [minPriceInput, setMinPriceInput]: [string, (minPriceInput: string) => void] = useState<string>((currentPriceRange?.[0] ?? 0).toString());
  const [maxPriceInput, setMaxPriceInput]: [string, (maxPriceInput: string) => void] = useState<string>((currentPriceRange?.[1] ?? 10000).toString());

  // Sync local state when drawer opens to match currently applied filters
  useEffect(() => {
    if (isOpen) {
      setLocalCategory(currentCategory);
      setLocalSizes(currentSizes);
      setLocalPriceRange(currentPriceRange);
      setLocalShowDiscountedOnly(currentShowDiscountedOnly);
      setMinPriceInput((currentPriceRange?.[0] ?? 0).toString());
      setMaxPriceInput((currentPriceRange?.[1] ?? 10000).toString());
    }
  }, [isOpen, currentCategory, currentSizes, currentPriceRange, currentShowDiscountedOnly]);

  const handleMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMinPriceInput(val === "" ? "0" : val);
    const num = parseInt(val);
    if (!isNaN(num)) {
      setLocalPriceRange([num, localPriceRange[1]]);
    }
  };

  const handleMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMaxPriceInput(val === "" ? "10000" : val);
    const num = parseInt(val);
    if (!isNaN(num)) {
      setLocalPriceRange([localPriceRange[0], num]);
    }
  };

  // Sync local inputs when localPriceRange changes (e.g. slider)
  useEffect(() => {
    setMinPriceInput(localPriceRange[0].toString());
    setMaxPriceInput(localPriceRange[1].toString());
  }, [localPriceRange]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const prevCategoryRef = useRef<string>(localCategory);

  // Reset local sizes ONLY when local category actually changes to a different value
  useEffect(() => {
    if (isOpen && prevCategoryRef.current !== localCategory) {
      setLocalSizes([]);
    }
    prevCategoryRef.current = localCategory;
  }, [localCategory, isOpen]);

  const toggleSection: (section: string) => void = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const toggleSize: (size: string) => void = (size: string) => {
    if (localSizes.includes(size)) {
      setLocalSizes(localSizes.filter((s) => s !== size));
    } else {
      setLocalSizes([...localSizes, size]);
    }
  };

  // Determine available sizes based on category type
  const categoryType: string = getCategoryType(localCategory);
  const showSizeSection: boolean = categoryType !== "accessories";
  
  const availableSizes: string[] = categoryType === "shoes" ? shoeSizes : clothingSizes;

  const handleApply = () => {
    onApply({
      category: localCategory,
      sizes: localSizes,
      priceRange: localPriceRange,
      showDiscountedOnly: localShowDiscountedOnly,
    });
  };

  const handleClear = () => {
    setLocalCategory("all");
    setLocalSizes([]);
    setLocalPriceRange([0, 10000]);
    setLocalShowDiscountedOnly(false);
    onClear();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold uppercase tracking-widest">
            {t("products.filter")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6 pb-24">
          {/* Category Section */}
          <div className="border-b border-gray-100 pb-6">
            <button
              onClick={() => toggleSection("category")}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <span className="text-sm font-bold uppercase tracking-wider">
                {t("products.categoriesLabel")}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeSection === "category" ? "rotate-180" : ""
                }`}
              />
            </button>
            
            <div
              className={`space-y-2 overflow-hidden transition-all duration-300 ${
                activeSection === "category" ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <button
                onClick={() => setLocalCategory("all")}
                className={`block w-full text-left text-sm py-1 ${
                  localCategory === "all"
                    ? "font-bold text-primary-600"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {t("products.categories.all")}
              </button>
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setLocalCategory(cat.value)}
                  className={`block w-full text-left text-sm py-1 ${
                    localCategory === cat.value
                      ? "font-bold text-primary-600"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {t(`products.categories.${cat.translationKey}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Size Section - Conditional Rendering */}
          {showSizeSection && (
            <div className="border-b border-gray-100 pb-6">
              <button
                onClick={() => toggleSection("size")}
                className="flex items-center justify-between w-full text-left mb-4"
              >
                <span className="text-sm font-bold uppercase tracking-wider">
                  {t("products.size")}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    activeSection === "size" ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div
                className={`grid grid-cols-4 gap-2 overflow-hidden transition-all duration-300 ${
                  activeSection === "size" ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`py-2 text-sm font-medium border transition-colors ${
                      localSizes.includes(size)
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-200 text-gray-900 hover:border-primary-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Section */}
          <div className="border-b border-gray-100 pb-6">
            <button
              onClick={() => toggleSection("price")}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <span className="text-sm font-bold uppercase tracking-wider">
                {t("products.price")}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeSection === "price" ? "rotate-180" : ""
                }`}
              />
            </button>
            
            <div
              className={`overflow-hidden transition-all duration-300 ${
                activeSection === "price" ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-2">
                <div className="relative h-10 mb-2">
                  {/* Track */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-lg -translate-y-1/2" />
                  
                  {/* Active Range Track */}
                  <div 
                    className="absolute top-1/2 h-1 bg-primary-600 rounded-lg -translate-y-1/2 z-10"
                    style={{
                      left: `${(localPriceRange[0] / 10000) * 100}%`,
                      right: `${100 - (localPriceRange[1] / 10000) * 100}%`
                    }}
                  />
                  {/* Min Slider */}
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={localPriceRange[0]}
                    onChange={(e) => {
                      const val = Math.min(parseInt(e.target.value), localPriceRange[1] - 100);
                      setLocalPriceRange([val, localPriceRange[1]]);
                    }}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-600 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer"
                  />

                  {/* Max Slider */}
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={localPriceRange[1]}
                    onChange={(e) => {
                      const val = Math.max(parseInt(e.target.value), localPriceRange[0] + 100);
                      setLocalPriceRange([localPriceRange[0], val]);
                    }}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-600 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer"
                  />
                </div>


                  <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Min</label>
                    <input
                      type="number"
                      min="0"
                      max={localPriceRange[1]}
                      step="100"
                      value={minPriceInput}
                      onChange={handleMinPriceChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-900 focus:outline-none focus:border-primary-600 transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Max</label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      step="100"
                      value={maxPriceInput}
                      onChange={handleMaxPriceChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-900 focus:outline-none focus:border-primary-600 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Discount Filter Section */}
          <DiscountFilter
            showDiscountedOnly={localShowDiscountedOnly}
            setShowDiscountedOnly={setLocalShowDiscountedOnly}
          />
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white z-10">
          <div className="flex gap-4">
            <button
              onClick={handleClear}
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {t("products.clearFilter")}
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              {t("products.applyFilter")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
