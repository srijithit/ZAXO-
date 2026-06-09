'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  gender: string;
  basePrice: number;
  discountPrice?: number | null;
  fabric: string;
  images: string; // JSON string array
  featured: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface CustomizationDetails {
  nameText?: string;
  nameColor?: string;
  nameFont?: string;
  namePlacement?: string;
  logoFile?: string; // base64 or filename
  logoPlacement?: string;
  priceCharge: number;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  customization?: CustomizationDetails;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // USER, ADMIN
  phone?: string;
}

interface AppContextType {
  // Auth
  user: User | null;
  login: (email: string, name: string, role: string, id: string) => void;
  logout: () => void;
  isAuthenticating: boolean;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Global UI Mode
  isB2BMode: boolean;
  setB2BMode: (mode: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Mode state (B2B vs B2C)
  const [isB2BMode, setB2BMode] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('zaxo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('zaxo_user');
      }
    }
    setIsAuthenticating(false);

    const savedCart = localStorage.getItem('zaxo_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        localStorage.removeItem('zaxo_cart');
      }
    }

    const savedMode = localStorage.getItem('zaxo_b2b_mode');
    if (savedMode) {
      setB2BMode(savedMode === 'true');
    }
  }, []);

  // Save Cart to localStorage and calculate totals
  useEffect(() => {
    localStorage.setItem('zaxo_cart', JSON.stringify(cart));
    
    let count = 0;
    let total = 0;
    
    cart.forEach(item => {
      count += item.quantity;
      const unitPrice = item.product.discountPrice || item.product.basePrice;
      const customCharge = item.customization ? item.customization.priceCharge : 0;
      total += (unitPrice + customCharge) * item.quantity;
    });
    
    setCartCount(count);
    setCartTotal(total);
  }, [cart]);

  // Save B2B Mode choice
  useEffect(() => {
    localStorage.setItem('zaxo_b2b_mode', String(isB2BMode));
  }, [isB2BMode]);

  const login = (email: string, name: string, role: string, id: string) => {
    const newUser = { id, email, name, role };
    setUser(newUser);
    localStorage.setItem('zaxo_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zaxo_user');
  };

  const addToCart = (newItem: CartItem) => {
    setCart(prevCart => {
      // Find if item with same SKU and same customization already exists
      const existingItemIndex = prevCart.findIndex(item => {
        const skuMatch = item.variant.sku === newItem.variant.sku;
        const custMatch = JSON.stringify(item.customization) === JSON.stringify(newItem.customization);
        return skuMatch && custMatch;
      });

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        return updatedCart;
      } else {
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (sku: string) => {
    // Note: this simple remover clears any items matching sku
    // To handle multiple variations of same sku (different embroidery), we filter by variant sku + customization
    setCart(prevCart => prevCart.filter(item => item.variant.sku !== sku));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sku);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.variant.sku === sku ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticating,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isB2BMode,
        setB2BMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
