"use client";

import { useState } from "react";
import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCartStore } from "@/lib/store/cart";
import { useMounted } from "@/lib/hooks/useMounted";
import { IconSearch, IconBag, IconUser, IconMenu } from "@/components/icons";
import MobileMenu from "@/components/layout/MobileMenu";
import SearchOverlay from "@/components/search/SearchOverlay";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mounted = useMounted();
  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore((s) =>
    s.lines.reduce((sum, l) => sum + l.quantity, 0)
  );

  const navLinks = [
    { href: `/${locale}/products`, label: dict.nav.products },
    { href: `/${locale}/offers`, label: dict.nav.offers },
    { href: `/${locale}/collections`, label: dict.nav.collections },
    { href: `/${locale}/about`, label: dict.nav.about }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-line">
        <div className="container-x">
          <div className="h-16 sm:h-20 flex items-center justify-between gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-10 h-10 -ms-2 flex items-center justify-center"
              aria-label="Open menu"
            >
              <IconMenu className="w-6 h-6" />
            </button>

            <Link
              href={`/${locale}`}
              className="flex flex-col items-center leading-none mx-auto lg:mx-0"
            >
              <span className="font-latin text-xl sm:text-2xl tracking-[0.15em]">L&apos;ADOUR</span>
              <span className="text-[10px] sm:text-xs tracking-widest2 text-gold-dark mt-0.5">لادورتي</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 mx-auto">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-semibold text-ink/80 hover:text-gold-dark transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageSwitcher
                locale={locale}
                className="hidden sm:inline-flex text-xs font-semibold border border-line rounded-full px-3 py-1.5 hover:border-gold transition-colors"
              >
                {dict.topbar.lang}
              </LanguageSwitcher>
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center hover:text-gold-dark transition-colors"
                aria-label={dict.nav.search}
              >
                <IconSearch className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              </button>
              <Link
                href={`/${locale}/account`}
                className="hidden sm:flex w-10 h-10 items-center justify-center hover:text-gold-dark transition-colors"
                aria-label={dict.nav.account}
              >
                <IconUser className="w-[22px] h-[22px]" />
              </Link>
              <button
                onClick={openCart}
                className="relative w-10 h-10 flex items-center justify-center hover:text-gold-dark transition-colors"
                aria-label={dict.nav.cart}
              >
                <IconBag className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                {mounted && itemCount > 0 && (
                  <span className="absolute top-1 end-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-gold text-white text-[10px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu locale={locale} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay locale={locale} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
