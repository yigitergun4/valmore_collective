"use client";

import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Bershka Style Full Screen */}
      <section className="relative h-[85vh] lg:h-screen w-full overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />
        <div className="absolute inset-0 bg-primary-900/20 z-10" />

        {/* Background Pattern or Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-black opacity-90" />

        <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tighter mb-6 leading-none">
            {t("home.hero.title")}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-12 max-w-2xl font-light tracking-wide">
            {t("home.hero.subtitle")}
          </p>
          <Link
            href="/products"
            className="group inline-flex items-center px-10 py-4 bg-primary-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-primary-700 transition-all duration-300"
          >
            {t("home.hero.cta")}
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 lg:py-24 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-12 lg:mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold uppercase tracking-tighter mb-4">
              {t("home.featured.title")}
            </h2>
            <p className="text-sm lg:text-base text-gray-500 uppercase tracking-wider">
              {t("home.featured.description")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-primary-700 transition-all duration-300"
            >
              {t("home.featured.viewAll")}
              <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Minimal & Bold */}
      <section className="py-16 lg:py-24 bg-primary-50">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-bold uppercase tracking-tighter mb-8 leading-none">
                {t("home.about.title")}
              </h2>
              <p className="text-base lg:text-lg text-gray-700 mb-6 leading-relaxed">
                {t("home.about.description1")}
              </p>
              <p className="text-base lg:text-lg text-gray-700 mb-8 leading-relaxed">
                {t("home.about.description2")}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center text-sm font-bold uppercase tracking-widest hover:underline underline-offset-8 decoration-2 transition-all"
              >
                {t("home.about.learnMore")}
                <ArrowRight className="ml-3 w-4 h-4" />
              </Link>
            </div>
            <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm uppercase tracking-wider font-bold">
                Image Placeholder
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
