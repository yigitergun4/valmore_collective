import { z } from 'zod';

export const ProductSchema = z.object({
    name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
    description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
    price: z.number().positive("Fiyat 0'dan büyük olmalıdır"),
    category: z.string().min(1, "Kategori seçilmelidir"),
    gender: z.string().min(1, "Cinsiyet seçilmelidir"),
    images: z.array(z.object({
        url: z.string().url("Geçerli bir resim URL'si girilmelidir"),
        color: z.string()
    })).min(1, "En az bir resim gereklidir"),
    brand: z.string().optional(),
    material: z.string().optional(),
    fit: z.string().optional(),
    inStock: z.boolean().default(true),
    hasVariants: z.boolean().default(false),
    variants: z.array(z.any()).optional(),
    isDiscounted: z.boolean().default(false),
    originalPrice: z.number().optional(),
});

export const OrderSchema = z.object({
    customer: z.object({
        fullName: z.string().min(2, "Ad Soyad gereklidir"),
        email: z.string().email("Geçerli bir e-posta adresi giriniz"),
        phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
    }),
    items: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number().positive(),
        selectedSize: z.string().optional(),
        selectedColor: z.string().optional(),
    })).min(1, "Sipariş en az bir ürün içermelidir"),
    total: z.number(),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
    shippingAddress: z.object({
        address: z.string().min(5, "Açık adres gereklidir"),
        city: z.string().min(1, "Şehir gereklidir"),
        district: z.string().min(1, "İlçe gereklidir"),
    }),
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
