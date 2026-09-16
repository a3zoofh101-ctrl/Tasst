import { HudSnapshot } from "@/lib/moqnaas/engine";

interface Props {
  snap: HudSnapshot | null;
  regionName: string;
  elapsedSec: number;
  onPause: () => void;
  onDismount: () => void;
  onMount: () => void;
  onShoot: () => void;
  onReload: () => void;
  onSteer: (dir: -1 | 0 | 1) => void;
  onThrottle: (on: boolean) => void;
  onBrake: (on: boolean) => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function HUD({
  snap,
  regionName,
  elapsedSec,
  onPause,
  onDismount,
  onMount,
  onShoot,
  onReload,
  onSteer,
  onThrottle,
  onBrake
}: Props) {
  if (!snap) return null;
  const driving = snap.mode === "driving";

  const holdProps = (down: () => void, up: () => void) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      down();
    },
    onPointerUp: up,
    onPointerLeave: up,
    onPointerCancel: up
  });

  return (
    <div className="pointer-events-none absolute inset-0 select-none text-[#f3ead9]">
      {/* الشريط العلوي */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <button
          onClick={onPause}
          className="pointer-events-auto rounded-full bg-black/40 px-3 py-2 text-sm backdrop-blur-sm"
        >
          ⏸
        </button>
        <div className="pointer-events-none flex flex-col items-center gap-1 rounded-xl bg-black/40 px-4 py-2 text-center text-xs backdrop-blur-sm">
          <span className="font-bold">{regionName}</span>
          <span className="text-[#c79a55]">{formatTime(elapsedSec)}</span>
        </div>
        <div className="pointer-events-none flex flex-col items-end gap-0.5 rounded-xl bg-black/40 px-3 py-2 text-xs backdrop-blur-sm">
          <span>
            النقاط: <b className="text-[#e2b06a]">{snap.score.toLocaleString("ar")}</b>
          </span>
          <span>
            الطرائد: <b>{snap.bag}</b>
          </span>
        </div>
      </div>

      {driving && (
        <>
          {/* شريط السرعة وحالة السيارة */}
          <div className="pointer-events-none absolute bottom-24 left-3 w-28 rounded-lg bg-black/40 p-2 backdrop-blur-sm">
            <div className="text-[10px] text-[#c79a55]">السرعة</div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#e2b06a]"
                style={{ width: `${snap.speedRatio * 100}%` }}
              />
            </div>
          </div>

          {snap.canDismount && (
            <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center">
              <button
                onClick={onDismount}
                className="pointer-events-auto animate-pulse rounded-full bg-[#b3763b] px-5 py-2.5 text-sm font-bold text-white shadow-lg"
              >
                ترجّل وحمّل البندقية 🦆
              </button>
            </div>
          )}

          {/* عصا التوجيه */}
          <div className="pointer-events-none absolute bottom-4 left-3 flex gap-2">
            <button
              {...holdProps(
                () => onSteer(-1),
                () => onSteer(0)
              )}
              className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-2xl backdrop-blur-sm active:bg-black/60"
            >
              ‹
            </button>
            <button
              {...holdProps(
                () => onSteer(1),
                () => onSteer(0)
              )}
              className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-2xl backdrop-blur-sm active:bg-black/60"
            >
              ›
            </button>
          </div>

          {/* دواسات */}
          <div className="pointer-events-none absolute bottom-4 right-3 flex flex-col gap-2">
            <button
              {...holdProps(
                () => onThrottle(true),
                () => onThrottle(false)
              )}
              className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3f6b3a]/80 text-xl backdrop-blur-sm active:bg-[#3f6b3a]"
            >
              ▲
            </button>
            <button
              {...holdProps(
                () => onBrake(true),
                () => onBrake(false)
              )}
              className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7a3b2e]/80 text-xl backdrop-blur-sm active:bg-[#7a3b2e]"
            >
              ▼
            </button>
          </div>
        </>
      )}

      {!driving && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center">
            <button
              onClick={onMount}
              className="pointer-events-auto rounded-full bg-black/50 px-5 py-2.5 text-sm font-bold backdrop-blur-sm"
            >
              🚗 العودة للسيارة
            </button>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-3 rounded-xl bg-black/40 px-3 py-2 text-xs backdrop-blur-sm">
            <span className="text-[#c79a55]">طيور متبقية:</span> <b>{snap.flockBirdsLeft}</b>
          </div>

          <div className="pointer-events-none absolute bottom-4 inset-x-0 flex flex-col items-center gap-3">
            <div className="pointer-events-none flex gap-1.5">
              {Array.from({ length: snap.magazine }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${
                    i < snap.ammo ? "bg-[#e2b06a]" : "bg-white/15"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onReload}
                disabled={snap.reloading || snap.ammo === snap.magazine}
                className="pointer-events-auto rounded-full bg-black/40 px-4 py-3 text-xs font-bold backdrop-blur-sm disabled:opacity-40"
              >
                {snap.reloading ? "إعادة تلقيم..." : "إعادة تلقيم"}
              </button>
              <button
                onClick={onShoot}
                disabled={snap.reloading}
                className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#e2b06a]/70 bg-[#b3763b] text-2xl font-black text-white shadow-xl active:scale-95 disabled:opacity-40"
              >
                🎯
              </button>
              <span className="w-14" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
