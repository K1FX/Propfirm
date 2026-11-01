import { describe, expect, it } from "vitest";

import type { Evaluation } from "../rules/types";
import { canOpenInstantAccount, getAccount, listAccounts, resolveStatus } from "./service";

describe("comptes de démonstration", () => {
  it("couvrent les statuts attendus", async () => {
    const byId = Object.fromEntries((await listAccounts()).map((a) => [a.id, a]));
    expect(byId["ACC-50K-1042"]?.status).toBe("evaluation");
    expect(byId["ACC-100K-3310"]?.status).toBe("passed");
    expect(byId["ACC-25K-4410"]?.status).toBe("passed_awaiting_activation");
    expect(byId["ACC-50K-0815"]?.status).toBe("funded");
    expect(byId["ACC-INS-50K-5120"]?.status).toBe("funded");
    expect(byId["ACC-25K-0377"]?.status).toBe("breached");
  });

  it("le compte FLEX 150K déclenche l'alerte drawdown à 80 %", async () => {
    const a = await getAccount("ACC-150K-2071");
    expect(a?.evaluation.alerts.map((x) => x.type)).toContain("drawdown");
  });

  it("le compte financé RUSH est éligible au payout (plafond 2 000 $)", async () => {
    const a = await getAccount("ACC-50K-0815");
    expect(a?.evaluation.payout?.eligible).toBe(true);
    expect(a?.evaluation.payout?.payable).toBe(200_000);
  });

  it("le compte Pay Later réussi attend ses frais d'activation (14 jours)", async () => {
    const a = await getAccount("ACC-25K-4410");
    expect(a?.activation).toEqual({ fee: 6_900, deadline: "2026-11-11" });
  });

  it("les règles sont figées dans le compte", async () => {
    const a = await getAccount("ACC-INS-50K-5120");
    expect(a?.rules.riskTemplate).toBe("INSTANT_50K_FUNDED");
    expect(a?.rules.consistencyPct).toBe(20);
  });

  it("renvoie null pour un compte inconnu", async () => {
    expect(await getAccount("NOPE")).toBeNull();
  });
});

describe("resolveStatus (Pay Later)", () => {
  const passed = { status: "passed" } as Evaluation;

  it("expire après le délai d'activation", () => {
    const r = resolveStatus(
      { phase: "evaluation", paymentMode: "pay_later" },
      passed,
      "2026-10-01",
      "2026-10-20",
    );
    expect(r.status).toBe("expired");
  });

  it("paiement unique : réussi directement", () => {
    expect(
      resolveStatus(
        { phase: "evaluation", paymentMode: "one_time" },
        passed,
        "2026-10-01",
        "2026-10-20",
      ).status,
    ).toBe("passed");
  });
});

describe("limite de comptes INSTANT", () => {
  const instant = (status: "funded" | "breached") => ({ programType: "instant" as const, status });

  it("autorise jusqu'à 5 comptes actifs", () => {
    expect(canOpenInstantAccount(Array.from({ length: 4 }, () => instant("funded")))).toBe(true);
    expect(canOpenInstantAccount(Array.from({ length: 5 }, () => instant("funded")))).toBe(false);
  });

  it("ne compte pas les comptes perdus", () => {
    expect(canOpenInstantAccount([...Array.from({ length: 5 }, () => instant("breached"))])).toBe(
      true,
    );
  });
});
