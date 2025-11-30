"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    const timer:NodeJS.Timeout = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/");
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 blur-3xl opacity-20 animate-pulse"></div>
            <CheckCircle className="w-24 h-24 text-green-600 relative" strokeWidth={1.5} />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900 mb-4">
          Sipariş Alındı!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Siparişiniz başarıyla oluşturuldu. En kısa sürede kargoya verilecektir.
        </p>

        {/* Order Info */}
        <div className="bg-white border-2 border-green-100 rounded-lg p-6 mb-8">
          <Package className="w-8 h-8 text-green-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 mb-2">
            Sipariş durumunuzu e-posta adresinizden takip edebilirsiniz.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-primary-600 text-white py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-primary-700 transition-colors"
          >
            <Home className="w-5 h-5 inline-block mr-2" />
            Ana Sayfaya Dön
          </Link>
          
          <p className="text-sm text-gray-500">
            {countdown} saniye sonra ana sayfaya yönlendirileceksiniz...
          </p>
        </div>
      </div>
    </div>
  );
}
