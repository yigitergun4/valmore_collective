import { Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ShippingInfo() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg">
      <Truck className="w-5 h-5 text-primary-600 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-gray-900">{t("products.freeShipping")}</p>
        <p className="text-gray-500 text-xs">{t("products.freeShippingFrom")}</p>
      </div>
    </div>
  );
}
