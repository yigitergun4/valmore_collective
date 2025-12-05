import { CartItem } from "..";
import { CheckoutFormData } from "..";
import { Address } from "..";
import { User } from "..";

export interface OrderSummaryProps {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isProcessing: boolean;
}

export interface PaymentFormProps {
  formData: CheckoutFormData;
  setFormData: React.Dispatch<React.SetStateAction<CheckoutFormData>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export interface ShippingFormProps {
  formData: CheckoutFormData;
  setFormData: React.Dispatch<React.SetStateAction<CheckoutFormData>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  savedAddresses: Address[];
  selectedAddressId: string;
  onAddressSelect: (addressId: string) => void;
  user: User | null;
}