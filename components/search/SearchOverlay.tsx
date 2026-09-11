"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { products } from "@/lib/data/products";
import { t, formatPrice } from "@/lib/utils";
import { IconClose, IconSearch } from "@/components/icons";

export default function SearchOverlay({
  locale,
  open,
  onClose
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const dict = getDictionary(locale);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      const haystack = [
        p.name.ar,
        p.name.en,
        p.tagline.ar,
        p.tagline.en,
        p.gender,
        p.collection ?? "",
        ...p.tags
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
      <div className="bg-cream w-full max-h-[85vh] overflow-y-auto rounded-b-3xl shadow-card">
        <div className="container-x py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-full border border-line px-4 py-3">
              <IconSearch className="w-5 h-5 text-ink/60 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.searchBar.placeholder}
                className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-ink/40"
              />
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 shrink-0 rounded-full border border-line flex items-center justify-center hover:bg-ink hover:text-cream transition-colors"
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6">
            {query.trim() === "" && (
              <div>
                <p className="eyebrow mb-3">{dict.searchBar.recent}</p>
                <div className="flex flex-wrap gap-2">
                  {["London", "Tokyo", "Miami", "Paris"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-4 py-2 rounded-full bg-white border border-line text-sm hover:border-gold transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.trim() !== "" && results.length === 0 && (
              <p className="text-ink/60 text-sm py-8 text-center">{dict.searchBar.noResults}</p>
            )}

            {results.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5 pb-4">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${locale}/products/${p.slug}`}
                    onClick={onClose}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white border border-line">
                      <Image
                        src={p.images[0]}
                        alt={t(p.name, locale)}
                        fill
                        sizes="200px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink">{t(p.name, locale)}</p>
                    <p className="text-xs text-ink/60">
                      {formatPrice(p.sizes[0].price, locale)} {dict.common.sar}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
