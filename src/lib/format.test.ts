import { describe, expect, it } from "vitest";

import { dollarsToCents, formatAccountSize, formatMoney } from "./format";

// Intl insère des espaces insécables : on les normalise pour des assertions lisibles.
const normalize = (s: string) => s.replace(/[  ]/g, " ");

describe("dollarsToCents", () => {
  it("convertit sans erreur de flottant", () => {
    expect(dollarsToCents(0.1 + 0.2)).toBe(30);
    expect(dollarsToCents(109)).toBe(10900);
    expect(dollarsToCents(19.99)).toBe(1999);
  });

  it("rejette les valeurs non finies", () => {
    expect(() => dollarsToCents(Number.NaN)).toThrow(TypeError);
    expect(() => dollarsToCents(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });
});

describe("formatMoney", () => {
  it("formate en anglais", () => {
    expect(formatMoney(300000, { locale: "en" })).toBe("$3,000");
    expect(formatMoney(1999, { locale: "en" })).toBe("$19.99");
  });

  it("formate en français", () => {
    expect(normalize(formatMoney(300000, { locale: "fr" }))).toBe("3 000 $");
  });

  it("affiche le signe pour le P&L", () => {
    expect(formatMoney(25050, { locale: "en", signed: true })).toBe("+$250.50");
    expect(formatMoney(-10000, { locale: "en", signed: true })).toBe("-$100");
    expect(formatMoney(0, { locale: "en", signed: true })).toBe("$0");
  });

  it("refuse les montants non entiers", () => {
    expect(() => formatMoney(10.5)).toThrow(TypeError);
  });
});

describe("formatAccountSize", () => {
  it("compacte les tailles de compte", () => {
    expect(formatAccountSize(2_500_000)).toBe("25K");
    expect(formatAccountSize(15_000_000)).toBe("150K");
  });
});
