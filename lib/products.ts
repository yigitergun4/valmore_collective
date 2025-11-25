import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "1",
    name: "Klasik Beyaz Gömlek",
    slug: "klasik-beyaz-gomlek",
    description:
      "Premium pamuktan yapılmış zamansız beyaz gömlek. Gündelikten resmiye her duruma uygun.",
    price: 89.99,
    originalPrice: 129.99,
    images: [
      "https://images.unsplash.com/photo-1594938291221-94f18a24443e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=600&fit=crop",
    ],
    category: "Gömlekler",
    brand: "MANGO",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beyaz", "Siyah", "Lacivert"],
    inStock: true,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Slim Fit Kot Pantolon",
    slug: "slim-fit-kot-pantolon",
    description:
      "Esnek konforlu modern slim-fit kot pantolon. Sürdürülebilir denimden üretilmiştir.",
    price: 129.99,
    originalPrice: 179.99,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop",
    ],
    category: "Pantolonlar",
    brand: "LC WAIKIKI",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Mavi", "Siyah"],
    inStock: true,
    featured: true,
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    name: "Yün Palto",
    slug: "yun-palto",
    description:
      "Soğuk mevsimler için zarif yün palto. Detaylara özen gösterilerek el yapımı.",
    price: 349.99,
    originalPrice: 499.99,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=600&fit=crop",
    ],
    category: "Dış Giyim",
    brand: "ZARA",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Deve Tüyü", "Siyah", "Lacivert"],
    inStock: true,
    featured: true,
    createdAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "4",
    name: "Kaşmir Kazak",
    slug: "kasmir-kazak",
    description: "Üstün konfor ve stil için lüks kaşmir kazak.",
    price: 199.99,
    originalPrice: 279.99,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&h=600&fit=crop",
    ],
    category: "Üst Giyim",
    brand: "DEFACTO",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Bej", "Gri", "Lacivert"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-04T00:00:00Z",
  },
  {
    id: "5",
    name: "Deri Ceket",
    slug: "deri-ceket",
    description: "Modern dokunuşlu klasik deri ceket. Dayanıklı ve şık.",
    price: 449.99,
    originalPrice: 649.99,
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
    ],
    category: "Dış Giyim",
    brand: "KOTON",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Kahverengi", "Siyah"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "6",
    name: "Chino Pantolon",
    slug: "chino-pantolon",
    description:
      "Hem gündelik hem de smart-casual görünümler için çok yönlü chino pantolon.",
    price: 99.99,
    originalPrice: 139.99,
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop",
    ],
    category: "Pantolonlar",
    brand: "COLIN'S",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Haki", "Lacivert", "Zeytin Yeşili"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-06T00:00:00Z",
  },
  {
    id: "7",
    name: "Oversize Basic Tişört",
    slug: "oversize-basic-tisort",
    description: "Yumuşak pamuklu oversize kesim günlük tişört.",
    price: 49.99,
    originalPrice: 79.99,
    images: [
      "https://images.unsplash.com/photo-1593032457868-4493e79f9d93?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91a1b9bb96c?w=600&h=600&fit=crop",
    ],
    category: "Tişörtler",
    brand: "BERSHKA",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beyaz", "Siyah", "Krem"],
    inStock: true,
    featured: true,
    createdAt: "2024-01-07T00:00:00Z",
  },
  {
    id: "8",
    name: "Relax Fit Hoodie",
    slug: "relax-fit-hoodie",
    description: "Sıcak tutan ve rahat kesimli kapüşonlu hoodie.",
    price: 159.99,
    originalPrice: 219.99,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3b1c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1618221195714-e1d874a7c087?w=600&h=600&fit=crop",
    ],
    category: "Sweatshirt",
    brand: "PULL&BEAR",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gri", "Siyah", "Bordo"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-08T00:00:00Z",
  },
  {
    id: "9",
    name: "Minimal Deri Omuz Çantası",
    slug: "minimal-deri-omuz-cantasi",
    description: "Modern ve sade tasarımlı kompakt deri omuz çantası.",
    price: 199.99,
    originalPrice: 249.99,
    images: [
      "https://images.unsplash.com/photo-1614252232657-77f9d88b22c8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600181954371-fb9a3bc6a25f?w=600&h=600&fit=crop",
    ],
    category: "Aksesuar",
    brand: "STRADIVARIUS",
    sizes: ["Tek Beden"],
    colors: ["Siyah", "Bej"],
    inStock: true,
    featured: true,
    createdAt: "2024-01-09T00:00:00Z",
  },
  {
    id: "10",
    name: "Yüksek Taban Spor Ayakkabı",
    slug: "yuksek-taban-spor-ayakkabi",
    description: "Gün boyu konfor sağlayan yüksek taban sneaker.",
    price: 299.99,
    originalPrice: 399.99,
    images: [
      "https://images.unsplash.com/photo-1600185365926-3a2fea288d1d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606813907291-d86efa6c73a0?w=600&h=600&fit=crop",
    ],
    category: "Ayakkabı",
    brand: "ADIDAS",
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Beyaz", "Gri"],
    inStock: true,
    featured: true,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "11",
    name: "Saten Midi Elbise",
    slug: "saten-midi-elbise",
    description: "Şık davetler için zarif saten midi elbise.",
    price: 279.99,
    originalPrice: 359.99,
    images: [
      "https://images.unsplash.com/photo-1620799139834-6f24f08f6b55?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1620799141378-042527969b5f?w=600&h=600&fit=crop",
    ],
    category: "Elbise",
    brand: "ZARA",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Kırmızı", "Siyah"],
    inStock: true,
    featured: true,
    createdAt: "2024-01-11T00:00:00Z",
  },
  {
    id: "12",
    name: "Bomber Ceket",
    slug: "bomber-ceket",
    description: "Sokak stilinin vazgeçilmezi bomber model ceket.",
    price: 229.99,
    originalPrice: 299.99,
    images: [
      "https://images.unsplash.com/photo-1534215754734-18e57f8f4620?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    ],
    category: "Dış Giyim",
    brand: "H&M",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Siyah", "Haki"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "13",
    name: "Oversize Sweatshirt",
    slug: "oversize-sweatshirt",
    description: "Yumuşak dokulu, tam bir konfor oversize sweatshirt.",
    price: 129.99,
    originalPrice: 169.99,
    images: [
      "https://images.unsplash.com/photo-1602810318349-d26d707b5c6e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1602810318372-0fa9fae90d64?w=600&h=600&fit=crop",
    ],
    category: "Sweatshirt",
    brand: "BERSHKA",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Krem", "Gri"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-13T00:00:00Z",
  },
  {
    id: "14",
    name: "Retro Sneaker",
    slug: "retro-sneaker",
    description: "Vintage detaylara sahip hafif spor ayakkabı.",
    price: 259.99,
    originalPrice: 349.99,
    images: [
      "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1584735175317-9d5df2403278?w=600&h=600&fit=crop",
    ],
    category: "Ayakkabı",
    brand: "NIKE",
    sizes: ["40", "41", "42", "43", "44"],
    colors: ["Beyaz", "Siyah"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-14T00:00:00Z",
  },
  {
    id: "15",
    name: "Kargo Şort",
    slug: "kargo-sort",
    description: "Hafif kumaşı ile rahat kesim çok cepli kargo şort.",
    price: 89.99,
    originalPrice: 129.99,
    images: [
      "https://images.unsplash.com/photo-1592878849128-f73e3b60c22d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551232864-3f1c06662f33?w=600&h=600&fit=crop",
    ],
    category: "Şort",
    brand: "COLIN'S",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Haki", "Bej"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "16",
    name: "Ketenden Gömlek",
    slug: "ketenden-gomlek",
    description: "Nefes alabilen keten kumaştan yazlık gömlek.",
    price: 119.99,
    originalPrice: 159.99,
    images: [
      "https://images.unsplash.com/photo-1583512603929-2a6f31c70244?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578932750294-f5075e85b3da?w=600&h=600&fit=crop",
    ],
    category: "Gömlekler",
    brand: "MANGO",
    sizes: ["S", "M", "L"],
    colors: ["Bej", "Beyaz"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-16T00:00:00Z",
  },
  {
    id: "17",
    name: "Wide Leg Palazzo Pantolon",
    slug: "wide-leg-palazzo-pantolon",
    description:
      "Akıcı kumaşı ve geniş paça kesimiyle modern palazzo pantolon. Günlük ve şık kullanım için ideal.",
    price: 149.99,
    originalPrice: 199.99,
    images: [
      "https://images.unsplash.com/photo-1583496661160-f7f4e7bbd9f9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594631252843-8f59c18284de?w=600&h=600&fit=crop",
    ],
    category: "Pantolonlar",
    brand: "ZARA",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Siyah", "Bej"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-17T00:00:00Z",
  },
  {
    id: "18",
    name: "Straight Fit Denim",
    slug: "straight-fit-denim",
    description:
      "Günlük kullanım için rahat straight-fit kesimli denim pantolon. Dayanıklı kumaş yapısı ile uzun ömürlü.",
    price: 139.99,
    originalPrice: 189.99,
    images: [
      "https://images.unsplash.com/photo-1533228100845-08145b01de14?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=600&fit=crop",
    ],
    category: "Pantolonlar",
    brand: "H&M",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Açık Mavi", "Koyu Mavi"],
    inStock: true,
    featured: false,
    createdAt: "2024-01-18T00:00:00Z",
  },
  {
    id: "19",
    name: "Kargo Jogger Pantolon",
    slug: "kargo-jogger-pantolon",
    description:
      "Rahat kesimli ve yan cepli modern kargo jogger pantolon. Sokak stiline sportif bir dokunuş katar.",
    price: 119.99,
    originalPrice: 169.99,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506071543658-56e1a52a0f02?w=600&h=600&fit=crop",
    ],
    category: "Pantolonlar",
    brand: "BERSHKA",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Haki", "Siyah"],
    inStock: true,
    featured: true,
    createdAt: "2024-01-19T00:00:00Z",
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

// Yeni yardımcı fonksiyonlar
export function getDiscountedProducts(): Product[] {
  return products.filter(
    (product) => product.originalPrice && product.originalPrice > product.price
  );
}

export function getProductsByBrand(brand: string): Product[] {
  return products.filter((product) => product.brand === brand);
}

export function getRelatedProducts(
  currentProductId: string,
  limit: number = 4
): Product[] {
  const currentProduct = getProductById(currentProductId);
  if (!currentProduct) return [];

  return products
    .filter((product) => product.id !== currentProductId)
    .filter(
      (product) =>
        product.category === currentProduct.category ||
        product.brand === currentProduct.brand
    )
    .slice(0, limit);
}

export function getAllProducts(): Product[] {
  return products;
}
