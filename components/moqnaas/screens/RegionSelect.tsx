import { useState } from "react";
import { REGIONS } from "@/lib/moqnaas/data";
import { RegionId } from "@/lib/moqnaas/types";

interface Props {
  initial: RegionId;
  onBack: () => void;
  onConfirm: (regionId: RegionId) => void;
}

export default function RegionSelect({ initial, onBack, onConfirm }: Props) {
  const [selected, setSelected] = useState<RegionId>(initial);

  return (
    <div className="flex h-full w-full flex-col bg-[#14110c] px-4 py-6 text-[#f3ead9]">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-[#c79a55]">
          رجوع ‹
        </button>
        <h2 className="text-lg font-bold">اختيار المنطقة</h2>
        <span className="w-10" />
      </div>

      <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            disabled={!r.available}
            onClick={() => setSelected(r.id)}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-right transition ${
              selected === r.id
                ? "border-[#b3763b] bg-[#b3763b]/15"
                : "border-[#3a2f22] bg-[#1c170f]"
            } ${!r.available ? "opacity-50" : "active:scale-[0.98]"}`}
          >
            <div>
              <h3 className="text-base font-bold">{r.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#c9b795]">{r.description}</p>
            </div>
            {!r.available && (
              <span className="shrink-0 rounded-full bg-black/40 px-2 py-1 text-[10px] text-[#c79a55]">
                قريباً
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-2">
        <button
          onClick={() => onConfirm(selected)}
          className="w-full rounded-2xl bg-[#b3763b] py-4 text-lg font-bold text-white active:scale-[0.97]"
        >
          ابدأ الرحلة ‹
        </button>
      </div>
    </div>
  );
}
