"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Locale, Product } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { categories, CategoryFilter } from "@/lib/data/categories";
import { collections } from "@/lib/data/collections";
import { t } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { cx } from "@/lib/utils";

type Sort = "featured" | "price-low" | "price-high" | "newest";

export default function ProductListing({
  locale,
  products,
  initialCategory,
  initialCollection
}: {
  locale: Locale;
  products: Product[];
  initialCategory?: string;
  initialCollection?: string;
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [category, setCategory] = useState<CategoryFilter>(
    (initialCategory as CategoryFilter) || "all"
  );
  const [collectionFilter, setCollectionFilter] = useState<string | undefined>(initialCollection);
  const [sort, setSort] = useState<Sort>("featured");

  function selectCategory(id: CategoryFilter) {
    setCategory(id);
    setCollectionFilter(undefined);
    const url = id === "all" ? `/${locale}/products` : `/${locale}/products?category=${id}`;
    router.replace(url, { scroll: false });
  }

  const filtered = useMemo(() => {
    let list = [...products];

    if (collectionFilter) {
      list = list.filter((p) => p.collection === collectionFilter);
    } else if (category !== "all" && category !== "collections") {
      if (["men", "women", "unisex"].includes(category)) {
        list = list.filter((p) => p.gender === category);
      } else {
        list = list.filter((p) => p.tags.includes(category as any));
      }
    }

    switch (sort) {
      case "price-low":
        list.sort((a, b) => a.sizes[0].price - b.sizes[0].price);
        break;
      case "price-high":
        list.sort((a, b) => b.sizes[0].price - a.sizes[0].price);
        break;
      case "newest":
        list.sort((a, b) => (b.tags.includes("new") ? 1 : 0) - (a.tags.includes("new") ? 1 : 0));
        break;
    }

    return list;
  }, [products, category, collectionFilter, sort]);

  return (
    <div>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCategory(c.id)}
            className={cx(
              "shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
              category === c.id && !collectionFilter
                ? "bg-ink text-cream border-ink"
                : "bg-white text-ink/70 border-line hover:border-gold"
            )}
          >
            {t(c.label, locale)}
          </button>
        ))}
      </div>

      {category === "collections" && !collectionFilter && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => setCollectionFilter(c.slug)}
              className="px-4 py-2 rounded-full text-sm border border-gold text-gold-dark hover:bg-gold hover:text-white transition-colors"
            >
              {t(c.name, locale)}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-5 mb-4">
        <p className="text-sm text-ink/60">
          {filtered.length} {dict.filters.resultsCount}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="text-sm border border-line rounded-full px-3 py-2 bg-white outline-none focus:border-gold"
        >
          <option value="featured">{dict.filters.sortFeatured}</option>
          <option value="price-low">{dict.filters.sortPriceLow}</option>
          <option value="price-high">{dict.filters.sortPriceHigh}</option>
          <option value="newest">{dict.filters.sortNewest}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-ink/50 py-16">{dict.filters.noResults}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
