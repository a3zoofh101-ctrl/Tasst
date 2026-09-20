import { StatItem } from "@/lib/data/municipality";

export default function StatCard({ stat, accent = "text-emerald-700" }: { stat: StatItem; accent?: string }) {
  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(6,60,40,0.35)]">
      <p className={`text-3xl font-extrabold sm:text-4xl ${accent}`}>{stat.value}</p>
      <p className="mt-2 text-sm leading-6 text-emerald-950/70">{stat.label}</p>
    </div>
  );
}
