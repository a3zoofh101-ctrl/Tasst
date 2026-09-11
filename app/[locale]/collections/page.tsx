import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { collections } from "@/lib/data/collections";
import { t } from "@/lib/utils";

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);

  return (
    <div className="container-x section-y">
      <h1 className="font-latin text-3xl sm:text-4xl text-ink mb-8">{dict.nav.collections}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/${locale}/products?collection=${c.slug}`}
            className="group relative block rounded-3xl overflow-hidden h-72 sm:h-96"
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
              <h2 className="font-latin text-white text-2xl">{t(c.name, locale)}</h2>
              <p className="text-white/80 text-sm mt-1 max-w-xs">{t(c.description, locale)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
