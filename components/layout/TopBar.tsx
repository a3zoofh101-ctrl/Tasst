"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function TopBar({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const messages = dict.topbar.messages;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4000);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="bg-ink text-cream text-center text-[11px] sm:text-xs tracking-wide">
      <div className="container-x h-9 flex items-center justify-center overflow-hidden">
        <p key={index} className="animate-fadeIn px-2 truncate">
          {messages[index]}
        </p>
      </div>
    </div>
  );
}
