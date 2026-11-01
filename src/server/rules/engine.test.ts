import { describe, expect, it } from "vitest";

import { evaluateAccount } from "./engine";
import type { DailyResult, RuleSet } from "./types";

// Règles du plan 50K (montants en centimes).
const rules: RuleSet = {
  startBalance: 5_000_000,
  profitTarget: 300_000,
  maxDrawdown: 200_000,
  drawdownLockBuffer: 10_000,
  consistencyMaxBestDayPct: 50,
  minTradingDays: 2,
  maxContracts: { mini: 5, micro: 50 },
  dailyLossLimit: null,
  alertThresholdPct: 80,
};

/** Construit des jours à partir d'une liste de P&L (en dollars) – sans creux intraday. */
function days(pnlsInDollars: number[], start = rules.startBalance): DailyResult[] {
  let bal = start;
  return pnlsInDollars.map((p, i) => {
    const pnl = p * 100;
    const low = Math.min(bal, bal + pnl);
    bal += pnl;
    return {
      day: `2026-10-${String(i + 1).padStart(2, "0")}`,
      pnl,
      closingBalance: bal,
      lowBalance: low,
      maxMiniContracts: 1,
      maxMicroContracts: 0,
    };
  });
}

describe("drawdown EOD trailing", () => {
  it("démarre au solde initial − drawdown max", () => {
    const r = evaluateAccount(rules, []);
    expect(r.drawdownThreshold).toBe(4_800_000);
    expect(r.drawdownRemaining).toBe(200_000);
    expect(r.status).toBe("active");
  });

  it("monte avec le plus haut solde de clôture", () => {
    const r = evaluateAccount(rules, days([500, -200]));
    // plus haut de clôture = 50 500 $ → seuil 48 500 $
    expect(r.drawdownThreshold).toBe(4_850_000);
    expect(r.balance).toBe(5_030_000);
    expect(r.drawdownRemaining).toBe(180_000);
  });

  it("ne redescend jamais après une perte", () => {
    const r = evaluateAccount(rules, days([1_000, -800, -100]));
    expect(r.drawdownThreshold).toBe(4_900_000);
  });

  it("se bloque au solde initial + 100 $", () => {
    const r = evaluateAccount(rules, days([1_500, 800]));
    // plus haut = 52 300 $ → 50 300 $ dépasserait le lock de 50 100 $
    expect(r.drawdownThreshold).toBe(5_010_000);
    expect(r.drawdownLocked).toBe(true);
    const later = evaluateAccount(rules, days([1_500, 800, 1_000]));
    expect(later.drawdownThreshold).toBe(5_010_000);
  });

  it("élimine le compte si le solde touche le seuil", () => {
    const r = evaluateAccount(rules, days([-1_000, -1_000]));
    expect(r.status).toBe("breached");
    expect(r.violations).toContainEqual({ type: "drawdown", day: "2026-10-02", fatal: true });
    expect(r.drawdownRemaining).toBe(0);
  });

  it("détecte une violation intraday même si la clôture remonte", () => {
    const d = days([200]);
    d[0]!.lowBalance = 4_799_000; // creux sous le seuil de 48 000 $
    expect(evaluateAccount(rules, d).status).toBe("breached");
  });

  it("utilise le seuil de la veille pendant la journée (pas celui du jour)", () => {
    // Jour 1 : +1 000 → seuil 49 000 $. Jour 2 : creux à 49 500 puis clôture 51 500 : pas de violation.
    const d = days([1_000, 500]);
    d[1]!.lowBalance = 4_950_000;
    expect(evaluateAccount(rules, d).status).not.toBe("breached");
  });

  it("ignore les jours après l'élimination", () => {
    const r = evaluateAccount(rules, days([-2_000, 5_000]));
    expect(r.status).toBe("breached");
    expect(r.drawdownHistory).toHaveLength(1);
  });
});

describe("validation de l'évaluation", () => {
  it("valide avec objectif + jours min + consistance", () => {
    const r = evaluateAccount(rules, days([1_000, 1_000, 1_000]));
    expect(r.profit).toBe(300_000);
    expect(r.targetProgressPct).toBe(100);
    expect(r.status).toBe("passed");
  });

  it("refuse si le minimum de jours n'est pas atteint", () => {
    const r = evaluateAccount(rules, days([3_000]));
    expect(r.minDaysMet).toBe(false);
    expect(r.status).not.toBe("passed");
  });

  it("refuse si le meilleur jour dépasse 50 % du profit (consistance)", () => {
    const r = evaluateAccount(rules, days([2_000, 1_000]));
    expect(r.bestDayShareOfProfitPct).toBeCloseTo(66.67, 1);
    expect(r.consistencyOk).toBe(false);
    expect(r.status).toBe("active");
  });

  it("accepte exactement 50 %", () => {
    const r = evaluateAccount(rules, days([1_500, 1_500]));
    expect(r.consistencyOk).toBe(true);
    expect(r.status).toBe("passed");
  });

  it("un compte financé n'a pas d'objectif", () => {
    const r = evaluateAccount({ ...rules, profitTarget: null }, days([5_000, 1_000]));
    expect(r.status).toBe("active");
    expect(r.targetProgressPct).toBe(0);
  });
});

describe("autres règles", () => {
  it("signale un dépassement de contrats sans éliminer", () => {
    const d = days([100, 100]);
    d[1]!.maxMiniContracts = 6;
    const r = evaluateAccount(rules, d);
    expect(r.violations).toContainEqual({ type: "maxContracts", day: "2026-10-02", fatal: false });
    expect(r.status).toBe("active");
  });

  it("élimine sur la limite de perte journalière quand elle est activée", () => {
    const r = evaluateAccount({ ...rules, dailyLossLimit: 100_000 }, days([-1_000]));
    expect(r.status).toBe("breached");
    expect(r.violations[0]?.type).toBe("dailyLoss");
  });

  it("compte les jours gagnants avec un seuil", () => {
    const r = evaluateAccount(rules, days([50, 150, 100, -20]), { winningDayMin: 10_000 });
    expect(r.winningDays).toBe(2);
  });
});

describe("alertes à 80 %", () => {
  it("alerte quand 80 % du drawdown est consommé", () => {
    const r = evaluateAccount(rules, days([-1_650]));
    expect(r.drawdownUsedPct).toBeCloseTo(82.5);
    expect(r.alerts).toContainEqual({ type: "drawdown", usedPct: 82.5 });
  });

  it("pas d'alerte sous le seuil", () => {
    expect(evaluateAccount(rules, days([-1_000])).alerts).toEqual([]);
  });

  it("alerte de consistance quand le meilleur jour approche de la limite", () => {
    // profit 2 000, meilleur jour 900 → 45 % / 50 % = 90 % de la limite
    const r = evaluateAccount(rules, days([900, 600, 500]));
    expect(r.alerts.map((a) => a.type)).toContain("consistency");
  });
});
