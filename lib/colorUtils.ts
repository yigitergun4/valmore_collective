/**
 * Color name to hex code mapping
 * Supports both Turkish and English color names
 */
export const COLOR_MAP: Record<string, string> = {
    // Turkish color names
    'siyah': '#000000',
    'beyaz': '#FFFFFF',
    'gri': '#9CA3AF',
    'kırmızı': '#EF4444',
    'mavi': '#3B82F6',
    'lacivert': '#1E3A8A',
    'yeşil': '#22C55E',
    'sarı': '#FACC15',
    'turuncu': '#F97316',
    'mor': '#A855F7',
    'pembe': '#EC4899',
    'kahverengi': '#92400E',
    'bej': '#D4B59F',
    'krem': '#F5F5DC',
    'bordo': '#800020',
    'haki': '#8B864E',
    'pudra': '#FFE4E1',
    'mint': '#98FF98',
    'füme': '#708090',
};

/**
 * Get hex color code from color name
 * @param colorName - Color name in Turkish or English (case-insensitive)
 * @returns Hex color code or fallback gray color
 */
export function getColorHex(colorName: string): string {
    const normalized = colorName.toLowerCase().trim();
    return COLOR_MAP[normalized] || '#D1D5DB'; // Default gray fallback
}

/**
 * Check if a color name is valid/mapped
 */
export function isColorMapped(colorName: string): boolean {
    const normalized = colorName.toLowerCase().trim();
    return normalized in COLOR_MAP;
}
