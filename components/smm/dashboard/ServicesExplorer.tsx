"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Star, Clock, RefreshCw, ArrowUpDown, ArrowRight, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { formatNumber } from "@/lib/smm/money";
import { Input, Select } from "@/components/smm/ui/Input";
import { Card } from "@/components/smm/ui/Card";
import { EmptyState } from "@/components/smm/ui/States";
import { PlatformIcon } from "@/components/smm/ui/PlatformIcon";
import { toggleFavoriteAction } from "@/lib/smm/actions/favorites";

export type PlatformDto = { id: string; name: string; slug: string; icon: string | null; categories: { id: string; name: string }[] };
export type ServiceDto = {
  id: string;
  name: string;
  description: string | null;
  platformId: string;
  platformName: string;
  platformSlug: string;
  categoryId: string;
  categoryName: string;
  pricePer1000: string;
  minQuantity: number;
  maxQuantity: number;
  refill: boolean;
  cancelSupported: boolean;
  averageTime: string | null;
  favorited: boolean;
};

type SortKey = "name" | "price-asc" | "price-desc";

export function ServicesExplorer({ platforms, services }: { platforms: PlatformDto[]; services: ServiceDto[] }) {
  const [query, setQuery] = useState("");
  const [platformId, setPlatformId] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  const activePlatform = platforms.find((p) => p.id === platformId);

  const filtered = useMemo(() => {
    let list = services.filter((s) => {
      const favorited = favoriteOverrides[s.id] ?? s.favorited;
      if (onlyFavorites && !favorited) return false;
      if (platformId !== "all" && s.platformId !== platformId) return false;
      if (categoryId !== "all" && s.categoryId !== categoryId) return false;
      if (query.trim() && !s.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return Number(a.pricePer1000) - Number(b.pricePer1000);
      if (sort === "price-desc") return Number(b.pricePer1000) - Number(a.pricePer1000);
      return a.name.localeCompare(b.name, "ar");
    });

    return list;
  }, [services, query, platformId, categoryId, sort, onlyFavorites, favoriteOverrides]);

  function toggleFavorite(serviceId: string, current: boolean) {
    setFavoriteOverrides((prev) => ({ ...prev, [serviceId]: !current }));
    startTransition(() => {
      toggleFavoriteAction(serviceId);
    });
  }

  return (
    <div className="space-y-4">
      {activePlatform ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPlatformId("all");
              setCategoryId("all");
            }}
            aria-label="رجوع لكل المنصات"
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border2 bg-surface text-muted shadow-sm shadow-black/[0.03] transition-colors hover:text-fg active:scale-[0.98]"
          >
            <ArrowRight className="size-[18px]" />
          </button>
          <div className="flex items-center gap-2.5 rounded-2xl border border-brand-500 bg-surface px-4 py-3 text-brand-700 shadow-sm shadow-black/[0.03] dark:text-brand-200">
            <PlatformIcon slug={activePlatform.slug} size="sm" />
            <span className="font-bold">{activePlatform.name}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <button
            onClick={() => {
              setPlatformId("all");
              setCategoryId("all");
            }}
            className="flex items-center justify-between gap-2 rounded-2xl border border-brand-500 bg-surface px-4 py-3 text-sm font-semibold text-brand-700 shadow-sm shadow-black/[0.03] transition-all active:scale-[0.98] dark:text-brand-200"
          >
            الكل
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <LayoutGrid className="size-5" />
            </span>
          </button>
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPlatformId(p.id);
                setCategoryId("all");
              }}
              className="flex items-center justify-between gap-2 rounded-2xl border border-border2 bg-surface px-4 py-3 text-sm font-semibold text-fg shadow-sm shadow-black/[0.03] transition-all hover:border-brand-300 active:scale-[0.98] dark:hover:border-brand-700"
            >
              {p.name}
              <PlatformIcon slug={p.slug} />
            </button>
          ))}
        </div>
      )}

      {activePlatform && activePlatform.categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryId("all")}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              categoryId === "all" ? "bg-brand-600 text-white" : "bg-surface2 text-muted hover:text-fg"
            )}
          >
            كل التصنيفات
          </button>
          {activePlatform.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                categoryId === c.id ? "bg-brand-600 text-white" : "bg-surface2 text-muted hover:text-fg"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن خدمة..." className="pr-9" />
        </div>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="sm:w-44">
          <option value="name">الاسم (أ-ي)</option>
          <option value="price-asc">السعر: الأقل أولاً</option>
          <option value="price-desc">السعر: الأعلى أولاً</option>
        </Select>
        <button
          onClick={() => setOnlyFavorites((v) => !v)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-semibold transition-colors",
            onlyFavorites ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30" : "border-border2 text-muted hover:text-fg"
          )}
        >
          <Star className={cn("size-4", onlyFavorites && "fill-current")} />
          المفضلة
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="لا توجد خدمات مطابقة" description="جرّب تغيير كلمات البحث أو الفلاتر" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const favorited = favoriteOverrides[s.id] ?? s.favorited;
            return (
              <Card key={s.id} className="flex flex-col p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-700">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <PlatformIcon slug={s.platformSlug} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-muted">{s.platformName}</p>
                      <h3 className="font-bold text-fg">{s.name}</h3>
                      <p className="text-xs text-muted">{s.categoryName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(s.id, favorited)}
                    aria-label="إضافة للمفضلة"
                    className="rounded-lg p-1.5 text-muted hover:bg-surface2"
                  >
                    <Star className={cn("size-4", favorited && "fill-accent text-accent")} />
                  </button>
                </div>

                {s.description && <p className="mt-2 line-clamp-2 text-xs text-muted">{s.description}</p>}

                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted">
                  {s.averageTime && (
                    <span className="flex items-center gap-1 rounded-full bg-surface2 px-2 py-1">
                      <Clock className="size-3" /> {s.averageTime}
                    </span>
                  )}
                  {s.refill && (
                    <span className="flex items-center gap-1 rounded-full bg-surface2 px-2 py-1">
                      <RefreshCw className="size-3" /> ريفيل
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded-full bg-surface2 px-2 py-1">
                    <ArrowUpDown className="size-3" /> {formatNumber(s.minQuantity)} - {formatNumber(s.maxQuantity)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border2 pt-3">
                  <div>
                    <p className="text-[11px] text-muted">لكل 1000</p>
                    <p className="font-bold text-fg">{s.pricePer1000} ر.س</p>
                  </div>
                  <Link
                    href={`/dashboard/new-order?serviceId=${s.id}`}
                    className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glowLg"
                  >
                    اطلب الآن
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
