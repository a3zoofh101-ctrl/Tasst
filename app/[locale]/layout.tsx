import type { Metadata } from "next";
import "@/app/globals.css";
import { Locale } from "@/lib/types";
import { locales, getDictionary } from "@/lib/i18n/dictionaries";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);
  const title = `${dict.brand.name} | ${dict.brand.sub}`;
  const description =
    locale === "ar"
      ? "لادورتي L'ADOUR — متجر عطور فاخر مستوحى من أشهر مدن العالم. تسوق أحدث العطور الرجالية والنسائية بجودة استثنائية وتوصيل سريع."
      : "L'ADOUR — a luxury perfume house inspired by the world's most iconic cities. Shop the latest men's and women's fragrances with fast delivery.";
  return {
    title: { default: title, template: `%s | ${dict.brand.name}` },
    description
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={locale === "ar" ? "font-arabic" : "font-latin"}>
        <TopBar locale={locale} />
        <Header locale={locale} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer locale={locale} />
        <CartDrawer locale={locale} />
      </body>
    </html>
  );
}
