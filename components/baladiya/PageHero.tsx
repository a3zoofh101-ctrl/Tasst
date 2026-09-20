import Link from "next/link";
import { MunicipalitySection } from "@/lib/data/municipality";
import { SectionIcon } from "./sectionIcons";
import { IconArrow } from "./icons";

export default function PageHero({ section }: { section: MunicipalitySection }) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${section.color.from} ${section.color.to} text-white`}>
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <div className="absolute -left-16 -top-16 h-64 w-64 rotate-45 rounded-3xl border-[3px] border-white/40" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rotate-12 rounded-3xl border-[3px] border-white/30" />
      </div>

      <div className="relative mx-auto w-full max-w-[1300px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Link
          href="/baladiya"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          <IconArrow className="h-4 w-4 rotate-180" />
          العودة إلى التقرير
        </Link>

        <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
            <SectionIcon id={section.id} className="h-8 w-8" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">{section.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">{section.summary}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
