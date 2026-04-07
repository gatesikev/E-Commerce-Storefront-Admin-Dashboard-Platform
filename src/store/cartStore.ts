import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          set((s) => ({ items: s.items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) }));
        } else {
          set((s) => ({ items: [...s.items, { product, quantity: 1 }] }));
        }
      },
      removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        set((s) => ({ items: s.items.map((i) => i.product.id === productId ? { ...i, quantity } : i) }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);