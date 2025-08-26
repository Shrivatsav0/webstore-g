// apps/web/stores/cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
  };
}

interface CartStore {
  sessionId: string;
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;

  // Actions
  setCart: (cart: {
    items: CartItem[];
    itemCount: number;
    total: number;
  }) => void;
  setLoading: (loading: boolean) => void;
  generateSessionId: () => string;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      sessionId: "",
      items: [],
      itemCount: 0,
      total: 0,
      isLoading: false,

      setCart: (cart) =>
        set({
          items: cart.items,
          itemCount: cart.itemCount,
          total: cart.total,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      generateSessionId: () => {
        const sessionId = `cart_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        set({ sessionId });
        return sessionId;
      },

      clearCart: () =>
        set({
          items: [],
          itemCount: 0,
          total: 0,
        }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
);
