"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useState, useRef, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import FavoriteButton from "./FavoriteButton";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const images: string[] = useMemo(
    () => product.images.map(img => img.url).filter((url) => url && url.trim() !== ""),
    [product.images]
  );
  const hasMultipleImages: boolean = images.length > 1;
  const imagesLength: number = images.length;

  const originalPrice: number = product.originalPrice || 0;
  const discountedPrice: number | undefined = product.price;
  const hasDiscount: boolean = !!discountedPrice && discountedPrice < originalPrice;
  const discountPercentage: number = hasDiscount
    ? Math.round(((originalPrice - discountedPrice!) / originalPrice) * 100)
    : 0;

  const handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasMultipleImages || !imageContainerRef.current) return;

      if (throttleTimeoutRef.current) return;

      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null;
      }, 50);

      const rect: DOMRectReadOnly = imageContainerRef.current.getBoundingClientRect();
      const mouseX: number = e.clientX - rect.left;
      const cardWidth: number = rect.width;
      const mousePosition: number = mouseX / cardWidth;
      const sectionIndex: number = Math.floor(mousePosition * imagesLength);
      const newIndex: number = Math.min(sectionIndex, imagesLength - 1);

      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    },
    [hasMultipleImages, imagesLength, currentImageIndex]
  );

  const handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;
    touchStartX.current = e.touches[0].clientX;
  },
    [hasMultipleImages]
  );

  const handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;
    touchEndX.current = e.touches[0].clientX;
  },
    [hasMultipleImages]
  );

  const handleTouchEnd: () => void = useCallback(() => {
    if (!hasMultipleImages) return;

    const swipeThreshold: number = 50;
    const diff: number = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % imagesLength);
      } else {
        setCurrentImageIndex(
          (prev) => (prev - 1 + imagesLength) % imagesLength
        );
      }
    }
  },
    [hasMultipleImages, imagesLength]
  );



  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="bg-white">
          {/* Image Container */}
          <div
            ref={imageContainerRef}
            className="aspect-[3/4] relative overflow-hidden bg-gray-50 touch-pan-y mb-2 lg:mb-3"
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {images.length > 0 && images[currentImageIndex] ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={`${product.name} - ${currentImageIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />

                <div className="absolute top-2 right-2 z-20 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <FavoriteButton
                    productId={product.id}
                    className="bg-white/90 hover:bg-white shadow-sm"
                  />
                </div>

                {hasDiscount && (
                  <div className="absolute top-2 left-2 bg-primary-600 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-[0.15em] z-10">
                    -{discountPercentage}%
                  </div>
                )}

                {/* Image Indicators - Desktop Only */}
                {hasMultipleImages && isHovered && (
                  <div className="hidden lg:flex absolute bottom-2 left-1/2 -translate-x-1/2 gap-1 z-10">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`h-0.5 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? "w-3 bg-white"
                            : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                  {t("products.noImage")}
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="px-0.5">
            <h3 className="text-[11px] lg:text-xs font-bold text-black uppercase tracking-wide mb-1 truncate">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-[9px] lg:text-[10px] text-gray-500 uppercase tracking-wider">
                {product.category}
              </p>
              <div className="flex flex-col items-end">
                {hasDiscount && (
                  <span className="text-[9px] lg:text-[10px] text-gray-400 line-through">
                    {originalPrice.toFixed(2)} {t("products.currency")}
                  </span>
                )}
                <span
                  className={`text-xs lg:text-sm font-bold ${
                    hasDiscount ? "text-primary-600" : "text-black"
                  }`}
                >
                  {(discountedPrice || originalPrice).toFixed(2)} {t("products.currency")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
