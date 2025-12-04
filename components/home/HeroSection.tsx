"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection(): React.JSX.Element {
  const { t } = useLanguage();

  return (
    <section className="relative h-[90vh] w-full overflow-hidden">
      {/* Background Image with Zoom Animation */}
      <div className="absolute inset-0 animate-zoom">
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion Background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

      {/* Content Container */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center text-white animate-fade-in">
        {/* Brand Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold uppercase tracking-widest mb-6 leading-none drop-shadow-lg">
          {t("home.hero.title")}
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg lg:text-xl mb-12 max-w-2xl font-light tracking-wide opacity-90">
          {t("home.hero.subtitle")}
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes zoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.05);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-zoom {
          animation: zoom 10s ease-out infinite alternate;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
