import { HuntSession } from "@/lib/moqnaas/types";
import { getCar, getRegion } from "@/lib/moqnaas/data";

interface Props {
  log: HuntSession[];
  bestScore: number;
  onBack: () => void;
}

export default function HuntLog({ log, bestScore, onBack }: Props) {
  return (
    <div className="flex h-full w-full flex-col bg-[#14110c] px-4 py-6 text-[#f3ead9]">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-[#c79a55]">
          رجوع ‹
        </button>
        <h2 className="text-lg font-bold">سجل الصيد</h2>
        <span className="w-10" />
      </div>

      <div className="mt-4 rounded-xl border border-[#3a2f22] bg-[#1c170f] px-4 py-3 text-center">
        <span className="text-xs text-[#c79a55]">أفضل نتيجة</span>
        <div className="text-2xl font-black">{bestScore.toLocaleString("ar")}</div>
      </div>

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
        {log.length === 0 && (
          <p className="mt-8 text-center text-sm text-[#8a7a5f]">لا يوجد سجل مقناص بعد. ابدأ أول رحلة لك!</p>
        )}
        {log.map((s) => {
          const car = getCar(s.carId);
          const region = getRegion(s.regionId);
          return (
            <div key={s.id} className="rounded-xl border border-[#3a2f22] bg-[#1c170f] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-bold">{car.name}</span>
                <span className="text-xs text-[#c79a55]">{new Date(s.date).toLocaleDateString("ar")}</span>
              </div>
              <div className="mt-1 text-xs text-[#c9b795]">{region.name}</div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[11px]">
                <MiniStat label="النقاط" value={s.score} />
                <MiniStat label="الطرائد" value={s.birdsHunted} />
                <MiniStat
                  label="الدقة"
                  value={s.shotsTaken ? Math.round((s.hits / s.shotsTaken) * 100) : 0}
                  suffix="%"
                />
                <MiniStat label="الوقت" value={Math.round(s.durationSec)} suffix="ث" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-lg bg-black/30 py-1.5">
      <div className="font-bold text-[#f3ead9]">
        {value}
        {suffix ?? ""}
      </div>
      <div className="text-[#a99872]">{label}</div>
    </div>
  );
}
