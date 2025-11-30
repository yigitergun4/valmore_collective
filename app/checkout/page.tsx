"use client";

import { useState, useEffect } from "react";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CheckoutFormData } from "@/types";
import { CartItem } from "@/types";
import { createOrder } from "@/lib/firestore"; // New import
import { useAlert } from "@/contexts/AlertContext";
import { TURKISH_CITIES } from "@/lib/turkish-data";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";


export default function CheckoutPage(): React.JSX.Element | null {
  const { cart: items, cartCount: getTotalItems, clearCart } = useShop();
  
  const getTotalPrice: () => number = () => {
    return items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
  };

  const { user } = useAuth(); 
  const { t, language } = useLanguage();
  const router = useRouter();
  const { showError } = useAlert(); // New initialization
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
      const nameParts: string[] = user.name.split(" ");
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

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (
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
    if (!formData.phone.trim()) {
      newErrors.phone = `${t("checkout.phone")} ${t("checkout.required")}`;
    } else if (!/^5\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Geçerli bir cep telefonu numarası giriniz (5xx xxx xx xx)";
    }
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

    try {
      // Calculate totals
      const subtotal: number = getTotalPrice();
      const shippingCost: number = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const total: number = subtotal + shippingCost;

      // Prepare order data
      const orderData = {
        userId: user?.id || null, // null for guest users
        customer: {
          id: user?.id || null,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: '0' + formData.phone,
        },
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        subtotal,
        shippingCost,
        total,
        currency: "TRY",
        paymentMethod: "credit_card" as const,
        status: "pending" as const,
        shippingAddress: {
          title: "Teslimat Adresi",
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          address: formData.address,
          city: formData.city,
          district: formData.state, // Using state field as district
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create order in Firestore
      const orderId: string = await createOrder(orderData); // Changed import method

      setIsProcessing(false);
      setOrderPlaced(true);
      // Clear cart and redirect
      clearCart();
      router.push("/checkout/success"); // New line
    } catch (error) {
      console.error("Order error:", error); // Changed console log
      showError("Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."); // Replaced alert
    } finally {
      setIsProcessing(false); // Added finally block
    }
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
    <div className="min-h-screen pt-15 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/cart"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t("checkout.backToCart")}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary-800 mb-4">
            {t("checkout.title")}
          </h1>
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
                    {t("checkout.firstName")}
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
                    {t("checkout.lastName")}
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
                    {t("checkout.email")}
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
                    {t("checkout.phone")}
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pr-3 border border-r border-gray-300 rounded-l-lg">
                      <span className="text-gray-700">+90</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={
                        // Format: 5xx xxx xx xx
                        formData.phone
                          .replace(/(\d{3})(\d{0,3})(\d{0,2})(\d{0,2})/, (match, p1, p2, p3, p4) => {
                            let result = p1;
                            if (p2) result += ' ' + p2;
                            if (p3) result += ' ' + p3;
                            if (p4) result += ' ' + p4;
                            return result;
                          })
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only numbers
                        if (value.length <= 10) {
                          setFormData((prev) => ({ ...prev, phone: value }));
                          if (errors.phone) {
                            setErrors((prev) => ({ ...prev, phone: "" }));
                          }
                        }
                      }}
                      placeholder="5xx xxx xx xx"
                      maxLength={13}
                      className={`w-full pl-16 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 tracking-wider ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.address")}
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
                    {t("checkout.city")}
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData(prev => ({ ...prev, state: "" })); // Reset district when city changes
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">İl Seçiniz</option>
                    {TURKISH_CITIES.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlçe
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!formData.city}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    } ${!formData.city ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    <option value="">İlçe Seçiniz</option>
                    {formData.city && TURKISH_CITIES.find(c => c.name === formData.city)?.districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.zipCode")}
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => {
                        const value: string = e.target.value.replace(/[^0-9]/g, '');
                        setFormData(prev => ({ ...prev, zipCode: value }));
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.zipCode ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={5}
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.zipCode}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("checkout.country")}
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg border-gray-300 bg-gray-100"
                  />
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cardNumber}
                    </p>
                  )}
                </div>
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cardName}
                    </p>
                  )}
                </div>
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
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cardExpiry}
                      </p>
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
                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 right-0 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-medium">
                          x{item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-1">
                            {item.name}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {item.selectedColor && (
                              <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                {t("products.color")}: {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                {t("products.size")}: {item.selectedSize}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end flex-col items-end">
                          <span className="text-[10px] text-gray-400 mb-0.5">{t("products.price")}</span>
                          <p className="text-sm font-semibold text-primary-700">
                            ₺{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>
                    {t("cart.items")} ({getTotalItems})
                  </span>
                  <span>₺{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t("cart.shipping")}</span>
                  <span>
                    {getTotalPrice() >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="text-green-600 font-medium">{t("products.freeShipping")}</span>
                    ) : (
                      `₺${SHIPPING_COST.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-primary-800">
                    <span>{t("cart.total")}</span>
                    <span>
                      ₺{(getTotalPrice() + (getTotalPrice() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST)).toFixed(2)}
                    </span>
                  </div>
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
