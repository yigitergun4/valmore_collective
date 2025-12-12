/**
 * Flat Variation System
 * Each color-size combination is a unique object
 */

export interface Variation {
    /** Unique identifier (UUID) */
    id: string;
    /** Color name (e.g., "Kırmızı") */
    color: string;
    /** Single size value (e.g., "M", "42") */
    size: string;
    /** Auto-generated or custom SKU (e.g., "TSHIRT-KIRMIZI-36") */
    sku: string;
    /** Optional barcode */
    barcode: string;
    /** Stock availability status */
    stockStatus: boolean;
}

/** Input for adding variations */
export interface AddVariationsInput {
    productName: string;
    color: string;
    sizes: string[];
    stockStatus: boolean;
    barcode?: string;
}

/** Generate UUID */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/** Generate SKU from product name, color, and size */
export const generateSKU = (productName: string, color: string, size: string): string => {
    const normalize = (str: string): string => {
        const trMap: { [key: string]: string } = {
            'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I', 'ğ': 'g', 'Ğ': 'G',
            'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
        };
        return str
            .split('')
            .map(char => trMap[char] || char)
            .join('')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 10);
    };

    return `${normalize(productName)}-${normalize(color)}-${normalize(size)}`;
};
