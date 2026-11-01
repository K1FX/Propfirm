import { describe, expect, it } from "vitest";

import { buildTrustItems, NO_STATS } from "./trust";

describe("buildTrustItems", () => {
  it("affiche les promesses sans statistiques réelles", () => {
    const ids = buildTrustItems(NO_STATS).map((i) => i.id);
    expect(ids).toEqual(["maxSize", "split", "activation"]);
  });

  it("garde la promesse tant que le seuil n'est pas atteint", () => {
    const ids = buildTrustItems({ ...NO_STATS, totalPaidOut: 500_000, tradersPaid: 3 }).map(
      (i) => i.id,
    );
    expect(ids).toContain("maxSize");
    expect(ids).toContain("split");
  });

  it("bascule vers les vraies stats au-delà des seuils", () => {
    const items = buildTrustItems({
      totalPaidOut: 2_500_000,
      tradersPaid: 40,
      avgPayoutHours: { value: 18, sample: 30 },
    });
    expect(items.map((i) => i.id)).toEqual([
      "totalPaidOut",
      "tradersPaid",
      "activation",
      "avgPayout",
    ]);
    expect(items[0]!.value).toBe(2_500_000);
  });

  it("ignore un délai moyen calculé sur trop peu de payouts", () => {
    const ids = buildTrustItems({ ...NO_STATS, avgPayoutHours: { value: 4, sample: 3 } }).map(
      (i) => i.id,
    );
    expect(ids).not.toContain("avgPayout");
  });
});
