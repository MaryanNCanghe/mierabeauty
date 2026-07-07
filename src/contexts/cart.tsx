
// src/contexts/cart.tsx
'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  productId: number;
  variantId?: number;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl?: string;
  qty: number;
  attributes?: {
    color?: string;
    size?: string;
    [key: string]: string | number | undefined;
  };
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (productId: number, variantId?: number) => void;
  setQty: (productId: number, qty: number, variantId?: number) => void;
  clear: () => void;
  subtotalCents: number;
  totalItems: number; // 👈 new
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = 'cart:v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // cross-tab sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        try {
          setItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem: CartState['addItem'] = (item, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i =>
        i.productId === item.productId &&
        (i.variantId ?? null) === (item.variantId ?? null)
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeItem: CartState['removeItem'] = (productId, variantId) =>
    setItems(prev =>
      prev.filter(i =>
        !(i.productId === productId && (i.variantId ?? null) === (variantId ?? null))
      )
    );

  const setQty: CartState['setQty'] = (productId, qty, variantId) =>
    setItems(prev =>
      prev.map(i =>
        i.productId === productId && (i.variantId ?? null) === (variantId ?? null)
          ? { ...i, qty }
          : i
      )
    );

  const clear: CartState['clear'] = () => setItems([]);

  const subtotalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.priceCents * i.qty, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const value: CartState = { items, addItem, removeItem, setQty, clear, subtotalCents, totalItems };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>');
  return ctx;
}
