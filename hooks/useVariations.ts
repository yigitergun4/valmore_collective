"use client";

import { useState, useCallback, useMemo } from "react";
import { Variation, AddVariationsInput, generateUUID, generateSKU } from "@/types/variations";
import toast from "react-hot-toast";
import { UseVariationsReturn } from "@/types/hooks";

/**
 * Custom hook for managing Flat Array variations
 * Separates business logic from UI components
 */
export const useVariations = (initialVariations: Variation[] = []): UseVariationsReturn => {
    const [variations, setVariations] = useState<Variation[]>(initialVariations);

    const isDuplicate = useCallback((color: string, size: string): boolean => {
        return variations.some(v =>
            v.color.toLowerCase() === color.toLowerCase() &&
            v.size.toLowerCase() === size.toLowerCase()
        );
    }, [variations]);

    const addVariations: UseVariationsReturn["addVariations"] = useCallback((input: AddVariationsInput): boolean => {
        const { productName, color, sizes, stockStatus, barcode = "" } = input;

        // Check for duplicates
        const duplicates = sizes.filter(size => isDuplicate(color, size));
        if (duplicates.length > 0) {
            toast.error(`Bu kombinasyon zaten mevcut: ${color} - ${duplicates.join(", ")}`);
            return false;
        }

        const newVariations: Variation[] = sizes.map((size) => ({
            id: generateUUID(),
            color,
            size,
            sku: generateSKU(productName, color, size),
            barcode,
            stockStatus,
        }));

        setVariations((prev) => [...prev, ...newVariations]);
        return true;
    }, [isDuplicate]);

    const updateVariation: UseVariationsReturn["updateVariation"] = useCallback((id: string, updates: Partial<Omit<Variation, "id">>) => {
        setVariations((prev) =>
            prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
        );
    }, []);

    const removeVariation: UseVariationsReturn["removeVariation"] = useCallback((id: string) => {
        setVariations((prev) => prev.filter((v) => v.id !== id));
    }, []);

    const removeByColor: UseVariationsReturn["removeByColor"] = useCallback((color: string) => {
        setVariations((prev) => prev.filter((v) => v.color !== color));
    }, []);

    const getUniqueColors: UseVariationsReturn["getUniqueColors"] = useCallback((): string[] => {
        return Array.from(new Set(variations.map((v) => v.color)));
    }, [variations]);

    const getUniqueSizes: UseVariationsReturn["getUniqueSizes"] = useCallback((): string[] => {
        return Array.from(new Set(variations.map((v) => v.size)));
    }, [variations]);

    const hasInStock: UseVariationsReturn["hasInStock"] = useCallback((): boolean => {
        return variations.some((v) => v.stockStatus);
    }, [variations]);

    const reset: UseVariationsReturn["reset"] = useCallback(() => {
        setVariations([]);
    }, []);

    const groupedByColor: UseVariationsReturn["groupedByColor"] = useMemo(() => {
        const groups: Record<string, Variation[]> = {};
        variations.forEach(v => {
            if (!groups[v.color]) {
                groups[v.color] = [];
            }
            groups[v.color].push(v);
        });
        return groups;
    }, [variations]);

    return {
        variations,
        setVariations,
        addVariations,
        updateVariation,
        removeVariation,
        removeByColor,
        getUniqueColors,
        getUniqueSizes,
        hasInStock,
        isDuplicate,
        reset,
        groupedByColor,
    };
};
