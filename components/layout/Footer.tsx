import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { socialLinks } from "@/lib/data/social";
import SocialIcon from "@/components/layout/SocialIcon";
import NewsletterForm from "@/components/layout/NewsletterForm";

export default function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <footer className="bg-ink text-cream mt-16 sm:mt-24">
      <div className="container-x py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <p className="font-latin text-xl tracking-[0.15em] mb-3">L&apos;ADOUR</p>
            <p className="text-sm text-cream/70 leading-relaxed max-w-xs">{dict.footer.aboutBody}</p>
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-cream/25 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
                >
                  <SocialIcon icon={s.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gold mb-4">{dict.footer.quickLinks}</p>
            <ul className="space-y-2.5 text-sm text-cream/75">
              <li><Link href={`/${locale}/products`} className="hover:text-cream">{dict.nav.products}</Link></li>
              <li><Link href={`/${locale}/offers`} className="hover:text-cream">{dict.nav.offers}</Link></li>
              <li><Link href={`/${locale}/collections`} className="hover:text-cream">{dict.nav.collections}</Link></li>
              <li><Link href={`/${locale}/about`} className="hover:text-cream">{dict.nav.about}</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gold mb-4">{dict.footer.help}</p>
            <ul className="space-y-2.5 text-sm text-cream/75">
              <li><Link href={`/${locale}/faq`} className="hover:text-cream">{dict.nav.faq}</Link></li>
              <li><Link href={`/${locale}/cart`} className="hover:text-cream">{dict.nav.cart}</Link></li>
              <li><a href="https://wa.me/966500000000" target="_blank" rel="noopener noreferrer" className="hover:text-cream">{dict.footer.contact}</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gold mb-4">{dict.footer.newsletter}</p>
            <p className="text-sm text-cream/70 mb-4">{dict.footer.newsletterBody}</p>
            <NewsletterForm placeholder={dict.footer.emailPlaceholder} cta={dict.footer.subscribe} />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/60">
          <p>© {new Date().getFullYear()} L&apos;ADOUR — {dict.footer.rights}</p>
          <div className="flex items-center gap-3">
            <span>{dict.footer.paymentMethods}:</span>
            <span className="flex items-center gap-2 text-cream/80 font-semibold">
              <span className="px-2 py-1 rounded bg-cream/10">mada</span>
              <span className="px-2 py-1 rounded bg-cream/10">VISA</span>
              <span className="px-2 py-1 rounded bg-cream/10">Apple Pay</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
