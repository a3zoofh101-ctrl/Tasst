"use client";

import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { categories } from "@/lib/data/categories";
import { t } from "@/lib/utils";
import { IconClose } from "@/components/icons";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { socialLinks } from "@/lib/data/social";
import SocialIcon from "@/components/layout/SocialIcon";

export default function MobileMenu({
  locale,
  open,
  onClose
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const dict = getDictionary(locale);
  if (!open) return null;

  const links = [
    { href: `/${locale}/products`, label: dict.nav.products },
    { href: `/${locale}/offers`, label: dict.nav.offers },
    { href: `/${locale}/collections`, label: dict.nav.collections },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/faq`, label: dict.nav.faq }
  ];

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 bottom-0 start-0 w-[85%] max-w-sm bg-cream shadow-card flex flex-col animate-fadeUp overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <span className="font-latin text-lg tracking-wide">L&apos;ADOUR</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-5 py-4 flex flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="py-3.5 text-base font-semibold border-b border-line/70"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4">
          <p className="eyebrow mb-2">{dict.filters.title}</p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/products?category=${c.id}`}
                onClick={onClose}
                className="px-3 py-1.5 rounded-full bg-white border border-line text-xs"
              >
                {t(c.label, locale)}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto px-5 py-5 border-t border-line space-y-4">
          <LanguageSwitcher
            locale={locale}
            className="btn-secondary w-full"
          >
            {dict.topbar.lang}
          </LanguageSwitcher>
          <div className="flex items-center justify-center gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink/70 hover:text-gold hover:border-gold transition-colors"
              >
                <SocialIcon icon={s.icon} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
