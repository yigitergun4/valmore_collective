"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useState, useRef, useMemo, useCallback } from "react";
import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Optimize: images.filter() her render'da çalışmasın
  const images = useMemo(
    () => product.images.filter((img) => img && img.trim() !== ""),
    [product.images]
  );
  const hasMultipleImages = images.length > 1;
  const imagesLength = images.length;

  // İndirim hesaplama (örnek)
  const originalPrice = product.originalPrice || product.price * 1.3;
  const discountPercentage = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100
  );
  const hasDiscount = discountPercentage > 0;

  // Mouse pozisyonuna göre resim değiştirme (desktop) - Throttled
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasMultipleImages || !imageContainerRef.current) return;

      // Throttle: Her 50ms'de bir çalışsın
      if (throttleTimeoutRef.current) return;

      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null;
      }, 50);

      const rect = imageContainerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const cardWidth = rect.width;

      // Mouse'un kart içindeki yüzdesini hesapla (0-1 arası)
      const mousePosition = mouseX / cardWidth;

      // Hangi resim bölümünde olduğunu hesapla
      const sectionIndex = Math.floor(mousePosition * imagesLength);
      const newIndex = Math.min(sectionIndex, imagesLength - 1);

      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    },
    [hasMultipleImages, imagesLength, currentImageIndex]
  );

  // Touch event handlers (mobil)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!hasMultipleImages) return;

    const swipeThreshold = 50; // Minimum kaydırma mesafesi (px)
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Sola kaydırma - sonraki resim
        setCurrentImageIndex((prev) => (prev + 1) % imagesLength);
      } else {
        // Sağa kaydırma - önceki resim
        setCurrentImageIndex(
          (prev) => (prev - 1 + imagesLength) % imagesLength
        );
      }
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

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
        <div className="bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg">
          {/* Görsel Container */}
          <div
            ref={imageContainerRef}
            className="aspect-[3/4] relative overflow-hidden bg-gray-50 touch-pan-y"
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
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />

                {/* Favori Butonu */}
                <button
                  onClick={handleFavoriteClick}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20"
                  aria-label={t("products.addToFavorites")}
                >
                  <Heart
                    size={18}
                    className={`transition-colors ${
                      isFavorited
                        ? "fill-orange-500 text-orange-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>

                {/* İndirim Badge'i */}
                {hasDiscount && (
                  <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                    %{discountPercentage}
                  </div>
                )}

                {/* Görsel İndikatörleri */}
                {hasMultipleImages && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? "w-4 bg-white"
                            : "w-1 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Hover'da "Hızlı Bak" butonu */}
                <div
                  className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-12 pb-3 transition-opacity duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="text-center">
                    <span className="text-white text-sm font-medium">
                      {t("products.quickView")}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">
                  {t("products.noImage")}
                </span>
              </div>
            )}
          </div>

          {/* Ürün Bilgileri */}
          <div className="p-2.5">
            {/* Marka/Kategori */}
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
              {product.brand || product.category}
            </div>

            {/* Ürün Adı */}
            <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 h-10 leading-5 font-normal">
              {product.name}
            </h3>

            {/* Fiyat Bilgisi */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900">
                {product.price.toFixed(2)} {t("products.currency")}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {originalPrice.toFixed(2)} {t("products.currency")}
                </span>
              )}
            </div>
            <div className="text-xs text-green-600 font-medium">
              {t("products.freeShipping")}
            </div>
            {product.rating && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex text-orange-400">
                  {"★".repeat(Math.floor(product.rating))}
                  {"☆".repeat(5 - Math.floor(product.rating))}
                </div>
                <span className="text-xs text-gray-500">
                  ({product.reviewCount || 0})
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
