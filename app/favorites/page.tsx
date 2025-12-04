'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useShop } from '@/contexts/ShopContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllProducts } from '@/lib/productService';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

export default function FavoritesPage() {
  const { favorites } = useShop();
  const { t } = useLanguage();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts: () => Promise<void> = async () => {
      try {
        const products: Product[] = await getAllProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products that are in the favorites list
  const favoriteProducts: Product[] = allProducts.filter((product: Product) => 
    favorites.includes(product.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 lg:px-8 max-w-[1920px] mx-auto">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-tighter">
            {t('favorites.title')}
          </h1>
          <span className="text-gray-500 text-sm font-medium">
            {favoriteProducts.length} {t('favorites.items')}
          </span>
        </div>

        {/* Content */}
        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-8 lg:gap-y-12">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                {t('favorites.empty')}
              </h2>
              <p className="text-gray-500 max-w-md">
                {t('cart.empty.description')}
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              {t('favorites.continue')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
