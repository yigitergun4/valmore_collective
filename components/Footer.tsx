"use client";

import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { XIcon } from "./XIcon";

import { usePathname } from "next/navigation";

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-primary-900 text-white pt-24 pb-8">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <h3 className="text-4xl lg:text-5xl font-bold tracking-tighter uppercase mb-8">
              VALMORÉ
            </h3>
            <p className="text-gray-400 mb-10 max-w-md text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-white hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-white hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-16">
            {/* Quick Links */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-gray-500">
                {t("footer.quickLinks")}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/products"
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {t("nav.products")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {t("nav.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {t("nav.contact")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-gray-500">
                {t("footer.customerService")}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {t("footer.shipping")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {t("footer.returns")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {t("footer.sizeGuide")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {t("footer.faq")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-gray-500">
                {t("footer.newsletter")}
              </h4>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                {t("footer.newsletterDescription")}
              </p>
              <div className="flex border-b border-primary-600/30 pb-2 mb-2">
                <input
                  type="email"
                  placeholder={t("footer.emailPlaceholder")}
                  className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-700 text-white"
                />
                <button className="text-[10px] font-bold uppercase tracking-wider text-primary-400 hover:text-primary-300 transition-colors">
                  {t("footer.joinButton")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-900/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-400">
          <p className="uppercase tracking-wider">
            &copy; {new Date().getFullYear()} Valmoré Collective.{" "}
            {t("footer.rights")}
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="uppercase tracking-wider hover:text-primary-400 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="uppercase tracking-wider hover:text-primary-400 transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
