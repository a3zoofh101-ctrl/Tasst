"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Locale, Product } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t, formatPrice, discountPercent, cx } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { IconMinus, IconPlus, IconCheck } from "@/components/icons";
import Badge from "@/components/ui/Badge";

export default function ProductPurchasePanel({
  product,
  locale
}: {
  product: Product;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addLine = useCartStore((s) => s.addLine);

  const size = product.sizes[sizeIndex];
  const pct = discountPercent(size.price, size.compareAtPrice);

  function buildLine() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      ml: size.ml,
      sku: size.sku,
      price: size.price,
      compareAtPrice: size.compareAtPrice,
      quantity
    };
  }

  function handleAddToCart() {
    addLine(buildLine());
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  function handleBuyNow() {
    addLine(buildLine());
    router.push(`/${locale}/checkout`);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {product.tags.includes("bestseller") && <Badge tone="dark">{dict.badges.bestseller}</Badge>}
        {product.tags.includes("new") && <Badge tone="gold">{dict.badges.new}</Badge>}
        {product.tags.includes("limited") && <Badge tone="maroon">{dict.badges.limited}</Badge>}
      </div>

      <h1 className="font-latin text-3xl sm:text-4xl text-ink">{t(product.name, locale)}</h1>
      <p className="text-ink/60 mt-1.5 text-sm sm:text-base">{t(product.tagline, locale)}</p>

      <div className="flex items-baseline gap-3 mt-4">
        <span className="text-2xl sm:text-3xl font-bold text-ink">
          {formatPrice(size.price, locale)} {dict.common.sar}
        </span>
        {size.compareAtPrice && (
          <>
            <span className="text-base text-ink/40 line-through">
              {formatPrice(size.compareAtPrice, locale)} {dict.common.sar}
            </span>
            <Badge tone="maroon">-{pct}%</Badge>
          </>
        )}
      </div>
      {size.compareAtPrice && (
        <p className="text-sm text-maroon mt-1">
          {dict.product.save} {formatPrice(size.compareAtPrice - size.price, locale)} {dict.common.sar}
        </p>
      )}

      <p className="text-sm text-ink/70 mt-5 leading-relaxed">{t(product.description, locale)}</p>

      <div className="mt-6">
        <p className="text-sm font-semibold text-ink mb-2">{dict.product.size}</p>
        <div className="flex items-center gap-2">
          {product.sizes.map((s, i) => (
            <button
              key={s.sku}
              onClick={() => setSizeIndex(i)}
              className={cx(
                "px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors",
                sizeIndex === i
                  ? "bg-ink text-cream border-ink"
                  : "bg-white text-ink/70 border-line hover:border-gold"
              )}
            >
              {s.ml} ml
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-ink mb-2">{dict.product.quantity}</p>
        <div className="inline-flex items-center gap-1 border border-line rounded-full">
          <button
            className="w-11 h-11 flex items-center justify-center"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="decrease"
          >
            <IconMinus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button
            className="w-11 h-11 flex items-center justify-center"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="increase"
          >
            <IconPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-7">
        <button onClick={handleAddToCart} className="btn-secondary flex-1">
          {justAdded ? (
            <>
              <IconCheck className="w-4.5 h-4.5" /> {dict.product.addedToCart}
            </>
          ) : (
            dict.product.addToCart
          )}
        </button>
        <button onClick={handleBuyNow} className="btn-primary flex-1">
          {dict.product.buyNow}
        </button>
      </div>
    </div>
  );
}
