import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { faqs } from "@/lib/data/faqs";
import Accordion from "@/components/ui/Accordion";
import Reveal from "@/components/ui/Reveal";

export default function FAQSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="section-y">
      <div className="container-x max-w-3xl">
        <Reveal className="flex items-end justify-between mb-6 sm:mb-8">
          <h2 className="font-latin text-2xl sm:text-3xl lg:text-4xl text-ink">{dict.home.faqTitle}</h2>
          <Link href={`/${locale}/faq`} className="hidden sm:block text-sm font-semibold text-gold-dark">
            {dict.home.faqCta}
          </Link>
        </Reveal>
        <Reveal delay={100}>
          <Accordion items={faqs.slice(0, 4)} locale={locale} />
        </Reveal>
        <Link
          href={`/${locale}/faq`}
          className="sm:hidden flex items-center justify-center text-sm font-semibold text-gold-dark mt-6"
        >
          {dict.home.faqCta}
        </Link>
      </div>
    </section>
  );
}
