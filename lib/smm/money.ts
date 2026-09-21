import Decimal from "decimal.js";

export function toDecimal(value: Decimal.Value): Decimal {
  return new Decimal(value);
}

export function formatMoney(value: Decimal.Value, currency = "SAR"): string {
  const amount = new Decimal(value).toDecimalPlaces(2).toNumber();
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    currencyDisplay: "symbol"
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ar-SA").format(value);
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
