import Image from "next/image";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Reveal from "@/components/ui/Reveal";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);

  return (
    <div>
      <section className="relative h-[42vh] min-h-[280px] sm:h-[50vh] w-full">
        <Image
          src="https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=1600&q=80"
          alt={dict.about.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/50" />
        <div className="relative h-full container-x flex items-center justify-center text-center">
          <h1 className="font-latin text-white text-3xl sm:text-5xl">{dict.about.heroTitle}</h1>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x max-w-3xl text-center">
          <Reveal>
            <p className="text-ink/70 leading-relaxed text-sm sm:text-lg">{dict.about.heroBody}</p>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-sand/50">
        <div className="container-x">
          <Reveal>
            <h2 className="font-latin text-2xl sm:text-3xl text-ink text-center mb-10">{dict.about.valuesTitle}</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {dict.about.values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100} className="card-surface p-6 text-center">
                <p className="font-latin text-lg text-gold-dark mb-2">{v.title}</p>
                <p className="text-sm text-ink/65 leading-relaxed">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
