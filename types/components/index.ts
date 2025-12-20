import { Product, ProductGender } from "../";

export interface ProductCardProps {
    product: Product;
    filterGender?: ProductGender | "ALL";
}

// General component props
export interface FavoriteButtonProps {
    productId: string;
    className?: string;
}

export interface XIconProps {
    className?: string;
}

export interface MobileSelectionButtonProps {
    label: string;
    value: string;
    onClick: () => void;
    className?: string;
}

export interface FilterTagProps {
    label: string;
    onRemove: () => void;
    className?: string;
}

export interface SelectionButtonProps {
    label: string;
    value: string;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}

export interface Option {
    value: string;
    label: string;
}

export interface PremiumSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    className?: string;
    disabled?: boolean;
}