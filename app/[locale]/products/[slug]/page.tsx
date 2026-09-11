import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { products, getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getReviewsForProduct } from "@/lib/data/reviews";
import { t } from "@/lib/utils";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import NotesSection from "@/components/product/NotesSection";
import ReviewsSection from "@/components/product/ReviewsSection";
import ProductCard from "@/components/product/ProductCard";
import { locales } from "@/lib/i18n/dictionaries";

export function generateStaticParams() {
  return locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: t(product.name, locale),
    description: t(product.tagline, locale)
  };
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const dict = getDictionary(locale);
  const related = getRelatedProducts(product, 4);
  const productReviews = getReviewsForProduct(product.id);

  return (
    <div className="container-x section-y">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        <ProductGallery images={product.images} alt={t(product.name, locale)} />
        <ProductPurchasePanel product={product} locale={locale} />
      </div>

      <div className="mt-14 sm:mt-20">
        <h2 className="font-latin text-2xl sm:text-3xl text-ink mb-6 text-center">{dict.product.notes}</h2>
        <NotesSection notes={product.notes} locale={locale} />
      </div>

      {related.length > 0 && (
        <div className="mt-14 sm:mt-20">
          <h2 className="font-latin text-2xl sm:text-3xl text-ink mb-6">{dict.product.related}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-14 sm:mt-20">
        <h2 className="font-latin text-2xl sm:text-3xl text-ink mb-6">{dict.product.reviewsTitle}</h2>
        <ReviewsSection product={product} reviews={productReviews} locale={locale} />
      </div>
    </div>
  );
}
