import Link from "next/link";
import { Locale, Product } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { IconChevron } from "@/components/icons";

export default function ProductRail({
  locale,
  title,
  products,
  viewAllHref
}: {
  locale: Locale;
  title: string;
  products: Product[];
  viewAllHref: string;
}) {
  const dict = getDictionary(locale);

  return (
    <section className="section-y">
      <div className="container-x">
        <Reveal className="flex items-end justify-between mb-6 sm:mb-8">
          <h2 className="font-latin text-2xl sm:text-3xl lg:text-4xl text-ink">{title}</h2>
          <Link
            href={viewAllHref}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gold-dark hover:gap-2 transition-all"
          >
            {dict.home.viewAll}
            <IconChevron className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProductCard product={p} locale={locale} />
            </Reveal>
          ))}
        </div>

        <Link
          href={viewAllHref}
          className="sm:hidden flex items-center justify-center gap-1 text-sm font-semibold text-gold-dark mt-6"
        >
          {dict.home.viewAll}
          <IconChevron className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
