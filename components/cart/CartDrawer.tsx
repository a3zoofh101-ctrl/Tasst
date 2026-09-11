"use client";

import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCartStore, cartTotals } from "@/lib/store/cart";
import { t, formatPrice } from "@/lib/utils";
import { IconClose, IconMinus, IconPlus, IconTrash } from "@/components/icons";
import { useMounted } from "@/lib/hooks/useMounted";

export default function CartDrawer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const mounted = useMounted();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const promoDiscountPercent = useCartStore((s) => s.promoDiscountPercent);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);

  if (!mounted || !isOpen) return null;

  const totals = cartTotals(lines, promoDiscountPercent);

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-fadeIn" onClick={closeCart} />
      <div
        className="absolute top-0 bottom-0 end-0 w-full sm:w-[420px] bg-cream shadow-card flex flex-col animate-fadeUp"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-latin text-lg font-semibold">{dict.cart.title}</h2>
          <button
            onClick={closeCart}
            aria-label="Close"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
              <p className="text-ink/60">{dict.cart.empty}</p>
              <Link href={`/${locale}/products`} onClick={closeCart} className="btn-secondary">
                {dict.cart.emptyCta}
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map((line) => (
                <li key={line.sku} className="flex gap-3">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-white border border-line shrink-0">
                    <Image src={line.image} alt={t(line.name, locale)} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink truncate">{t(line.name, locale)}</p>
                      <button
                        onClick={() => removeLine(line.sku)}
                        aria-label={dict.cart.remove}
                        className="text-ink/40 hover:text-maroon transition-colors shrink-0"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-ink/60 mt-0.5">
                      {dict.cart.size}: {line.ml}ml
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 border border-line rounded-full">
                        <button
                          className="w-7 h-7 flex items-center justify-center"
                          onClick={() => updateQuantity(line.sku, line.quantity - 1)}
                          aria-label="decrease"
                        >
                          <IconMinus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs w-5 text-center">{line.quantity}</span>
                        <button
                          className="w-7 h-7 flex items-center justify-center"
                          onClick={() => updateQuantity(line.sku, line.quantity + 1)}
                          aria-label="increase"
                        >
                          <IconPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-ink">
                        {formatPrice(line.price * line.quantity, locale)} {dict.common.sar}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">{dict.cart.subtotal}</span>
              <span className="font-semibold">
                {formatPrice(totals.subtotal, locale)} {dict.common.sar}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">{dict.cart.shipping}</span>
              <span className="font-semibold">
                {totals.shipping === 0 ? dict.cart.shippingFree : `${formatPrice(totals.shipping, locale)} ${dict.common.sar}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-base pt-2 border-t border-line">
              <span className="font-semibold">{dict.cart.total}</span>
              <span className="font-bold text-gold-dark">
                {formatPrice(totals.total, locale)} {dict.common.sar}
              </span>
            </div>
            <Link href={`/${locale}/cart`} onClick={closeCart} className="btn-primary w-full mt-2">
              {dict.cart.checkout}
            </Link>
            <Link
              href={`/${locale}/products`}
              onClick={closeCart}
              className="block text-center text-sm text-ink/60 hover:text-ink pt-1"
            >
              {dict.cart.continueShopping}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
