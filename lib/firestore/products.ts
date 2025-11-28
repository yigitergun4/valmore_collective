import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Product } from "@/types";

const COLLECTION_NAME: string = "products";

export async function getAdminProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export async function addProduct(productData: Omit<Product, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...productData,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, productData);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Sadece resim dosyaları yüklenebilir');
    }

    // Validate file size (max 5MB)
    const maxSize: number = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('Dosya boyutu maksimum 5MB olabilir');
    }

    // Create unique filename with timestamp
    const timestamp: number = Date.now();
    const sanitizedFileName: string = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName: string = `${timestamp}_${sanitizedFileName}`;

    // Create storage reference
    const storageRef = ref(storage, `products/${fileName}`);

    // Upload file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL: string = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading image:", error);

    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('Yetkilendirme hatası. Lütfen giriş yapın.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Yükleme iptal edildi.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    }

    throw error;
  }
}
