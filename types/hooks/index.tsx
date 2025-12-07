import type React from "react";
import { Variation,AddVariationsInput } from "../variations";

export interface UseVariationsReturn {
    /** Current list of variations */
    variations: Variation[];
    /** Set variations directly (for initial data) */
    setVariations: React.Dispatch<React.SetStateAction<Variation[]>>;
    /** Add multiple variations for a color with multiple sizes */
    addVariations: (input: AddVariationsInput) => boolean;
    /** Update a single variation by ID */
    updateVariation: (id: string, updates: Partial<Omit<Variation, "id">>) => void;
    /** Remove a single variation by ID */
    removeVariation: (id: string) => void;
    /** Remove all variations of a specific color */
    removeByColor: (color: string) => void;
    /** Get unique colors from variations */
    getUniqueColors: () => string[];
    /** Get unique sizes from variations */
    getUniqueSizes: () => string[];
    /** Check if any variation is in stock */
    hasInStock: () => boolean;
    /** Check if a color-size combination exists */
    isDuplicate: (color: string, size: string) => boolean;
    /** Reset all variations */
    reset: () => void;
    /** Grouped variations by color */
    groupedByColor: Record<string, Variation[]>;
}