export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

/**
 * Formats a number as Turkish Lira currency
 * Format: 1.234,56 ₺ (dot for thousands, comma for decimals, symbol on right)
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}
