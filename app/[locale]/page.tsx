import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { products } from "@/lib/data/products";
import { nationalDayCampaign } from "@/lib/data/campaign";
import HeroBanner from "@/components/home/HeroBanner";
import ProductRail from "@/components/home/ProductRail";
import NationalDayBanner from "@/components/home/NationalDayBanner";
import CollectionsSection from "@/components/home/CollectionsSection";
import BrandStory from "@/components/home/BrandStory";
import Testimonials from "@/components/home/Testimonials";
import FAQSection from "@/components/home/FAQSection";
import SocialSection from "@/components/home/SocialSection";
import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/product/ProductCard";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);

  const bestSellers = products.filter((p) => p.tags.includes("bestseller")).slice(0, 8);
  const newArrivals = products.filter((p) => p.tags.includes("new")).slice(0, 8);
  const showcase = products.slice(0, 8);

  return (
    <>
      <HeroBanner locale={locale} />

      <ProductRail
        locale={locale}
        title={dict.home.bestSellers}
        products={bestSellers}
        viewAllHref={`/${locale}/products?category=bestseller`}
      />

      <ProductRail
        locale={locale}
        title={dict.home.newArrivals}
        products={newArrivals}
        viewAllHref={`/${locale}/products?category=new`}
      />

      {nationalDayCampaign.enabled && <NationalDayBanner locale={locale} />}

      <CollectionsSection locale={locale} />

      <section className="section-y">
        <div className="container-x">
          <Reveal>
            <h2 className="font-latin text-2xl sm:text-3xl lg:text-4xl text-ink mb-6 sm:mb-8">
              {dict.home.productsShowcase}
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {showcase.map((p, i) => (
              <Reveal key={p.id} delay={i * 50}>
                <ProductCard product={p} locale={locale} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <BrandStory locale={locale} />
      <Testimonials locale={locale} />
      <FAQSection locale={locale} />
      <SocialSection locale={locale} />
    </>
  );
}
