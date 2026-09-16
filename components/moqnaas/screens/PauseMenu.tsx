interface Props {
  onResume: () => void;
  onMusic: () => void;
  onEndHunt: () => void;
}

export default function PauseMenu({ onResume, onMusic, onEndHunt }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-6">
      <div className="w-full max-w-xs rounded-2xl border border-[#3a2f22] bg-[#1c170f] p-5 text-center text-[#f3ead9]">
        <h3 className="text-xl font-black">إيقاف مؤقت</h3>
        <div className="mt-5 space-y-3">
          <button
            onClick={onResume}
            className="w-full rounded-xl bg-[#b3763b] py-3.5 font-bold text-white active:scale-[0.97]"
          >
            متابعة المقناص
          </button>
          <button
            onClick={onMusic}
            className="w-full rounded-xl border border-[#5a4a34] py-3.5 font-semibold active:scale-[0.97]"
          >
            🎵 شيلات المقناص
          </button>
          <button
            onClick={onEndHunt}
            className="w-full rounded-xl border border-[#5a4a34] py-3.5 font-semibold text-[#e2b06a] active:scale-[0.97]"
          >
            إنهاء الرحلة
          </button>
        </div>
      </div>
    </div>
  );
}
