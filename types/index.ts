import { ReactNode } from "react";

export interface Product {
  // Temel Kimlik Bilgileri
  id: string;
  name: string;
  description: string; // SEO ve kullanıcı bilgisi için kısa/uzun açıklama
  slug: string; // URL yapısı için (örn: 'kirmizi-kazak-123')

  // Fiyatlandırma
  price: number; // Güncel satış fiyatı
  originalPrice?: number; // İndirim varsa üstü çizili eski fiyat (Opsiyonel)

  // Görseller
  images: string[]; // İlk eleman genellikle kapak fotoğrafı olur

  // Kategorizasyon
  category: string;
  brand?: string; // Markasız ürünler olabileceği için opsiyonel

  // Varyasyonlar (Her üründe olmayacağı için opsiyonel yaptım)
  sizes?: string[];
  colors?: string[];

  // Durum Bilgileri
  inStock: boolean; // Stok var/yok kontrolü
  featured?: boolean; // Anasayfada "Öne Çıkanlar"da göstermek için

  // Lojistik/Satış Teşviki
  freeShipping?: boolean; // Kargo bedava etiketi için
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    size: string,
    color: string,
    quantity?: number
  ) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendVerificationEmail: () => Promise<boolean>;
  isLoading: boolean;
}

export interface LanguageContextType {
  language: "tr" | "en";
  setLanguage: (lang: "tr" | "en") => void;
  t: (key: string) => string;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface Translations {
  [key: string]: string | Translations;
}

export interface ProviderProps {
  children: ReactNode;
}
