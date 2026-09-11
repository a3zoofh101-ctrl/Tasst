"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCartStore, cartTotals } from "@/lib/store/cart";
import { t, formatPrice } from "@/lib/utils";
import { IconMinus, IconPlus, IconTrash, IconCheck } from "@/components/icons";
import { useMounted } from "@/lib/hooks/useMounted";

const PROMO_CODES: Record<string, number> = {
  SA95: 30,
  LADOUR10: 10
};

export default function CartPage() {
  const { locale } = useParams<{ locale: Locale }>();
  const dict = getDictionary(locale);
  const mounted = useMounted();
  const lines = useCartStore((s) => s.lines);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscountPercent = useCartStore((s) => s.promoDiscountPercent);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const applyPromo = useCartStore((s) => s.applyPromo);

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  if (!mounted) return <div className="container-x section-y min-h-[40vh]" />;

  const totals = cartTotals(lines, promoDiscountPercent);

  function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase();
    const pct = PROMO_CODES[code];
    if (pct) {
      applyPromo(code, pct);
      setPromoMessage(dict.cart.promoApplied);
    } else {
      setPromoMessage(null);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-x section-y text-center min-h-[50vh] flex flex-col items-center justify-center gap-5">
        <h1 className="font-latin text-2xl sm:text-3xl text-ink">{dict.cart.title}</h1>
        <p className="text-ink/60">{dict.cart.empty}</p>
        <Link href={`/${locale}/products`} className="btn-primary">
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x section-y">
      <h1 className="font-latin text-3xl sm:text-4xl text-ink mb-8">{dict.cart.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {lines.map((line) => (
            <div key={line.sku} className="card-surface p-4 flex gap-4">
              <Link href={`/${locale}/products/${line.slug}`} className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden bg-white border border-line shrink-0">
                <Image src={line.image} alt={t(line.name, locale)} fill sizes="120px" className="object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/${locale}/products/${line.slug}`} className="font-semibold text-ink hover:text-gold-dark">
                      {t(line.name, locale)}
                    </Link>
                    <p className="text-xs text-ink/60 mt-1">
                      {dict.cart.size}: {line.ml}ml
                    </p>
                  </div>
                  <button
                    onClick={() => removeLine(line.sku)}
                    className="text-ink/40 hover:text-maroon transition-colors"
                    aria-label={dict.cart.remove}
                  >
                    <IconTrash className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="flex items-end justify-between mt-4">
                  <div className="flex items-center gap-1 border border-line rounded-full">
                    <button
                      className="w-8 h-8 flex items-center justify-center"
                      onClick={() => updateQuantity(line.sku, line.quantity - 1)}
                    >
                      <IconMinus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <button
                      className="w-8 h-8 flex items-center justify-center"
                      onClick={() => updateQuantity(line.sku, line.quantity + 1)}
                    >
                      <IconPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-ink">
                      {formatPrice(line.price * line.quantity, locale)} {dict.common.sar}
                    </p>
                    {line.compareAtPrice && (
                      <p className="text-xs text-ink/40 line-through">
                        {formatPrice(line.compareAtPrice * line.quantity, locale)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-surface p-5 sm:p-6 h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-2 mb-4">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder={dict.cart.promoPlaceholder}
              className="flex-1 min-w-0 rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
            <button onClick={handleApplyPromo} className="btn-secondary px-5 py-2.5 text-sm shrink-0">
              {dict.cart.promoApply}
            </button>
          </div>
          {promoCode && (
            <p className="text-xs text-green-700 flex items-center gap-1 mb-4">
              <IconCheck className="w-3.5 h-3.5" /> {dict.cart.promoApplied} ({promoCode})
            </p>
          )}

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink/60">{dict.cart.subtotal}</span>
              <span className="font-semibold">
                {formatPrice(totals.subtotal, locale)} {dict.common.sar}
              </span>
            </div>
            {totals.promoDiscount > 0 && (
              <div className="flex items-center justify-between text-maroon">
                <span>{dict.cart.discount}</span>
                <span>
                  -{formatPrice(totals.promoDiscount, locale)} {dict.common.sar}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-ink/60">{dict.cart.shipping}</span>
              <span className="font-semibold">
                {totals.shipping === 0 ? dict.cart.shippingFree : `${formatPrice(totals.shipping, locale)} ${dict.common.sar}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-base pt-3 border-t border-line">
              <span className="font-bold">{dict.cart.total}</span>
              <span className="font-bold text-gold-dark text-lg">
                {formatPrice(totals.total, locale)} {dict.common.sar}
              </span>
            </div>
          </div>

          <Link href={`/${locale}/checkout`} className="btn-primary w-full mt-6">
            {dict.cart.checkout}
          </Link>
          <Link href={`/${locale}/products`} className="block text-center text-sm text-ink/60 hover:text-ink mt-3">
            {dict.cart.continueShopping}
          </Link>
        </div>
      </div>
    </div>
  );
}
