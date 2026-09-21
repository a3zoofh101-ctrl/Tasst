"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Star, Clock, RefreshCw, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { formatNumber } from "@/lib/smm/money";
import { Input, Select } from "@/components/smm/ui/Input";
import { Card } from "@/components/smm/ui/Card";
import { Badge } from "@/components/smm/ui/Badge";
import { EmptyState } from "@/components/smm/ui/States";
import { toggleFavoriteAction } from "@/lib/smm/actions/favorites";

export type PlatformDto = { id: string; name: string; slug: string; icon: string | null; categories: { id: string; name: string }[] };
export type ServiceDto = {
  id: string;
  name: string;
  description: string | null;
  platformId: string;
  platformName: string;
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
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setPlatformId("all");
            setCategoryId("all");
          }}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            platformId === "all" ? "bg-brand-600 text-white" : "bg-surface2 text-muted hover:text-fg"
          )}
        >
          الكل
        </button>
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPlatformId(p.id);
              setCategoryId("all");
            }}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              platformId === p.id ? "bg-brand-600 text-white" : "bg-surface2 text-muted hover:text-fg"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن خدمة..." className="pr-9" />
        </div>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={!activePlatform} className="sm:w-44">
          <option value="all">كل التصنيفات</option>
          {activePlatform?.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
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
              <Card key={s.id} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge tone="brand">{s.platformName}</Badge>
                    <h3 className="mt-2 font-bold text-fg">{s.name}</h3>
                    <p className="text-xs text-muted">{s.categoryName}</p>
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
                    className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
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
