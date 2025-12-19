// Utility function types

export interface GetButtonTextParams {
    isSizeValid: boolean;
    isColorValid: boolean;
    productInStock: boolean;
    hasVariants: boolean;
    selectedColor: string;
    isVariantInStock: boolean;
    isUpdated: boolean;
    isEditMode: boolean;
    t: (key: string) => string;
}

export interface CalculateProductPriceParams {
    product: {
        originalPrice?: number;
        price: number;
    };
}

export interface ProductPriceResult {
    originalPrice: number;
    discountedPrice: number;
    finalPrice: number;
    hasDiscount: boolean;
    discountPercentage: number;
}
