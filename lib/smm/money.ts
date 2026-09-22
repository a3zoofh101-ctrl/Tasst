import Decimal from "decimal.js";

export function toDecimal(value: Decimal.Value): Decimal {
  return new Decimal(value);
}

// "ar-SA" alone defaults to Eastern Arabic-Indic digits (٠١٢٣...) — at UI
// sizes, "٠" in particular renders as a near-invisible dot rather than a
// clear zero. Force Western digits (-u-nu-latn) explicitly: still fully
// Arabic script/currency formatting, just legible numerals — the
// convention real Gulf apps use for on-screen numbers.
const AR_LATN_DIGITS = "ar-SA-u-nu-latn";

export function formatMoney(value: Decimal.Value, currency = "SAR"): string {
  const amount = new Decimal(value).toDecimalPlaces(2).toNumber();
  return new Intl.NumberFormat(AR_LATN_DIGITS, {
    style: "currency",
    currency,
    currencyDisplay: "symbol"
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(AR_LATN_DIGITS).format(value);
}

// total = quantity / 1000 * pricePer1000, rounded to 2 decimal places.
export function calcOrderTotal(quantity: number, pricePer1000: Decimal.Value): Decimal {
  return new Decimal(quantity).dividedBy(1000).times(pricePer1000).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function calcSellingPrice(providerCost: Decimal.Value, markupType: "PERCENT" | "FIXED", markupValue: Decimal.Value): Decimal {
  const cost = new Decimal(providerCost);
  if (markupType === "PERCENT") {
    return cost.times(new Decimal(1).plus(new Decimal(markupValue).dividedBy(100))).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
  return cost.plus(markupValue).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}
