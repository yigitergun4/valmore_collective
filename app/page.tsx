"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/home/HeroSection";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeaturedProducts } from "@/lib/productService";
import { Product } from "@/types";

export default function Home(): React.JSX.Element {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts: () => Promise<void> = async () => {
      const products: Product[] = await getFeaturedProducts();
      setFeaturedProducts(products);
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white pt-16 lg:pt-20">
      {/* Hero Section */}
      <HeroSection />
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
