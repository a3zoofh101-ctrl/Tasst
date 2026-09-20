import Link from "next/link";
import { MunicipalitySection } from "@/lib/data/municipality";
import { SectionIcon } from "./sectionIcons";
import { IconArrow } from "./icons";

export default function SectionCard({ section }: { section: MunicipalitySection }) {
  return (
    <Link
      href={`/baladiya/${section.slug}`}
      className="group flex flex-col rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-[0_16px_40px_-24px_rgba(6,60,40,0.4)] transition-transform duration-300 hover:-translate-y-1 sm:p-8"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${section.color.from} ${section.color.to} text-white shadow-md`}
      >
        <SectionIcon id={section.id} className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-emerald-950 sm:text-xl">{section.shortTitle}</h3>
      <p className="mt-2 text-sm leading-7 text-emerald-950/65">{section.summary}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        {section.stats.slice(0, 2).map((stat) => (
          <div key={stat.label} className={`rounded-xl bg-emerald-50 p-3 ring-1 ${section.color.ring}`}>
            <dt className="text-[11px] text-emerald-950/60">{stat.label}</dt>
            <dd className={`mt-1 text-lg font-extrabold ${section.color.text}`}>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <span className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${section.color.text}`}>
        عرض التفاصيل
        <IconArrow className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}
