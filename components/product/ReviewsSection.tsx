import { Locale, Product, Review } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { t } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import { IconCheck } from "@/components/icons";

export default function ReviewsSection({
  product,
  reviews,
  locale
}: {
  product: Product;
  reviews: Review[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-ink">{product.rating}</p>
            <StarRating rating={product.rating} size="md" />
          </div>
          <div className="text-sm text-ink/60">
            {product.reviewCount} {dict.product.reviews}
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-ink/50 text-sm">—</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {reviews.map((r) => (
            <div key={r.id} className="card-surface p-5">
              <div className="flex items-center justify-between mb-2">
                <StarRating rating={r.rating} />
                <span className="text-xs text-ink/40">{r.date}</span>
              </div>
              <p className="text-sm text-ink/75 leading-relaxed">{t(r.comment, locale)}</p>
              <div className="flex items-center gap-1.5 mt-3">
                <p className="text-xs font-semibold text-ink">{t(r.name, locale)}</p>
                {r.verified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-gold-dark">
                    <IconCheck className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
