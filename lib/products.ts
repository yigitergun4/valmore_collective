import { Product } from '@/types';

// Örnek ürün verileri - gerçek bir uygulamada bu veriler veritabanından gelecektir
export const products: Product[] = [
  {
    id: '1',
    name: 'Klasik Beyaz Gömlek',
    description: 'Premium pamuktan yapılmış zamansız beyaz gömlek. Gündelikten resmiye her duruma uygun.',
    price: 89.99,
    images: ['https://via.placeholder.com/600x600?text=Klasik+Beyaz+Gomlek'],
    category: 'Gömlekler',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beyaz', 'Siyah', 'Lacivert'],
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Slim Fit Kot Pantolon',
    description: 'Esnek konforlu modern slim-fit kot pantolon. Sürdürülebilir denimden üretilmiştir.',
    price: 129.99,
    images: ['https://via.placeholder.com/600x600?text=Slim+Fit+Kot'],
    category: 'Pantolonlar',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Mavi', 'Siyah'],
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Yün Palto',
    description: 'Soğuk mevsimler için zarif yün palto. Detaylara özen gösterilerek el yapımı.',
    price: 349.99,
    images: ['https://via.placeholder.com/600x600?text=Yun+Palto'],
    category: 'Dış Giyim',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Deve Tüyü', 'Siyah', 'Lacivert'],
    inStock: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Kaşmir Kazak',
    description: 'Üstün konfor ve stil için lüks kaşmir kazak.',
    price: 199.99,
    images: ['https://via.placeholder.com/600x600?text=Kasmir+Kazak'],
    category: 'Üst Giyim',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Bej', 'Gri', 'Lacivert'],
    inStock: true,
    featured: false,
  },
  {
    id: '5',
    name: 'Deri Ceket',
    description: 'Modern dokunuşlu klasik deri ceket. Dayanıklı ve şık.',
    price: 449.99,
    images: ['https://via.placeholder.com/600x600?text=Deri+Ceket'],
    category: 'Dış Giyim',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Kahverengi', 'Siyah'],
    inStock: true,
    featured: false,
  },
  {
    id: '6',
    name: 'Chino Pantolon',
    description: 'Hem gündelik hem de smart-casual görünümler için çok yönlü chino pantolon.',
    price: 99.99,
    images: ['https://via.placeholder.com/600x600?text=Chino+Pantolon'],
    category: 'Pantolonlar',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Haki', 'Lacivert', 'Zeytin Yeşili'],
    inStock: true,
    featured: false,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(product => product.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(product => product.featured);
}

