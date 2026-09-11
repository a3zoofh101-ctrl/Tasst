import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { faqs } from "@/lib/data/faqs";
import Accordion from "@/components/ui/Accordion";

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);

  return (
    <div className="container-x section-y max-w-3xl">
      <h1 className="font-latin text-3xl sm:text-4xl text-ink mb-2">{dict.faqPage.title}</h1>
      <p className="text-ink/60 mb-8">{dict.faqPage.subtitle}</p>
      <Accordion items={faqs} locale={locale} />
    </div>
  );
}
