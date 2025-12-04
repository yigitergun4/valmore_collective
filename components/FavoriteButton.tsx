'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useShop } from '@/contexts/ShopContext';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
}

export default function FavoriteButton({ productId, className = '' }: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useShop();
  const isFavorite: boolean = favorites.includes(productId);

  const handleToggle: React.MouseEventHandler<HTMLButtonElement> = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if inside a link
    e.stopPropagation(); // Prevent event bubbling
    toggleFavorite(productId);
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 ${className}`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-5 h-5 transition-colors duration-200 ${
          isFavorite ? 'fill-primary-500 text-primary-500' : 'text-gray-600 hover:text-black'
        }`}
      />
    </button>
  );
}
