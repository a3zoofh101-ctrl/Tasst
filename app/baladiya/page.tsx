import { municipality } from "@/lib/data/municipality";
import { IconEmblem } from "@/components/baladiya/icons";
import StatCard from "@/components/baladiya/StatCard";
import SectionCard from "@/components/baladiya/SectionCard";

export default function BaladiyaHomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-20 top-10 h-72 w-72 rotate-45 rounded-[3rem] border-[3px] border-white/40" />
          <div className="absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rotate-12 rounded-[3rem] border-[3px] border-amber-300/40" />
          <div className="absolute bottom-[-6rem] left-1/3 h-64 w-64 rotate-[20deg] rounded-[3rem] border-[3px] border-white/20" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1300px] flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white sm:h-24 sm:w-24">
            <IconEmblem className="h-11 w-11 sm:h-14 sm:w-14" />
          </span>

          <p className="mt-6 text-sm font-semibold tracking-widest text-amber-200/90 sm:text-base">
            {municipality.authority}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">
            {municipality.reportLabel}
          </h1>
          <p className="mt-2 text-xl font-semibold text-amber-200 sm:text-2xl">
            {municipality.reportYear}م
          </p>
          <p className="mt-6 max-w-2xl text-sm leading-8 text-white/80 sm:text-base">
            {municipality.tagline}
          </p>
        </div>

        <div className="relative h-1.5 bg-gradient-to-l from-amber-400 via-emerald-500 to-emerald-800" />
      </section>

      <section className="section-y">
        <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <p className="mx-auto max-w-3xl text-center text-sm leading-8 text-emerald-950/75 sm:text-base">
            {municipality.intro}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-14 sm:gap-6 lg:grid-cols-4">
            {municipality.overviewStats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-white/60">
        <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 sm:text-sm">
              محاور التقرير
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-emerald-950 sm:text-3xl">
              أقسام التقرير الرئيسية
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {municipality.sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
