import { Locale, LocalizedText } from "@/lib/types";

export function t(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

export function formatPrice(amount: number, locale: Locale): string {
  const numerals = new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US").format(
    amount
  );
  return numerals;
}

export function discountPercent(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function getTimeRemaining(endsAt: string) {
  const total = new Date(endsAt).getTime() - Date.now();
  const clamped = Math.max(0, total);
  const seconds = Math.floor((clamped / 1000) % 60);
  const minutes = Math.floor((clamped / 1000 / 60) % 60);
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  return { total: clamped, days, hours, minutes, seconds };
}

export function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
