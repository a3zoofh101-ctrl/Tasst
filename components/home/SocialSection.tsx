import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { socialLinks } from "@/lib/data/social";
import SocialIcon from "@/components/layout/SocialIcon";
import Reveal from "@/components/ui/Reveal";

export default function SocialSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="section-y bg-sand/50">
      <div className="container-x text-center">
        <Reveal>
          <h2 className="font-latin text-2xl sm:text-3xl lg:text-4xl text-ink">{dict.home.socialTitle}</h2>
          <p className="text-ink/60 text-sm sm:text-base mt-2 max-w-md mx-auto">{dict.home.socialSubtitle}</p>
        </Reveal>
        <Reveal delay={100} className="flex items-center justify-center gap-4 mt-7">
          {socialLinks.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-line flex items-center justify-center text-ink/70 hover:text-gold hover:border-gold hover:-translate-y-1 transition-all duration-300 shadow-card"
            >
              <SocialIcon icon={s.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
