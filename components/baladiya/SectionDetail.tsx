import Link from "next/link";
import { municipality, MunicipalitySection } from "@/lib/data/municipality";
import PageHero from "./PageHero";
import StatCard from "./StatCard";
import { IconCheck } from "./icons";

export default function SectionDetail({
  section,
  children
}: {
  section: MunicipalitySection;
  children?: React.ReactNode;
}) {
  const otherSections = municipality.sections.filter((s) => s.id !== section.id);

  return (
    <>
      <PageHero section={section} />

      <section className="section-y">
        <div className="mx-auto grid w-full max-w-[1300px] gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:px-8">
          <div>
            <h2 className="text-xl font-extrabold text-emerald-950 sm:text-2xl">نبذة عن المحور</h2>
            <p className="mt-4 text-sm leading-8 text-emerald-950/75 sm:text-base">{section.description}</p>

            <h3 className="mt-8 text-lg font-bold text-emerald-950">أبرز المبادرات والإجراءات</h3>
            <ul className="mt-4 space-y-3">
              {section.highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${section.color.from} ${section.color.to} text-white`}
                  >
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm leading-7 text-emerald-950/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-emerald-950 sm:text-2xl">أبرز المؤشرات</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {section.stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} accent={section.color.text} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {children}

      <section className="section-y">
        <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-extrabold text-emerald-950 sm:text-2xl">محاور أخرى من التقرير</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {otherSections.map((s) => (
              <Link
                key={s.id}
                href={`/baladiya/${s.slug}`}
                className="group rounded-2xl border border-emerald-900/10 bg-white p-5 transition-transform hover:-translate-y-1"
              >
                <p className={`text-sm font-bold ${s.color.text}`}>{s.shortTitle}</p>
                <p className="mt-1.5 text-xs leading-6 text-emerald-950/60">{s.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
