import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './types';

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (key: string) => void;
    updateQuantity: (key: string, qty: number) => void;
    clearCart: () => void;
    subtotal: () => number;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const currentItems = get().items;
                const key = item.cartKey || String(item.productId);
                const existingItem = currentItems.find((i) => (i.cartKey || String(i.productId)) === key);
                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            (i.cartKey || String(i.productId)) === key
                                ? { ...i, ...item, qty: i.qty + item.qty }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...currentItems, { ...item, cartKey: key }] });
                }
            },
            removeItem: (key) => {
                set({ items: get().items.filter((i) => (i.cartKey || String(i.productId)) !== key) });
            },
            updateQuantity: (key, qty) => {
                if (qty <= 0) {
                    get().removeItem(key);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        (i.cartKey || String(i.productId)) === key ? { ...i, qty } : i
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            subtotal: () => {
                return get().items.reduce((acc, item) => acc + item.price * item.qty, 0);
            },
        }),
        {
            name: 'asr-cart-storage',
        }
    )
);
