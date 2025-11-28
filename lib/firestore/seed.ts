import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- MOCK DATA ---
const CATEGORIES = [
    { name: "t-shirt", type: "clothing" },
    { name: "shirt", type: "clothing" },
    { name: "pants", type: "clothing" },
    { name: "jacket", type: "clothing" },
    { name: "shoes", type: "shoes" },
    { name: "accessory", type: "accessory" }
];

const BRANDS = ["Nike", "Adidas", "Zara", "H&M", "Gucci", "Prada", "Valmoré"];
const ADJECTIVES = ["Premium", "Classic", "Modern", "Vintage", "Urban", "Luxury", "Essential"];
const NOUNS = ["T-Shirt", "Jeans", "Sneakers", "Hoodie", "Coat", "Bag", "Watch"];
const COLORS = ["Siyah", "Beyaz", "Mavi", "Kırmızı", "Yeşil", "Gri", "Lacivert", "Bej"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
const ACCESSORY_SIZES = ["Standart"];
const IMAGES = [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?w=800&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"
];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const getRandomSubset = (arr: any[], count: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const generateSlug = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

export async function seedProducts() {
    const promises = [];

    for (let i = 0; i < 50; i++) {
        const category = getRandom(CATEGORIES);
        const brand = getRandom(BRANDS);
        const adjective = getRandom(ADJECTIVES);
        const noun = getRandom(NOUNS);
        const name = `${brand} ${adjective} ${noun}`;

        // Fiyat mantığı
        const price = Math.floor(Math.random() * (2000 - 300) + 300); // 300 - 2000 arası
        const originalPrice = Math.floor(price * 1.3); // %30 daha pahalı

        // Kategoriye göre beden seçimi
        let sizes = CLOTHING_SIZES;
        if (category.type === "shoes") sizes = SHOE_SIZES;
        if (category.type === "accessory") sizes = ACCESSORY_SIZES;

        // Ürün Objesi (Senin veritabanı yapına birebir uygun)
        const product = {
            name: name,
            slug: generateSlug(`${name}-${i}`), // Benzersiz slug
            brand: brand,
            category: category.name,
            description: "Modern bireyler için tasarlanmış, gün boyu konfor sağlayan, premium malzemelerden üretilmiş zamansız bir parça. Valmoré koleksiyonunun en gözde ürünlerinden biri.",
            price: price,
            originalPrice: originalPrice,
            isDiscounted: true,
            inStock: Math.random() > 0.2, // %80 stokta
            featured: Math.random() > 0.8, // %20 öne çıkan
            colors: getRandomSubset(COLORS, 3), // 3 rastgele renk
            sizes: sizes, // Kategoriye uygun bedenler
            images: getRandomSubset(IMAGES, 2).map((url: string) => ({ url, color: "Genel" })), // 2 rastgele resim
            createdAt: new Date().toISOString(),
            // Yeni eklediğimiz alanlar (Opsiyonel, hata vermez)
            gender: getRandom(["Erkek", "Kadın", "Unisex"]),
            material: "%100 Pamuk",
            fit: "Regular Fit",
            hasVariants: false,
            variants: []
        };

        promises.push(addDoc(collection(db, "products"), product));
    }

    await Promise.all(promises);
}
