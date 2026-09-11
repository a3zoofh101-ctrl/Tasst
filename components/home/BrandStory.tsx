import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Reveal from "@/components/ui/Reveal";

export default function BrandStory({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="section-y">
      <div className="container-x grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <Reveal className="relative aspect-[4/3] rounded-3xl overflow-hidden order-2 lg:order-1">
          <Image
            src="https://images.unsplash.com/photo-1583467875263-3fa0b2896f1d?auto=format&fit=crop&w=1200&q=80"
            alt={dict.home.brandTitle}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>
        <Reveal className="order-1 lg:order-2" delay={100}>
          <p className="eyebrow mb-3">L&apos;ADOUR</p>
          <h2 className="font-latin text-2xl sm:text-3xl lg:text-4xl text-ink mb-4">{dict.home.brandTitle}</h2>
          <p className="text-ink/70 leading-relaxed text-sm sm:text-base max-w-xl">{dict.home.brandBody}</p>
          <Link href={`/${locale}/about`} className="btn-secondary mt-6">
            {dict.home.brandCta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
