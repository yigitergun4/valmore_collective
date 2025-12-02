"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getColorHex } from "@/lib/colorUtils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const originalPrice: number = product.originalPrice || 0;
  const discountedPrice: number | undefined = product.price;
  const hasDiscount: boolean = !!discountedPrice && discountedPrice < originalPrice;
  const discountPercentage: number = hasDiscount
    ? Math.round(((originalPrice - discountedPrice!) / originalPrice) * 100)
    : 0;

  // Get first image as fallback
  const primaryImage: string | undefined = product.images[0]?.url;

  const handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!product.images || product.images.length <= 1) return;
    
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x: number = e.clientX - left;
    const sectionWidth: number = width / product.images.length;
    const index: number = Math.floor(x / sectionWidth);
    
    // Ensure index is within bounds
    const safeIndex: number = Math.max(0, Math.min(index, product.images.length - 1));
    setActiveImageIndex(safeIndex);
  };

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImageIndex(0);
      }}
      onMouseMove={handleMouseMove}
    >
      <Link href={`/products/${product.id}`} className="block flex-1">
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 mb-3">
          {primaryImage ? (
            <>
              {/* Active Image */}
              <Image
                src={product.images[activeImageIndex]?.url || primaryImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                priority={activeImageIndex === 0}
              />
              
              {/* Image Indicators (Optional: Show dots or lines to indicate multiple images) */}
              {isHovered && product.images.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20">
                  {product.images.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        idx === activeImageIndex ? "w-4 bg-black" : "w-1 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {t("products.noImage")}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.featured && (
              <span className="bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm min-w-[50px] text-center flex justify-center items-center h-6">
                {t("products.featured")}
              </span>
            )}
          </div>
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            {hasDiscount && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm max-w-[40px] text-center flex justify-center items-center h-6">
                -{discountPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {product.brand || "VALMORÉ"}
              </span>
              <h3 className="text-xs font-medium text-black uppercase tracking-wide line-clamp-2">
                {product.name}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              {hasDiscount ? (
                <>
                  <span className="text-[10px] text-gray-400 line-through decoration-primary-600/50 whitespace-nowrap">
                    {originalPrice.toFixed(2)} {t("products.currency")}
                  </span>
                  <span className="text-sm font-bold text-primary-600 whitespace-nowrap">
                    {discountedPrice?.toFixed(2)} {t("products.currency")}
                  </span>
                </>
              ) : (
                <span className="text-xs font-bold text-black whitespace-nowrap">
                  {discountedPrice?.toFixed(2)} {t("products.currency")}
                </span>
              )}
            </div>
          </div>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1 mt-1">
              {product.colors.slice(0, 4).map((color, index) => {
                if(getColorHex(color) == "#D1D5DB") {
                  return;
                }
                return <div
                key={index}
                className="w-2 h-2 rounded-full border border-gray-300"
                style={{ backgroundColor: getColorHex(color) }}
                title={color}
              />
              })}
              {product.colors.length > 4 && (
                <span className="text-[9px] text-gray-400 leading-none flex items-center">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
