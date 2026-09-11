"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { products } from "@/lib/data/products";
import ProductCard from "@/components/product/ProductCard";
import { IconSearch } from "@/components/icons";

function SearchContent() {
  const { locale } = useParams<{ locale: Locale }>();
  const searchParams = useSearchParams();
  const dict = getDictionary(locale);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      const haystack = [p.name.ar, p.name.en, p.tagline.ar, p.tagline.en, p.gender, p.collection ?? "", ...p.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <div className="container-x section-y">
      <h1 className="font-latin text-3xl sm:text-4xl text-ink mb-6">{dict.nav.search}</h1>
      <div className="flex items-center gap-3 bg-white rounded-full border border-line px-4 py-3 max-w-xl">
        <IconSearch className="w-5 h-5 text-ink/60 shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.searchBar.placeholder}
          className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-ink/40"
        />
      </div>

      <div className="mt-8">
        {query.trim() !== "" && results.length === 0 && (
          <p className="text-center text-ink/50 py-16">{dict.searchBar.noResults}</p>
        )}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-x section-y min-h-[40vh]" />}>
      <SearchContent />
    </Suspense>
  );
}
