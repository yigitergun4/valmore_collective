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
  Truck,
  ShieldCheck,
} from "lucide-react";
import OptionSelector from "@/components/OptionSelector";
import ProductInfo from "@/components/products/ProductInfo";
import ExpandableText from "@/components/products/ExpandableText";
import Link from "next/link";

export default function ProductDetailClient(props: ProductDetailClientProps): React.JSX.Element {
  const { product, allProducts } = props;

  const router = useRouter();
  const { addToCart, updateCartItem, favorites, toggleFavorite } = useShop();
  const { t } = useLanguage();
  const { showError } = useAlert();
  const searchParams = useSearchParams();
  // Get the first product image's color to use as default (excluding "Genel")
  const firstImageColor:string = product.images.find(img => img.color !== "Genel")?.color || product.colors[0] || "";
  
  const [selectedSize, setSelectedSize] = useState<string>(
    searchParams.get("size") || ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    searchParams.get("color") || firstImageColor
  );
  const isFavorited:boolean = favorites.includes(product?.id || "");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  // Reset success state when user changes size or color
  useEffect(() => {
    setIsUpdated(false);
    setCurrentImageIndex(0);
  }, [selectedSize, selectedColor]);

  // Filter images based on selected color using useMemo
  const displayImages:ProductImage[] = useMemo(() => {
    const filtered:ProductImage[] = product.images.filter(img => 
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
      // Get all sizes from all variants matching the selected color
      const colorVariants:ProductVariant[] = variants.filter(v => v.color === selectedColor);
      const allSizes:string[] = colorVariants.flatMap(v => v.sizes);
      // Return unique sizes
      return [...new Set(allSizes)];
    }
    return product.sizes;
  }, [hasVariants, selectedColor, variants, product.sizes]);

  // Check if any variant of the selected color is in stock
  const isVariantInStock:boolean = useMemo(() => {
    if (hasVariants && selectedColor) {
      // Return true if ANY variant of this color is in stock
      return variants.some(v => v.color === selectedColor && v.inStock);
    }
    return product.inStock;
  }, [hasVariants, selectedColor, variants, product.inStock]);

  // Determine unavailable sizes (sizes that should be disabled)
  const unavailableSizes:string[] = useMemo(() => {
    if (hasVariants && selectedColor) {
      // Get sizes that are out of stock for this color
      const colorVariants:ProductVariant[] = variants.filter(v => v.color === selectedColor);
      const outOfStockSizes: string[] = [];
      
      colorVariants.forEach(v => {
        if (!v.inStock) {
          v.sizes.forEach(size => outOfStockSizes.push(size));
        }
      });
      
      return [...new Set(outOfStockSizes)];
    }
    // If product itself is not in stock, all sizes are unavailable
    if (!hasVariants && !product.inStock) {
      return product.sizes;
    }
    return [];
  }, [hasVariants, selectedColor, variants, product.inStock, product.sizes]);

  // Discount Logic
  const originalPrice:number = product.originalPrice || 0;
  const finalPrice:number = product.price;
  const hasDiscount:boolean = originalPrice > finalPrice;
  const discountPercentage:number = hasDiscount 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

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

  // New Swipe Logic (Horizontal for Product Navigation)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance:number = 50;

  const onTouchStart:React.TouchEventHandler<HTMLDivElement> = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove:React.TouchEventHandler<HTMLDivElement> = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd:React.TouchEventHandler<HTMLDivElement> = () => {
    if (!touchStart || !touchEnd) return;
    const distance:number = touchStart - touchEnd;
    const isLeftSwipe:boolean = distance > minSwipeDistance;
    const isRightSwipe:boolean = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      if (!allProducts || allProducts.length === 0) return;
      const currentIndex:number = allProducts.findIndex((p:any) => p.id === product.id);
      if (currentIndex === -1) return;

      let nextIndex:number = -1;
      if (isLeftSwipe) {
         // Next product
         nextIndex = currentIndex + 1 < allProducts.length ? currentIndex + 1 : 0;
      } else {
         // Prev product
         nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : allProducts.length - 1;
      }
      
      if (nextIndex !== -1) {
        router.push(`/products/${allProducts[nextIndex].id}`);
      }
    }
  };

  // Check if we're in edit mode
  const originalSize:string | null = searchParams.get("size");
  const originalColor:string | null = searchParams.get("color");
  const isEditMode:boolean = !!(originalSize && originalColor);

  const handleAddToCart:React.MouseEventHandler<HTMLButtonElement> = async () => {
    if (!selectedSize && product.sizes.length > 0) {
      showError(t("products.selectSize"));
      return;
    }
    
    // Variant Stock Check
    if (hasVariants && selectedColor) {
      const variant:ProductVariant | undefined = variants.find(v => 
        v.color === selectedColor && 
        ((v as any).size === selectedSize || v.sizes?.includes(selectedSize))
      );
      if (variant && !variant.inStock) {
        showError(t("products.variantNotInStock"));
        return;
      }
    }

    // Determine effective values (use "Standard" if options are empty)
    const effectiveSize:string = product.sizes?.length > 0 ? selectedSize : "Standard";
    const effectiveColor:string = product.colors?.length > 0 ? selectedColor : "Standard";

    // Check if there's a matching image for the selected color
    const hasMatchingImage:boolean = product.images.some(
      img => img.color === effectiveColor || img.color === "Genel"
    );
    if (!hasMatchingImage && product.colors?.length > 0) {
      showError(t("products.noMatchingImage") || "Bu renk için fotoğraf bulunamadı");
      return;
    }

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
              const isLast:boolean = index === displayImages.length - 1;
              const isOddTotal:boolean = displayImages.length % 2 !== 0;
              const spanClass:string = (isLast && isOddTotal) ? "col-span-2" : "col-span-1";
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
            {/* Description - Truncated with Show More */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">
                {t("products.productDescription")}
              </h3>
              <ExpandableText text={product.description} maxLines={3} />
            </div>

            {/* Product Info (Material, Fit, Care) */}
            <ProductInfo product={product} />
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
                  disabledOptions={unavailableSizes}
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
                      ? t("products.selectSizeColor")
                      : !isSizeValid
                      ? t("products.selectSize")
                      : t("products.selectColor"))
                  : (product.inStock 
                      ? (hasVariants && selectedColor && !isVariantInStock ? t("products.outOfStock") : (isUpdated ? t("products.cartUpdated") : isEditMode ? t("products.updateCart") : t("products.addToCart")))
                      : t("products.outOfStock"))}
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

        {/* Vertical Image Slider (Mobile) - starts below header */}
        <div 
          className="relative w-full h-[calc(100vh-4rem)] mt-16 bg-white group"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex flex-col overflow-y-auto snap-y snap-mandatory w-full h-full hide-scrollbar scroll-smooth"
            onScroll={(e) => {
               // Optional: Update index based on vertical scroll if we want 'dots' to reflect vertical pos.
               // For vertical "Bershka style", dots might not be necessary or should be vertical.
               // Let's implement index tracking for vertical scroll too.
               const container = e.currentTarget;
               const scrollTop = container.scrollTop;
               const height = container.offsetHeight;
               const index = Math.round(scrollTop / height);
               setCurrentImageIndex(index);
            }}
          >
            {displayImages.map((image, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 snap-center relative">
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
          
          {/* Vertical Progress Indicator (Optional, maybe on right side?) 
              Or keep bottom dots if it makes sense. Let's keep bottom dots but they might overlay the bottom of the image.
           */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
            {displayImages.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "h-4 bg-white shadow-md"
                    : "h-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile Product Info */}
        <div className="px-5 py-6 space-y-6">
          {/* Product Name & Reference */}
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              REF. {product.id.substring(0, 8).toUpperCase()}
            </p>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
              {product.name}
            </h1>
          </div>
          
          {/* Price */}
          <div className="flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-bold text-black">
                  {finalPrice.toFixed(2)} {t("products.currency")}
                </span>
                <span className="text-gray-400 line-through text-sm">
                  {originalPrice.toFixed(2)} {t("products.currency")}
                </span>
                <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5">
                  -{discountPercentage}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-black">
                {finalPrice.toFixed(2)} {t("products.currency")}
              </span>
            )}
          </div>

          {/* Color Selection - Inline */}
          {product.colors.length > 0 && (
            <OptionSelector
              label={t("products.color")}
              options={product.colors}
              selectedOption={selectedColor}
              onSelect={(color) => {
                setSelectedColor(color);
                setSelectedSize("");
              }}
            />
          )}

          {/* Size Selection - Inline */}
          {product.sizes && product.sizes.length > 0 && (!product.colors.length || selectedColor) && (
            <OptionSelector
              label={t("products.size")}
              options={availableSizes}
              selectedOption={selectedSize}
              onSelect={setSelectedSize}
              disabledOptions={unavailableSizes}
            />
          )}

          {/* Description - Expandable */}
          <div className="pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2">
              {t("products.productDescription")}
            </h3>
            <ExpandableText text={product.description} maxLines={3} />
          </div>

          {/* Product Info Accordions */}
          <ProductInfo product={product} />

          {/* Shipping Info Badge */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
            <Truck className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">{t("products.freeShipping")}</p>
              <p className="text-gray-500 text-xs">{t("products.freeShippingFrom")}</p>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-5 py-4 shadow-lg">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`w-full py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
              canAddToCart
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {!isSizeValid || !isColorValid
              ? (!isSizeValid && !isColorValid
                  ? t("products.selectSizeColor")
                  : !isSizeValid
                  ? t("products.selectSize")
                  : t("products.selectColor"))
              : (product.inStock
                  ? (hasVariants && selectedColor && !isVariantInStock 
                      ? t("products.outOfStock") 
                      : (isUpdated
                          ? t("products.cartUpdated")
                          : isEditMode
                            ? t("products.updateCart")
                            : t("products.addToCart")))
                  : t("products.outOfStock"))}
          </button>
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
