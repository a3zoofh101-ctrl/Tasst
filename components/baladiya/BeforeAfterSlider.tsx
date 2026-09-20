"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { IconDragHandle } from "./icons";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  alt,
  beforeLabel = "قبل",
  afterLabel = "بعد"
}: BeforeAfterSliderProps) {
  const [percent, setPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.min(100, Math.max(0, ratio)));
  }, []);

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-2xl shadow-[0_16px_40px_-24px_rgba(6,60,40,0.4)] sm:aspect-video"
      onPointerDown={(e) => {
        draggingRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) updateFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
      }}
    >
      <Image
        src={afterSrc}
        alt={`${alt} - بعد`}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 800px, 100vw"
      />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}>
        <Image
          src={beforeSrc}
          alt={`${alt} - قبل`}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 800px, 100vw"
        />
      </div>

      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
        {afterLabel}
      </span>

      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${percent}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-emerald-800 shadow-lg">
          <IconDragHandle className="h-4 w-4" />
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={percent}
        onChange={(e) => setPercent(Number(e.target.value))}
        aria-label="مقارنة قبل وبعد"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
