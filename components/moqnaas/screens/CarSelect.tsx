import { useState } from "react";
import { CARS } from "@/lib/moqnaas/data";
import { CarId } from "@/lib/moqnaas/types";
import CarIcon from "../CarIcon";

interface Props {
  initial: CarId;
  onBack: () => void;
  onConfirm: (carId: CarId) => void;
}

export default function CarSelect({ initial, onBack, onConfirm }: Props) {
  const [selected, setSelected] = useState<CarId>(initial);
  const car = CARS.find((c) => c.id === selected)!;

  return (
    <div className="flex h-full w-full flex-col bg-[#14110c] px-4 py-6 text-[#f3ead9]">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-[#c79a55]">
          رجوع ‹
        </button>
        <h2 className="text-lg font-bold">اختيار السيارة</h2>
        <span className="w-10" />
      </div>

      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-[#3a2f22] bg-[#1c170f] p-4">
          <CarIcon carId={car.id} className="mx-auto h-32 w-full" />
          <h3 className="mt-3 text-center text-2xl font-black">{car.name}</h3>
          <p className="text-center text-xs text-[#c79a55]">{car.subtitle}</p>
          <p className="mt-2 text-center text-sm leading-relaxed text-[#d8c9ac]">{car.description}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
            <Stat label="السرعة" value={car.topSpeed} max={140} />
            <Stat label="التسارع" value={car.acceleration * 80} max={110} />
            <Stat label="التحكم" value={car.handling * 80} max={100} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-3">
        {CARS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
              selected === c.id
                ? "border-[#b3763b] bg-[#b3763b]/20 text-[#f3ead9]"
                : "border-[#3a2f22] bg-black/20 text-[#c79a55]"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={() => onConfirm(selected)}
          className="w-full rounded-2xl bg-[#b3763b] py-4 text-lg font-bold text-white active:scale-[0.97]"
        >
          تأكيد واختيار المنطقة ‹
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.max(4, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
        <div className="h-full rounded-full bg-[#c79a55]" style={{ width: `${pct}%` }} />
      </div>
      <span className="mt-1 block text-[#a99872]">{label}</span>
    </div>
  );
}
