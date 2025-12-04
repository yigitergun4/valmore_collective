/**
 * Product Category Constants
 * 
 * Centralized category definitions with type mappings
 * for dynamic form behavior and validation
 */

export type CategoryType = "shoes" | "accessories" | "clothing";

export interface ProductCategory {
    value: string;
    label: string;
    type: CategoryType;
    translationKey: string;
}

// filterdrawer constants
export const clothingSizes: string[] = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
export const shoeSizes: string[] = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49"];

export const SHIPPING_COST: number = 100;
export const FREE_SHIPPING_THRESHOLD: number = 1000;

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
    // Clothing
    { value: "Tişörtler", label: "Tişörtler", type: "clothing", translationKey: "tshirts" },
    { value: "Gömlekler", label: "Gömlekler", type: "clothing", translationKey: "shirts" },
    { value: "Pantolonlar", label: "Pantolonlar", type: "clothing", translationKey: "pants" },
    { value: "Dış Giyim", label: "Dış Giyim", type: "clothing", translationKey: "outerwear" },
    { value: "Üst Giyim", label: "Üst Giyim", type: "clothing", translationKey: "tops" },
    { value: "Sweatshirt", label: "Sweatshirt", type: "clothing", translationKey: "sweatshirts" },
    { value: "Elbise", label: "Elbise", type: "clothing", translationKey: "dresses" },
    { value: "Şort", label: "Şort", type: "clothing", translationKey: "shorts" },

    // Shoes
    { value: "Ayakkabı", label: "Ayakkabı", type: "shoes", translationKey: "shoes" },

    // Accessories
    { value: "Aksesuar", label: "Aksesuar", type: "accessories", translationKey: "accessories" },
    { value: "Çanta", label: "Çanta", type: "accessories", translationKey: "bags" },
    { value: "Çorap", label: "Çorap", type: "accessories", translationKey: "socks" },
] as const;

/**
 * Get category type for a given category value
 * @param category - The category value to look up
 * @returns The category type (shoes, accessories, or clothing)
 */
export const getCategoryType = (category: string): CategoryType => {
    const found = PRODUCT_CATEGORIES.find(cat => cat.value === category);
    return found?.type || "clothing";
};

/**
 * Get dynamic size placeholder based on category type
 * @param category - The category value
 * @returns Placeholder text for size input
 */
export const getSizePlaceholder = (category: string): string => {
    const categoryType = getCategoryType(category);

    switch (categoryType) {
        case "shoes":
            return "Örn: 36, 37, 38...";
        case "accessories":
            return "Opsiyonel";
        case "clothing":
        default:
            return "Örn: XS, S, M, L...";
    }
};

/**
 * Check if sizes are required for a given category
 * @param category - The category value
 * @returns true if sizes are required, false otherwise
 */
export const isSizeRequired = (category: string): boolean => {
    return getCategoryType(category) !== "accessories";
};
