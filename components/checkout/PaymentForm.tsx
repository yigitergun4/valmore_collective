"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { PaymentFormProps } from "@/types/checkout";

export default function PaymentForm({
  formData,
  setFormData,
  errors,
  setErrors,
}: PaymentFormProps): React.JSX.Element {
  const { t, language } = useLanguage();

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-primary-800 mb-6">
        {t("checkout.payment")}
      </h2>
      <div className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.cardNumber")}
          </label>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.cardNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        {/* Card Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("checkout.cardName")}
          </label>
          <input
            type="text"
            name="cardName"
            value={formData.cardName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.cardName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.cardName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
          )}
        </div>

        {/* Expiry & CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("checkout.expiryDate")}
            </label>
            <input
              type="text"
              name="cardExpiry"
              value={formData.cardExpiry}
              onChange={handleInputChange}
              placeholder={language === "tr" ? "AA/YY" : "MM/YY"}
              maxLength={5}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.cardExpiry ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.cardExpiry && (
              <p className="mt-1 text-sm text-red-600">{errors.cardExpiry}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("checkout.cvc")}
            </label>
            <input
              type="text"
              name="cardCVC"
              value={formData.cardCVC}
              onChange={handleInputChange}
              placeholder="123"
              maxLength={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.cardCVC ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.cardCVC && (
              <p className="mt-1 text-sm text-red-600">{errors.cardCVC}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
