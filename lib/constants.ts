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
}

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
    // Clothing
    { value: "Tişörtler", label: "Tişörtler", type: "clothing" },
    { value: "Gömlekler", label: "Gömlekler", type: "clothing" },
    { value: "Pantolonlar", label: "Pantolonlar", type: "clothing" },
    { value: "Dış Giyim", label: "Dış Giyim", type: "clothing" },
    { value: "Üst Giyim", label: "Üst Giyim", type: "clothing" },
    { value: "Sweatshirt", label: "Sweatshirt", type: "clothing" },
    { value: "Elbise", label: "Elbise", type: "clothing" },
    { value: "Şort", label: "Şort", type: "clothing" },

    // Shoes
    { value: "Ayakkabı", label: "Ayakkabı", type: "shoes" },

    // Accessories
    { value: "Aksesuar", label: "Aksesuar", type: "accessories" },
    { value: "Çanta", label: "Çanta", type: "accessories" },
    { value: "Çorap", label: "Çorap", type: "accessories" },
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
