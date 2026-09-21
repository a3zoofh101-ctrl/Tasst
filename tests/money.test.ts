import { describe, it, expect } from "vitest";
import { calcOrderTotal, calcSellingPrice } from "@/lib/smm/money";

describe("calcOrderTotal", () => {
  it("computes quantity / 1000 * pricePer1000", () => {
    expect(calcOrderTotal(1000, "6.00").toFixed(2)).toBe("6.00");
    expect(calcOrderTotal(2500, "4.00").toFixed(2)).toBe("10.00");
  });

  it("rounds to 2 decimal places", () => {
    expect(calcOrderTotal(333, "3.3333").toFixed(2)).toBe("1.11");
  });
});

describe("calcSellingPrice", () => {
  it("applies a percentage markup over provider cost", () => {
    expect(calcSellingPrice("3", "PERCENT", "100").toFixed(2)).toBe("6.00");
    expect(calcSellingPrice("3", "PERCENT", "50").toFixed(2)).toBe("4.50");
  });

  it("applies a fixed markup over provider cost", () => {
    expect(calcSellingPrice("3", "FIXED", "2").toFixed(2)).toBe("5.00");
  });
});
