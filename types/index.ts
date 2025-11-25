import { ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  createdAt: string; // Made required as per new spec
  slug?: string;
}

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  recentOrders: any[]; // Will define Order type later
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

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCVC: string;
}
