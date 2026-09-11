import { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { products } from "@/lib/data/products";
import ProductListing from "@/components/product/ProductListing";

export default async function ProductsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; collection?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const resolvedSearchParams = await searchParams;
  const dict = getDictionary(locale);

  return (
    <div className="container-x section-y">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-latin text-3xl sm:text-4xl text-ink">{dict.nav.products}</h1>
      </div>
      <ProductListing
        locale={locale}
        products={products}
        initialCategory={resolvedSearchParams.category}
        initialCollection={resolvedSearchParams.collection}
      />
    </div>
  );
}
