import { describe, expect, it } from "vitest";

import { getAccount, listAccounts, traderShareOf } from "./service";

describe("traderShareOf (split 100 % jusqu'à 10 000 $, puis 90 %)", () => {
  it("100 % sous le seuil", () => expect(traderShareOf(500_000)).toBe(500_000));
  it("90 % au-delà", () => expect(traderShareOf(1_200_000)).toBe(1_000_000 + 180_000));
  it("0 si pas de profit", () => expect(traderShareOf(-100)).toBe(0));
});

describe("comptes de démonstration", () => {
  it("couvrent les statuts attendus", async () => {
    const accounts = await listAccounts();
    const byId = Object.fromEntries(accounts.map((a) => [a.id, a]));
    expect(byId["ACC-50K-1042"]?.status).toBe("evaluation");
    expect(byId["ACC-150K-2071"]?.status).toBe("evaluation");
    expect(byId["ACC-100K-3310"]?.status).toBe("passed");
    expect(byId["ACC-50K-0815"]?.status).toBe("funded");
    expect(byId["ACC-25K-0377"]?.status).toBe("breached");
  });

  it("le compte 150K déclenche l'alerte drawdown à 80 %", async () => {
    const a = await getAccount("ACC-150K-2071");
    expect(a?.evaluation.alerts.map((x) => x.type)).toContain("drawdown");
  });

  it("le compte financé est éligible au payout", async () => {
    const a = await getAccount("ACC-50K-0815");
    expect(a?.payout?.eligible).toBe(true);
    expect(a?.evaluation.drawdownLocked).toBe(true);
  });

  it("renvoie null pour un compte inconnu", async () => {
    expect(await getAccount("NOPE")).toBeNull();
  });
});
