import { Order } from "../admin/orders";

export interface FormErrors {
  fullName?: string;
  phone?: string;
  fullAddress?: string;
  zipCode?: string;
}

export interface OrderProductItemProps {
  image: string;
  name: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  price: number;
  compact?: boolean; // For orders list (smaller version)
}

export interface OrderSummaryProps {
  subtotal: number;
  shippingCost: number;
  discountTotal?: number;
  total: number;
  compact?: boolean; // Smaller version for order cards
}

export interface OrderCardProps {
  order: Order;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}