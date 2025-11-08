'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const product = getProductById(params.id as string);
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('products.notFound')}</h2>
          <Link href="/products" className="text-gray-600 hover:text-primary-600">
            {t('products.backToProducts')}
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert(t('products.selectSizeColor'));
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('products.back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              {product.images[selectedImageIndex] ? (
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <span>No Image</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 12.5vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-primary-800 mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-primary-700 mb-4">₺{product.price.toFixed(2)}</p>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t('products.size')}</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-primary-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t('products.color')}</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-primary-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t('products.quantity')}</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-primary-50 transition-colors"
                  aria-label="Adet azalt"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-primary-50 transition-colors"
                  aria-label="Adet artır"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || !selectedSize || !selectedColor || addedToCart}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                product.inStock && selectedSize && selectedColor && !addedToCart
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {addedToCart ? (
                <span className="flex items-center justify-center">
                  <Check className="w-5 h-5 mr-2" />
                  {t('products.addedToCart')}
                </span>
              ) : product.inStock ? (
                t('products.addToCart')
              ) : (
                t('products.outOfStock')
              )}
            </button>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">{t('products.productDetails')}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>{t('products.category')}:</strong> {product.category}</li>
                <li><strong>{t('products.stockStatus')}:</strong> {product.inStock ? t('products.inStock') : t('products.outOfStock')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

