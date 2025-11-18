'use client';

import { useState, useMemo } from 'react';
import { products } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { Search, Filter, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProductsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(t('products.all'));
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');

  // Optimize: categories her render'da hesaplanmasın
  const categories = useMemo(
    () => [t('products.all'), ...Array.from(new Set(products.map(p => p.category)))],
    [t]
  );

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === t('products.all') || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, t]);

  const hasActiveFilters = searchQuery || (selectedCategory !== t('products.all'));

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(t('products.all'));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full mx-auto px-1 sm:px-2 lg:px-3 py-6">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {t('products.title')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('products.description')}
            </p>
          </div>
          {filteredAndSortedProducts.length > 0 && (
            <p className="text-sm text-gray-500 hidden sm:block">
              <span className="font-medium text-gray-900">{filteredAndSortedProducts.length}</span> ürün
            </p>
          )}
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 md:p-4">
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('products.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              />
            </div>

            {/* Category and Sort Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center space-x-2">
                <Filter className="text-gray-400 w-4 h-4 flex-shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price-low' | 'price-high')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white min-w-[140px]"
              >
                <option value="name">{t('products.sort.name')}</option>
                <option value="price-low">{t('products.sort.priceLow')}</option>
                <option value="price-high">{t('products.sort.priceHigh')}</option>
              </select>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                      "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 hover:text-gray-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory !== t('products.all') && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory(t('products.all'))}
                        className="ml-1 hover:text-gray-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
              <p className="text-sm text-gray-500 mb-4">{t('products.noResults')}</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 text-sm bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

