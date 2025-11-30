"use client";

import { useState, useMemo, useEffect } from "react";
import {useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {ProductDetailClientProps, ProductImage, ProductVariant } from "@/types";
import { useShop } from "@/contexts/ShopContext";
import { useAlert } from "@/contexts/AlertContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ChevronLeft,
  Heart,
  Share2,
  ChevronUp,
  ChevronRight,
  Truck,
  ShieldCheck,
} from "lucide-react";
import OptionSelector from "@/components/OptionSelector";
import Link from "next/link";

export default function ProductDetailClient({ 
  product, 
}: ProductDetailClientProps): React.JSX.Element {
  const router = useRouter();
  const { addToCart, updateCartItem, favorites, toggleFavorite } = useShop();
  const { t } = useLanguage();
  const { showError } = useAlert();

  const searchParams = useSearchParams();
  const [selectedSize, setSelectedSize] = useState<string>(
    searchParams.get("size") || ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    searchParams.get("color") || ""
  );
  
  const isFavorited:boolean = favorites.includes(product?.id || "");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  // Reset success state when user changes size or color
  useEffect(() => {
    setIsUpdated(false);
    setCurrentImageIndex(0);
  }, [selectedSize, selectedColor]);

  // Filter images based on selected color using useMemo
  const displayImages:ProductImage[] = useMemo(() => {
    const filtered = product.images.filter(img => 
      img.color === "Genel" || (selectedColor && img.color === selectedColor)
    );
    return filtered.length > 0 ? filtered : product.images;
  }, [product.images, selectedColor]);

  // Variant Logic
  const hasVariants:boolean = product.hasVariants;
  const variants:ProductVariant[] = product.variants || [];

  // Derived state for variants
  const availableSizes:string[] = useMemo(() => {
    if (hasVariants && selectedColor) {
      return variants.find(v => v.color === selectedColor)?.sizes || [];
    }
    return product.sizes;
  }, [hasVariants, selectedColor, variants, product.sizes]);

  const isVariantInStock:boolean = useMemo(() => {
    if (hasVariants && selectedColor) {
      return variants.find(v => v.color === selectedColor)?.inStock ?? false;
    }
    return product.inStock;
  }, [hasVariants, selectedColor, variants, product.inStock]);

  // Discount Logic
  const originalPrice:number = product.originalPrice || 0;
  const finalPrice:number = product.price;
  const hasDiscount:boolean = originalPrice > finalPrice;
  const discountPercentage:number = hasDiscount 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  // Mobile Swipe Logic (Horizontal)
  const handleScroll:React.UIEventHandler<HTMLDivElement>  = (e: React.UIEvent<HTMLDivElement>) => {
    const container:HTMLDivElement = e.currentTarget;
    const scrollLeft:number = container.scrollLeft;
    const width:number = container.offsetWidth;
    const index:number = Math.round(scrollLeft / width);
    setCurrentImageIndex(index);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold uppercase mb-4">
            Product Not Found
          </h2>
          <Link
            href="/products"
            className="text-sm underline font-bold uppercase hover:opacity-60 transition-opacity"
          >
            {t("products.backToProducts")}
          </Link>
        </div>
      </div>
    );
  }

  // Check if we're in edit mode
  const originalSize = searchParams.get("size");
  const originalColor = searchParams.get("color");
  const isEditMode = !!(originalSize && originalColor);

  const handleAddToCart:React.MouseEventHandler<HTMLButtonElement> = async () => {
    if (!selectedSize && product.sizes.length > 0) {
      showError("Lütfen bir beden seçiniz.");
      return;
    }
    
    // Variant Stock Check
    if (hasVariants && selectedColor) {
      const variant = variants.find(v => v.color === selectedColor);
      if (variant && !variant.inStock) {
        showError("Seçilen varyasyon stokta yok.");
        return;
      }
    }

    // Determine effective values (use "Standard" if options are empty)
    const effectiveSize:string = product.sizes?.length > 0 ? selectedSize : "Standard";
    const effectiveColor:string = product.colors?.length > 0 ? selectedColor : "Standard";

    // Validate only if options exist
    if (product.sizes?.length > 0 && !selectedSize) return;
    if (product.colors?.length > 0 && !selectedColor) return;

    if (isEditMode && (originalSize !== selectedSize || originalColor !== selectedColor)) {
      // Update existing cart item
      await updateCartItem(product.id, originalSize!, originalColor!, effectiveSize, effectiveColor);
      setIsUpdated(true);
    } else if (!isEditMode) {
      // Normal add to cart flow
      await addToCart(product, effectiveSize, effectiveColor);
    }
    
    setIsDrawerOpen(false);
  };

  const isSizeValid:boolean = product.sizes?.length > 0 ? !!selectedSize : true;
  const isColorValid:boolean = product.colors?.length > 0 ? !!selectedColor : true;
  const canAddToCart:boolean = product.inStock && isSizeValid && isColorValid && (!hasVariants || (hasVariants && isVariantInStock));

  const handleToggleFavorite:React.MouseEventHandler<HTMLButtonElement> = () => {
    if (product) {
      toggleFavorite(product.id);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:grid lg:grid-cols-12 min-h-screen max-w-[1920px] mx-auto gap-8 px-8 pt-28 pb-8">
        {/* Left Column: Vertical Grid / Masonry */}
        <div className="col-span-8 relative">
          <div className="grid grid-cols-2 gap-2">
            {displayImages.map((img, index) => {
              // Logic for odd number of images: make the last one span full width
              const isLast = index === displayImages.length - 1;
              const isOddTotal = displayImages.length % 2 !== 0;
              const spanClass = (isLast && isOddTotal) ? "col-span-2" : "col-span-1";

              return (
                <div
                  key={index}
                  className={`relative w-full aspect-[3/4] ${spanClass}`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index < 2}
                    sizes="(min-width: 1024px) 25vw, 100vw"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sticky Product Details */}
        <div className="col-span-4 relative h-full">
          <div className="sticky top-24 h-fit flex flex-col pl-8">
            {/* Header Info */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold uppercase tracking-tight leading-none text-black">
                  {product.name}
                </h1>
                <button
                  onClick={handleToggleFavorite}
                  className="hover:text-primary-600 transition-colors"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isFavorited
                        ? "fill-primary-600 text-primary-600"
                        : "text-primary-400"
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-baseline gap-3 mt-2">
                {hasDiscount ? (
                  <>
                    <span className="text-gray-400 line-through text-lg">
                      {originalPrice.toFixed(2)} {t("products.currency")}
                    </span>
                    <span className="text-2xl font-bold text-black">
                      {finalPrice.toFixed(2)} {t("products.currency")}
                    </span>
                  <span className="text-xs font-medium text-white bg-red-600 px-2 py-1 ">
                    -{discountPercentage}%
                  </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-black">
                    {finalPrice.toFixed(2)} {t("products.currency")}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">
                REF. {product.id.substring(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 leading-relaxed mb-10">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <OptionSelector
                  label="Renk"
                  options={product.colors}
                  selectedOption={selectedColor}
                  onSelect={(color) => {
                    setSelectedColor(color);
                    setSelectedSize(""); // Reset size when color changes
                  }}
                />
              </div>
            )}

            {/* Sizes - Only show if color is selected (if colors exist) */}
            {availableSizes.length > 0 && (!product.colors.length || selectedColor) && (
              <div className="mb-8">
                <OptionSelector
                  label="Beden"
                  options={availableSizes.sort((a, b) => a.localeCompare(b))}
                  selectedOption={selectedSize}
                  onSelect={setSelectedSize}
                />
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
                  canAddToCart
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {!isSizeValid || !isColorValid
                  ? (!isSizeValid && !isColorValid
                      ? "Lütfen Renk ve Beden Seçin"
                      : !isSizeValid
                      ? "Lütfen Beden Seçin"
                      : "Lütfen Renk Seçin")
                  : (product.inStock 
                      ? (hasVariants && selectedColor && !isVariantInStock ? "Tükendi" : t("products.addToCart"))
                      : "Tükendi")}
              </button>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary-100">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-5 h-5 text-primary-600" />
                  <span className="text-[10px] font-bold uppercase text-gray-600">
                    Free Shipping
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                  <span className="text-[10px] font-bold uppercase text-gray-600">
                    Secure Payment
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 cursor-pointer hover:text-primary-600 transition-colors">
                  <Share2 className="w-5 h-5 text-primary-600" />
                  <span className="text-[10px] font-bold uppercase text-gray-600">
                    Share
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden min-h-screen w-full bg-white pb-24">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-30 p-4 flex justify-between items-start pointer-events-none">
          <button
            onClick={() => router.back()}
            className="pointer-events-auto p-2 bg-white/80 backdrop-blur-md rounded-full text-black shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-3 pointer-events-auto">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 backdrop-blur-md rounded-full transition-colors shadow-sm ${
                isFavorited ? "bg-primary-600 text-white" : "bg-white/80 text-black"
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorited ? "fill-white" : ""}`} />
            </button>
            <button className="p-2 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-white transition-colors shadow-sm">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Horizontal Image Slider */}
        <div className="relative w-full aspect-[3/4]">
          <div
            className="flex overflow-x-auto snap-x snap-mandatory w-full h-full hide-scrollbar"
            onScroll={handleScroll}
          >
            {displayImages.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 snap-center relative h-full">
                <Image
                  src={image.url}
                  alt={`${product.name} - ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
          
          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
        </div>

        {/* Mobile Product Info */}
        <div className="px-5 py-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
              {product.name}
            </h1>
          </div>
          
          <div className="flex items-baseline gap-3 mb-6">
            {hasDiscount ? (
              <>
                <span className="text-gray-400 line-through text-sm">
                  {originalPrice.toFixed(2)} {t("products.currency")}
                </span>
                <span className="text-xl font-bold text-black">
                  {finalPrice.toFixed(2)} {t("products.currency")}
                </span>
                <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 uppercase">
                  -{discountPercentage}%
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-black">
                {finalPrice.toFixed(2)} {t("products.currency")}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            {product.description}
          </p>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full py-4 bg-primary-600 text-white font-bold uppercase tracking-widest hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>
              {isUpdated
                ? t("products.cartUpdated")
                : isEditMode
                  ? t("products.updateCart")
                  : t("products.addToCart")}
            </span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Drawer */}
        <div
          className={`fixed inset-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isDrawerOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setIsDrawerOpen(false)}
            style={{ opacity: isDrawerOpen ? 1 : 0 }}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 pt-4 pb-2 flex justify-center border-b border-primary-100">
              <div className="w-12 h-1.5 bg-primary-200 rounded-full" />
            </div>

            <div className="p-6 space-y-8 pb-12">
              {/* Header in Drawer */}
              <div className="flex-1">
              <h2 className="text-2xl font-bold uppercase tracking-tight shadow-black drop-shadow-md">
                {product.name}
              </h2>
              <p className="text-xl font-medium mt-1 drop-shadow-md">
                {finalPrice.toFixed(2)} {t("products.currency")}
              </p>
            </div>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div>
                  <OptionSelector
                    label={t("products.color")}
                    options={product.colors}
                    selectedOption={selectedColor}
                    onSelect={(color) => {
                      setSelectedColor(color);
                      setSelectedSize(""); // Reset size when color changes
                    }}
                  />
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (!product.colors.length || selectedColor) && (
                <div>
                  <OptionSelector
                    label={t("products.size")}
                    options={availableSizes}
                    selectedOption={selectedSize}
                    onSelect={setSelectedSize}
                  />
                </div>
              )}

              {/* Add Button */}
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`w-full py-4 text-sm font-bold uppercase tracking-widest ${
                  canAddToCart
                    ? "bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {!isSizeValid || !isColorValid
                  ? (!isSizeValid && !isColorValid
                      ? "Lütfen Renk ve Beden Seçin"
                      : !isSizeValid
                      ? "Lütfen Beden Seçin"
                      : "Lütfen Renk Seçin")
                  : (product.inStock
                      ? (hasVariants && selectedColor && !isVariantInStock ? "Tükendi" : (isUpdated
                        ? t("products.cartUpdated")
                        : isEditMode
                          ? t("products.updateCart")
                          : t("products.addToCart")))
                      : t("products.outOfStock"))}
              </button>

              {/* Details Accordion */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <details className="group">
                  <summary className="flex justify-between items-center font-bold uppercase text-sm cursor-pointer list-none">
                    {t("products.productDescription")}
                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center font-bold uppercase text-sm cursor-pointer list-none">
                    {t("products.shippingReturns")}
                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="mt-4 text-sm text-gray-600 space-y-2">
                    <p>{t("products.freeShippingFrom")}</p>
                    <p>{t("products.returnPolicy")}</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
