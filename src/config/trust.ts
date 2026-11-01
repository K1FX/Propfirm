import { plans } from "@/config/plans";
import { fundedRules } from "@/config/rules";

/**
 * Barre de confiance (CLAUDE.md §11 : aucun chiffre inventé).
 * 1. PROMESSES : vérifiables, calculées depuis la configuration.
 * 2. STATISTIQUES RÉELLES : lues en base (Phase 3). Chacune ne s'affiche qu'au-delà d'un seuil ;
 *    en dessous, la promesse correspondante reste affichée.
 */

export const trustConfig = {
  /** À REMPLIR : délai cible de traitement d'un payout, en heures. null = item masqué. */
  payoutProcessingHours: null as number | null,
  thresholds: {
    totalPaidOut: 1_000_000, // 10 000 $ en centimes
    tradersPaid: 25,
    avgPayoutHoursSample: 20, // nombre minimum de payouts pour publier un délai moyen
  },
} as const;

export type TrustKind = "moneyK" | "money" | "percent" | "hours" | "count";
export type TrustLabel =
  | "maxSize"
  | "split"
  | "activation"
  | "payoutTarget"
  | "totalPaidOut"
  | "tradersPaid"
  | "avgPayout";
export type TrustItem = { id: string; value: number; kind: TrustKind; labelKey: TrustLabel };

/** Statistiques réelles (null tant que la base n'existe pas ou que les données manquent). */
export type RealStats = {
  totalPaidOut: number | null;
  tradersPaid: number | null;
  avgPayoutHours: { value: number; sample: number } | null;
};

export const NO_STATS: RealStats = { totalPaidOut: null, tradersPaid: null, avgPayoutHours: null };

/** Construit les items affichés : vraie stat si son seuil est atteint, sinon la promesse. */
export function buildTrustItems(stats: RealStats = NO_STATS): TrustItem[] {
  const maxSize = Math.max(...plans.map((p) => p.accountSize));
  const t = trustConfig.thresholds;
  const items: TrustItem[] = [];

  items.push(
    stats.totalPaidOut !== null && stats.totalPaidOut >= t.totalPaidOut
      ? { id: "totalPaidOut", value: stats.totalPaidOut, kind: "money", labelKey: "totalPaidOut" }
      : { id: "maxSize", value: maxSize, kind: "moneyK", labelKey: "maxSize" },
  );
  items.push(
    stats.tradersPaid !== null && stats.tradersPaid >= t.tradersPaid
      ? { id: "tradersPaid", value: stats.tradersPaid, kind: "count", labelKey: "tradersPaid" }
      : { id: "split", value: fundedRules.profitSplitPct, kind: "percent", labelKey: "split" },
  );
  items.push({
    id: "activation",
    value: fundedRules.activationFee,
    kind: "money",
    labelKey: "activation",
  });

  if (stats.avgPayoutHours && stats.avgPayoutHours.sample >= t.avgPayoutHoursSample) {
    items.push({
      id: "avgPayout",
      value: stats.avgPayoutHours.value,
      kind: "hours",
      labelKey: "avgPayout",
    });
  } else if (trustConfig.payoutProcessingHours !== null) {
    items.push({
      id: "payoutTarget",
      value: trustConfig.payoutProcessingHours,
      kind: "hours",
      labelKey: "payoutTarget",
    });
  }
  return items;
}

/** Délai minimum avant un premier payout, déduit des règles (jours de trading). */
export function minDaysToFirstPayout(minEvalDays: number): number {
  return minEvalDays + fundedRules.payoutMinWinningDays;
}
