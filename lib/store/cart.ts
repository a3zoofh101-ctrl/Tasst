"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  promoCode: string | null;
  promoDiscountPercent: number;
  isOpen: boolean;
  addLine: (line: CartLine) => void;
  removeLine: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  applyPromo: (code: string, percent: number) => void;
  clearPromo: () => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      promoCode: null,
      promoDiscountPercent: 0,
      isOpen: false,
      addLine: (line) => {
        const existing = get().lines.find((l) => l.sku === line.sku);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.sku === line.sku ? { ...l, quantity: l.quantity + line.quantity } : l
            )
          });
        } else {
          set({ lines: [...get().lines, line] });
        }
        set({ isOpen: true });
      },
      removeLine: (sku) => set({ lines: get().lines.filter((l) => l.sku !== sku) }),
      updateQuantity: (sku, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((l) => l.sku !== sku) });
          return;
        }
        set({ lines: get().lines.map((l) => (l.sku === sku ? { ...l, quantity } : l)) });
      },
      applyPromo: (code, percent) => set({ promoCode: code, promoDiscountPercent: percent }),
      clearPromo: () => set({ promoCode: null, promoDiscountPercent: 0 }),
      clearCart: () => set({ lines: [], promoCode: null, promoDiscountPercent: 0 }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen })
    }),
    {
      name: "ladour-cart",
      partialize: (state) => ({
        lines: state.lines,
        promoCode: state.promoCode,
        promoDiscountPercent: state.promoDiscountPercent
      })
    }
  )
);

export function cartTotals(lines: CartLine[], promoDiscountPercent: number) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const compareSubtotal = lines.reduce(
    (sum, l) => sum + (l.compareAtPrice ?? l.price) * l.quantity,
    0
  );
  const itemDiscount = Math.max(0, compareSubtotal - subtotal);
  const promoDiscount = Math.round((subtotal * promoDiscountPercent) / 100);
  const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 25;
  const total = Math.max(0, subtotal - promoDiscount + shipping);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { subtotal, compareSubtotal, itemDiscount, promoDiscount, shipping, total, itemCount };
}
