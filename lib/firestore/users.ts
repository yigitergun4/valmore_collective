import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from "firebase/firestore";
import { User, Address } from "@/types";

/**
 * Update user profile information
 */
export const updateUserProfile = async (uid: string, data: Partial<User>): Promise<boolean> => {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, data);
        return true;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

/**
 * Add a new address to user's address book
 */
export const addAddress = async (uid: string, address: Address): Promise<boolean> => {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            addresses: arrayUnion(address)
        });
        return true;
    } catch (error) {
        console.error("Error adding address:", error);
        throw error;
    }
};

/**
 * Update an existing address
 * Since Firestore doesn't support updating a specific item in an array,
 * we need to read the array, modify the item, and write it back.
 */
export const updateAddress = async (uid: string, updatedAddress: Address): Promise<boolean> => {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            const addresses = userData.addresses || [];

            const newAddresses: Address[] = addresses.map(addr =>
                addr.id === updatedAddress.id ? updatedAddress : addr
            );

            await updateDoc(userRef, { addresses: newAddresses });
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error updating address:", error);
        throw error;
    }
};

/**
 * Delete an address from user's address book
 */
export const deleteAddress = async (uid: string, addressId: string): Promise<boolean> => {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            const addresses = userData.addresses || [];
            const addressToDelete = addresses.find(a => a.id === addressId);

            if (addressToDelete) {
                await updateDoc(userRef, {
                    addresses: arrayRemove(addressToDelete)
                });
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("Error deleting address:", error);
        throw error;
    }
};

/**
 * Get user profile data
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as User;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};
