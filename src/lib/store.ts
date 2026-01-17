import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './types';

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, qty: number) => void;
    clearCart: () => void;
    subtotal: () => number;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.productId === item.productId);
                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.productId === item.productId
                                ? { ...i, ...item, qty: i.qty + item.qty }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...currentItems, item] });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((i) => i.productId !== productId) });
            },
            updateQuantity: (productId, qty) => {
                if (qty <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.productId === productId ? { ...i, qty } : i
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            subtotal: () => {
                return get().items.reduce((acc, item) => acc + item.price * item.qty, 0);
            },
        }),
        {
            name: 'veggie-cart-storage',
        }
    )
);
