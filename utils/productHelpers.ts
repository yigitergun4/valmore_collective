import { Product } from "@/types";

interface GetButtonTextParams {
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

export function getAddToCartButtonText({
    isSizeValid,
    isColorValid,
    productInStock,
    hasVariants,
    selectedColor,
    isVariantInStock,
    isUpdated,
    isEditMode,
    t,
}: GetButtonTextParams): string {
    // Validation errors first
    if (!isSizeValid || !isColorValid) {
        if (!isSizeValid && !isColorValid) {
            return t("products.selectSizeColor");
        }
        return !isSizeValid ? t("products.selectSize") : t("products.selectColor");
    }

    // Stock check
    if (!productInStock) {
        return t("products.outOfStock");
    }

    // Variant stock check
    if (hasVariants && selectedColor && !isVariantInStock) {
        return t("products.outOfStock");
    }

    // Success states
    if (isUpdated) {
        return t("products.cartUpdated");
    }

    return isEditMode ? t("products.updateCart") : t("products.addToCart");
}

interface CalculateProductPriceParams {
    product: Product;
}

interface ProductPriceResult {
    originalPrice: number;
    discountedPrice: number;
    finalPrice: number;
    hasDiscount: boolean;
    discountPercentage: number;
}

export function calculateProductPrice({
    product,
}: CalculateProductPriceParams): ProductPriceResult {
    const originalPrice: number = product.originalPrice || 0;
    const discountedPrice: number = product.price;
    const hasDiscount: boolean = !!discountedPrice && discountedPrice < originalPrice;
    const finalPrice: number = hasDiscount ? discountedPrice! : originalPrice;
    const discountPercentage: number = hasDiscount
        ? Math.round(((originalPrice - discountedPrice!) / originalPrice) * 100)
        : 0;

    return {
        originalPrice,
        discountedPrice: discountedPrice || 0,
        finalPrice,
        hasDiscount,
        discountPercentage,
    };
}
