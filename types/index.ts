import { ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // '?' koyduk çünkü her üründe indirim olmayabilir
  images: string[];
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  // Veritabanı için eklenmesi önerilen alanlar:
  createdAt?: string; // "En yeniler" sıralaması için gerekli
  slug?: string; // SEO dostu URL için (örn: /urun/klasik-beyaz-gomlek)
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
