"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary-800 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-white mb-4">
              Valmoré Collective
            </h3>
            <p className="text-gray-300 mb-4">{t("footer.description")}</p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-white transition-colors"
                >
                  {t("nav.cart")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {t("footer.customerService")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.shipping")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.returns")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.sizeGuide")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.faq")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>
            &copy; {new Date().getFullYear()} Valmoré Collective.{" "}
            {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
