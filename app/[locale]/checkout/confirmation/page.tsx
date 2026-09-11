import Link from "next/link";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { IconCheck } from "@/components/icons";

export default async function ConfirmationPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const resolvedSearchParams = await searchParams;
  const dict = getDictionary(locale);
  const orderNumber = resolvedSearchParams.order ?? "LDR-000000";

  return (
    <div className="container-x section-y min-h-[60vh] flex flex-col items-center justify-center text-center gap-5">
      <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
        <IconCheck className="w-10 h-10 text-gold-dark" />
      </div>
      <h1 className="font-latin text-2xl sm:text-3xl text-ink">{dict.checkout.confirmTitle}</h1>
      <p className="text-ink/60 max-w-md">{dict.checkout.confirmBody}</p>
      <p className="text-sm text-ink/50">
        {dict.checkout.orderNumber}: <span className="font-semibold text-ink">{orderNumber}</span>
      </p>
      <div className="flex items-center gap-3 mt-4">
        <Link href={`/${locale}`} className="btn-primary">
          {dict.checkout.backHome}
        </Link>
        <Link href={`/${locale}/products`} className="btn-secondary">
          {dict.cart.emptyCta}
        </Link>
      </div>
    </div>
  );
}
