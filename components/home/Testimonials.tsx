import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { reviews } from "@/lib/data/reviews";
import { t } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import Reveal from "@/components/ui/Reveal";

export default function Testimonials({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const featured = reviews.slice(0, 6);

  return (
    <section className="section-y bg-ink">
      <div className="container-x">
        <Reveal>
          <h2 className="font-latin text-2xl sm:text-3xl lg:text-4xl text-cream mb-6 sm:mb-8">
            {dict.home.testimonialsTitle}
          </h2>
        </Reveal>
        <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((r, i) => (
            <Reveal
              key={r.id}
              delay={i * 60}
              className="shrink-0 w-[80%] xs:w-[70%] sm:w-auto bg-cream/[0.06] border border-cream/15 rounded-2xl p-5 sm:p-6"
            >
              <StarRating rating={r.rating} />
              <p className="text-cream/85 text-sm leading-relaxed mt-3">&ldquo;{t(r.comment, locale)}&rdquo;</p>
              <p className="text-cream/50 text-xs mt-4">{t(r.name, locale)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
