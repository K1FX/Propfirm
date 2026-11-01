import { describe, expect, it } from "vitest";

import { evaluateAccount } from "./engine";
import { createRulesSnapshot } from "./snapshot";
import type { DailyResult, RulesSnapshot } from "./types";

/** Construit des jours à partir d'une liste de P&L en dollars (sans creux intraday). */
function days(rules: RulesSnapshot, pnlsInDollars: number[], firstDay = 1): DailyResult[] {
  let bal = rules.startBalance;
  return pnlsInDollars.map((p, i) => {
    const pnl = p * 100;
    const low = Math.min(bal, bal + pnl);
    bal += pnl;
    return {
      day: `2026-10-${String(i + firstDay).padStart(2, "0")}`,
      pnl,
      closingBalance: bal,
      lowBalance: low,
      maxMiniContracts: 1,
      maxMicroContracts: 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Mécanique commune : drawdown EOD trailing (RUSH 50K éval : DD 2 000 $, DLL 1 250 $)
// ---------------------------------------------------------------------------
describe("drawdown EOD trailing (commun)", () => {
  const r = createRulesSnapshot("rush", "50k", "evaluation");

  it("démarre au solde initial − drawdown max", () => {
    const e = evaluateAccount(r, []);
    expect(e.drawdownThreshold).toBe(4_800_000);
    expect(e.drawdownRemaining).toBe(200_000);
  });

  it("monte avec le plus haut solde de clôture et ne redescend jamais", () => {
    expect(evaluateAccount(r, days(r, [500, -200])).drawdownThreshold).toBe(4_850_000);
    expect(evaluateAccount(r, days(r, [1_000, -800, -100])).drawdownThreshold).toBe(4_900_000);
  });

  it("se bloque au solde initial + 100 $", () => {
    const e = evaluateAccount(r, days(r, [1_100, 900, 700]));
    expect(e.drawdownThreshold).toBe(5_010_000);
    expect(e.drawdownLocked).toBe(true);
  });

  it("élimine si le solde touche le seuil, y compris en intraday", () => {
    expect(evaluateAccount(r, days(r, [-1_000, -1_000])).status).toBe("breached");
    const d = days(r, [200]);
    d[0]!.lowBalance = 4_799_000;
    expect(evaluateAccount(r, d).status).toBe("breached");
  });

  it("utilise le seuil de la veille pendant la journée", () => {
    const d = days(r, [1_000, 500]);
    d[1]!.lowBalance = 4_950_000; // au-dessus du seuil de la veille (49 000 $)
    expect(evaluateAccount(r, d).status).not.toBe("breached");
  });

  it("signale un dépassement de contrats sans éliminer", () => {
    const d = days(r, [100]);
    d[0]!.maxMiniContracts = 5; // max 4 mini en RUSH 50K
    const e = evaluateAccount(r, d);
    expect(e.violations).toContainEqual({ type: "maxContracts", day: "2026-10-01", fatal: false });
    expect(e.status).toBe("active");
  });

  it("alerte à 80 % du drawdown consommé", () => {
    const e = evaluateAccount(r, days(r, [-1_200, -450]));
    expect(e.alerts.map((a) => a.type)).toContain("drawdown");
  });
});

// ---------------------------------------------------------------------------
// RUSH × évaluation : 1 jour min, pas de consistance, perte journalière soft
// ---------------------------------------------------------------------------
describe("RUSH – évaluation", () => {
  const r = createRulesSnapshot("rush", "50k", "evaluation");

  it("peut valider en 1 seul jour (pas de consistance)", () => {
    expect(evaluateAccount(r, days(r, [3_000])).status).toBe("passed");
  });

  it("perte journalière soft : journée bloquée, compte conservé", () => {
    const e = evaluateAccount(r, days(r, [-1_300, 400]));
    expect(e.status).toBe("active");
    expect(e.dailyLossLockedDays).toEqual(["2026-10-01"]);
    expect(e.violations).toContainEqual({ type: "dailyLoss", day: "2026-10-01", fatal: false });
  });

  it("n'a pas de payout en évaluation", () => {
    expect(evaluateAccount(r, days(r, [500])).payout).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// RUSH × financé : consistance 35 % du cycle, perte journalière soft, plafond
// ---------------------------------------------------------------------------
describe("RUSH – financé", () => {
  const r = createRulesSnapshot("rush", "50k", "funded");

  it("payout après 5 jours gagnants (≥ 150 $), plafonné à 2 000 $, split 90 %", () => {
    const e = evaluateAccount(r, days(r, [600, 700, 500, 650, 550, 200]));
    expect(e.winningDays).toBe(6);
    expect(e.payout).toMatchObject({ eligible: true, payable: 200_000, traderShare: 180_000 });
  });

  it("un jour à +149 $ n'est pas un jour gagnant", () => {
    const e = evaluateAccount(r, days(r, [149, 300, 300, 300, 300]));
    expect(e.winningDays).toBe(4);
    expect(e.payout?.eligible).toBe(false);
  });

  it("consistance 35 % : un gros jour bloque le payout", () => {
    const e = evaluateAccount(r, days(r, [1_500, 200, 200, 200, 200]));
    expect(e.consistencyOk).toBe(false);
    expect(e.payout?.eligible).toBe(false);
  });

  it("le compteur repart à zéro après un payout", () => {
    const d = days(r, [300, 300, 300, 300, 300, 400, 400]);
    const e = evaluateAccount(r, d, { lastPayoutDay: "2026-10-05" });
    expect(e.winningDays).toBe(2);
    expect(e.payout?.eligible).toBe(false);
  });

  it("garde la perte journalière soft", () => {
    expect(evaluateAccount(r, days(r, [-1_300])).dailyLossLockedDays).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// FLEX × évaluation : 3 jours min, consistance 40 %, pas de limite journalière
// ---------------------------------------------------------------------------
describe("FLEX – évaluation", () => {
  const r = createRulesSnapshot("flex", "50k", "evaluation");

  it("exige 3 jours de trading", () => {
    expect(evaluateAccount(r, days(r, [1_500, 1_500])).status).toBe("active");
    expect(evaluateAccount(r, days(r, [1_000, 1_000, 1_000])).status).toBe("passed");
  });

  it("consistance 40 % au moment de valider", () => {
    const e = evaluateAccount(r, days(r, [1_500, 800, 700]));
    expect(e.bestDayShareOfProfitPct).toBe(50);
    expect(e.status).toBe("active");
  });

  it("aucune limite journalière", () => {
    const e = evaluateAccount(r, days(r, [-1_900]));
    expect(e.dailyLossLockedDays).toEqual([]);
    expect(e.status).toBe("active");
  });
});

// ---------------------------------------------------------------------------
// FLEX × financé : ni consistance, ni limite journalière
// ---------------------------------------------------------------------------
describe("FLEX – financé", () => {
  const r = createRulesSnapshot("flex", "50k", "funded");

  it("payout possible même avec un très gros jour (pas de consistance)", () => {
    const e = evaluateAccount(r, days(r, [1_800, 200, 200, 200, 200]));
    expect(e.consistencyOk).toBe(true);
    expect(e.payout?.eligible).toBe(true);
  });

  it("aucune limite journalière", () => {
    expect(evaluateAccount(r, days(r, [-1_900])).dailyLossLockedDays).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// INSTANT × financé : consistance 20 %, perte journalière soft selon la taille
// ---------------------------------------------------------------------------
describe("INSTANT – financé", () => {
  it("n'a pas de phase d'évaluation", () => {
    expect(() => createRulesSnapshot("instant", "50k", "evaluation")).toThrow();
  });

  const r = createRulesSnapshot("instant", "50k", "funded");

  it("consistance 20 % du cycle", () => {
    const ok = evaluateAccount(r, days(r, [300, 300, 300, 300, 300]));
    expect(ok.payout?.eligible).toBe(true);
    const ko = evaluateAccount(r, days(r, [600, 300, 300, 300, 300]));
    expect(ko.consistencyOk).toBe(false);
  });

  it("25K sans limite journalière, 50K avec limite soft à 1 250 $", () => {
    const small = createRulesSnapshot("instant", "25k", "funded");
    expect(evaluateAccount(small, days(small, [-900])).dailyLossLockedDays).toEqual([]);
    expect(evaluateAccount(r, days(r, [-1_300])).dailyLossLockedDays).toHaveLength(1);
  });

  it("refuse un payout sous le minimum de 250 $", () => {
    const e = evaluateAccount(
      r,
      days(r, [160, 160, 160, 160, 160]).map((d, i) => ({ ...d, pnl: i === 0 ? 15_000 : 5_000 })),
    );
    expect(e.payout?.eligible).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Avantages de rang et figeage des règles
// ---------------------------------------------------------------------------
describe("snapshot des règles", () => {
  it("Gold : payout tous les 4 jours gagnants ; Elite : split 100 %", () => {
    expect(createRulesSnapshot("rush", "50k", "funded", "gold").payoutEveryWinningDays).toBe(4);
    expect(createRulesSnapshot("rush", "50k", "funded", "elite").profitSplitPct).toBe(100);
    expect(createRulesSnapshot("rush", "50k", "funded", "bronze").profitSplitPct).toBe(90);
  });

  it("les avantages de rang ne s'appliquent pas à l'évaluation", () => {
    expect(createRulesSnapshot("rush", "50k", "evaluation", "elite").payoutEveryWinningDays).toBe(
      5,
    );
  });

  it("contient le gabarit de risque du fournisseur", () => {
    expect(createRulesSnapshot("flex", "100k", "evaluation").riskTemplate).toBe("FLEX_100K_EVAL");
  });
});
