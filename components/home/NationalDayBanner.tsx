import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { nationalDayCampaign } from "@/lib/data/campaign";
import { t } from "@/lib/utils";
import CountdownTimer from "@/components/ui/CountdownTimer";
import Reveal from "@/components/ui/Reveal";

export default function NationalDayBanner({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const campaign = nationalDayCampaign;
  if (!campaign.enabled) return null;

  return (
    <section className="section-y">
      <div className="container-x">
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[400px] flex items-end">
            <Image
              src={campaign.image}
              alt={t(campaign.title, locale)}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${campaign.theme.primary}E6, ${campaign.theme.primary}66 60%, transparent)`
              }}
            />
            <div className="relative p-6 sm:p-12 w-full flex flex-col gap-4">
              <span className="eyebrow text-white/90">{dict.home.nationalDayTitle}</span>
              <h2 className="font-latin text-white text-2xl sm:text-4xl lg:text-5xl max-w-lg">
                {t(campaign.title, locale)}
              </h2>
              <p className="text-white/85 text-sm sm:text-base max-w-md">{t(campaign.subtitle, locale)}</p>
              <CountdownTimer endsAt={campaign.endsAt} locale={locale} />
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Link href={`/${locale}/offers`} className="btn-gold">
                  {dict.home.nationalDayCta}
                </Link>
                <span className="text-white/90 text-sm border border-white/40 rounded-full px-4 py-2">
                  {dict.offersPage.code}: <b className="tracking-wider">{campaign.promoCode}</b>
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
