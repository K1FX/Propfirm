import { describe, expect, it } from "vitest";

import { getOffer, MIN_DAYS_TO_FIRST_PAYOUT, offers, riskTemplate, SIZES } from "./plans";
import { canApplyPromo, discountedPrice, promoSavings } from "./promo";

const dollars = (c: number) => c / 100;

describe("offres", () => {
  it("12 offres valides (3 types × 4 tailles)", () => {
    expect(offers).toHaveLength(12);
  });

  it("INSTANT n'a ni évaluation, ni reset, ni Pay Later", () => {
    for (const size of SIZES) {
      const o = getOffer("instant", size);
      expect(o.evaluation).toBeNull();
      expect(o.resetFee).toBeNull();
      expect(o.payLater).toBeNull();
    }
  });

  it("règles financées par type", () => {
    expect(getOffer("rush", "50k").funded.consistencyPct).toBe(35);
    expect(getOffer("rush", "50k").funded.dailyLossLimit).toBe(125_000);
    expect(getOffer("flex", "50k").funded.consistencyPct).toBeNull();
    expect(getOffer("flex", "50k").funded.dailyLossLimit).toBeNull();
    expect(getOffer("instant", "50k").funded.consistencyPct).toBe(20);
    expect(getOffer("instant", "25k").funded.dailyLossLimit).toBeNull();
    expect(getOffer("instant", "150k").funded.payoutCap).toBe(300_000);
  });

  it("règles d'évaluation", () => {
    expect(getOffer("rush", "100k").evaluation).toMatchObject({
      minTradingDays: 1,
      consistencyPct: null,
      maxDrawdown: 350_000,
    });
    expect(getOffer("flex", "100k").evaluation).toMatchObject({
      minTradingDays: 3,
      consistencyPct: 40,
      dailyLossLimit: null,
    });
  });

  it("gabarits de risque fournisseur", () => {
    expect(riskTemplate("rush", "50k", "evaluation")).toBe("RUSH_50K_EVAL");
    expect(riskTemplate("instant", "50k", "funded")).toBe("INSTANT_50K_FUNDED");
  });

  it("premier payout possible en 5 jours (INSTANT)", () => {
    expect(MIN_DAYS_TO_FIRST_PAYOUT).toBe(5);
  });
});

describe("code promo -40 % (arrondi au dollar inférieur)", () => {
  const expected = {
    rush: [53, 77, 137, 197],
    flex: [59, 89, 143, 201],
    instant: [185, 263, 353, 431],
  } as const;

  for (const [type, prices] of Object.entries(expected)) {
    it(`${type} : ${prices.join(" / ")}`, () => {
      const got = SIZES.map((s) =>
        dollars(discountedPrice(getOffer(type as "rush", s).price, type as "rush")),
      );
      expect(got).toEqual(prices);
    });
  }

  it("calcule l'économie affichée", () => {
    expect(dollars(promoSavings(getOffer("rush", "50k").price, "rush"))).toBe(52);
  });

  it("ne se cumule pas avec le Pay Later", () => {
    expect(canApplyPromo("pay_later")).toEqual({ ok: false, reason: "payLater" });
    expect(canApplyPromo("one_time").ok).toBe(true);
  });
});
