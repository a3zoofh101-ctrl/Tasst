// "ar-SA" alone defaults to the Hijri (islamic-umalqura) calendar and
// Eastern Arabic-Indic digits in most JS engines — surprising for an app
// whose dates are otherwise all Gregorian, and less legible on-screen
// than Western numerals (the convention real Gulf apps use for UI
// numbers). Force both explicitly, once, here.
const AR_GREGORIAN_LATN = "ar-SA-u-ca-gregory-nu-latn";

export function formatDate(date: Date): string {
  return date.toLocaleDateString(AR_GREGORIAN_LATN);
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString(AR_GREGORIAN_LATN);
}
