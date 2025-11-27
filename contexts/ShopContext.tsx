'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, setDoc, DocumentReference, DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { Product,ShopContextType, CartItem } from '@/types';





const ShopContext: React.Context<ShopContextType | undefined> = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to calculate cart count
  const cartCount: number = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Load initial state from LocalStorage (for guest) or Firestore (for user)
  useEffect(() => {
    let unsubscribeCart: () => void;

    const initializeShop: () => Promise<void> = async () => {
      if (user) {
        // User is logged in: Listen to Firestore
        const userRef: DocumentReference<DocumentData> = doc(db, 'users', user.id);
        
        // Check if user doc exists, if not create it
        const userSnap: DocumentSnapshot<DocumentData> = await getDoc(userRef);
        if (!userSnap.exists()) {
           try {
             await setDoc(userRef, { 
               email: user.email, 
               name: user.name,
               cart: [],
               favorites: []
             }, { merge: true });
           } catch (e) {
             console.error("Error creating user doc:", e);
           }
        }

        // Real-time listener for Cart and Favorites
        unsubscribeCart = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setCart(data.cart || []);
            setFavorites(data.favorites || []);
          }
        });

        // Merge LocalStorage cart if exists
        const localCartJson: string | null = localStorage.getItem('valmore_cart');
        const localFavoritesJson: string | null = localStorage.getItem('valmore_favorites');
        
        if (localCartJson || localFavoritesJson) {
          const userDoc = await getDoc(userRef);
          const currentData = userDoc.data() || {};
          const currentCart = (currentData.cart as CartItem[]) || [];
          const currentFavorites = (currentData.favorites as string[]) || [];

          let updates: any = {};
          let needsUpdate = false;

          // Merge Cart
          if (localCartJson) {
            const localCart: CartItem[] = JSON.parse(localCartJson);
            if (localCart.length > 0) {
              const mergedCart = [...currentCart];
              localCart.forEach(localItem => {
                const existingIndex = mergedCart.findIndex(
                  item => item.productId === localItem.productId && 
                          item.selectedSize === localItem.selectedSize && 
                          item.selectedColor === localItem.selectedColor
                );
                if (existingIndex > -1) {
                  mergedCart[existingIndex].quantity += localItem.quantity;
                } else {
                  mergedCart.push(localItem);
                }
              });
              updates.cart = mergedCart;
              needsUpdate = true;
            }
            localStorage.removeItem('valmore_cart');
          }

          // Merge Favorites
          if (localFavoritesJson) {
            const localFavorites: string[] = JSON.parse(localFavoritesJson);
            if (localFavorites.length > 0) {
              // Combine and deduplicate
              const mergedFavorites = Array.from(new Set([...currentFavorites, ...localFavorites]));
              if (mergedFavorites.length !== currentFavorites.length) {
                updates.favorites = mergedFavorites;
                needsUpdate = true;
              }
            }
            localStorage.removeItem('valmore_favorites');
          }

          if (needsUpdate) {
            await updateDoc(userRef, updates);
          }
        }

      } else {
        // Guest: Load from LocalStorage
        const localCart = localStorage.getItem('valmore_cart');
        if (localCart) {
          try {
            setCart(JSON.parse(localCart));
          } catch (e) {
            console.error("Error parsing cart from localStorage", e);
            localStorage.removeItem('valmore_cart');
          }
        }
        
        const localFavorites = localStorage.getItem('valmore_favorites');
        if (localFavorites) {
          try {
            setFavorites(JSON.parse(localFavorites));
          } catch (e) {
            console.error("Error parsing favorites from localStorage", e);
          }
        }
      }
      setIsLoading(false);
    };

    initializeShop();

    return () => {
      if (unsubscribeCart) unsubscribeCart();
    };
  }, [user]);

  // Persist to LocalStorage for guests whenever cart/favorites change
  useEffect(() => {
    if (!user && !isLoading) {
      localStorage.setItem('valmore_cart', JSON.stringify(cart));
      localStorage.setItem('valmore_favorites', JSON.stringify(favorites));
    }
  }, [cart, favorites, user, isLoading]);

  const addToCart: (product: Product, size: string, color: string) => Promise<boolean> = async (product: Product, size: string, color: string): Promise<boolean> => {
    try {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        selectedSize: size,
        selectedColor: color,
        quantity: 1,
      };

      let newCart = [...cart];
      const existingIndex = newCart.findIndex(
        item => item.productId === newItem.productId && 
                item.selectedSize === newItem.selectedSize && 
                item.selectedColor === newItem.selectedColor
      );

      if (existingIndex > -1) {
        newCart[existingIndex].quantity += 1;
      } else {
        newCart.push(newItem);
      }

      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { cart: newCart });
      } else {
        setCart(newCart);
      }

      setIsCartOpen(true);
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  };

  const removeFromCart: (productId: string, size: string, color: string) => Promise<void> = async (productId: string, size: string, color: string) => {
    const newCart = cart.filter(
      item => !(item.productId === productId && item.selectedSize === size && item.selectedColor === color)
    );

    if (user) {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { cart: newCart });
    } else {
      setCart(newCart);
    }
  };

  const updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<void> = async (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, size, color);
      return;
    }

    const newCart = cart.map(item => {
      if (item.productId === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity };
      }
      return item;
    });

    if (user) {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { cart: newCart });
    } else {
      setCart(newCart);
    }
  };

  const toggleFavorite: (productId: string) => Promise<void> = async (productId: string) => {
    const isFavorite: boolean = favorites.includes(productId);
    
    // Optimistic Update
    let newFavorites: string[];
    if (isFavorite) {
      newFavorites = favorites.filter(id => id !== productId);
    } else {
      newFavorites = [...favorites, productId];
    }
    setFavorites(newFavorites);

    if (user) {
      const userRef = doc(db, 'users', user.id);
      try {
        if (isFavorite) {
          await updateDoc(userRef, {
            favorites: arrayRemove(productId)
          });
        } else {
          await updateDoc(userRef, {
            favorites: arrayUnion(productId)
          });
        }
      } catch (error) {
        console.error("Error updating favorites in Firestore:", error);
        // Revert optimistic update on error
        setFavorites(favorites); 
      }
    }
  };

  const clearCart: () => Promise<void> = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { cart: [] });
    } else {
      setCart([]);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        favorites,
        isCartOpen,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleFavorite,
        setIsCartOpen,
        clearCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
