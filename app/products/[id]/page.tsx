"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  getProductById,
  getRelatedProducts,
  getAllProducts,
} from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  Heart,
  Share2,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const product = getProductById(params.id as string);
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isShowingRelatedProducts, setIsShowingRelatedProducts] =
    useState(false);
  const relatedProductsScrollRef = useRef<HTMLDivElement>(null);
  const relatedProductsScrollRefMobile = useRef<HTMLDivElement>(null);
  const relatedProductsScrollRefMobileInside = useRef<HTMLDivElement>(null);
  const relatedProductsTouchStartX = useRef<number>(0);
  const relatedProductsTouchStartY = useRef<number>(0);
  const isScrollingRelatedProducts = useRef<boolean>(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const desktopImageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const allProducts = getAllProducts();
  const currentProductIndex = allProducts.findIndex((p) => p.id === params.id);
  const relatedProducts = getRelatedProducts(params.id as string, 4);

  // Scroll ile görsel değiştirme (mobilde)
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || !product) return;

    // Sadece mobilde çalışsın
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const index = Math.round(scrollTop / itemHeight);

      // İlgili ürünler bölümüne gelip gelmediğini kontrol et
      const isAtRelatedProducts = index >= product.images.length;
      setIsShowingRelatedProducts(isAtRelatedProducts);

      // Resim index'ini güncelle (sadece resimler için)
      setCurrentImageIndex(Math.min(index, product.images.length - 1));
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [product]);

  // Drawer açıkken arka plandaki scroll'u engelle (mobilde)
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    // Sadece mobilde çalışsın
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;

    if (isDrawerOpen) {
      container.style.overflow = "hidden";
      container.style.touchAction = "none";
    } else {
      container.style.overflow = "scroll";
      container.style.touchAction = "auto";
    }

    return () => {
      container.style.overflow = "scroll";
      container.style.touchAction = "auto";
    };
  }, [isDrawerOpen]);

  // Desktop'ta keyboard navigation (left/right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!product) return;

      // Sadece desktop'ta çalışsın
      if (window.innerWidth < 1024) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedImageIndex((prev) =>
          prev > 0 ? prev - 1 : product.images.length - 1
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedImageIndex((prev) =>
          prev < product.images.length - 1 ? prev + 1 : 0
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product]);

  // Mobilde sağa-sola swipe ile ürün değiştirme
  const touchStartY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // İlgili ürünler scroll'u aktifse ana touch handler'ı çalıştırma
    if (isScrollingRelatedProducts.current) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // İlgili ürünler scroll'u aktifse ana touch handler'ı çalıştırma
    if (isScrollingRelatedProducts.current) return;

    touchEndX.current = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    // Yatay veya dikey kaydırma kontrolü
    const deltaX = Math.abs(touchStartX.current - touchEndX.current);
    const deltaY = Math.abs(touchStartY.current - touchEndY);

    // Yatay kaydırma daha fazlaysa ürün değiştirme moduna geç
    if (deltaX > deltaY && deltaX > 10) {
      isHorizontalSwipe.current = true;
      // Dikey scroll'u engelle
      if (imageContainerRef.current) {
        imageContainerRef.current.style.overflowY = "hidden";
      }
    }
  };

  const handleTouchEnd = () => {
    if (!product || !isHorizontalSwipe.current) {
      // Dikey scroll'u tekrar aktif et
      if (imageContainerRef.current) {
        imageContainerRef.current.style.overflowY = "scroll";
      }
      return;
    }

    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Sola kaydırma - sonraki ürüne geç
        const nextIndex = (currentProductIndex + 1) % allProducts.length;
        router.push(`/products/${allProducts[nextIndex].id}`);
      } else {
        // Sağa kaydırma - önceki ürüne geç
        const prevIndex =
          (currentProductIndex - 1 + allProducts.length) % allProducts.length;
        router.push(`/products/${allProducts[prevIndex].id}`);
      }
    } else {
      // Scroll'u tekrar aktif et
      if (imageContainerRef.current) {
        imageContainerRef.current.style.overflowY = "scroll";
      }
    }

    isHorizontalSwipe.current = false;
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-black mb-4">
            {t("products.notFound")}
          </h2>
          <Link href="/products" className="text-sm underline text-black">
            {t("products.backToProducts")}
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert(t("products.selectSizeColor"));
      return;
    }
    addToCart(product, selectedSize, selectedColor, 1);
    setIsDrawerOpen(false);
  };

  const handleFavoriteClick = () => {
    if (!user) {
      router.push("/login?redirect=/products/" + params.id);
      return;
    }
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="min-h-screen lg:h-auto bg-white">
      {/* Desktop Layout - 2 Kolon */}
      {/* Header - Mobilde fixed, Desktop'ta sticky */}
      <div className="hidden lg:block fixed lg:sticky top-0 left-0 right-0 bg-transparent backdrop-blur-none border-b border-transparent">
        <div className="max-w-10xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Geri Butonu - En solda */}
          <button
            onClick={() => router.push("/products")}
            className="flex items-center text-black hover:opacity-60 transition-opacity"
            aria-label={t("products.back")}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Sağ tarafta butonlar */}
          <div className="flex items-center gap-8">
            <button
              onClick={handleFavoriteClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={t("products.addToFavorites")}
            >
              <Heart
                size={24}
                className={`${
                  isFavorited
                    ? "fill-primary-600 text-primary-600"
                    : "text-black"
                }`}
              />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={t("products.share")}
            >
              <Share2 size={24} className="text-black" />
            </button>
          </div>
        </div>
      </div>
      <div className="hidden lg:block max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-0">
          {/* Image Gallery - Sol taraf */}
          <div className="hidden lg:flex gap-6 h-[calc(100vh-60px)]">
            <div className="w-28 overflow-y-auto hide-scrollbar py-4 flex flex-col gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-full aspect-[3/4] border transition-all rounded-md overflow-hidden
          ${
            selectedImageIndex === index
              ? "border-black"
              : "border-transparent opacity-60 hover:opacity-100"
          }`}
                >
                  <Image
                    src={img}
                    alt="Thumbnail"
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="relative flex-1 h-full rounded-xl overflow-hidden group">
              {product.images.length > 1 && (
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev > 0 ? prev - 1 : product.images.length - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/60 hover:bg-white shadow-lg w-10 h-10 flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="text-black" />
                </button>
              )}
              {product.images.length > 1 && (
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev < product.images.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/60 hover:bg-white shadow-lg w-10 h-10 flex items-center justify-center transition-all"
                >
                  <ChevronRight className="text-black" />
                </button>
              )}
              <div className="relative w-full h-full transition-all duration-700 ease-in-out">
                <Image
                  key={selectedImageIndex}
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover transition-opacity duration-500 ease-in-out opacity-100"
                />
              </div>
            </div>
          </div>

          <style jsx>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <div className="px-6 lg:px-12 py-8 lg:py-12">
            {/* Ürün Başlığı */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-normal text-black mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold text-black mb-6">
                {product.price.toFixed(2)} {t("products.currency")}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-black uppercase tracking-wide">
                  {t("products.color")}
                </span>
                {selectedColor && (
                  <span className="text-sm text-gray-600">{selectedColor}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 text-sm font-medium transition-all border ${
                      selectedColor === color
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-300 text-black hover:border-primary-600"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-black uppercase tracking-wide">
                  {t("products.size")}
                </span>
                <button className="text-sm underline text-black hover:opacity-60">
                  {t("products.sizeGuide")}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm font-medium transition-all border ${
                      selectedSize === size
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-300 text-black hover:border-primary-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || !selectedSize || !selectedColor}
              className={`w-full py-4 text-sm font-semibold uppercase tracking-wider transition-all mb-4 ${
                product.inStock && selectedSize && selectedColor
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {product.inStock
                ? t("products.addToCart")
                : t("products.outOfStock")}
            </button>

            {/* Accordion Sections */}
            <div className="border-t border-gray-200 mt-8">
              <details className="group border-b border-gray-200">
                <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {t("products.productDescription")}
                  </span>
                  <span className="text-xl group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="pb-4 text-sm text-gray-700">
                  <p>{product.description}</p>
                </div>
              </details>

              <details className="group border-b border-gray-200">
                <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {t("products.shippingReturns")}
                  </span>
                  <span className="text-xl group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="pb-4 text-sm text-gray-700">
                  <p>{t("products.freeShippingFrom")}</p>
                  <p className="mt-2">{t("products.returnPolicy")}</p>
                </div>
              </details>

              <details className="group border-b border-gray-200">
                <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {t("products.productDetails")}
                  </span>
                  <span className="text-xl group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="pb-4 text-sm text-gray-700 space-y-2">
                  <p>
                    <strong>{t("products.categoryLabel")}</strong>{" "}
                    {product.category}
                  </p>
                  {product.brand && (
                    <p>
                      <strong>{t("products.brandLabel")}</strong>{" "}
                      {product.brand}
                    </p>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* İlgili Ürünler - Desktop */}
        {relatedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">
                {t("products.relatedProducts")}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (relatedProductsScrollRef.current) {
                      relatedProductsScrollRef.current.scrollBy({
                        left: -600,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Önceki ürünler"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => {
                    if (relatedProductsScrollRef.current) {
                      relatedProductsScrollRef.current.scrollBy({
                        left: 600,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Sonraki ürünler"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
            <div
              ref={relatedProductsScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                scrollBehavior: "smooth",
                scrollSnapType: "x mandatory",
              }}
            >
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="flex-shrink-0 w-[calc(25%-12px)] min-w-[250px] snap-start"
                >
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobil Layout - Bershka tarzı */}
      <div className="lg:hidden h-screen overflow-hidden">
        {/* Scrollable Image Container */}
        <div
          ref={imageContainerRef}
          className="h-full snap-y snap-mandatory scroll-smooth pt-[60px] pb-[80px]"
          style={{
            scrollSnapType: "y mandatory",
            overflowY: isDrawerOpen ? "hidden" : "scroll",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {product.images.map((image, index) => (
            <div
              key={index}
              className="h-screen w-full snap-start snap-always relative"
            >
              <Image
                src={image}
                alt={`${product.name} - ${index + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
              />
            </div>
          ))}
          {/* Related Products Preview inside photo scroll */}
          {relatedProducts.length > 0 && (
            <div className="h-screen w-full snap-start snap-always bg-white flex flex-col pt-10 px-6 overflow-hidden">
              <h2 className="text-xl font-semibold mb-4">
                {t("products.relatedProducts")}
              </h2>
              <div
                ref={relatedProductsScrollRefMobileInside}
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 flex-1"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  scrollBehavior: "smooth",
                  scrollSnapType: "x mandatory",
                }}
                onTouchStart={(e) => {
                  relatedProductsTouchStartX.current = e.touches[0].clientX;
                  relatedProductsTouchStartY.current = e.touches[0].clientY;
                  isScrollingRelatedProducts.current = false;
                }}
                onTouchMove={(e) => {
                  const deltaX = Math.abs(
                    relatedProductsTouchStartX.current - e.touches[0].clientX
                  );
                  const deltaY = Math.abs(
                    relatedProductsTouchStartY.current - e.touches[0].clientY
                  );

                  // Yatay scroll yapılıyorsa dikey scroll'u engelle
                  if (deltaX > deltaY && deltaX > 5) {
                    isScrollingRelatedProducts.current = true;
                    // Ana container'ın scroll'unu engelle
                    if (imageContainerRef.current) {
                      imageContainerRef.current.style.overflowY = "hidden";
                    }
                  }
                }}
                onTouchEnd={() => {
                  // Scroll'u tekrar aktif et
                  setTimeout(() => {
                    if (imageContainerRef.current) {
                      imageContainerRef.current.style.overflowY = "scroll";
                    }
                    isScrollingRelatedProducts.current = false;
                  }, 100);
                }}
              >
                {relatedProducts.map((rp) => (
                  <div
                    key={rp.id}
                    className="flex-shrink-0 w-[calc(50%-6px)] min-w-[160px] snap-start"
                  >
                    <ProductCard product={rp} />
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                {t("products.swipeMore")}
              </div>
            </div>
          )}
        </div>

        {/* Image Indicator Dots - Sağda dikey, sadece resimler gösterilirken */}
        {!isShowingRelatedProducts && (
          <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 items-center">
            {product.images.map((_, index) => (
              <div
                key={index}
                className={`rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "w-3 h-8 bg-white shadow-lg border-2 border-gray-900"
                    : "w-2 h-2 bg-white/80 shadow-md border border-gray-700"
                }`}
              />
            ))}
          </div>
        )}

        {/* Bottom Drawer Trigger */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-medium text-black line-clamp-1">
                {product.name}
              </h2>
              <p className="text-xl font-semibold text-black">
                {product.price.toFixed(2)} {t("products.currency")}
              </p>
            </div>
            <ChevronUp className="w-6 h-6 text-black" />
          </div>
        </button>
        {/* Bottom Drawer - Sadece mobilde */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ${
            isDrawerOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Overlay */}
          <div
            className={`absolute inset-0 backdrop-blur-md bg-black/30 transition-all duration-300 ${
              isDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="px-6 pb-8">
              {/* Product Info */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h1 className="text-2xl font-medium text-black mb-2">
                  {product.name}
                </h1>
                <p className="text-2xl font-semibold text-black mb-4">
                  {product.price.toFixed(2)} {t("products.currency")}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-black uppercase">
                    {t("products.color")}
                  </span>
                  {selectedColor && (
                    <span className="text-sm text-gray-600">
                      {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 text-sm font-medium border transition-all ${
                        selectedColor === color
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 text-black"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-black uppercase">
                    {t("products.size")}
                  </span>
                  <button className="text-sm underline text-black">
                    {t("products.sizeGuide")}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-sm font-medium border transition-all ${
                        selectedSize === size
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 text-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || !selectedSize || !selectedColor}
                className={`w-full py-4 text-sm font-semibold uppercase tracking-wider transition-all mb-4 ${
                  product.inStock && selectedSize && selectedColor
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {product.inStock
                  ? t("products.addToCart")
                  : t("products.outOfStock")}
              </button>

              {/* Accordion Sections */}
              <div className="border-t border-gray-200">
                <details className="group border-b border-gray-200">
                  <summary className="flex items-center justify-between py-4 cursor-pointer">
                    <span className="text-sm font-medium uppercase">
                      {t("products.productDetails")}
                    </span>
                    <span className="text-xl transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="pb-4 text-sm text-gray-700">
                    <p>
                      <strong>{t("products.categoryLabel")}</strong>{" "}
                      {product.category}
                    </p>
                    {product.brand && (
                      <p className="mt-2">
                        <strong>{t("products.brandLabel")}</strong>{" "}
                        {product.brand}
                      </p>
                    )}
                  </div>
                </details>

                <details className="group border-b border-gray-200">
                  <summary className="flex items-center justify-between py-4 cursor-pointer">
                    <span className="text-sm font-medium uppercase">
                      {t("products.shippingReturns")}
                    </span>
                    <span className="text-xl transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="pb-4 text-sm text-gray-700">
                    <p>{t("products.freeShippingFrom")}</p>
                    <p className="mt-2">{t("products.returnPolicy")}</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* İlgili Ürünler - Mobil */}
        {relatedProducts.length > 0 && (
          <div className="lg:hidden px-4 py-8 bg-white border-t border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4 px-2">
              {t("products.relatedProducts")}
            </h2>
            <div
              ref={relatedProductsScrollRefMobile}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                touchAction: "pan-x",
                scrollBehavior: "smooth",
                scrollSnapType: "x mandatory",
              }}
            >
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="flex-shrink-0 w-[calc(50%-6px)] min-w-[160px] snap-start"
                >
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
