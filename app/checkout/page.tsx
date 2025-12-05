"use client";

import { useState, useEffect } from "react";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { CheckoutFormData, CartItem, Address } from "@/types";
import { createOrder } from "@/lib/firestore/orders";
import { getUserProfile } from "@/lib/firestore/users";
import { useAlert } from "@/contexts/AlertContext";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

import ShippingForm from "@/components/checkout/ShippingForm";
import PaymentForm from "@/components/checkout/PaymentForm";
import OrderSummary from "@/components/checkout/OrderSummary";

export default function CheckoutPage(): React.JSX.Element | null {
  const { cart: items, cartCount: getTotalItems, clearCart } = useShop();
  
  const getTotalPrice: () => number = () => {
    return items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
  };

  const { user } = useAuth(); 
  const { t } = useLanguage();
  const router = useRouter();
  const { showError } = useAlert();
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
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  // Pre-fill form if user is logged in and fetch saved addresses
  useEffect(() => {
    if (user) {
      const nameParts: string[] = user.fullName.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
      }));

      getUserProfile(user.uid).then((userData) => {
        if (userData?.addresses) {
          setSavedAddresses(userData.addresses);
        }
      }).catch(console.error);
    }
  }, [user]);

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.push("/cart");
    }
  }, [items.length, orderPlaced, router]);

  if (items.length === 0 && !orderPlaced) {
    return null;
  }

  const handleAddressSelect: (addressId: string) => void = (addressId: string) => {
    setSelectedAddressId(addressId);
    
    if (addressId === "new") {
      const nameParts: string[] = user?.fullName?.split(" ") || ["", ""];
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      }));
    } else {
      const selected: Address | undefined = savedAddresses.find((addr: Address) => addr.title === addressId);
      if (selected) {
        const nameParts: string[] = selected.fullName.split(" ");
        setFormData((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: selected.phone.replace(/^0/, ""),
          address: selected.fullAddress,
          city: selected.city,
          state: selected.district,
          zipCode: selected.zipCode,
          country: "Türkiye",
        }));
      }
    }
  };

  const validateForm: () => boolean = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = `${t("checkout.firstName")} ${t("checkout.required")}`;
    if (!formData.lastName.trim())
      newErrors.lastName = `${t("checkout.lastName")} ${t("checkout.required")}`;
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
      newErrors.cardNumber = `${t("checkout.cardNumber")} ${t("checkout.required")}`;
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = t("checkout.invalidCard");
    }
    if (!formData.cardName.trim())
      newErrors.cardName = `${t("checkout.cardName")} ${t("checkout.required")}`;
    if (!formData.cardExpiry.trim()) {
      newErrors.cardExpiry = `${t("checkout.expiryDate")} ${t("checkout.required")}`;
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
      const subtotal: number = getTotalPrice();
      const shippingCost: number = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const total: number = subtotal + shippingCost;

      const orderData = {
        userId: user?.uid || null,
        customer: {
          id: user?.uid || null,
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
          district: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };

      await new Promise((resolve) => setTimeout(resolve, 1500));
      await createOrder(orderData);

      setIsProcessing(false);
      setOrderPlaced(true);
      clearCart();
      router.push("/checkout/success");
    } catch (error) {
      console.error("Order error:", error);
      showError("Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsProcessing(false);
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <OrderSummary
              items={items}
              totalItems={getTotalItems}
              totalPrice={getTotalPrice()}
              isProcessing={isProcessing}
            />
          </div>

          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8 order-last lg:order-first">
            <ShippingForm
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              savedAddresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              onAddressSelect={handleAddressSelect}
              user={user}
            />
            <PaymentForm
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
            />
          </div>
        </form>
        
        {/* Spacer for mobile sticky footer */}
        <div className="lg:hidden h-32" />
      </div>
    </div>
  );
}
