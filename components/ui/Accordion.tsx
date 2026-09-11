"use client";

import { useState } from "react";
import { FaqItem, Locale } from "@/lib/types";
import { t } from "@/lib/utils";
import { IconChevronDown } from "@/components/icons";

export default function Accordion({ items, locale }: { items: FaqItem[]; locale: Locale }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(open ? null : item.id)}
              className="w-full flex items-center justify-between gap-4 py-4 sm:py-5 text-start"
              aria-expanded={open}
            >
              <span className="font-semibold text-ink text-sm sm:text-base">{t(item.question, locale)}</span>
              <IconChevronDown
                className={`w-5 h-5 shrink-0 text-gold-dark transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className="text-ink/65 text-sm leading-relaxed pb-4 sm:pb-5 max-w-2xl">{t(item.answer, locale)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
