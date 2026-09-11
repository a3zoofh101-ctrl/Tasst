import Image from "next/image";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { nationalDayCampaign } from "@/lib/data/campaign";
import { products } from "@/lib/data/products";
import { t } from "@/lib/utils";
import CountdownTimer from "@/components/ui/CountdownTimer";
import ProductCard from "@/components/product/ProductCard";

export default async function OffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  const dict = getDictionary(locale);
  const campaign = nationalDayCampaign;
  const campaignProducts = products.filter((p) => campaign.productIds.includes(p.id));

  return (
    <div>
      {campaign.enabled ? (
        <>
          <section className="relative overflow-hidden">
            <div className="relative h-[46vh] min-h-[320px] sm:h-[52vh] w-full">
              <Image src={campaign.image} alt={t(campaign.title, locale)} fill priority sizes="100vw" className="object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${campaign.theme.primary}F2, ${campaign.theme.primary}55 70%, transparent)`
                }}
              />
              <div className="relative h-full container-x flex flex-col items-center justify-end sm:justify-center text-center gap-4 pb-10 sm:pb-0">
                <span className="eyebrow text-white/90">{dict.offersPage.title}</span>
                <h1 className="font-latin text-white text-3xl sm:text-5xl max-w-2xl">{t(campaign.title, locale)}</h1>
                <p className="text-white/85 max-w-lg text-sm sm:text-base">{t(campaign.subtitle, locale)}</p>
                <div className="mt-2">
                  <p className="text-white/70 text-xs mb-2">{dict.offersPage.endsIn}</p>
                  <CountdownTimer endsAt={campaign.endsAt} locale={locale} />
                </div>
                <div className="mt-2 inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-5 py-2.5 text-white text-sm">
                  {dict.offersPage.code}: <b className="tracking-[0.2em] text-gold-light">{campaign.promoCode}</b>
                </div>
              </div>
            </div>
          </section>

          <div className="container-x section-y">
            {campaignProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {campaignProducts.map((p) => (
                  <ProductCard key={p.id} product={p} locale={locale} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="container-x section-y text-center min-h-[40vh] flex items-center justify-center">
          <p className="text-ink/60">—</p>
        </div>
      )}
    </div>
  );
}
