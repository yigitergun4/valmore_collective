import { ReactNode } from "react";

export interface ProductVariant {
  color: string;
  sizes: string[];
  inStock: boolean;
  sku?: string;
  barcode?: string;
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
  showDiscountedOnly: boolean;
  setShowDiscountedOnly: (show: boolean) => void;
  onApply: () => void;
  onClear: () => void;
}

export interface DiscountFilterProps {
  showDiscountedOnly: boolean;
  setShowDiscountedOnly: (show: boolean) => void;
}

export interface ProductDetailClientProps {
  product: Product;
  allProducts: Product[];
  relatedProducts: Product[];
}
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Erkek' },
  { value: 'Female', label: 'Kadın' },
  { value: 'Unisex', label: 'Unisex' },
] as const;

export type ProductGender = typeof GENDER_OPTIONS[number]['value'];

export interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, "id">) => Promise<void>;
  isSubmitting: boolean;
}

export type LocalImage = ProductImage & { isUploading?: boolean; file?: File };

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
  material?: string;
  fit?: string;
  careInstructions?: string;
  sku?: string;
  barcode?: string;
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
  uid: string; // Firebase user ID
  email: string;
  fullName: string;
  addresses?: any[]; // Will be properly typed when Address interface is used
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
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
