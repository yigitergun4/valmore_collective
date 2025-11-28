"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Database } from "lucide-react";

// --- GERÇEKÇİ VERİ HAVUZU ---

const BRANDS = ["Valmoré", "ZARA", "Massimo Dutti", "Mango Man", "Nike", "Adidas"];

const CATEGORIES = [
  { name: "Gömlekler", type: "clothing" },
  { name: "Pantolonlar", type: "clothing" },
  { name: "Dış Giyim", type: "clothing" },
  { name: "Tişörtler", type: "clothing" },
  { name: "Ayakkabı", type: "shoes" },
  { name: "Aksesuar", type: "accessory" },
];

const COLORS = ["Siyah", "Beyaz", "Lacivert", "Haki", "Bej", "Gri", "Bordo", "Antrasit"];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["40", "41", "42", "43", "44", "45"];
const ACCESSORY_SIZES = ["Standart"];

const ADJECTIVES = ["Premium", "Klasik", "Modern", "Slim Fit", "Oversize", "İtalyan Kesim", "Pamuklu", "Keten", "Basic", "Vintage"];
const NOUNS = ["Oxford Gömlek", "Chino Pantolon", "Deri Ceket", "Sneaker", "Takım Elbise", "Polo Yaka", "Sweatshirt", "Kot Pantolon", "Loafer", "Kemer"];

// Gerçekçi Unsplash Moda Fotoğrafları
const IMAGES = [
  "https://images.unsplash.com/photo-1593030761757-71bd90dbe3a4?q=80&w=600&auto=format&fit=crop", // Ayakkabı
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop", // Gömlek
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop", // Ceket
  "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&auto=format&fit=crop", // Gömlek 2
  "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=600&auto=format&fit=crop", // Moda Genel
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop", // Gömlek 3
  "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=600&auto=format&fit=crop", // Ayakkabı 2
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop", // Tişört
];

// --- YARDIMCI FONKSİYONLAR ---
const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const getRandomSubset = (arr: any[], count: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

export default function SeedButton() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    if (!confirm("Dikkat! Veritabanına 50 adet rastgele ürün eklenecek. Onaylıyor musun?")) return;
    
    setLoading(true);
    try {
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
          inStock: Math.random() > 0.2, // %80 stokta
          featured: Math.random() > 0.8, // %20 öne çıkan
          colors: getRandomSubset(COLORS, 3), // 3 rastgele renk
          sizes: sizes, // Kategoriye uygun bedenler
          images: getRandomSubset(IMAGES, 2), // 2 rastgele resim
          createdAt: new Date().toISOString(),
          // Yeni eklediğimiz alanlar (Opsiyonel, hata vermez)
          gender: getRandom(["Erkek", "Kadın", "Unisex"]),
          material: "%100 Pamuk",
          fit: "Regular Fit"
        };

        promises.push(addDoc(collection(db, "products"), product));
      }

      await Promise.all(promises);
      alert("Başarılı! 50 Ürün veritabanına eklendi. Sayfayı yenileyin.");
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
      {loading ? "Yükleniyor..." : "50 Örnek Ürün Yükle"}
    </button>
  );
}