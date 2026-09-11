"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCartStore, cartTotals } from "@/lib/store/cart";
import { t, formatPrice } from "@/lib/utils";
import { useMounted } from "@/lib/hooks/useMounted";
import { cx } from "@/lib/utils";

type PaymentMethod = "card" | "cod" | "apple";

export default function CheckoutPage() {
  const { locale } = useParams<{ locale: Locale }>();
  const dict = getDictionary(locale);
  const router = useRouter();
  const mounted = useMounted();
  const lines = useCartStore((s) => s.lines);
  const promoDiscountPercent = useCartStore((s) => s.promoDiscountPercent);
  const clearCart = useCartStore((s) => s.clearCart);

  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);

  if (!mounted) return <div className="container-x section-y min-h-[40vh]" />;

  if (lines.length === 0) {
    return (
      <div className="container-x section-y text-center min-h-[50vh] flex flex-col items-center justify-center gap-5">
        <h1 className="font-latin text-2xl sm:text-3xl text-ink">{dict.checkout.title}</h1>
        <p className="text-ink/60">{dict.cart.empty}</p>
        <Link href={`/${locale}/products`} className="btn-primary">
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  const totals = cartTotals(lines, promoDiscountPercent);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const orderNumber = `LDR-${Math.floor(100000 + Math.random() * 900000)}`;
    setTimeout(() => {
      clearCart();
      router.push(`/${locale}/checkout/confirmation?order=${orderNumber}`);
    }, 600);
  }

  const paymentOptions: { id: PaymentMethod; label: string }[] = [
    { id: "card", label: dict.checkout.paymentCard },
    { id: "apple", label: dict.checkout.paymentApple },
    { id: "cod", label: dict.checkout.paymentCod }
  ];

  return (
    <div className="container-x section-y">
      <h1 className="font-latin text-3xl sm:text-4xl text-ink mb-8">{dict.checkout.title}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-semibold text-ink mb-4">{dict.checkout.contact}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder={dict.checkout.fullName} className="input-field" />
              <input required type="tel" placeholder={dict.checkout.phone} className="input-field" />
              <input required type="email" placeholder={dict.checkout.email} className="input-field sm:col-span-2" />
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-ink mb-4">{dict.checkout.shippingAddress}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder={dict.checkout.city} className="input-field" />
              <input required placeholder={dict.checkout.district} className="input-field" />
              <input required placeholder={dict.checkout.address} className="input-field sm:col-span-2" />
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-ink mb-4">{dict.checkout.payment}</h2>
            <div className="space-y-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={cx(
                    "flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors",
                    payment === opt.id ? "border-gold bg-gold/5" : "border-line"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                    className="accent-gold"
                  />
                  <span className="text-sm font-medium text-ink">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="card-surface p-5 sm:p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold text-ink mb-4">{dict.checkout.orderSummary}</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pe-1">
            {lines.map((line) => (
              <div key={line.sku} className="flex gap-3">
                <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-white border border-line shrink-0">
                  <Image src={line.image} alt={t(line.name, locale)} fill sizes="60px" className="object-cover" />
                  <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-ink text-cream text-[10px] flex items-center justify-center">
                    {line.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{t(line.name, locale)}</p>
                  <p className="text-xs text-ink/50">{line.ml}ml</p>
                </div>
                <p className="text-sm font-semibold shrink-0">
                  {formatPrice(line.price * line.quantity, locale)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-sm mt-5 pt-4 border-t border-line">
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

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-6">
            {submitting ? dict.common.loading : dict.checkout.placeOrder}
          </button>
        </div>
      </form>
    </div>
  );
}
