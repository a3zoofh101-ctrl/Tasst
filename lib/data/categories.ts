import { LocalizedText } from "@/lib/types";

export type CategoryFilter =
  | "all"
  | "bestseller"
  | "new"
  | "offer"
  | "men"
  | "women"
  | "unisex"
  | "collections";

export const categories: { id: CategoryFilter; label: LocalizedText }[] = [
  { id: "all", label: { ar: "جميع العطور", en: "All Fragrances" } },
  { id: "bestseller", label: { ar: "الأكثر مبيعًا", en: "Bestsellers" } },
  { id: "new", label: { ar: "جديدنا", en: "New In" } },
  { id: "offer", label: { ar: "العروض", en: "Offers" } },
  { id: "men", label: { ar: "رجالي", en: "Men" } },
  { id: "women", label: { ar: "نسائي", en: "Women" } },
  { id: "unisex", label: { ar: "للجنسين", en: "Unisex" } },
  { id: "collections", label: { ar: "مجموعات العطور", en: "Collections" } }
];
