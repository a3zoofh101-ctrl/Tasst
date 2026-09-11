import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { collections } from "@/lib/data/collections";
import { t } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";

export default function CollectionsSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="section-y bg-sand/50">
      <div className="container-x">
        <Reveal>
          <h2 className="font-latin text-2xl sm:text-3xl lg:text-4xl text-ink mb-6 sm:mb-8">
            {dict.home.collectionsTitle}
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {collections.map((c, i) => (
            <Reveal key={c.id} delay={i * 100}>
              <Link
                href={`/${locale}/products?collection=${c.slug}`}
                className="group relative block rounded-3xl overflow-hidden h-64 sm:h-80"
              >
                <Image
                  src={c.image}
                  alt={t(c.name, locale)}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <h3 className="font-latin text-white text-xl sm:text-2xl">{t(c.name, locale)}</h3>
                  <p className="text-white/80 text-sm mt-1 max-w-xs">{t(c.description, locale)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
