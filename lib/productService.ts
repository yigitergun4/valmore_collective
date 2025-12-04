import {
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    limit,
    orderBy,
    DocumentData,
    QueryDocumentSnapshot,
    Query,
    QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, ProductGender, GENDER_OPTIONS } from "@/types";

const COLLECTION_NAME: string = "products";

/**
 * Helper function to map Firestore document to Product type
 * CRITICAL: Converts Firestore Timestamp to ISO string to prevent Next.js serialization errors
 */
function mapDocToProduct(doc: QueryDocumentSnapshot<DocumentData>): Product {
    const data: DocumentData = doc.data();

    return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        isDiscounted: data.isDiscounted ?? false,
        images: data.images || [],
        category: data.category,
        brand: data.brand,
        sizes: data.sizes || [],
        colors: data.colors || [],
        inStock: data.inStock ?? true,
        featured: data.featured ?? false,
        hasVariants: data.hasVariants ?? false,
        variants: data.variants || [],
        createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toDate().toISOString()) : new Date().toISOString(),
        slug: data.slug || "",
        gender: (data.gender as ProductGender) || GENDER_OPTIONS[1].value, // Default to Female if missing
    };
}

/**
 * Fetch ALL documents from the "products" collection.
 * Order them by createdAt descending (newest first).
 */
export async function getAllProducts(): Promise<Product[]> {
    try {
        const q: Query<DocumentData> = query(
            collection(db, COLLECTION_NAME),
            orderBy("createdAt", "desc")
        );
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
        const products: Product[] = querySnapshot.docs.map(mapDocToProduct);
        return products;
    } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
    }
}

/**
 * Fetch a single document. Return null if not found.
 */
export async function getProductById(id: string): Promise<Product | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapDocToProduct(docSnap as QueryDocumentSnapshot<DocumentData>);
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return null;
    }
}

/**
 * Query where category == category.
 */
export async function getProductsByCategory(
    category: string
): Promise<Product[]> {
    try {
        const q: Query<DocumentData> = query(
            collection(db, COLLECTION_NAME),
            where("category", "==", category),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(mapDocToProduct);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        return [];
    }
}

/**
 * Query where featured == true (Limit to 8 items).
 */
export async function getFeaturedProducts(): Promise<Product[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("featured", "==", true),
            limit(8)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(mapDocToProduct);
    } catch (error) {
        console.error("Error fetching featured products:", error);
        return [];
    }
}

/**
 * Fetch products in the same category, excluding the current ID.
 */
export async function getRelatedProducts(
    currentProductId: string,
    category: string,
    limitCount: number = 4
): Promise<Product[]> {
    try {
        // Fetch products from the same category (with extra to account for filtering)
        const q = query(
            collection(db, COLLECTION_NAME),
            where("category", "==", category),
            limit(limitCount + 1)
        );

        const querySnapshot = await getDocs(q);
        const relatedProducts = querySnapshot.docs
            .map(mapDocToProduct)
            .filter((product) => product.id !== currentProductId)
            .slice(0, limitCount);

        return relatedProducts;
    } catch (error) {
        console.error("Error fetching related products:", error);
        return [];
    }
}
