export interface Order {
  id: string;
  userId: string | null; // null for guest users
  
  // Müşteri Bilgileri (Snapshot - User değişse bile burası sabit kalmalı)
  customer: {
    fullName: string;
    email: string;
    phone: string; // Kargo için KRİTİK
  };

  // Sepet İçeriği (Snapshot)
  items: {
    productId: string;
    name: string;
    price: number;        // O anki satış fiyatı
    quantity: number;
    image: string;        // "Siparişlerim" sayfasında göstermek için
    selectedSize: string; // Giyim için KRİTİK
    selectedColor: string; // Giyim için KRİTİK
  }[];

  // Mali Durum
  subtotal: number;      // Ürünlerin toplamı (Örn: 500 TL)
  shippingCost: number;  // Kargo ücreti (Örn: 29.99 TL)
  discountTotal?: number;// Varsa indirim kuponu düşüşü
  total: number;         // Ödenen net tutar (529.99 TL)
  currency: string;      // "TRY", "USD" (İleriye dönük)

  // Ödeme Detayları
  paymentMethod: "credit_card" | "iyzico" | "stripe";
  paymentId?: string;    // İade işlemleri için Iyzico/Stripe işlem ID'si

  // Lojistik ve Durum
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  shippingAddress: {
    title: string;       // "Evim", "İş yeri"
    fullName: string;
    address: string;     // Açık adres
    city: string;
    district: string;    // İlçe (Kargo entegrasyonu için önemli)
    zipCode: string;
    country: string;
  };

  // Kargo Takip (Sipariş "shipped" olunca dolacak)
  trackingNumber?: string; 
  carrier?: string;      // "Yurtiçi Kargo", "Aras" vb.

  // Tarihçeler
  createdAt: string;     // Sipariş tarihi (ISO String)
  updatedAt: string;     // Son durum güncellemesi
}

export const getStatusBadgeColor: (status: Order["status"]) => string = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

export const getStatusText: (status: Order["status"]) => string = (status: Order["status"]) => {
  const statusMap = {
    pending: "Beklemede",
    processing: "Hazırlanıyor",
    shipped: "Kargoda",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
    returned: "İade Edildi",
  };
  return statusMap[status];
};