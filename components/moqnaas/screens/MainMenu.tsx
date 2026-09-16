interface Props {
  bestScore: number;
  onStart: () => void;
  onSettings: () => void;
  onHuntLog: () => void;
}

export default function MainMenu({ bestScore, onStart, onSettings, onHuntLog }: Props) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-[#14110c] px-5 py-8 text-center text-[#f3ead9]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(179,118,59,0.35), transparent 60%), linear-gradient(180deg,#221b12 0%, #0c0a07 70%)"
        }}
      />
      <div className="relative z-10 mt-6 flex flex-col items-center">
        <span className="text-xs tracking-[0.4em] text-[#c79a55]">صيد البر السعودي</span>
        <h1 className="mt-3 font-arabic text-6xl font-black text-[#f3ead9] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
          مقناص
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#d8c9ac]">
          اركب سيارتك، ادخل البر، ودوّر على القمري والحمام في أجواء شعبية سعودية أصيلة.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-xs space-y-3">
        <button
          onClick={onStart}
          className="w-full rounded-2xl bg-[#b3763b] py-4 text-lg font-bold text-white shadow-[0_8px_24px_rgba(179,118,59,0.35)] transition active:scale-[0.97]"
        >
          ابدأ المقناص
        </button>
        <button
          onClick={onHuntLog}
          className="w-full rounded-2xl border border-[#5a4a34] bg-black/20 py-3.5 text-base font-semibold text-[#f3ead9] transition active:scale-[0.97]"
        >
          سجل الصيد
        </button>
        <button
          onClick={onSettings}
          className="w-full rounded-2xl border border-[#5a4a34] bg-black/20 py-3.5 text-base font-semibold text-[#f3ead9] transition active:scale-[0.97]"
        >
          الإعدادات
        </button>
        <div className="pt-2 text-sm text-[#c79a55]">
          أفضل نتيجة: <span className="font-bold text-[#f3ead9]">{bestScore.toLocaleString("ar")}</span>
        </div>
      </div>

      <p className="relative z-10 pb-2 text-[11px] text-[#8a7a5f]">
        طلعت مع الربع للمقناص — شغّل الشيلة وابدأ الدوران على القمري
      </p>
    </div>
  );
}
