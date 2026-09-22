"use client";

import { useMemo, useState } from "react";
import { Search, Clock, RefreshCw, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/smm/cn";
import { formatNumber } from "@/lib/smm/money";
import { Input } from "@/components/smm/ui/Input";
import type { ServiceOption } from "@/components/smm/dashboard/NewOrderWizard";

// Replaces a plain <select> (which can't show more than one line of plain
// text per option) with a searchable, scrollable list of service "cards" —
// search matches the name or the provider's own service id directly, so
// pasting a known id (e.g. "7302") jumps straight to it.
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
    return [...list].sort((a, b) => Number(a.pricePer1000) - Number(b.pricePer1000));
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
              onClick={() => onChange(s.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-right transition-colors",
                selected ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : "border-border2 bg-surface hover:border-brand-300 dark:hover:border-brand-700"
              )}
            >
              <p className="text-sm font-bold text-fg">
                <span className="text-muted">#{s.providerRefId}</span> — {s.name}
              </p>
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
