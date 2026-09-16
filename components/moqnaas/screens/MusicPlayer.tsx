import { useRef, useState } from "react";
import { MusicPlayer as MusicPlayerEngine } from "@/lib/moqnaas/audio";

interface Props {
  player: MusicPlayerEngine;
  playlistName: string;
  onClose: () => void;
}

export default function MusicPlayerPanel({ player, playlistName, onClose }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState(player.trackList);
  const [current, setCurrent] = useState(player.currentTrack);
  const [playing, setPlaying] = useState(player.isPlaying);

  const refresh = () => {
    setTracks([...player.trackList]);
    setCurrent(player.currentTrack);
    setPlaying(player.isPlaying);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    player.loadFiles(Array.from(files));
    refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-3 pb-3" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-[#3a2f22] bg-[#1c170f] p-4 text-[#f3ead9]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">{playlistName}</h3>
          <button onClick={onClose} className="text-sm text-[#c79a55]">
            إغلاق
          </button>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-[#8a7a5f]">
          ارفع ملفاتك الصوتية الخاصة (شيلات، جلسة بر) التي تملك حق استخدامها — لا تحتوي اللعبة على أي
          مقاطع جاهزة.
        </p>

        <button
          onClick={() => fileInput.current?.click()}
          className="mt-3 w-full rounded-xl border border-dashed border-[#5a4a34] py-3 text-sm text-[#c79a55] active:scale-[0.98]"
        >
          + إضافة مقاطع صوتية
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />

        {tracks.length > 0 && (
          <div className="mt-3 max-h-32 space-y-1 overflow-y-auto">
            {tracks.map((t, i) => (
              <div
                key={t.url}
                className={`truncate rounded-lg px-3 py-1.5 text-xs ${
                  current?.url === t.url ? "bg-[#b3763b]/20 text-[#e2b06a]" : "bg-black/20 text-[#c9b795]"
                }`}
              >
                {i + 1}. {t.name}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              player.prev();
              refresh();
            }}
            disabled={!tracks.length}
            className="rounded-full bg-black/30 p-3 text-lg disabled:opacity-40"
            aria-label="السابق"
          >
            ⏮
          </button>
          <button
            onClick={() => {
              player.toggle();
              refresh();
            }}
            disabled={!tracks.length}
            className="rounded-full bg-[#b3763b] p-4 text-xl text-white disabled:opacity-40"
            aria-label="تشغيل/إيقاف"
          >
            {playing ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => {
              player.next();
              refresh();
            }}
            disabled={!tracks.length}
            className="rounded-full bg-black/30 p-3 text-lg disabled:opacity-40"
            aria-label="التالي"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
}
