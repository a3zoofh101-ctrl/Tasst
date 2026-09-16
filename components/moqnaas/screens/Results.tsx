import { CarSpec, RegionSpec } from "@/lib/moqnaas/types";

interface Props {
  car: CarSpec;
  region: RegionSpec;
  score: number;
  bag: number;
  shots: number;
  hits: number;
  durationSec: number;
  bestScore: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function Results({
  car,
  region,
  score,
  bag,
  shots,
  hits,
  durationSec,
  bestScore,
  isNewBest,
  onPlayAgain,
  onMenu
}: Props) {
  const accuracy = shots ? Math.round((hits / shots) * 100) : 0;
  const minutes = Math.floor(durationSec / 60);
  const seconds = Math.round(durationSec % 60);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0c0a07] px-6 text-center text-[#f3ead9]">
      <span className="text-xs tracking-[0.3em] text-[#c79a55]">انتهى المقناص</span>
      <h2 className="mt-2 text-3xl font-black">نتيجة الرحلة</h2>
      {isNewBest && (
        <span className="mt-2 rounded-full bg-[#b3763b]/20 px-3 py-1 text-xs font-bold text-[#e2b06a]">
          🏆 رقم قياسي جديد!
        </span>
      )}

      <div className="mt-6 w-full max-w-xs rounded-2xl border border-[#3a2f22] bg-[#1c170f] p-5">
        <div className="text-5xl font-black text-[#e2b06a]">{score.toLocaleString("ar")}</div>
        <p className="mt-1 text-xs text-[#c9b795]">
          {car.name} · {region.name}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Box label="الطرائد" value={bag} />
          <Box label="الدقة" value={`${accuracy}%`} />
          <Box label="الطلقات" value={shots} />
          <Box label="الوقت" value={`${minutes}:${seconds.toString().padStart(2, "0")}`} />
        </div>

        <div className="mt-4 border-t border-[#3a2f22] pt-3 text-xs text-[#8a7a5f]">
          أفضل نتيجة محفوظة: <span className="text-[#c79a55]">{bestScore.toLocaleString("ar")}</span>
        </div>
      </div>

      <div className="mt-8 w-full max-w-xs space-y-3">
        <button
          onClick={onPlayAgain}
          className="w-full rounded-2xl bg-[#b3763b] py-4 text-lg font-bold text-white active:scale-[0.97]"
        >
          مقناص جديد
        </button>
        <button
          onClick={onMenu}
          className="w-full rounded-2xl border border-[#5a4a34] py-3.5 text-base font-semibold active:scale-[0.97]"
        >
          القائمة الرئيسية
        </button>
      </div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-black/30 py-2.5">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[11px] text-[#a99872]">{label}</div>
    </div>
  );
}
