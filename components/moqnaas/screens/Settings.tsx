import { Settings } from "@/lib/moqnaas/types";

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onBack: () => void;
}

export default function SettingsScreen({ settings, onChange, onBack }: Props) {
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="flex h-full w-full flex-col bg-[#14110c] px-4 py-6 text-[#f3ead9]">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-[#c79a55]">
          رجوع ‹
        </button>
        <h2 className="text-lg font-bold">الإعدادات</h2>
        <span className="w-10" />
      </div>

      <div className="mt-6 space-y-5">
        <Slider
          label="مستوى الصوت العام"
          value={settings.masterVolume}
          onChange={(v) => set("masterVolume", v)}
        />
        <Slider label="صوت الموسيقى" value={settings.musicVolume} onChange={(v) => set("musicVolume", v)} />
        <Slider
          label="أصوات اللعبة (محرك، طيور، طلقات)"
          value={settings.sfxVolume}
          onChange={(v) => set("sfxVolume", v)}
        />
        <Slider
          label="حساسية التصويب"
          value={settings.cameraSensitivity}
          min={0.4}
          max={2}
          onChange={(v) => set("cameraSensitivity", v)}
        />

        <label className="flex items-center justify-between rounded-xl border border-[#3a2f22] bg-[#1c170f] px-4 py-3">
          <span className="text-sm">الاهتزاز عند الإصابة (للجوال)</span>
          <input
            type="checkbox"
            checked={settings.vibration}
            onChange={(e) => set("vibration", e.target.checked)}
            className="h-5 w-5 accent-[#b3763b]"
          />
        </label>

        <div className="rounded-xl border border-[#3a2f22] bg-[#1c170f] px-4 py-3">
          <label className="text-sm text-[#c9b795]">اسم قائمة التشغيل</label>
          <input
            value={settings.playlistName}
            onChange={(e) => set("playlistName", e.target.value)}
            className="mt-2 w-full rounded-lg border border-[#3a2f22] bg-black/30 px-3 py-2 text-sm text-[#f3ead9] outline-none"
            placeholder="شيلات المقناص"
          />
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-[#c79a55]">{Math.round(((value - min) / (max - min)) * 100)}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#b3763b]"
      />
    </div>
  );
}
