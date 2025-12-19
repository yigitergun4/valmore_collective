import { Product } from "@/types";
import type {
    GetButtonTextParams,
    CalculateProductPriceParams,
    ProductPriceResult,
} from "@/types/utils";

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

export function calculateProductPrice({
    product,
}: CalculateProductPriceParams): ProductPriceResult {
    const originalPrice: number = product.originalPrice || 0;
    const discountedPrice: number = product.price;

    // If no originalPrice is set, use product.price as the final price (no discount scenario)
    if (!originalPrice || originalPrice === 0) {
        return {
            originalPrice: discountedPrice,
            discountedPrice: 0,
            finalPrice: discountedPrice,
            hasDiscount: false,
            discountPercentage: 0,
        };
    }

    // Calculate discount if discounted price is less than original
    const hasDiscount: boolean = discountedPrice > 0 && discountedPrice < originalPrice;
    const finalPrice: number = hasDiscount ? discountedPrice : originalPrice;
    const discountPercentage: number = hasDiscount
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

    return {
        originalPrice,
        discountedPrice: hasDiscount ? discountedPrice : 0,
        finalPrice,
        hasDiscount,
        discountPercentage,
    };
}

