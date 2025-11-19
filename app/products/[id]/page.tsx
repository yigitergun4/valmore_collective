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
  Info,
  Truck,
  ShieldCheck,
  Ruler,
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

  // Refs for mobile interactions
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean>(false);

  const allProducts = getAllProducts();
  const currentProductIndex = allProducts.findIndex((p) => p.id === params.id);
  const relatedProducts = getRelatedProducts(params.id as string, 4);

  // Mobile Scroll Handler
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || !product) return;

    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const index = Math.round(scrollTop / itemHeight);
      setCurrentImageIndex(Math.min(index, product.images.length - 1));
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [product]);

  // Mobile Drawer Scroll Lock
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || window.innerWidth >= 1024) return;

    if (isDrawerOpen) {
      container.style.overflow = "hidden";
    } else {
      container.style.overflow = "scroll";
    }
  }, [isDrawerOpen]);

  // Mobile Swipe Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const deltaX = Math.abs(touchStartX.current - touchEndX.current);
    const deltaY = Math.abs(touchStartY.current - touchEndY);

    if (deltaX > deltaY && deltaX > 10) {
      isHorizontalSwipe.current = true;
      if (imageContainerRef.current) {
        imageContainerRef.current.style.overflowY = "hidden";
      }
    }
  };

  const handleTouchEnd = () => {
    if (!product || !isHorizontalSwipe.current) {
      if (imageContainerRef.current) {
        imageContainerRef.current.style.overflowY = "scroll";
      }
      return;
    }

    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        const nextIndex = (currentProductIndex + 1) % allProducts.length;
        router.push(`/products/${allProducts[nextIndex].id}`);
      } else {
        const prevIndex =
          (currentProductIndex - 1 + allProducts.length) % allProducts.length;
        router.push(`/products/${allProducts[prevIndex].id}`);
      }
    }

    if (imageContainerRef.current) {
      imageContainerRef.current.style.overflowY = "scroll";
    }
    isHorizontalSwipe.current = false;
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

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      // Could add a toast notification here
      return;
    }
    addToCart(product, selectedSize, selectedColor, 1);
    setIsDrawerOpen(false);
  };

  const toggleFavorite = () => {
    if (!user) {
      router.push("/login?redirect=/products/" + params.id);
      return;
    }
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:grid lg:grid-cols-12 min-h-screen max-w-[1600px] mx-auto">
        {/* Left Column: Scrollable Images */}
        <div className="col-span-7 relative">
          <div className="max-w-3xl mx-auto px-8 py-20">
            <div className="space-y-2">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className="relative w-full aspect-[3/4] overflow-hidden"
                >
                <Image
                    src={img}
                    alt={`${product.name} - ${index + 1}`}
                  fill
                  className="object-cover"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    priority={index === 0}
                />
                </div>
              ))}
            </div>
          </div>

          {/* Floating Back Button */}
          <button
            onClick={() => router.back()}
            className="fixed top-24 left-8 z-20 bg-white/80 backdrop-blur-md p-3 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-300 shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Right Column: Sticky Product Details */}
        <div className="col-span-5 relative bg-gray-50/50">
          <div className="sticky top-0 h-screen overflow-y-auto hide-scrollbar px-8 xl:px-12 py-24 flex flex-col">
            {/* Header Info */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-4xl font-bold uppercase tracking-tight leading-none">
                  {product.name}
                </h1>
                <button
                  onClick={toggleFavorite}
                  className="hover:opacity-60 transition-opacity"
                >
                  <Heart
                    className={`w-6 h-6 ${isFavorited ? "fill-black" : ""}`}
                  />
                </button>
              </div>
              <p className="text-2xl font-medium text-gray-900 mt-2">
                {product.price.toFixed(2)} {t("products.currency")}
              </p>
              <p className="text-sm text-gray-500 mt-2 font-medium">
                REF. {product.id.substring(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-10">
              {product.description}
            </p>

            {/* Color Selection */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-400">
                {t("products.color")}:{" "}
                <span className="text-black">{selectedColor || "Select"}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 px-6 text-sm font-bold uppercase transition-all duration-200 border ${
                      selectedColor === color
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-200 text-black hover:border-primary-600"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t("products.size")}:{" "}
                  <span className="text-black">{selectedSize || "Select"}</span>
                </p>
                <button className="flex items-center text-xs font-bold uppercase underline hover:opacity-60">
                  <Ruler className="w-3 h-3 mr-1" /> {t("products.sizeGuide")}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 text-sm font-bold uppercase transition-all duration-200 border ${
                      selectedSize === size
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-200 text-black hover:border-primary-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || !selectedSize || !selectedColor}
                className={`w-full py-5 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  product.inStock && selectedSize && selectedColor
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {product.inStock
                  ? t("products.addToCart")
                  : t("products.outOfStock")}
              </button>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] font-bold uppercase text-gray-500">
                    Free Shipping
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] font-bold uppercase text-gray-500">
                    Secure Payment
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Share2 className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] font-bold uppercase text-gray-500">
                    Share
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden h-screen w-full overflow-hidden bg-black">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-30 p-4 flex justify-between items-start bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
          <button
            onClick={() => router.back()}
            className="pointer-events-auto p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-3 pointer-events-auto">
            <button
              onClick={toggleFavorite}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
            >
              <Heart className={`w-6 h-6 ${isFavorited ? "fill-white" : ""}`} />
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Full Screen Images */}
        <div
          ref={imageContainerRef}
          className="h-full w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {product.images.map((image, index) => (
            <div key={index} className="h-screen w-full snap-start relative">
              <Image
                src={image}
                alt={`${product.name} - ${index + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
              />
              {/* Gradient Overlay at bottom for text readability */}
              <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
          {product.images.map((_, index) => (
            <div
              key={index}
              className={`w-1 transition-all duration-300 rounded-full bg-white shadow-sm ${
                index === currentImageIndex
                  ? "h-8 opacity-100"
                  : "h-1.5 opacity-50"
              }`}
            />
          ))}
        </div>

        {/* Bottom Info Bar (Always Visible) */}
        <div className="fixed bottom-0 left-0 right-0 z-30 p-6 pb-8 text-white pointer-events-none">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight shadow-black drop-shadow-md">
                {product.name}
              </h2>
              <p className="text-xl font-medium mt-1 drop-shadow-md">
                {product.price.toFixed(2)} {t("products.currency")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full py-4 bg-primary-600 text-white font-bold uppercase tracking-widest rounded-none pointer-events-auto hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>{t("products.addToCart")}</span>
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
            <div className="sticky top-0 bg-white z-10 pt-4 pb-2 flex justify-center border-b border-gray-100">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="p-6 space-y-8 pb-12">
              {/* Header in Drawer */}
              <div>
                <h3 className="text-2xl font-bold uppercase mb-2">
                  {product.name}
                </h3>
                <p className="text-xl text-gray-900">
                  {product.price.toFixed(2)} {t("products.currency")}
                </p>
              </div>

              {/* Color Selection */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-3">
                  {t("products.color")}
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 text-sm font-bold uppercase border transition-all ${
                      selectedColor === color
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-200 text-black hover:border-primary-600"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

              {/* Size Selection */}
            <div>
                <div className="flex justify-between mb-3">
                  <p className="text-xs font-bold uppercase text-gray-400">
                    {t("products.size")}
                  </p>
                  <button className="text-xs font-bold uppercase underline">
                    {t("products.sizeGuide")}
                </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-sm font-bold uppercase border transition-all ${
                        selectedSize === size
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-200 text-black hover:border-primary-600"
                      }`}
                    >
                      {size}
                </button>
                  ))}
              </div>
            </div>

              {/* Add Button */}
            <button
              onClick={handleAddToCart}
                disabled={!product.inStock || !selectedSize || !selectedColor}
                className={`w-full py-4 text-sm font-bold uppercase tracking-widest ${
                  product.inStock && selectedSize && selectedColor
                    ? "bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {product.inStock
                  ? t("products.addToCart")
                  : t("products.outOfStock")}
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
