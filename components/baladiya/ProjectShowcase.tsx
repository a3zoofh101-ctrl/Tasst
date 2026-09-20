import Image from "next/image";
import { ProjectShowcaseItem } from "@/lib/data/projectShowcase";
import BeforeAfterSlider from "./BeforeAfterSlider";

export default function ProjectShowcase({ item }: { item: ProjectShowcaseItem }) {
  return (
    <section className="section-y bg-white/60">
      <div className="mx-auto w-full max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 sm:text-sm">
            قبل وبعد
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-emerald-950 sm:text-3xl">{item.title}</h2>
          <p className="mt-3 text-sm leading-7 text-emerald-950/70">{item.description}</p>
        </div>

        <div className="mt-10 sm:mt-14">
          <BeforeAfterSlider beforeSrc={item.before} afterSrc={item.after} alt={item.title} />
          <p className="mt-3 text-center text-xs text-emerald-950/50">
            اسحب المؤشر لمقارنة الوضع قبل وبعد التطوير
          </p>
        </div>

        {item.gallery.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {item.gallery.map((g) => (
              <figure key={g.src} className="overflow-hidden rounded-2xl">
                <div className="relative aspect-video">
                  <Image
                    src={g.src}
                    alt={g.caption}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 600px, 100vw"
                  />
                </div>
                <figcaption className="mt-2 text-center text-xs text-emerald-950/60">{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
