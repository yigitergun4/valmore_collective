"use client";

import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white">
        <div className="w-full mx-auto px-1 sm:px-2 lg:px-3 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              {t("home.hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
              {t("home.hero.subtitle")}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              {t("home.hero.cta")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="w-full mx-auto px-1 sm:px-2 lg:px-3 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-800 mb-4">
            {t("home.featured.title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("home.featured.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border-2 border-primary-600 text-primary-700 font-semibold rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
          >
            {t("home.featured.viewAll")}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-primary-50 py-16">
        <div className="w-full mx-auto px-1 sm:px-2 lg:px-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-800 mb-6">
                {t("home.about.title")}
              </h2>
              <p className="text-gray-700 mb-4">
                {t("home.about.description1")}
              </p>
              <p className="text-gray-700 mb-6">
                {t("home.about.description2")}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center text-primary-700 font-semibold hover:text-primary-800 transition-colors"
              >
                {t("home.about.learnMore")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <div className="relative aspect-square bg-primary-100 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-primary-400">
                <p className="text-lg">Görsel Yeri</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
