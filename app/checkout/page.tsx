"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { CheckoutFormData } from "@/types";


export default function CheckoutPage(): React.JSX.Element | null {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Türkiye",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCVC: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      // Split user name into first and last name
      const nameParts = user.name.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Redirect to cart if empty (but not if order was just placed)
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.push("/cart");
    }
  }, [items.length, orderPlaced, router]);

  // Show loading/redirect state if cart is empty and order not placed
  if (items.length === 0 && !orderPlaced) {
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm: () => boolean = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = `${t("checkout.firstName")} ${t(
        "checkout.required"
      )}`;
    if (!formData.lastName.trim())
      newErrors.lastName = `${t("checkout.lastName")} ${t(
        "checkout.required"
      )}`;
    if (!formData.email.trim()) {
      newErrors.email = `${t("checkout.email")} ${t("checkout.required")}`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("checkout.invalidEmail");
    }
    if (!formData.phone.trim())
      newErrors.phone = `${t("checkout.phone")} ${t("checkout.required")}`;
    if (!formData.address.trim())
      newErrors.address = `${t("checkout.address")} ${t("checkout.required")}`;
    if (!formData.city.trim())
      newErrors.city = `${t("checkout.city")} ${t("checkout.required")}`;
    if (!formData.state.trim())
      newErrors.state = `${t("checkout.state")} ${t("checkout.required")}`;
    if (!formData.zipCode.trim())
      newErrors.zipCode = `${t("checkout.zipCode")} ${t("checkout.required")}`;
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = `${t("checkout.cardNumber")} ${t(
        "checkout.required"
      )}`;
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = t("checkout.invalidCard");
    }
    if (!formData.cardName.trim())
      newErrors.cardName = `${t("checkout.cardName")} ${t(
        "checkout.required"
      )}`;
    if (!formData.cardExpiry.trim()) {
      newErrors.cardExpiry = `${t("checkout.expiryDate")} ${t(
        "checkout.required"
      )}`;
    } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      newErrors.cardExpiry = t("checkout.invalidExpiry");
    }
    if (!formData.cardCVC.trim()) {
      newErrors.cardCVC = `${t("checkout.cvc")} ${t("checkout.required")}`;
    } else if (!/^\d{3,4}$/.test(formData.cardCVC)) {
      newErrors.cardCVC = t("checkout.invalidCVC");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("checkout.success.title")}
          </h2>
          <p className="text-gray-600 mb-6">{t("checkout.success.message")}</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t("checkout.success.continue")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-1 sm:px-2 lg:px-3 py-8">
        <Link
          href="/cart"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t("checkout.backToCart")}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary-800 mb-4">
            {t("checkout.title")}
          </h1>
          {!user && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                {t("checkout.guestMessageBefore")}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium underline"
                >
                  {t("nav.login")}
                </Link>
                {t("checkout.guestMessageAfter")}
              </p>
            </div>
          )}
          {user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-green-700">{user.name}</span>{" "}
                {t("checkout.loggedInMessage")}
              </p>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-primary-800 mb-6">
                {t("checkout.shipping")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.firstName")} *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    } ${user ? "bg-gray-50" : ""}`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.lastName")} *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    } ${user ? "bg-gray-50" : ""}`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.email")} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } ${user ? "bg-gray-50" : ""}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.phone")} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.address")} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.city")} *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.state")} *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.zipCode")} *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.zipCode ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.zipCode}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.country")} *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Türkiye">Türkiye</option>
                    <option value="Almanya">Almanya</option>
                    <option value="Fransa">Fransa</option>
                    <option value="İngiltere">İngiltere</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-primary-800 mb-6">
                {t("checkout.payment")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.cardNumber")} *
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cardNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.cardName")} *
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cardName}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("checkout.expiryDate")} *
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
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cardExpiry}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("checkout.cvc")} *
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
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cardCVC}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-primary-800 mb-6">
                {t("checkout.orderSummary")}
              </h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    {t("cart.items")} ({getTotalItems()})
                  </span>
                  <span>₺{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t("cart.shipping")}</span>
                  <span>₺10.00</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-primary-800">
                    <span>{t("cart.total")}</span>
                    <span>₺{(getTotalPrice() + 10).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-4 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors ${
                  isProcessing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isProcessing
                  ? t("checkout.processing")
                  : t("checkout.placeOrder")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
