"use client";

import Image from "next/image";
import Link from "next/link";
import { Locale, Product } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t, formatPrice, discountPercent } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import { IconBag } from "@/components/icons";

export default function ProductCard({
  product,
  locale
}: {
  product: Product;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const addLine = useCartStore((s) => s.addLine);
  const size = product.sizes[0];
  const pct = discountPercent(size.price, size.compareAtPrice);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      ml: size.ml,
      sku: size.sku,
      price: size.price,
      compareAtPrice: size.compareAtPrice,
      quantity: 1
    });
  }

  return (
    <Link href={`/${locale}/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-line">
        <Image
          src={product.images[0]}
          alt={t(product.name, locale)}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        <div className="absolute top-2.5 start-2.5 flex flex-col gap-1.5 items-start">
          {product.tags.includes("bestseller") && <Badge tone="dark">{dict.badges.bestseller}</Badge>}
          {product.tags.includes("new") && <Badge tone="gold">{dict.badges.new}</Badge>}
          {pct > 0 && <Badge tone="maroon">-{pct}%</Badge>}
        </div>

        <button
          onClick={quickAdd}
          aria-label={dict.product.addToCart}
          className="absolute bottom-2.5 end-2.5 w-10 h-10 rounded-full bg-cream/95 backdrop-blur flex items-center justify-center shadow-card opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-ink hover:text-cream"
        >
          <IconBag className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="mt-3 px-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-ink text-sm sm:text-base truncate">{t(product.name, locale)}</h3>
        </div>
        <p className="text-xs text-ink/55 truncate mt-0.5">{t(product.tagline, locale)}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <StarRating rating={product.rating} />
          <span className="text-[11px] text-ink/50">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="font-bold text-ink text-sm sm:text-base">
            {formatPrice(size.price, locale)} {dict.common.sar}
          </span>
          {size.compareAtPrice && (
            <span className="text-xs text-ink/40 line-through">
              {formatPrice(size.compareAtPrice, locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
