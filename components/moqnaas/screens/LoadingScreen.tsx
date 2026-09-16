import { useEffect, useState } from "react";
import { CarSpec, RegionSpec } from "@/lib/moqnaas/types";

interface Props {
  car: CarSpec;
  region: RegionSpec;
  onDone: () => void;
}

const TIPS = [
  "اقترب من الطيور ببطء حتى لا تطير قبل أن تترجل.",
  "الإصابة الدقيقة على طائر طائر تمنحك نقاط إضافية.",
  "لا تهدر طلقاتك — كل إصابة متتالية تزيد مكافأة الكومبو.",
  "أوقف السيارة تماماً قبل الترجل لحمل البندقية."
];

export default function LoadingScreen({ car, region, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    let raf: ReturnType<typeof setInterval>;
    raf = setInterval(() => {
      setProgress((p) => {
        const next = p + 6 + Math.random() * 10;
        if (next >= 100) {
          clearInterval(raf);
          setTimeout(onDone, 300);
          return 100;
        }
        return next;
      });
    }, 120);
    return () => clearInterval(raf);
  }, [onDone]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0c0a07] px-6 text-center text-[#f3ead9]">
      <div
        className="h-40 w-full max-w-sm rounded-2xl"
        style={{
          background: `linear-gradient(180deg, ${region.skySunset[0]} 0%, ${region.sandColor} 65%, ${region.sandColorDark} 100%)`
        }}
      />
      <h2 className="mt-6 text-2xl font-black">التحميل داخل {region.name}...</h2>
      <p className="mt-1 text-sm text-[#c79a55]">
        السيارة: {car.name} · {car.subtitle}
      </p>
      <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-[#b3763b] transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-6 max-w-xs text-xs leading-relaxed text-[#d8c9ac]">{tip}</p>
    </div>
  );
}
