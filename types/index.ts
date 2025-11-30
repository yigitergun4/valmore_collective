import { ReactNode } from "react";

export interface ProductVariant {
  color: string;
  inStock: boolean;
  sizes: string[];
}
export interface ProductImage {
  url: string;
  color: string; // "Genel" veya renk adı ("Kırmızı")
}

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSizes: string[];
  setSelectedSizes: (sizes: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  onApply: () => void;
  onClear: () => void;
}

export interface ProductDetailClientProps {
  product: Product;
  allProducts: Product[];
  relatedProducts: Product[];
}
export type ProductGender = 'Male' | 'Female' | 'Unisex';

export interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, "id">) => Promise<void>;
  isSubmitting: boolean;
}


export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  isDiscounted: boolean;
  images: ProductImage[];
  category: string;
  brand: string;
  gender: ProductGender;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  hasVariants: boolean;
  variants: ProductVariant[];
  createdAt: string;
  slug?: string;
}
export interface ShopContextType {
  cart: CartItem[];
  favorites: string[];
  isCartOpen: boolean;
  cartCount: number;
  addToCart: (product: Product, size: string, color: string) => Promise<boolean>;
  removeFromCart: (productId: string, size: string, color: string) => Promise<void>;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, oldSize: string, oldColor: string, newSize: string, newColor: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  setIsCartOpen: (isOpen: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

// Type Definitions
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  updatedAt: number; // Timestamp for sorting
}

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  recentOrders: any[]; // Will define Order type later
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
