import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function HeroBanner({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="relative h-[78vh] min-h-[520px] sm:h-[85vh] sm:min-h-[600px] max-h-[820px] w-full">
        <Image
          src="https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1800&q=80"
          alt="L'ADOUR"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/10" />

        <div className="relative h-full container-x flex flex-col items-center justify-end sm:justify-center text-center pb-14 sm:pb-0 gap-4 sm:gap-5">
          <p className="eyebrow text-gold-light animate-fadeUp">{dict.home.heroEyebrow}</p>
          <h1 className="font-latin text-cream text-[2.1rem] leading-[1.15] sm:text-6xl lg:text-7xl max-w-3xl animate-fadeUp [animation-delay:100ms]">
            {dict.home.heroTitle}
          </h1>
          <p className="text-cream/80 text-sm sm:text-lg max-w-xl animate-fadeUp [animation-delay:200ms]">
            {dict.home.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 w-full sm:w-auto animate-fadeUp [animation-delay:300ms]">
            <Link href={`/${locale}/products`} className="btn-gold">
              {dict.home.heroCta}
            </Link>
            <Link
              href={`/${locale}/collections`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/50 text-cream px-6 py-3.5 text-sm sm:text-base font-semibold hover:bg-cream hover:text-ink transition-all duration-300"
            >
              {dict.home.heroSecondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
