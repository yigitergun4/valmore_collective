import { describe, it, expect } from 'vitest';
import { formatPrice } from './utils';

describe('formatPrice', () => {
    it('should format numbers in Turkish Lira format correctly', () => {
        expect(formatPrice(1000)).toBe('₺1.000,00');
        expect(formatPrice(1234.56)).toBe('₺1.234,56');
        expect(formatPrice(50000.99)).toBe('₺50.000,99');
        expect(formatPrice(99.9)).toBe('₺99,90');
    });

    it('should handle large numbers', () => {
        expect(formatPrice(1000000)).toBe('₺1.000.000,00');
    });

    it('should handle zero', () => {
        expect(formatPrice(0)).toBe('₺0,00');
    });
});
