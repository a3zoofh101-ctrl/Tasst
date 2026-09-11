"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getTimeRemaining } from "@/lib/utils";

export default function CountdownTimer({
  endsAt,
  locale,
  compact = false
}: {
  endsAt: string;
  locale: Locale;
  compact?: boolean;
}) {
  const dict = getDictionary(locale);
  const [remaining, setRemaining] = useState(() => getTimeRemaining(endsAt));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getTimeRemaining(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const units = [
    { value: remaining.days, label: dict.offersPage.days },
    { value: remaining.hours, label: dict.offersPage.hours },
    { value: remaining.minutes, label: dict.offersPage.minutes },
    { value: remaining.seconds, label: dict.offersPage.seconds }
  ];

  return (
    <div className={compact ? "flex items-center gap-2" : "flex items-center gap-2 sm:gap-3"}>
      {units.map((u) => (
        <div
          key={u.label}
          className={
            compact
              ? "bg-white/15 rounded-lg px-2 py-1 text-center min-w-[38px]"
              : "bg-white/15 backdrop-blur rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center min-w-[56px] sm:min-w-[72px]"
          }
        >
          <div className={compact ? "text-sm font-bold text-white" : "text-lg sm:text-2xl font-bold text-white"}>
            {String(u.value).padStart(2, "0")}
          </div>
          {!compact && <div className="text-[10px] sm:text-xs text-white/70 mt-0.5">{u.label}</div>}
        </div>
      ))}
    </div>
  );
}
