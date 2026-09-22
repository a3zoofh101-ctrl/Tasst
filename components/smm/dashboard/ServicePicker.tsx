"use client";

import { useMemo, useState } from "react";
import { Search, Clock, RefreshCw, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { formatNumber } from "@/lib/smm/money";
import { Input } from "@/components/smm/ui/Input";
import type { ServiceOption } from "@/components/smm/dashboard/NewOrderWizard";

// Converts a free-text averageTime ("0-6 ساعات", "فوري", "1-2 يوم", ...) into
// a rough hours estimate so services can be ranked fastest-first when their
// price ties. Unparseable/missing values sink to the end of their price tier.
function estimatedHours(averageTime: string | null): number {
  if (!averageTime) return Infinity;
  if (averageTime.includes("فوري")) return 0;
  const numbers = averageTime.match(/\d+(\.\d+)?/g);
  if (!numbers) return Infinity;
  const upperBound = Number(numbers[numbers.length - 1]);
  if (averageTime.includes("دقيق")) return upperBound / 60;
  if (averageTime.includes("أسبوع") || averageTime.includes("اسبوع")) return upperBound * 24 * 7;
  if (averageTime.includes("يوم")) return upperBound * 24;
  return upperBound;
}

// Replaces a plain <select> (which can't show more than one line of plain
// text per option) with a searchable, scrollable list of service "cards" —
// search matches the name or the provider's own service id directly, so
// pasting a known id (e.g. "7302") jumps straight to it. Sorted cheapest
// first, then fastest for services tied on price, matching the ordering
// requested for the services system.
export function ServicePicker({
  services,
  value,
  onChange
}: {
  services: ServiceOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? services
      : services.filter((s) => s.name.toLowerCase().includes(q) || s.providerRefId.toLowerCase().includes(q));
    return [...list].sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      const priceDiff = Number(a.pricePer1000) - Number(b.pricePer1000);
      if (priceDiff !== 0) return priceDiff;
      return estimatedHours(a.averageTime) - estimatedHours(b.averageTime);
    });
  }, [services, query]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو برقم الخدمة..."
          className="pr-9"
        />
      </div>

      <div className="smm-scrollbar max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border2 p-2">
        {filtered.length === 0 && <p className="p-3 text-center text-sm text-muted">لا توجد خدمات مطابقة</p>}
        {filtered.map((s) => {
          const selected = s.id === value;
          return (
            <button
              key={s.id}
              type="button"
              disabled={!s.available}
              onClick={() => onChange(s.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-right transition-all",
                !s.available
                  ? "cursor-not-allowed border-border2 bg-surface2/60 opacity-60"
                  : selected
                    ? "border-brand-500 bg-brand-50 shadow-glow dark:bg-brand-900/30"
                    : "border-border2 bg-surface hover:border-brand-300 dark:hover:border-brand-700"
              )}
            >
              <p className="text-sm font-bold text-fg">
                <span className="text-muted">#{s.providerRefId}</span> — {s.name}
                {!s.available && <span className="mr-2 rounded-full bg-surface2 px-2 py-0.5 text-[11px] font-semibold text-muted">غير متاحة حاليًا</span>}
              </p>
              {selected && s.available && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted">
                  <span className="rounded-full bg-surface2 px-2 py-1 font-bold text-brand-700 dark:text-brand-300">{s.pricePer1000} ر.س / 1000</span>
                  <span className="flex items-center gap-1 rounded-full bg-surface2 px-2 py-1">
                    <ArrowUpDown className="size-3" /> {formatNumber(s.minQuantity)} - {formatNumber(s.maxQuantity)}
                  </span>
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
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
