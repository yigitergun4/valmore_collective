import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Order } from "@/types/admin/orders";

/**
 * Creates a new order in Firestore
 * @param orderData - Order data without ID (will be auto-generated)
 * @returns The created order ID
 */
export async function createOrder(
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<string> {
    try {
        const ordersRef = collection(db, "orders");

        // Add the order to Firestore with server timestamps
        const docRef = await addDoc(ordersRef, {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order. Please try again.");
    }
}

/**
 * Fetches all orders from Firestore
 * @returns Array of orders sorted by creation date (newest first)
 */
export async function fetchAllOrders(): Promise<Order[]> {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            orders.push({
                id: doc.id,
                userId: data.userId || null,
                customer: data.customer,
                items: data.items,
                subtotal: data.subtotal,
                shippingCost: data.shippingCost,
                discountTotal: data.discountTotal,
                total: data.total,
                currency: data.currency,
                paymentMethod: data.paymentMethod,
                paymentId: data.paymentId,
                status: data.status,
                shippingAddress: data.shippingAddress,
                trackingNumber: data.trackingNumber,
                carrier: data.carrier,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
            });
        });

        return orders;
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw new Error("Failed to fetch orders.");
    }
}

/**
 * Fetches orders for a specific user
 * @param userId - User ID to filter orders
 * @returns Array of user's orders
 */
export async function fetchUserOrders(userId: string): Promise<Order[]> {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            orders.push({
                id: doc.id,
                userId: data.userId,
                customer: data.customer,
                items: data.items,
                subtotal: data.subtotal,
                shippingCost: data.shippingCost,
                discountTotal: data.discountTotal,
                total: data.total,
                currency: data.currency,
                paymentMethod: data.paymentMethod,
                paymentId: data.paymentId,
                status: data.status,
                shippingAddress: data.shippingAddress,
                trackingNumber: data.trackingNumber,
                carrier: data.carrier,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
            });
        });

        return orders;
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw new Error("Failed to fetch user orders.");
    }
}

/**
 * Generates a unique order number (e.g., "ORD-20240315-001")
 * @returns Formatted order number string
 */
export async function generateOrderNumber(): Promise<string> {
    const today: Date = new Date();
    const dateStr: string = today.toISOString().split('T')[0].replace(/-/g, '');

    // Query orders created today to get the count
    const ordersRef = collection(db, "orders");
    const startOfDay: Date = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay: Date = new Date(today.setHours(23, 59, 59, 999));

    const q = query(
        ordersRef,
        where("createdAt", ">=", startOfDay),
        where("createdAt", "<=", endOfDay),
        orderBy("createdAt", "desc"),
        limit(1)
    );

    const querySnapshot = await getDocs(q);
    const count: number = querySnapshot.size + 1;

    return `ORD-${dateStr}-${count.toString().padStart(3, '0')}`;
}
