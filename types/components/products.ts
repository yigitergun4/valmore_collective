// Product-related component props

export interface ProductPriceDisplayProps {
    productName: string;
    productId: string;
    finalPrice: number;
    originalPrice: number;
    hasDiscount: boolean;
    discountPercentage: number;
}

export interface MobileTopBarProps {
    onBack: () => void;
    onToggleFavorite: () => void;
    isFavorited: boolean;
}
