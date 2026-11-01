import type { Cents } from "@/lib/format";

/**
 * Règles communes, toutes paramétrables (CLAUDE.md §5).
 */
export const evaluationRules = {
  /** Le meilleur jour doit représenter au plus X % du profit total. */
  consistencyMaxBestDayPct: 50,
  minTradingDays: 2,
  /** Le drawdown trailing se bloque au solde initial + ce montant. */
  drawdownLockBuffer: 10_000 as Cents,
  /** Fuseau de référence du jour de trading CME Globex (17:00 → 16:00). */
  sessionTimeZone: "America/Chicago",
  sessionOpen: "17:00",
  sessionClose: "16:00",
  /** Seuil d'alerte quand une règle approche de sa limite. */
  alertThresholdPct: 80,
} as const;

export const fundedRules = {
  activationFee: 0 as Cents,
  profitSplitPct: 90,
  /** Les premiers X $ de profit sont reversés à 100 %. */
  fullSplitThreshold: 1_000_000 as Cents,
  payoutMinWinningDays: 5,
  winningDayMin: 10_000 as Cents,
  payoutMin: 25_000 as Cents,
  payoutFrequencyDays: 14,
} as const;
